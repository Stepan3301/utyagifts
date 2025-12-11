import { Request, Response, NextFunction } from 'express';
import { portalsPriceService } from '../services/portalsPriceService';
import { supabase } from '../lib/supabase';

/**
 * Set Portals authorization token
 * POST /api/floor-price/set-token
 */
export const setPortalsToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    portalsPriceService.setToken(token);
    res.json({ success: true, message: 'Token set successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get floor price for a specific gift by URL
 * POST /api/floor-price/fetch
 */
export const fetchFloorPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { giftUrl } = req.body;

    if (!giftUrl || !giftUrl.startsWith('https://t.me/nft/')) {
      res.status(400).json({ error: 'Valid gift URL is required (https://t.me/nft/...)' });
      return;
    }

    const result = await portalsPriceService.getGiftFloorFromUrl(giftUrl);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update floor price for a specific gift
 * POST /api/floor-price/update/:giftId
 */
export const updateGiftFloorPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { giftId } = req.params;

    // Get the gift to find its URL
    const { data: gift, error } = await supabase
      .from('gifts')
      .select('id, gift_url')
      .eq('id', giftId)
      .single();

    if (error || !gift) {
      res.status(404).json({ error: 'Gift not found' });
      return;
    }

    if (!gift.gift_url) {
      res.status(400).json({ error: 'Gift does not have a URL' });
      return;
    }

    const result = await portalsPriceService.updateGiftFloorPrice(gift.id, gift.gift_url);
    res.json({
      success: true,
      giftId: gift.id,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update floor prices for all gifts needing updates
 * POST /api/floor-price/update-all
 */
export const updateAllFloorPrices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { maxAgeMinutes } = req.body;
    const result = await portalsPriceService.updateAllFloorPrices(maxAgeMinutes || 30);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get floor price info for a gift
 * GET /api/floor-price/:giftId
 */
export const getGiftFloorPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { giftId } = req.params;

    const { data: gift, error } = await supabase
      .from('gifts')
      .select('id, name, model, collection_id, floor_price, floor_price_asset, floor_price_updated_at, gift_url')
      .eq('id', giftId)
      .single();

    if (error || !gift) {
      res.status(404).json({ error: 'Gift not found' });
      return;
    }

    res.json({
      giftId: gift.id,
      name: gift.name,
      model: gift.model,
      collectionId: gift.collection_id,
      floorPrice: gift.floor_price,
      floorPriceAsset: gift.floor_price_asset || 'TON',
      lastUpdated: gift.floor_price_updated_at,
      giftUrl: gift.gift_url,
    });
  } catch (error) {
    next(error);
  }
};

