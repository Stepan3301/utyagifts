import { gameSessionRepository } from '../repositories/gameSessionRepository';
import { giftService } from './giftService';
import { poolService } from './poolService';

export interface GameSession {
  id: string;
  userId: string;
  giftId: string;
  multiplier: number;
  crashedAt?: number;
  cashedOutAt?: number;
  status: 'active' | 'crashed' | 'cashed_out';
  createdAt: Date;
}

class GameService {
  /**
   * Generate crash point (multiplier where rocket crashes)
   */
  private generateCrashPoint(): number {
    // Simple algorithm - can be made more sophisticated
    // Returns a multiplier between 1.01 and 10.0
    const min = 1.01;
    const max = 10.0;
    const crashPoint = min + Math.random() * (max - min);
    
    // Round to 2 decimal places
    return Math.round(crashPoint * 100) / 100;
  }

  /**
   * Start a new game session
   */
  async startSession(userId: string, giftId: string): Promise<GameSession> {
    // Verify gift ownership
    const gift = await giftService.getGiftById(giftId, userId);
    if (!gift || gift.status !== 'owned') {
      throw new Error('Invalid gift or not owned');
    }

    // Set gift status to in-game
    await giftService.setGiftInGame(giftId);

    // Generate crash point
    const crashPoint = this.generateCrashPoint();

    // Create session
    const session = await gameSessionRepository.create({
      userId,
      giftId,
      multiplier: crashPoint,
      status: 'active',
    });

    return session;
  }

  /**
   * Cash out from current session
   */
  async cashOut(userId: string, sessionId: string) {
    const session = await gameSessionRepository.findById(sessionId);

    if (!session || session.userId !== userId) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    // Check if already crashed
    if (session.crashedAt && session.crashedAt < Date.now()) {
      throw new Error('Session already crashed');
    }

    // Calculate winnings
    const winnings = Math.floor(session.multiplier); // Simplified

    // Get gift from pool
    const awardedGiftId = await poolService.getRandomGift(winnings);

    if (awardedGiftId) {
      await giftService.awardGift(userId, awardedGiftId);
    }

    // Update session
    await gameSessionRepository.update(sessionId, {
      status: 'cashed_out',
      cashedOutAt: Date.now(),
    });

    return {
      success: true,
      multiplier: session.multiplier,
      giftId: awardedGiftId,
    };
  }

  /**
   * Get active session for user
   */
  async getActiveSession(userId: string): Promise<GameSession | null> {
    return await gameSessionRepository.findActiveByUserId(userId);
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, limit: number, offset: number) {
    return await gameSessionRepository.findByUserId(userId, limit, offset);
  }

  /**
   * Check if session should crash (called periodically)
   */
  async checkCrash(sessionId: string): Promise<boolean> {
    const session = await gameSessionRepository.findById(sessionId);
    
    if (!session || session.status !== 'active') {
      return false;
    }

    // Simplified: check if current time has passed crash point
    // In real implementation, this would check current multiplier vs crash point
    const shouldCrash = false; // TODO: Implement proper crash logic

    if (shouldCrash) {
      await gameSessionRepository.update(sessionId, {
        status: 'crashed',
        crashedAt: Date.now(),
      });

      // Move gift to pool
      await giftService.moveGiftToPool(session.giftId);
    }

    return shouldCrash;
  }
}

export const gameService = new GameService();

