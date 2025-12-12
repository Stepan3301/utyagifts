import { Router } from 'express';
import { gameController } from '../controllers/gameController';
import { authenticate } from '../middleware/authenticate';

export const gameRouter = Router();

// All game routes require authentication
gameRouter.use(authenticate);

// Start a new game session
gameRouter.post('/session/start', gameController.startSession);

// Cash out from current session
gameRouter.post('/session/:sessionId/cashout', gameController.cashOut);

// Get current active session
gameRouter.get('/session/active', gameController.getActiveSession);

// Get session history
gameRouter.get('/session/history', gameController.getSessionHistory);

// Get current session status for the authenticated user
gameRouter.get('/session/current', gameController.getCurrentSession);

// Get win gift options for a session
gameRouter.get('/session/:sessionId/win-options', gameController.getWinGiftOptions);

