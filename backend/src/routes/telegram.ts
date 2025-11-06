import { Router } from 'express';
import { telegramWebhookController } from '../controllers/telegramController';

export const telegramRouter = Router();

// Telegram webhook endpoint
telegramRouter.post('/webhook', telegramWebhookController);

