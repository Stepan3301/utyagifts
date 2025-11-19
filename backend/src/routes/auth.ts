import { Router } from 'express';
import { authController } from '../controllers/authController';

export const authRouter = Router();

// Validate Telegram initData and authenticate user
authRouter.post('/validate', authController.validateInitData);

// Register or update user from Telegram WebApp
authRouter.post('/register', authController.registerUser);

