import { Router } from 'express';
import { giftProcessingController } from '../controllers/giftProcessingController';
import { authenticate } from '../middleware/authenticate';

export const giftProcessingRouter = Router();

// All gift processing routes require authentication
giftProcessingRouter.use(authenticate);

// Process a gift URL (returns animation data without saving)
giftProcessingRouter.post('/process', giftProcessingController.processGiftUrl);

// Process and update an existing gift with animation data
giftProcessingRouter.post('/process-and-update', giftProcessingController.processAndUpdateGift);

// Process all unprocessed gifts for the authenticated user
giftProcessingRouter.post('/process-all', giftProcessingController.processAllUnprocessedGifts);

