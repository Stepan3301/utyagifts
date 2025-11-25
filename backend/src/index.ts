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
import { giftProcessingRouter } from './routes/giftProcessing';
import { telegramService } from './services/telegramService';
import { giftProcessingService } from './services/giftProcessingService';
import { sessionManagerService } from './services/sessionManagerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://stepan3301.github.io',
    'https://stepan3301.github.io/utyagifts',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8001',
    'http://localhost:8002',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle OPTIONS requests for CORS preflight
app.options('*', cors(corsOptions));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/telegram', telegramRouter);
app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/game', gameRouter);
app.use('/api/gifts', giftProcessingRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

// Initialize Telegram bot
telegramService.initialize().catch((error) => {
  console.error('Failed to initialize Telegram bot:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Routes registered:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/gifts/process-all`);
  console.log(`   - GET  /api/game/session/current`);
  console.log(`   - POST /api/game/session/join`);
  
  // Start continuous session manager
  console.log(`🎮 Initializing session manager...`);
  sessionManagerService.start();
  console.log(`✅ Session manager started`);
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, cleaning up...');
  await giftProcessingService.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, cleaning up...');
  sessionManagerService.stop();
  await giftProcessingService.cleanup();
  process.exit(0);
});

