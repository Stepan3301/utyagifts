import { giftRepository } from '../repositories/giftRepository';
import { GiftStatus } from './giftService';

class PoolService {
  /**
   * Add gift to pool
   */
  async addGift(_giftId: string): Promise<void> {
    // Gift is already moved to pool in giftService
    // This service manages pool logic
  }

  /**
   * Remove gift from pool
   */
  async removeGift(_giftId: string): Promise<void> {
    // Gift is already moved to user in giftService
  }

  /**
   * Get random gift(s) from pool based on value
   */
  async getRandomGift(_value: number): Promise<string | null> {
    // Get gifts from pool
    const poolGifts = await giftRepository.findByStatus(GiftStatus.IN_POOL);

    if (poolGifts.length === 0) {
      return null;
    }

    // Simple: return first available gift
    // In production, this could be more sophisticated (value matching, etc.)
    return poolGifts[0].id;
  }

  /**
   * Get pool statistics
   */
  async getPoolStats() {
    const poolGifts = await giftRepository.findByStatus(GiftStatus.IN_POOL);
    return {
      totalGifts: poolGifts.length,
    };
  }
}

export const poolService = new PoolService();

