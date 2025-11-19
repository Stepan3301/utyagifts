import { userRepository } from '../repositories/userRepository';

export interface TelegramUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

class AuthService {
  /**
   * Validates Telegram WebApp initData
   * @param _initData - Telegram initData string
   * @returns Authenticated user
   */
  async validateTelegramInitData(_initData: string): Promise<TelegramUser> {
    // TODO: Implement proper Telegram initData validation
    // This involves:
    // 1. Parsing the initData string
    // 2. Validating the hash using HMAC-SHA256
    // 3. Extracting user data
    // 4. Creating or updating user in database

    // Placeholder implementation
    throw new Error('Not implemented');
  }

  /**
   * Get or create user by Telegram ID
   */
  async getOrCreateUser(telegramUser: TelegramUser) {
    let user = await userRepository.findByTelegramId(telegramUser.telegramId);

    if (!user) {
      user = await userRepository.create({
        telegramId: telegramUser.telegramId,
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
      });
    } else {
      // Update user info if changed
      user = await userRepository.update(user.id, {
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
      });
    }

    return user;
  }
}

export const authService = new AuthService();

