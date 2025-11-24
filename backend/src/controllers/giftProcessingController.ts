import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { giftProcessingService } from '../services/giftProcessingService';
import { giftRepository } from '../repositories/giftRepository';
import { userRepository } from '../repositories/userRepository';
import { inventoryService } from '../services/inventoryService';

export const giftProcessingController = {
  /**
   * Process a Telegram gift URL and extract animation data
   */
  async processGiftUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { giftUrl } = req.body;
      if (!giftUrl) {
        res.status(400).json({ error: 'giftUrl is required' });
        return;
      }

      // Validate URL format
      if (!giftUrl.startsWith('https://t.me/nft/')) {
        res.status(400).json({ error: 'Invalid gift URL format. Expected: https://t.me/nft/...' });
        return;
      }

      // Process the gift URL to extract animation data
      const processedData = await giftProcessingService.processGiftUrl(giftUrl);

      res.json({
        success: true,
        animationData: processedData.animationData,
        tgsUrl: processedData.tgsUrl,
      });
    } catch (error) {
      console.error('Error processing gift URL:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to process gift URL',
      });
    }
  },

  /**
   * Process gift URL and update existing gift in database
   */
  async processAndUpdateGift(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { giftId, giftUrl } = req.body;
      if (!giftId) {
        res.status(400).json({ error: 'giftId is required' });
        return;
      }

      if (!giftUrl) {
        res.status(400).json({ error: 'giftUrl is required' });
        return;
      }

      // Get user
      const user = await userRepository.findByTelegramId(telegramId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // Verify gift ownership
      const gift = await giftRepository.findById(giftId);
      if (!gift) {
        res.status(404).json({ error: 'Gift not found' });
        return;
      }

      // Process the gift URL
      const processedData = await giftProcessingService.processGiftUrl(giftUrl);

      // Update gift with animation data
      await giftRepository.update(giftId, {
        animationData: processedData.animationData,
        giftUrl: giftUrl,
      });

      res.json({
        success: true,
        message: 'Gift animation data updated successfully',
      });
    } catch (error) {
      console.error('Error processing and updating gift:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to process and update gift',
      });
    }
  },

  /**
   * Process all unprocessed gifts for the authenticated user
   * This processes gifts that have gift_url but no animation_data
   */
  async processAllUnprocessedGifts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's inventory
      const inventory = await inventoryService.getUserInventory(telegramId);
      
      // Filter gifts that need processing (have gift_url but no animation_data)
      const unprocessedGifts = inventory.filter(
        (gift: any) => gift.gift_url && !gift.animation_data
      );

      if (unprocessedGifts.length === 0) {
        res.json({
          success: true,
          message: 'No unprocessed gifts found',
          processed: 0,
        });
        return;
      }

      console.log(`Processing ${unprocessedGifts.length} unprocessed gifts...`);

      // Process gifts in parallel (but limit concurrency to avoid overwhelming the server)
      const results = await Promise.allSettled(
        unprocessedGifts.map(async (gift: any) => {
          try {
            console.log(`Processing gift ${gift.id}: ${gift.gift_url}`);
            const processedData = await giftProcessingService.processGiftUrl(gift.gift_url);
            
            await giftRepository.update(gift.id, {
              animationData: processedData.animationData,
              giftUrl: gift.gift_url,
            });

            return { giftId: gift.id, success: true };
          } catch (error) {
            console.error(`Failed to process gift ${gift.id}:`, error);
            return { 
              giftId: gift.id, 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      res.json({
        success: true,
        message: `Processed ${successful} out of ${unprocessedGifts.length} gifts`,
        processed: successful,
        failed,
        total: unprocessedGifts.length,
      });
    } catch (error) {
      console.error('Error processing all unprocessed gifts:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to process gifts',
      });
    }
  },
};

