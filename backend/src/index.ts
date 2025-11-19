import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { telegramRouter } from './routes/telegram';
import { authRouter } from './routes/auth';
import { inventoryRouter } from './routes/inventory';
import { gameRouter } from './routes/game';
import { healthRouter } from './routes/health';
import { telegramService } from './services/telegramService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/telegram', telegramRouter);
app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/game', gameRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize Telegram bot
telegramService.initialize().catch((error) => {
  console.error('Failed to initialize Telegram bot:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

