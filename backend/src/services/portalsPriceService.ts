import axios from 'axios';
import { supabase } from '../lib/supabase';

const PORTALS_API_URL = 'https://portal-market.com/api';

export interface GiftMetadata {
  name: string | null;
  model: string | null;
}

export interface FloorPriceData {
  price: number | null;
  asset: string;
  portalId: string | null;
  collectionNumber: number | null;
}

export interface GiftFloorResult {
  giftUrl: string;
  name: string | null;
  model: string | null;
  collectionId: number | null;
  floorPrice: FloorPriceData | null;
}

class PortalsPriceService {
  private portalsToken: string | null = null;

  /**
   * Set the Portals authorization token (tma token from Telegram WebApp)
   * This token can be obtained by opening Portals mini-app in Telegram
   */
  setToken(token: string): void {
    this.portalsToken = token.startsWith('tma ') ? token : `tma ${token}`;
    console.log('✅ Portals token set');
  }

  /**
   * Get authorization headers for Portals API
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
    };

    if (this.portalsToken) {
      headers['Authorization'] = this.portalsToken;
    }

    return headers;
  }

  /**
   * Parse gift metadata (name and model) from Telegram NFT page
   * Example URL: https://t.me/nft/LunarSnake-99977
   */
  async fetchGiftMetadata(giftUrl: string): Promise<GiftMetadata> {
    try {
      const response = await axios.get(giftUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 30000,
      });

      const html = response.data as string;

      // Extract name from og:title meta tag
      // Example: <meta property="og:title" content="Lunar Snake #99977">
      let name: string | null = null;
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      if (titleMatch && titleMatch[1]) {
        // Extract just the gift name without the number
        // "Lunar Snake #99977" -> "Lunar Snake"
        const fullTitle = titleMatch[1].trim();
        const hashIndex = fullTitle.lastIndexOf('#');
        name = hashIndex > 0 ? fullTitle.substring(0, hashIndex).trim() : fullTitle;
      }

      // Try to extract model from the page content
      // Model appears as "Model Night Market 0.8%" in the page
      let model: string | null = null;
      
      // Look for Model in the page content
      // The format is usually: Model <model_name> <percentage>%
      const modelMatch = html.match(/Model\s+([^<]+?)\s+[\d.]+%/i);
      if (modelMatch && modelMatch[1]) {
        model = modelMatch[1].trim();
      }

      // Alternative: Try to find model in structured data or other meta tags
      if (!model) {
        // Some pages might have the model in different formats
        const altModelMatch = html.match(/"model"\s*:\s*"([^"]+)"/i);
        if (altModelMatch && altModelMatch[1]) {
          model = altModelMatch[1].trim();
        }
      }

