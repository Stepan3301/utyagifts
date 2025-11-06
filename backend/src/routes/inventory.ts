import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticate } from '../middleware/authenticate';

export const inventoryRouter = Router();

// All inventory routes require authentication
inventoryRouter.use(authenticate);

// Get user's inventory
inventoryRouter.get('/', inventoryController.getInventory);

// Get specific gift details
inventoryRouter.get('/:giftId', inventoryController.getGift);

