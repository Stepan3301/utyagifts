import { giftService } from './giftService';
import { userRepository } from '../repositories/userRepository';

class InventoryService {
  /**
   * Get user's inventory
   */
  async getUserInventory(telegramId: number) {
    const user = await userRepository.findByTelegramId(telegramId);
    
    if (!user) {
      return [];
    }

    const gifts = await giftService.getUserGifts(user.id);
    return gifts;
  }

  /**
   * Get gift by ID (with ownership check)
   */
  async getGiftById(giftId: string, telegramId: number) {
    const user = await userRepository.findByTelegramId(telegramId);
    
    if (!user) {
      return null;
    }

    return await giftService.getGiftById(giftId, user.id);
  }
}

export const inventoryService = new InventoryService();

