import axios from 'axios';
import * as pako from 'pako';
import puppeteer, { Browser, Page } from 'puppeteer';

export interface ProcessedGiftData {
  animationData: any; // Lottie JSON object
  tgsUrl: string | null;
}

class GiftProcessingService {
  private browser: Browser | null = null;
  private browserPromise: Promise<Browser> | null = null;

  /**
   * Get or create a browser instance (reused for efficiency)
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    if (this.browserPromise) {
      return this.browserPromise;
    }

    // Determine Chromium executable path
    // On Railway with nixpacks, Chromium should be in PATH
    let executablePath: string | undefined = process.env.PUPPETEER_EXECUTABLE_PATH;
    
    // Try to find Chromium using which command (most reliable on Linux)
    if (!executablePath) {
      try {
        const { execSync } = require('child_process');
        const chromiumPath = execSync('which chromium 2>/dev/null || which chromium-browser 2>/dev/null || echo ""', { 
          encoding: 'utf-8',
          timeout: 5000 
        }).trim();
        if (chromiumPath) {
          executablePath = chromiumPath;
          console.log(`✅ Found Chromium via which: ${chromiumPath}`);
        }
      } catch (e) {
        console.warn('Could not find Chromium via which command, will try bundled');
      }
    }
    
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    };

    // Only set executablePath if we found one, otherwise let Puppeteer use bundled
    if (executablePath) {
      launchOptions.executablePath = executablePath;
      console.log(`🚀 Using system Chromium: ${executablePath}`);
    } else {
      console.log(`🚀 Using Puppeteer bundled Chromium`);
    }
    
    this.browserPromise = puppeteer.launch(launchOptions);

    this.browser = await this.browserPromise;
    
    // Handle browser disconnection
    this.browser.on('disconnected', () => {
      this.browser = null;
      this.browserPromise = null;
    });

    return this.browser;
  }

  /**
   * Extract .tgs URL from Telegram NFT page using Puppeteer
   */
  private async extractTgsUrlWithPuppeteer(giftUrl: string): Promise<string | null> {
    let page: Page | null = null;
    
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      // Set User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36'
      );

      console.log(`🌐 Opening page: ${giftUrl}`);
      
      // Navigate to the page and wait for content to load
      await page.goto(giftUrl, {
        waitUntil: 'networkidle2',
        timeout: 90000,
      });

      // Wait for the source element with .tgs file
      const selector = 'source[type="application/x-tgsticker"]';
      console.log(`⏳ Waiting for selector: ${selector}`);
      
      await page.waitForSelector(selector, {
        timeout: 60000,
      });

      // Extract srcset attribute from the source element
      const tgsUrl = await page.$eval(
        selector,
        (el) => el.getAttribute('srcset')
      );

      if (!tgsUrl) {
        console.error('❌ Failed to get .tgs URL from DOM');
        return null;
      }

      // Parse srcset - take first URL (srcset can have multiple values)
      const finalTgsUrl = tgsUrl.split(',')[0].trim().split(' ')[0].trim();
      console.log(`✅ Found .tgs URL: ${finalTgsUrl}`);

      return finalTgsUrl;
    } catch (error) {
      console.error('Error extracting .tgs URL with Puppeteer:', error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
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

      console.log(`🔗 Processing gift URL: ${giftUrl}`);

      // 1. Extract .tgs URL using Puppeteer (required because page loads dynamically)
      console.log('🌐 Extracting .tgs URL using Puppeteer...');
      const tgsUrl = await this.extractTgsUrlWithPuppeteer(giftUrl);
      
      if (!tgsUrl) {
        throw new Error('TGS URL not found on page. The page might not have loaded correctly.');
      }

      // 2. Download and decompress .tgs to Lottie JSON
      console.log('💾 Downloading and decompressing .tgs file...');
      const animationData = await this.downloadAndDecompressTgs(tgsUrl);
      console.log('✅ Animation data extracted successfully');

      return {
        animationData,
        tgsUrl,
      };
    } catch (error) {
      console.error('❌ Error processing gift URL:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process gift URL: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Cleanup browser instance (call on app shutdown)
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.browserPromise = null;
    }
  }
}

export const giftProcessingService = new GiftProcessingService();

