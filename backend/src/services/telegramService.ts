import TelegramBot from 'node-telegram-bot-api';
import { giftService } from './giftService';
import { userRepository } from '../repositories/userRepository';

class TelegramService {
  private bot: TelegramBot | null = null;
  private botToken: string | null = null;

  /**
   * Initialize Telegram bot
   */
  async initialize(): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    this.botToken = token;
    this.bot = new TelegramBot(token, { polling: false });

    // Set webhook if WEBHOOK_URL is provided
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (webhookUrl) {
      await this.bot.setWebHook(webhookUrl);
      console.log('📡 Webhook set to:', webhookUrl);
    } else {
      // Polling mode for development
      await this.bot.startPolling({
        polling: {
          interval: 300,
          autoStart: true,
        },
      });
      console.log('🔄 Bot started in polling mode');
    }

    this.setupHandlers();
    await this.setupMenuButton();
  }

  /**
   * Setup bot command handlers
   */
  private setupHandlers(): void {
    if (!this.bot) return;

    this.bot.onText(/\/start/, async (msg: any) => {
      try {
        const chatId = msg.chat.id;
        const webappUrl = process.env.WEBAPP_URL || process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

        await this.bot!.sendMessage(chatId, 'Welcome to Rocket Gifts! 🚀\n\nTap the menu button below to launch the game!', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🎮 Launch Game',
                  web_app: { url: webappUrl },
                },
              ],
            ],
          },
        });
        console.log(`✅ Responded to /start from user ${msg.from?.id}`);
      } catch (error) {
        console.error('Error handling /start command:', error);
      }
    });

    // Handle gift updates (when user sends gift to relayer)
    this.bot.on('message', async (msg: any) => {
      // Check if message contains a gift
      if (msg.gift) {
        await this.handleGiftReceived(msg);
      }
    });

    // Error handling
    this.bot.on('error', (error: any) => {
      console.error('Telegram bot error:', error);
    });

    this.bot.on('polling_error', (error: any) => {
      console.error('Telegram polling error:', error);
    });
  }

  /**
   * Setup persistent menu button (Launch App button in chat header)
   * Uses Telegram Bot API directly via request method
   */
  private async setupMenuButton(): Promise<void> {
    if (!this.bot || !this.botToken) return;

    try {
      const webappUrl = process.env.WEBAPP_URL || process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
      
      // Use bot's request method to call setChatMenuButton API
      // This sets the menu button globally for all users
      // Note: request method exists but isn't in TypeScript types
      await (this.bot as any).request('setChatMenuButton', {
        menu_button: {
          type: 'web_app',
          text: '🚀 Launch App',
          web_app: {
            url: webappUrl,
          },
        },
      });
      console.log('✅ Menu button set successfully:', webappUrl);
    } catch (error: any) {
      console.error('Error setting menu button:', error.message || error);
      // Don't throw - menu button is optional, might fail if bot doesn't have permission
    }
  }

  /**
   * Process incoming Telegram update (webhook)
   */
  async processUpdate(update: any): Promise<void> {
    if (!this.bot) {
      await this.initialize();
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
  async sendGift(_userTelegramId: number, _giftId: string): Promise<void> {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }

    // TODO: Implement gift sending via Telegram Bot API
    // This will be implemented when we have the gift details
  }
}

export const telegramService = new TelegramService();

