import { giftRepository } from '../repositories/giftRepository';
import { poolService } from './poolService';

export enum GiftStatus {
  OWNED = 'owned',
  IN_POOL = 'in_pool',
  IN_GAME = 'in_game',
  WITHDRAWN = 'withdrawn',
}

class GiftService {
  /**
   * Add gift to user's inventory
   */
  async addGiftToInventory(userId: string, giftData: any) {
    return await giftRepository.create({
      userId,
      telegramGiftId: giftData.telegramGiftId,
      name: giftData.name,
      thumbnail: giftData.thumbnail,
      status: GiftStatus.OWNED,
    });
  }

  /**
   * Get user's gifts
   */
  async getUserGifts(userId: string) {
    return await giftRepository.findByUserId(userId);
  }

  /**
   * Get gift by ID
   */
  async getGiftById(giftId: string, userId: string) {
    const gift = await giftRepository.findById(giftId);
    
    // Verify ownership
    if (gift && gift.userId === userId) {
      return gift;
    }
    
    return null;
  }

  /**
   * Move gift to pool (when user loses)
   */
  async moveGiftToPool(giftId: string) {
    await giftRepository.update(giftId, {
      status: GiftStatus.IN_POOL,
      userId: null, // Remove ownership
    });

    await poolService.addGift(giftId);
  }

  /**
   * Move gift to in-game status
   */
  async setGiftInGame(giftId: string) {
    await giftRepository.update(giftId, {
      status: GiftStatus.IN_GAME,
    });
  }

  /**
   * Award gift to user (from pool)
   */
  async awardGift(userId: string, giftId: string) {
    await giftRepository.update(giftId, {
      userId,
      status: GiftStatus.OWNED,
    });

    await poolService.removeGift(giftId);
  }
}

export const giftService = new GiftService();

