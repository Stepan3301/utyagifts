import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/userRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.warn(`[Auth] No authorization header for ${req.method} ${req.path}`);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // Handle Telegram initData or simple user ID format
    let telegramId: number | null = null;

    // Check if it's a simple format: "telegram_user_<id>"
    if (token.startsWith('telegram_user_')) {
      const userIdStr = token.replace('telegram_user_', '');
      telegramId = parseInt(userIdStr, 10);
      
      if (isNaN(telegramId)) {
        res.status(401).json({ error: 'Invalid authentication token' });
        return;
      }
    } else {
      // Try to parse as Telegram initData
      // For now, we'll extract user ID from initData if possible
      // Full initData validation should be implemented later
      try {
        // Simple parsing: look for user_id in initData
        const params = new URLSearchParams(token);
        const userParam = params.get('user');
        
        if (userParam) {
          try {
            const userObj = JSON.parse(decodeURIComponent(userParam));
            if (userObj && userObj.id) {
              telegramId = parseInt(userObj.id, 10);
            }
          } catch (parseError) {
            // Try direct parsing if JSON parse fails
            console.warn('Failed to parse user object from initData:', parseError);
          }
        }
        
        // If still no telegramId, try to extract from raw token (might be just user ID)
        if (!telegramId) {
          const directId = parseInt(token, 10);
          if (!isNaN(directId)) {
            telegramId = directId;
          }
        }
      } catch (error) {
        // If parsing fails, try to extract from token directly
        console.warn('Failed to parse initData, trying alternative methods:', error);
        // Last resort: try parsing token as direct user ID
        const directId = parseInt(token, 10);
        if (!isNaN(directId)) {
          telegramId = directId;
        }
      }
    }

    if (!telegramId) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }

    // Find user in database
    const user = await userRepository.findByTelegramId(telegramId);
    
    if (!user) {
      console.warn(`[Auth] User not found for telegramId: ${telegramId}`);
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user info to request
    req.user = {
      telegramId: user.telegram_id,
      username: user.username || undefined,
      firstName: user.first_name || undefined,
      lastName: user.last_name || undefined,
    };

    // Log successful authentication (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth] Authenticated user ${telegramId} for ${req.method} ${req.path}`);
    }

    next();
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

