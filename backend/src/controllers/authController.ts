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
};

