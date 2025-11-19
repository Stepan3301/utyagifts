import { Router } from 'express';
import { telegramController } from '../controllers/telegramController';

export const telegramRouter = Router();

// Telegram webhook endpoint
telegramRouter.post('/webhook', telegramController.telegramWebhook);

