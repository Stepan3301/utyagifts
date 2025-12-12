import { supabase } from '../lib/supabase';
import { userRepository } from '../repositories/userRepository';
import type { Gift } from '../lib/supabase';

const RELAYER_USER_ID = '6f52eee8-cbdd-4ef7-9b79-6dff4798519b';

export interface BetGift {
  id: string; // Gift ID from inventory (the 'id' field in inventory JSONB)
  giftId?: string; // UUID from gifts table if it exists
  name: string;
  image: string | null;
  url: string;
  floorPrice: number | null;
}

export interface WinGiftOption {
  id: string; // Gift ID from inventory
  name: string;
  image: string | null;
  url: string;
  floorPrice: number | null;
  animationData: any | null;
}

class GameWinLossService {
  /**
   * Get gift details from gifts table by gift URL
   */
  private async getGiftFromTable(giftUrl: string): Promise<Gift | null> {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('gift_url', giftUrl)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Remove gifts from user's inventory
   */
  private async removeGiftsFromInventory(
    userId: string,
    giftIds: string[]
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const inventory = (user.inventory as any[]) || [];
    const updatedInventory = inventory.filter(
      (gift) => !giftIds.includes(gift.id)
    );

    const { error } = await supabase
      .from('users')
      .update({
        inventory: updatedInventory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to remove gifts from inventory: ${error.message}`);
    }
  }

  /**
   * Add gifts to user's inventory
   */
  private async addGiftsToInventory(
    userId: string,
    gifts: Array<{
      id: string;
      name: string;
      image: string | null;
      url: string;
      animation_data: any | null;
    }>
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const inventory = (user.inventory as any[]) || [];
    const updatedInventory = [...inventory, ...gifts];

    const { error } = await supabase
      .from('users')
      .update({
        inventory: updatedInventory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to add gifts to inventory: ${error.message}`);
    }
  }

  /**
   * Handle loss scenario: Move bet gifts from user to relayer
   */
  async handleLoss(userId: string, betGifts: BetGift[]): Promise<void> {
    const relayer = await userRepository.findById(RELAYER_USER_ID);
    if (!relayer) {
      throw new Error('Relayer account not found');
    }

    // Remove gifts from user's inventory
    const giftIds = betGifts.map((g) => g.id);
    await this.removeGiftsFromInventory(userId, giftIds);

    // Add gifts to relayer's inventory
    const giftsToAdd = betGifts.map((gift) => ({
      id: gift.id,
      name: gift.name,
      image: gift.image,
      url: gift.url,
      animation_data: null, // Will be populated if gift exists in gifts table
    }));

    // Try to get animation_data from gifts table for each gift
    for (let i = 0; i < giftsToAdd.length; i++) {
      const gift = await this.getGiftFromTable(betGifts[i].url);
      if (gift && gift.animation_data) {
        giftsToAdd[i].animation_data = gift.animation_data;
      }
    }

    await this.addGiftsToInventory(RELAYER_USER_ID, giftsToAdd);
  }

  /**
   * Calculate new gift price based on old gift price and multiplier
   */
  calculateNewGiftPrice(oldFloorPrice: number | null, multiplier: number): number | null {
    if (oldFloorPrice === null || oldFloorPrice <= 0) {
      return null;
    }
    return oldFloorPrice * multiplier;
  }

  /**
   * Find matching gifts from relayer's inventory based on calculated price
   * Returns gifts within a reasonable price range (within 20% of target price)
   */
  async findMatchingGifts(
    targetPrice: number,
    tolerancePercent: number = 20
  ): Promise<WinGiftOption[]> {
    const relayer = await userRepository.findById(RELAYER_USER_ID);
    if (!relayer) {
      throw new Error('Relayer account not found');
    }

    const inventory = (relayer.inventory as any[]) || [];
    if (inventory.length === 0) {
      return [];
    }

    const tolerance = (targetPrice * tolerancePercent) / 100;
    const minPrice = targetPrice - tolerance;
    const maxPrice = targetPrice + tolerance;

    const matchingGifts: WinGiftOption[] = [];

    // Check each gift in relayer's inventory
    for (const gift of inventory) {
      // Try to get floor price from gifts table
      const giftFromTable = await this.getGiftFromTable(gift.url);
      const floorPrice = giftFromTable?.floor_price
        ? Number(giftFromTable.floor_price)
        : null;

      // If we have a floor price, check if it matches
      if (floorPrice !== null && floorPrice >= minPrice && floorPrice <= maxPrice) {
        matchingGifts.push({
          id: gift.id,
          name: gift.name,
          image: gift.image,
          url: gift.url,
          floorPrice,
          animationData: gift.animation_data || giftFromTable?.animation_data || null,
        });
      }
    }

    // Sort by price closest to target
    matchingGifts.sort((a, b) => {
      if (a.floorPrice === null) return 1;
      if (b.floorPrice === null) return -1;
      const diffA = Math.abs(a.floorPrice - targetPrice);
      const diffB = Math.abs(b.floorPrice - targetPrice);
      return diffA - diffB;
    });

    return matchingGifts;
  }

  /**
   * Handle win scenario: Exchange bet gifts for chosen gift
   */
  async handleWin(
    userId: string,
    betGifts: BetGift[],
    chosenGiftId: string
  ): Promise<WinGiftOption> {
    const relayer = await userRepository.findById(RELAYER_USER_ID);
    if (!relayer) {
      throw new Error('Relayer account not found');
    }

    // Find the chosen gift in relayer's inventory
    const relayerInventory = (relayer.inventory as any[]) || [];
    const chosenGift = relayerInventory.find((g) => g.id === chosenGiftId);

    if (!chosenGift) {
      throw new Error('Chosen gift not found in relayer inventory');
    }

    // Get full gift details from gifts table if available
    const giftFromTable = await this.getGiftFromTable(chosenGift.url);
    const chosenGiftFull: WinGiftOption = {
      id: chosenGift.id,
      name: chosenGift.name,
      image: chosenGift.image,
      url: chosenGift.url,
      floorPrice: giftFromTable?.floor_price ? Number(giftFromTable.floor_price) : null,
      animationData: chosenGift.animation_data || giftFromTable?.animation_data || null,
    };

    // Remove bet gifts from user's inventory
    const betGiftIds = betGifts.map((g) => g.id);
    await this.removeGiftsFromInventory(userId, betGiftIds);

    // Remove chosen gift from relayer's inventory
    const updatedRelayerInventory = relayerInventory.filter(
      (g) => g.id !== chosenGiftId
    );
    await supabase
      .from('users')
      .update({
        inventory: updatedRelayerInventory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', RELAYER_USER_ID);

    // Add bet gifts to relayer's inventory
    const betGiftsToAdd = betGifts.map((gift) => ({
      id: gift.id,
      name: gift.name,
      image: gift.image,
      url: gift.url,
      animation_data: null,
    }));

    // Try to get animation_data from gifts table for each bet gift
    for (let i = 0; i < betGiftsToAdd.length; i++) {
      const gift = await this.getGiftFromTable(betGifts[i].url);
      if (gift && gift.animation_data) {
        betGiftsToAdd[i].animation_data = gift.animation_data;
      }
    }

    await this.addGiftsToInventory(RELAYER_USER_ID, betGiftsToAdd);

    // Add chosen gift to user's inventory
    await this.addGiftsToInventory(userId, [chosenGiftFull]);

    return chosenGiftFull;
  }

  /**
   * Get bet gifts with floor prices from user's inventory
   */
  async getBetGiftsWithPrices(
    userId: string,
    giftIds: string[]
  ): Promise<BetGift[]> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const inventory = (user.inventory as any[]) || [];
    const betGifts: BetGift[] = [];

    for (const giftId of giftIds) {
      const gift = inventory.find((g) => g.id === giftId);
      if (!gift) {
        throw new Error(`Gift ${giftId} not found in user inventory`);
      }

      // Try to get floor price from gifts table
      const giftFromTable = await this.getGiftFromTable(gift.url);
      const floorPrice = giftFromTable?.floor_price
        ? Number(giftFromTable.floor_price)
        : null;

      betGifts.push({
        id: gift.id,
        giftId: giftFromTable?.id,
        name: gift.name,
        image: gift.image,
        url: gift.url,
        floorPrice,
      });
    }

    return betGifts;
  }
}

export const gameWinLossService = new GameWinLossService();