      console.log(`📋 Extracted metadata - Name: "${name}", Model: "${model}"`);
      return { name, model };
    } catch (error) {
      console.error('Error fetching gift metadata:', error);
      return { name: null, model: null };
    }
  }

  /**
   * Get collection ID from Portals API by gift name
   */
  async getCollectionId(giftName: string): Promise<number | null> {
    try {
      const response = await axios.get(`${PORTALS_API_URL}/collections`, {
        params: {
          search: giftName,
          limit: '10',
        },
        headers: this.getHeaders(),
        timeout: 30000,
      });

      const collections = response.data?.collections || [];
      if (collections.length === 0) {
        console.warn(`⚠️ Collection not found for "${giftName}"`);
        return null;
      }

      const collectionId = collections[0].id;
      console.log(`🔍 Found collection ID: ${collectionId} for "${giftName}"`);
      return collectionId;
    } catch (error) {
      console.error('Error getting collection ID:', error);
      return null;
    }
  }

  /**
   * Get floor price for a collection (optionally filtered by model)
   */
  async getFloorPrice(collectionId: number, model?: string | null): Promise<FloorPriceData | null> {
    try {
      const params: Record<string, string> = {
        offset: '0',
        limit: '1',
        status: 'listed',
        sort_by: 'price asc',
        collection_ids: String(collectionId),
      };

      if (model) {
        params.filter_by_models = model;
      }

      const response = await axios.get(`${PORTALS_API_URL}/nfts/search`, {
        params,
        headers: this.getHeaders(),
        timeout: 30000,
      });

      const results = response.data?.results || [];
      if (results.length === 0) {
        console.warn(`⚠️ No listings found for collection ${collectionId}${model ? ` with model "${model}"` : ''}`);
        
        // If no results with model filter, try without it
        if (model) {
          console.log('🔄 Retrying without model filter...');
          return this.getFloorPrice(collectionId, null);
        }
        
        return null;
      }

      const item = results[0];
      const floorPrice: FloorPriceData = {
        price: item.price ? parseFloat(item.price) : null,
        asset: item.asset || 'TON',
        portalId: item.id || null,
        collectionNumber: item.external_collection_number || null,
      };

      console.log(`💰 Floor price: ${floorPrice.price} ${floorPrice.asset}`);
      return floorPrice;
    } catch (error) {
      console.error('Error getting floor price:', error);
      return null;
    }
  }

  /**
   * Get complete floor price data for a gift from its Telegram URL
   */
  async getGiftFloorFromUrl(giftUrl: string): Promise<GiftFloorResult> {
    console.log(`🔗 Getting floor price for: ${giftUrl}`);

    // 1. Fetch gift metadata from Telegram page
    const { name, model } = await this.fetchGiftMetadata(giftUrl);

    if (!name) {
      console.warn('❌ Could not extract gift name from URL');
      return {
        giftUrl,
        name: null,
        model: null,
        collectionId: null,
        floorPrice: null,
      };
    }

    // 2. Get collection ID from Portals
    const collectionId = await this.getCollectionId(name);
    if (!collectionId) {
      return {
        giftUrl,
        name,
        model,
        collectionId: null,
        floorPrice: null,
      };
    }

    // 3. Get floor price
    const floorPrice = await this.getFloorPrice(collectionId, model);

    return {
      giftUrl,
      name,
      model,
      collectionId,
      floorPrice,
    };
  }

  /**
   * Update floor price for a specific gift in the database
   */
  async updateGiftFloorPrice(giftId: string, giftUrl: string): Promise<GiftFloorResult> {
    const result = await this.getGiftFloorFromUrl(giftUrl);

    // Update the gift in database
    const updateData: Record<string, unknown> = {
      floor_price_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (result.name) {
      updateData.name = result.name;
    }

    if (result.model) {
      updateData.model = result.model;
    }

    if (result.collectionId) {
      updateData.collection_id = result.collectionId;
    }

    if (result.floorPrice) {
      updateData.floor_price = result.floorPrice.price;
      updateData.floor_price_asset = result.floorPrice.asset;
    }

    const { error } = await supabase
      .from('gifts')
      .update(updateData)
      .eq('id', giftId);

    if (error) {
      console.error('Error updating gift floor price:', error);
    } else {
      console.log(`✅ Updated floor price for gift ${giftId}`);
    }

    return result;
  }

  /**
   * Update floor prices for all gifts that have gift_url but no recent price update
   * @param maxAgeMinutes - Only update prices older than this (default: 30 minutes)
   */
  async updateAllFloorPrices(maxAgeMinutes = 30): Promise<{ updated: number; failed: number }> {
    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();

    // Get all gifts that need price updates
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('id, gift_url, floor_price_updated_at')
      .not('gift_url', 'is', null)
      .or(`floor_price_updated_at.is.null,floor_price_updated_at.lt.${cutoffTime}`);

    if (error) {
      console.error('Error fetching gifts for price update:', error);
      return { updated: 0, failed: 0 };
    }

    if (!gifts || gifts.length === 0) {
      console.log('📭 No gifts need price updates');
      return { updated: 0, failed: 0 };
    }

    console.log(`📦 Found ${gifts.length} gifts needing price updates`);

    let updated = 0;
    let failed = 0;

    for (const gift of gifts) {
      if (!gift.gift_url) continue;

      try {
        await this.updateGiftFloorPrice(gift.id, gift.gift_url);
        updated++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to update price for gift ${gift.id}:`, error);
        failed++;
      }
    }

    console.log(`✅ Price update complete: ${updated} updated, ${failed} failed`);
    return { updated, failed };
  }
}

export const portalsPriceService = new PortalsPriceService();

