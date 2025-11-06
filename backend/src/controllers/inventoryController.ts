import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { inventoryService } from '../services/inventoryService';

export const inventoryController = {
  async getInventory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const telegramId = req.user?.telegramId;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const inventory = await inventoryService.getUserInventory(telegramId);
      res.json({ inventory });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  },

  async getGift(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { giftId } = req.params;
      const telegramId = req.user?.telegramId;
      
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const gift = await inventoryService.getGiftById(giftId, telegramId);
      
      if (!gift) {
        res.status(404).json({ error: 'Gift not found' });
        return;
      }

      res.json({ gift });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gift' });
    }
  },
};

