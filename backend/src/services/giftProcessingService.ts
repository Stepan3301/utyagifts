import axios from 'axios';
import * as pako from 'pako';

export interface ProcessedGiftData {
  animationData: any; // Lottie JSON object
  tgsUrl: string | null;
}

class GiftProcessingService {
  /**
   * Extract .tgs URL from HTML page
   */
  private extractTgsUrl(html: string): string | null {
    // Look for .tgs URLs in the HTML
    const match = html.match(/https?:\/\/[^\s"']+\.tgs/);
    return match ? match[0] : null;
  }

  /**
   * Download and decompress .tgs file to Lottie JSON
   */
  private async downloadAndDecompressTgs(tgsUrl: string): Promise<any> {
    try {
      const response = await axios.get(tgsUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const tgsBuffer = Buffer.from(response.data);
      
      // Decompress gzip data
      const jsonStr = pako.ungzip(tgsBuffer, { to: 'string' });
      const animationData = JSON.parse(jsonStr);

      return animationData;
    } catch (error) {
      console.error('Error downloading/decompressing .tgs file:', error);
      throw new Error(`Failed to process .tgs file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process Telegram gift URL to extract animation data
   */
  async processGiftUrl(giftUrl: string): Promise<ProcessedGiftData> {
    try {
      // Validate URL format
      if (!giftUrl || !giftUrl.startsWith('https://t.me/nft/')) {
        throw new Error('Invalid gift URL format. Expected: https://t.me/nft/...');
      }

      // 1. Download HTML page
      const pageResponse = await axios.get(giftUrl, {
        responseType: 'text',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = pageResponse.data;

      // 2. Extract .tgs URL
      const tgsUrl = this.extractTgsUrl(html);
      if (!tgsUrl) {
        throw new Error('TGS URL not found on page');
      }

      // 3. Download and decompress .tgs to Lottie JSON
      const animationData = await this.downloadAndDecompressTgs(tgsUrl);

      return {
        animationData,
        tgsUrl,
      };
    } catch (error) {
      console.error('Error processing gift URL:', error);
      throw error;
    }
  }
}

export const giftProcessingService = new GiftProcessingService();

