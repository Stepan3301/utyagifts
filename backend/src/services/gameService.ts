import { gameSessionRepository } from '../repositories/gameSessionRepository';
import { giftService } from './giftService';
import { poolService } from './poolService';
import { gameWinLossService, type BetGift } from './gameWinLossService';
import type { GameSession as DBGameSession } from '../lib/supabase';

export interface GameSession {
  id: string;
  userId: string;
  giftId: string;
  betGifts?: string[]; // Array of gift IDs from inventory
  crashPoint: number;
  status: 'countdown' | 'running' | 'crashed' | 'cashed_out';
  createdAt: Date;
  countdownEndsAt?: number;
  startedAt?: number;
  crashedAt?: number;
  cashedOutAt?: number;
}

function mapGameSession(dbSession: DBGameSession): GameSession {
  const betGifts = dbSession.bet_gifts
    ? (Array.isArray(dbSession.bet_gifts)
        ? dbSession.bet_gifts
        : JSON.parse(dbSession.bet_gifts as string))
    : undefined;

  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    giftId: dbSession.gift_id || '',
    betGifts,
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

        // Handle loss: Move bet gifts to relayer
        const betGifts = session.bet_gifts
          ? (Array.isArray(session.bet_gifts)
              ? session.bet_gifts
              : JSON.parse(session.bet_gifts as string))
          : [];

        if (betGifts.length > 0) {
          try {
            const betGiftsWithPrices = await gameWinLossService.getBetGiftsWithPrices(
              session.user_id,
              betGifts
            );
            await gameWinLossService.handleLoss(session.user_id, betGiftsWithPrices);
          } catch (error) {
            console.error('Error handling loss:', error);
            // Fallback to old behavior if bet gifts fail
            if (session.gift_id) {
              await giftService.moveGiftToPool(session.gift_id);
            }
          }
        } else if (session.gift_id) {
          // Fallback to old behavior for single gift
          await giftService.moveGiftToPool(session.gift_id);
        }
      }
    }

    return session;
  }

  async startSession(
    userId: string,
    options: { giftId?: string; betGifts?: string[] }
  ): Promise<GameSession> {
    // Support both old single gift and new multiple bet gifts
    const { giftId, betGifts } = options;

    if (betGifts && betGifts.length > 0) {
      // Validate all bet gifts exist in user's inventory
      const betGiftsWithPrices = await gameWinLossService.getBetGiftsWithPrices(
        userId,
        betGifts
      );
      // Validation passed if no error thrown
    } else if (giftId) {
      // Old behavior: single gift
      const gift = await giftService.getGiftById(giftId, userId);
      if (!gift) {
        throw new Error('Invalid gift or not owned');
      }
      await giftService.setGiftInGame(giftId);
    } else {
      throw new Error('Either giftId or betGifts must be provided');
    }

    const crashPoint = this.generateCrashPoint();
    const now = Date.now();
    const countdownEndsAt = now + this.COUNTDOWN_DURATION;

    const dbSession = await gameSessionRepository.create({
      userId,
      giftId,
      betGifts,
      multiplier: crashPoint,
      status: 'countdown',
      countdownEndsAt,
    });

    return mapGameSession(dbSession);
  }

  async cashOut(userId: string, sessionId: string, chosenGiftId?: string) {
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

    // Handle win with bet gifts
    const betGifts = session.betGifts || [];
    if (betGifts.length > 0) {
      if (!chosenGiftId) {
        throw new Error('chosenGiftId is required when using bet gifts');
      }

      const betGiftsWithPrices = await gameWinLossService.getBetGiftsWithPrices(
        userId,
        betGifts
      );

      // Calculate new gift price based on average of bet gifts
      const totalPrice = betGiftsWithPrices.reduce(
        (sum, gift) => sum + (gift.floorPrice || 0),
        0
      );
      const avgPrice = betGiftsWithPrices.length > 0 ? totalPrice / betGiftsWithPrices.length : 0;
      const newGiftPrice = gameWinLossService.calculateNewGiftPrice(
        avgPrice > 0 ? avgPrice : null,
        session.crashPoint
      );

      // Exchange gifts
      const wonGift = await gameWinLossService.handleWin(
        userId,
        betGiftsWithPrices,
        chosenGiftId
      );

      await gameSessionRepository.update(sessionId, {
        status: 'cashed_out',
        cashedOutAt: Date.now(),
      });

      return {
        success: true,
        multiplier: session.crashPoint,
        wonGift,
        newGiftPrice,
      };
    }

    // Fallback to old behavior for single gift
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

  /**
   * Get win gift options for a session (before cashing out)
   */
  async getWinGiftOptions(sessionId: string): Promise<{
    options: Array<{
      id: string;
      name: string;
      image: string | null;
      url: string;
      floorPrice: number | null;
      animationData: any | null;
    }>;
    newGiftPrice: number | null;
  }> {
    const dbSession = await gameSessionRepository.findById(sessionId);
    if (!dbSession) {
      throw new Error('Session not found');
    }

    const session = mapGameSession(dbSession);
    const betGifts = session.betGifts || [];

    if (betGifts.length === 0) {
      throw new Error('No bet gifts found in session');
    }

    const betGiftsWithPrices = await gameWinLossService.getBetGiftsWithPrices(
      session.userId,
      betGifts
    );

    // Calculate new gift price based on average of bet gifts
    const totalPrice = betGiftsWithPrices.reduce(
      (sum, gift) => sum + (gift.floorPrice || 0),
      0
    );
    const avgPrice = betGiftsWithPrices.length > 0 ? totalPrice / betGiftsWithPrices.length : 0;
    const newGiftPrice = gameWinLossService.calculateNewGiftPrice(
      avgPrice > 0 ? avgPrice : null,
      session.crashPoint
    );

    if (newGiftPrice === null) {
      return { options: [], newGiftPrice: null };
    }

    const options = await gameWinLossService.findMatchingGifts(newGiftPrice);

    return { options, newGiftPrice };
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

