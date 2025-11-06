import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { gameService } from '../services/gameService';
import { userRepository } from '../repositories/userRepository';

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
};

