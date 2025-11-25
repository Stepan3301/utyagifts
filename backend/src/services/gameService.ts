import { gameSessionRepository } from '../repositories/gameSessionRepository';
import { giftService } from './giftService';
import { poolService } from './poolService';
import type { GameSession as DBGameSession } from '../lib/supabase';

export interface GameSession {
  id: string;
  userId: string;
  giftId: string;
  crashPoint: number;
  status: 'countdown' | 'running' | 'crashed' | 'cashed_out';
  createdAt: Date;
  countdownEndsAt?: number;
  startedAt?: number;
  crashedAt?: number;
  cashedOutAt?: number;
}

function mapGameSession(dbSession: DBGameSession): GameSession {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    giftId: dbSession.gift_id || '',
    crashPoint: dbSession.multiplier ? Number(dbSession.multiplier) : 0,
    status: dbSession.status as GameSession['status'],
    createdAt: new Date(dbSession.created_at),
    countdownEndsAt: dbSession.countdown_ends_at
      ? new Date(dbSession.countdown_ends_at).getTime()
      : undefined,
    startedAt: dbSession.started_at ? new Date(dbSession.started_at).getTime() : undefined,
    crashedAt: dbSession.crashed_at ? new Date(dbSession.crashed_at).getTime() : undefined,
    cashedOutAt: dbSession.cashed_out_at ? new Date(dbSession.cashed_out_at).getTime() : undefined,
  };
}

class GameService {
  private readonly COUNTDOWN_DURATION = 10_000;
  private readonly MIN_CRASH_POINT = 1.01;
  private readonly MAX_CRASH_POINT = 10.0;

  private generateCrashPoint(): number {
    const crashPoint =
      this.MIN_CRASH_POINT + Math.random() * (this.MAX_CRASH_POINT - this.MIN_CRASH_POINT);
    return Math.round(crashPoint * 100) / 100;
  }

  private estimateCrashDuration(crashPoint: number): number {
    // Mirrors the multiplier curve logic used on the frontend (slow start, faster later)
    const timeTo2x = 7500;
    if (crashPoint <= 2) {
      const slowRate = Math.pow(2, 1 / 7.5);
      return Math.max((Math.log(crashPoint) / Math.log(slowRate)) * 1000, 2500);
    }

    const acceleratingBase = 1.35;
    const acceleratingDuration = ((crashPoint - 2) / acceleratingBase) * 2000;
    return Math.max(timeTo2x + acceleratingDuration, 5000);
  }

  private calculateCrashTimestamp(startedAt: number, crashPoint: number): number {
    return startedAt + this.estimateCrashDuration(crashPoint);
  }

  private async refreshSessionState(
    dbSession: DBGameSession | null,
  ): Promise<DBGameSession | null> {
    if (!dbSession) {
      return null;
    }

    let session = dbSession;
    const now = Date.now();

    if (session.status === 'countdown' && session.countdown_ends_at) {
      const countdownEnds = new Date(session.countdown_ends_at).getTime();
      if (now >= countdownEnds) {
        session = await gameSessionRepository.update(session.id, {
          status: 'running',
          startedAt: countdownEnds,
        });
      }
    }

    if (session.status === 'running' && session.started_at) {
      const startedAt = new Date(session.started_at).getTime();
      const crashTimestamp = this.calculateCrashTimestamp(
        startedAt,
        session.multiplier ? Number(session.multiplier) : this.MIN_CRASH_POINT,
      );

      if (now >= crashTimestamp) {
        session = await gameSessionRepository.update(session.id, {
          status: 'crashed',
          crashedAt: crashTimestamp,
        });

        if (session.gift_id) {
          await giftService.moveGiftToPool(session.gift_id);
        }
      }
    }

    return session;
  }

  async startSession(userId: string, giftId: string): Promise<GameSession> {
    const gift = await giftService.getGiftById(giftId, userId);
    if (!gift) {
      throw new Error('Invalid gift or not owned');
    }

    await giftService.setGiftInGame(giftId);

    const crashPoint = this.generateCrashPoint();
    const now = Date.now();
    const countdownEndsAt = now + this.COUNTDOWN_DURATION;

    const dbSession = await gameSessionRepository.create({
      userId,
      giftId,
      multiplier: crashPoint,
      status: 'countdown',
      countdownEndsAt,
    });

    return mapGameSession(dbSession);
  }

  async cashOut(userId: string, sessionId: string) {
    const dbSession = await gameSessionRepository.findById(sessionId);

    if (!dbSession || dbSession.user_id !== userId) {
      throw new Error('Session not found');
    }

    const refreshed = await this.refreshSessionState(dbSession);
    if (!refreshed) {
      throw new Error('Session not found');
    }

    const session = mapGameSession(refreshed);

    if (session.status !== 'running') {
      if (session.status === 'crashed') {
        throw new Error('Session already crashed');
      }
      throw new Error('Session is not running');
    }

    const winnings = Math.floor(session.crashPoint);
    const awardedGiftId = await poolService.getRandomGift(winnings);

    if (awardedGiftId) {
      await giftService.awardGift(userId, awardedGiftId);
    }

    await gameSessionRepository.update(sessionId, {
      status: 'cashed_out',
      cashedOutAt: Date.now(),
    });

    return {
      success: true,
      multiplier: session.crashPoint,
      giftId: awardedGiftId,
    };
  }

  async getCurrentSession(userId: string): Promise<GameSession | null> {
    const dbSession = await gameSessionRepository.findLatestByUserId(userId);
    const refreshed = await this.refreshSessionState(dbSession);
    return refreshed ? mapGameSession(refreshed) : null;
  }

  async getActiveSession(userId: string): Promise<GameSession | null> {
    const dbSession = await gameSessionRepository.findActiveByUserId(userId);
    const refreshed = await this.refreshSessionState(dbSession);
    return refreshed ? mapGameSession(refreshed) : null;
  }

  async getSessionHistory(userId: string, limit: number, offset: number): Promise<GameSession[]> {
    const dbSessions = await gameSessionRepository.findByUserId(userId, limit, offset);
    return dbSessions.map(mapGameSession);
  }
}

export const gameService = new GameService();

