import { Request, Response } from 'express';
import { telegramService } from '../services/telegramService';

export const telegramController = {
  async telegramWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Telegram sends updates here
      const update = req.body;

      // Process the update (messages, gifts, etc.)
      await telegramService.processUpdate(update);

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error processing Telegram webhook:', error);
      res.status(200).json({ ok: true }); // Still return 200 to avoid retries
    }
  },
};

export { telegramController as telegramWebhookController };

