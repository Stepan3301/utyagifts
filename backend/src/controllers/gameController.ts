import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { gameService, type GameSession } from '../services/gameService';
import { userRepository } from '../repositories/userRepository';

const serializeSession = (session: GameSession) => ({
  id: session.id,
  status: session.status,
  crashPoint: session.crashPoint,
  countdownEndsAt: session.countdownEndsAt,
  startedAt: session.startedAt,
  crashedAt: session.crashedAt,
  cashedOutAt: session.cashedOutAt,
  createdAt: session.createdAt.getTime(),
  giftId: session.giftId,
  betGifts: session.betGifts,
});

export const gameController = {
  async startSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user from database
      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const { giftId, betGifts } = req.body;

      // Support both old single gift and new multiple bet gifts
      if (!giftId && (!betGifts || betGifts.length === 0)) {
        res.status(400).json({ error: 'Either giftId or betGifts array is required' });
        return;
      }

      if (betGifts && !Array.isArray(betGifts)) {
        res.status(400).json({ error: 'betGifts must be an array' });
        return;
      }

      const activeSession = await gameService.getActiveSession(user.id);
      if (activeSession) {
        res.status(400).json({ error: 'A session is already running or in countdown' });
        return;
      }

      const session = await gameService.startSession(user.id, { giftId, betGifts });
      res.json({ session: serializeSession(session) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start session';
      const statusCode = message === 'Invalid gift or not owned' ? 400 : 500;
      res.status(statusCode).json({ error: message });
    }
  },

  async cashOut(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      const { sessionId } = req.params;

      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user from database
      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const { chosenGiftId } = req.body; // Optional: required when using bet gifts

      const result = await gameService.cashOut(user.id, sessionId, chosenGiftId);
      res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cash out';
      const statusCode = message === 'Session not found' ? 404 : 400;
      res.status(statusCode).json({ error: message });
    }
  },

  async getActiveSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user from database
      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const session = await gameService.getActiveSession(user.id);
      res.json({ session: session ? serializeSession(session) : null });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active session' });
    }
  },

  async getSessionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user from database
      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const sessions = await gameService.getSessionHistory(user.id, limit, offset);
      res.json({ sessions: sessions.map(serializeSession) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch session history' });
    }
  },

  /**
   * Get current global session status
   */
  async getCurrentSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const session = await gameService.getCurrentSession(user.id);

      res.json({
        session: session ? serializeSession(session) : null,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current session' });
    }
  },

  /**
   * Get win gift options for a session (before cashing out)
   * GET /api/game/session/:sessionId/win-options
   */
  async getWinGiftOptions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      const { sessionId } = req.params;

      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // Verify session belongs to user
      const session = await gameService.getActiveSession(user.id);
      if (!session || session.id !== sessionId) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const result = await gameService.getWinGiftOptions(sessionId);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get win gift options';
      res.status(500).json({ error: message });
    }
  },
};

