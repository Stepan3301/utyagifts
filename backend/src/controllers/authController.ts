import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async validateInitData(req: Request, res: Response): Promise<void> {
    try {
      const { initData } = req.body;

      if (!initData) {
        res.status(400).json({ error: 'initData is required' });
        return;
      }

      const user = await authService.validateTelegramInitData(initData);

      res.json({
        success: true,
        user: {
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid initData' });
    }
  },

  /**
   * Register or update user from Telegram WebApp
   * This endpoint is called when a user launches the app
   */
  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId, username, firstName, lastName } = req.body;

      if (!telegramId || typeof telegramId !== 'number') {
        res.status(400).json({ error: 'telegramId is required and must be a number' });
        return;
      }

      const telegramUser = {
        telegramId,
        username: username || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      };

      const user = await authService.getOrCreateUser(telegramUser);

      res.json({
        success: true,
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      });
    } catch (error: any) {
      console.error('Error registering user:', error);
      res.status(500).json({ 
        error: 'Failed to register user',
        message: error.message 
      });
    }
  },
};

