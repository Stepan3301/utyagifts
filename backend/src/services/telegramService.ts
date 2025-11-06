import TelegramBot from 'node-telegram-bot-api';
import { giftService } from './giftService';
import { userRepository } from '../repositories/userRepository';

class TelegramService {
  private bot: TelegramBot | null = null;

  /**
   * Initialize Telegram bot
   */
  initialize(): void {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    this.bot = new TelegramBot(token);

    // Set webhook if WEBHOOK_URL is provided
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (webhookUrl) {
      this.bot.setWebHook(webhookUrl);
      console.log('📡 Webhook set to:', webhookUrl);
    } else {
      // Polling mode for development
      this.bot.startPolling();
      console.log('🔄 Bot started in polling mode');
    }

    this.setupHandlers();
  }

  /**
   * Setup bot command handlers
   */
  private setupHandlers(): void {
    if (!this.bot) return;

    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const webappUrl = process.env.WEBAPP_URL || 'https://your-domain.com/app';

      await this.bot!.sendMessage(chatId, 'Welcome to Rocket Gifts! 🚀', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎮 Open Game',
                web_app: { url: webappUrl },
              },
            ],
          ],
        },
      });
    });

    // Handle gift updates (when user sends gift to relayer)
    this.bot.on('message', async (msg) => {
      // Check if message contains a gift
      if (msg.gift) {
        await this.handleGiftReceived(msg);
      }
    });
  }

  /**
   * Process incoming Telegram update (webhook)
   */
  async processUpdate(update: any): Promise<void> {
    if (!this.bot) {
      this.initialize();
    }

    // Process the update
    if (update.message) {
      await this.bot!.processUpdate(update);
    }

    // Handle gift updates
    if (update.message?.gift) {
      await this.handleGiftReceived(update.message);
    }
  }

  /**
   * Handle when a gift is received by the relayer
   */
  private async handleGiftReceived(msg: any): Promise<void> {
    const relayerId = parseInt(process.env.RELAYER_TELEGRAM_ID || '0');
    
    // Only process gifts sent to the relayer
    if (msg.chat.id !== relayerId) {
      return;
    }

    const gift = msg.gift;
    const senderId = msg.from?.id;

    if (!senderId) {
      return;
    }

    // Get or create user
    const user = await userRepository.findByTelegramId(senderId);
    if (!user) {
      console.error('User not found for gift:', senderId);
      return;
    }

    // Add gift to user's inventory
    await giftService.addGiftToInventory(user.id, {
      telegramGiftId: gift.id,
      name: gift.name,
      thumbnail: gift.thumbnail,
      // Add other gift properties as needed
    });
  }

  /**
   * Send gift to user
   */
  async sendGift(userTelegramId: number, giftId: string): Promise<void> {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }

    // TODO: Implement gift sending via Telegram Bot API
    // This will be implemented when we have the gift details
  }
}

export const telegramService = new TelegramService();

