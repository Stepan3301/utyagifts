import { Router } from 'express';
import {
  setPortalsToken,
  fetchFloorPrice,
  updateGiftFloorPrice,
  updateAllFloorPrices,
  getGiftFloorPrice,
} from '../controllers/floorPriceController';

const router = Router();

// Set Portals authorization token
router.post('/set-token', setPortalsToken);

// Fetch floor price for a gift URL (without updating database)
router.post('/fetch', fetchFloorPrice);

// Get floor price for a specific gift
router.get('/:giftId', getGiftFloorPrice);

// Update floor price for a specific gift
router.post('/update/:giftId', updateGiftFloorPrice);

// Update floor prices for all gifts
router.post('/update-all', updateAllFloorPrices);

export default router;

