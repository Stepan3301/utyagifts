import { gameSessionRepository } from '../repositories/gameSessionRepository';
import { giftService } from './giftService';
import { poolService } from './poolService';
import type { GameSession as DBGameSession } from '../lib/supabase';

// Service-level interface (camelCase)
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

// Helper to convert database row to service interface
function mapGameSession(dbSession: DBGameSession): GameSession {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    giftId: dbSession.gift_id || '',
    multiplier: dbSession.multiplier ? Number(dbSession.multiplier) : 0,
    crashedAt: dbSession.crashed_at ? new Date(dbSession.crashed_at).getTime() : undefined,
    cashedOutAt: dbSession.cashed_out_at ? new Date(dbSession.cashed_out_at).getTime() : undefined,
    status: dbSession.status as 'active' | 'crashed' | 'cashed_out',
    createdAt: new Date(dbSession.created_at),
  };
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
    if (!gift) {
      throw new Error('Invalid gift or not owned');
    }

    // Set gift status to in-game
    await giftService.setGiftInGame(giftId);

    // Generate crash point
    const crashPoint = this.generateCrashPoint();

    // Create session
    const dbSession = await gameSessionRepository.create({
      userId,
      giftId,
      multiplier: crashPoint,
      status: 'active',
    });

    return mapGameSession(dbSession);
  }

  /**
   * Cash out from current session
   */
  async cashOut(userId: string, sessionId: string) {
    const dbSession = await gameSessionRepository.findById(sessionId);

    if (!dbSession || dbSession.user_id !== userId) {
      throw new Error('Session not found');
    }

    const session = mapGameSession(dbSession);

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
    const dbSession = await gameSessionRepository.findActiveByUserId(userId);
    return dbSession ? mapGameSession(dbSession) : null;
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, limit: number, offset: number): Promise<GameSession[]> {
    const dbSessions = await gameSessionRepository.findByUserId(userId, limit, offset);
    return dbSessions.map(mapGameSession);
  }

  /**
   * Check if session should crash (called periodically)
   */
  async checkCrash(sessionId: string): Promise<boolean> {
    const dbSession = await gameSessionRepository.findById(sessionId);
    
    if (!dbSession || dbSession.status !== 'active') {
      return false;
    }

    const session = mapGameSession(dbSession);

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

