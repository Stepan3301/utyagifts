import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { gameService } from '../services/gameService';
import { userRepository } from '../repositories/userRepository';
import { sessionManagerService } from '../services/sessionManagerService';
import { giftService } from '../services/giftService';

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

      const { giftId } = req.body;

      if (!giftId) {
        res.status(400).json({ error: 'giftId is required' });
        return;
      }

      const session = await gameService.startSession(user.id, giftId);
      res.json({ session });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start session' });
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

      // Check if user joined the current session
      const globalSession = sessionManagerService.getCurrentSession();
      if (globalSession && globalSession.status === 'running') {
        if (!sessionManagerService.hasUserJoined(user.id)) {
          res.status(403).json({ error: 'You did not join this session during the countdown period' });
          return;
        }
      }

      const result = await gameService.cashOut(user.id, sessionId);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cash out' });
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
      res.json({ session });
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
      res.json({ sessions });
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

      const globalSession = sessionManagerService.getCurrentSession();
      if (!globalSession) {
        res.json({ session: null });
        return;
      }

      // Check if user joined
      const hasJoined = sessionManagerService.hasUserJoined(user.id);

      // Calculate countdown remaining if in countdown phase
      let countdownRemaining = 0;
      if (globalSession.status === 'countdown' && globalSession.countdownEndsAt) {
        countdownRemaining = Math.max(0, globalSession.countdownEndsAt - Date.now());
      }

      res.json({
        session: {
          id: globalSession.id,
          status: globalSession.status,
          crashPoint: globalSession.crashPoint,
          countdownRemaining,
          countdownEndsAt: globalSession.countdownEndsAt,
          hasJoined,
          startedAt: globalSession.startedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current session' });
    }
  },

  /**
   * Join current session (during countdown)
   */
  async joinSession(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { giftId } = req.body;
      if (!giftId) {
        res.status(400).json({ error: 'giftId is required' });
        return;
      }

      // Verify gift ownership
      const gift = await giftService.getGiftById(giftId, user.id);
      if (!gift) {
        res.status(400).json({ error: 'Invalid gift or not owned' });
        return;
      }

      // Try to join the session
      const joined = sessionManagerService.joinSession(user.id);
      if (!joined) {
        res.status(400).json({ error: 'Cannot join session. Countdown may have ended or session is not in countdown phase.' });
        return;
      }

      res.json({
        success: true,
        message: 'Successfully joined session',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to join session' });
    }
  },
};

