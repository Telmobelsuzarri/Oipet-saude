import { logger } from '../utils/logger';
import { RedisService } from '../config/redis';

export class DeepLinkService {
  private static readonly BASE_URL = process.env.BASE_URL || 'https://oipet-saude.vercel.app';
  private static readonly MOBILE_SCHEME = 'oipet://';

  // Generate deep link for product
  static generateProductLink(productId: string, options?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  }): {
    webUrl: string;
    mobileUrl: string;
    universalUrl: string;
  } {
    const params = new URLSearchParams();
    params.set('product', productId);

    if (options?.utm_source) params.set('utm_source', options.utm_source);
    if (options?.utm_medium) params.set('utm_medium', options.utm_medium);
    if (options?.utm_campaign) params.set('utm_campaign', options.utm_campaign);
    if (options?.referrer) params.set('referrer', options.referrer);

    const webUrl = `${this.BASE_URL}/store/product/${productId}?${params.toString()}`;
    const mobileUrl = `${this.MOBILE_SCHEME}product/${productId}?${params.toString()}`;
    
    // Universal Link (iOS) / App Link (Android)
    const universalUrl = `${this.BASE_URL}/app/product/${productId}?${params.toString()}`;

    return {
      webUrl,
      mobileUrl,
      universalUrl
    };
  }

  // Generate deep link for pet
  static generatePetLink(petId: string): {
    webUrl: string;
    mobileUrl: string;
    universalUrl: string;
  } {
    const webUrl = `${this.BASE_URL}/pets/${petId}`;
    const mobileUrl = `${this.MOBILE_SCHEME}pets/${petId}`;
    const universalUrl = `${this.BASE_URL}/app/pets/${petId}`;

    return {
      webUrl,
      mobileUrl,
      universalUrl
    };
  }

  // Generate deep link for health record
  static generateHealthLink(petId: string, recordId?: string): {
    webUrl: string;
    mobileUrl: string;
    universalUrl: string;
  } {
    const path = recordId ? `/health/${petId}/record/${recordId}` : `/health/${petId}`;
    
    const webUrl = `${this.BASE_URL}${path}`;
    const mobileUrl = `${this.MOBILE_SCHEME}${path.substring(1)}`;
    const universalUrl = `${this.BASE_URL}/app${path}`;

    return {
      webUrl,
      mobileUrl,
      universalUrl
    };
  }

  // Generate deep link for food scan
  static generateFoodScanLink(scanId: string): {
    webUrl: string;
    mobileUrl: string;
    universalUrl: string;
  } {
    const webUrl = `${this.BASE_URL}/scanner/result/${scanId}`;
    const mobileUrl = `${this.MOBILE_SCHEME}scanner/result/${scanId}`;
    const universalUrl = `${this.BASE_URL}/app/scanner/result/${scanId}`;

    return {
      webUrl,
      mobileUrl,
      universalUrl
    };
  }

  // Generate sharing link with tracking
  static async generateShareLink(
    type: 'product' | 'pet' | 'health' | 'scan',
    id: string,
    userId?: string,
    customMessage?: string
  ): Promise<{
    shortUrl: string;
    fullUrl: string;
    trackingId: string;
  }> {
    try {
      // Generate tracking ID
      const trackingId = `share_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Get appropriate link
      let links;
      switch (type) {
        case 'product':
          links = this.generateProductLink(id, {
            utm_source: 'share',
            utm_medium: 'mobile',
            utm_campaign: 'product_share'
          });
          break;
        case 'pet':
          links = this.generatePetLink(id);
          break;
        case 'health':
          links = this.generateHealthLink(id);
          break;
        case 'scan':
          links = this.generateFoodScanLink(id);
          break;
        default:
          throw new Error('Invalid share type');
      }

      // Store tracking info
      const trackingData = {
        type,
        id,
        userId,
        customMessage,
        createdAt: new Date(),
        clicks: 0,
        lastClickAt: null
      };

      await RedisService.set(`share:${trackingId}`, trackingData, 86400 * 30); // 30 days

      // Create short URL
      const shortUrl = `${this.BASE_URL}/s/${trackingId}`;

      logger.info(`Share link generated: ${type}/${id} by user ${userId}`);

      return {
        shortUrl,
        fullUrl: links.universalUrl,
        trackingId
      };

    } catch (error) {
      logger.error('Generate share link error:', error);
      throw error;
    }
  }

  // Track link click
  static async trackLinkClick(trackingId: string, metadata?: {
    userAgent?: string;
    referrer?: string;
    ip?: string;
  }): Promise<{
    redirectUrl: string;
    trackingData: any;
  }> {
    try {
      const trackingData = await RedisService.get(`share:${trackingId}`) as any;

      if (!trackingData) {
        throw new Error('Link not found or expired');
      }

      // Update click count
      trackingData.clicks = (trackingData.clicks || 0) + 1;
      trackingData.lastClickAt = new Date();
      
      if (metadata) {
        if (!trackingData.clickMetadata) trackingData.clickMetadata = [];
        trackingData.clickMetadata.push({
          ...metadata,
          timestamp: new Date()
        });
      }

      // Update tracking data
      await RedisService.set(`share:${trackingId}`, trackingData, 86400 * 30);

      // Generate redirect URL based on type
      let redirectUrl;
      switch (trackingData.type) {
        case 'product':
          const productLinks = this.generateProductLink(trackingData.id);
          redirectUrl = productLinks.universalUrl;
          break;
        case 'pet':
          const petLinks = this.generatePetLink(trackingData.id);
          redirectUrl = petLinks.universalUrl;
          break;
        case 'health':
          const healthLinks = this.generateHealthLink(trackingData.id);
          redirectUrl = healthLinks.universalUrl;
          break;
        case 'scan':
          const scanLinks = this.generateFoodScanLink(trackingData.id);
          redirectUrl = scanLinks.universalUrl;
          break;
        default:
          redirectUrl = this.BASE_URL;
      }

      logger.info(`Link clicked: ${trackingId} (${trackingData.clicks} total)`);

      return {
        redirectUrl,
        trackingData
      };

    } catch (error) {
      logger.error('Track link click error:', error);
      throw error;
    }
  }

  // Get link analytics
  static async getLinkAnalytics(trackingId: string): Promise<{
    trackingId: string;
    type: string;
    id: string;
    clicks: number;
    createdAt: Date;
    lastClickAt: Date | null;
    clickMetadata?: Array<any>;
  }> {
    try {
      const trackingData = await RedisService.get(`share:${trackingId}`) as any;

      if (!trackingData) {
        throw new Error('Tracking data not found');
      }

      return {
        trackingId,
        type: trackingData.type,
        id: trackingData.id,
        clicks: trackingData.clicks || 0,
        createdAt: new Date(trackingData.createdAt),
        lastClickAt: trackingData.lastClickAt ? new Date(trackingData.lastClickAt) : null,
        clickMetadata: trackingData.clickMetadata || []
      };

    } catch (error) {
      logger.error('Get link analytics error:', error);
      throw error;
    }
  }

  // Generate App Store / Play Store links
  static getAppStoreLinks(): {
    ios: string;
    android: string;
    web: string;
  } {
    return {
      ios: 'https://apps.apple.com/app/oipet-saude/id123456789', // To be updated
      android: 'https://play.google.com/store/apps/details?id=com.oipet.saude', // To be updated
      web: this.BASE_URL
    };
  }

  // Smart redirect based on user agent
  static getSmartRedirect(
    targetUrl: string,
    userAgent?: string
  ): {
    shouldRedirectToApp: boolean;
    redirectUrl: string;
    fallbackUrl: string;
  } {
    const isIOS = userAgent?.includes('iPhone') || userAgent?.includes('iPad');
    const isAndroid = userAgent?.includes('Android');
    const isMobile = isIOS || isAndroid;

    const appStoreLinks = this.getAppStoreLinks();

    if (isMobile) {
      return {
        shouldRedirectToApp: true,
        redirectUrl: isIOS ? appStoreLinks.ios : appStoreLinks.android,
        fallbackUrl: targetUrl
      };
    }

    return {
      shouldRedirectToApp: false,
      redirectUrl: targetUrl,
      fallbackUrl: targetUrl
    };
  }

  // Generate QR Code data for links
  static generateQRCodeData(
    type: 'product' | 'pet' | 'health' | 'scan',
    id: string
  ): {
    data: string;
    url: string;
  } {
    let links;
    
    switch (type) {
      case 'product':
        links = this.generateProductLink(id, {
          utm_source: 'qr_code',
          utm_medium: 'print',
          utm_campaign: 'qr_share'
        });
        break;
      case 'pet':
        links = this.generatePetLink(id);
        break;
      case 'health':
        links = this.generateHealthLink(id);
        break;
      case 'scan':
        links = this.generateFoodScanLink(id);
        break;
      default:
        throw new Error('Invalid QR type');
    }

    return {
      data: links.universalUrl,
      url: links.universalUrl
    };
  }

  // Validate deep link
  static validateDeepLink(url: string): {
    isValid: boolean;
    type?: string;
    id?: string;
    params?: Record<string, string>;
  } {
    try {
      const urlObj = new URL(url);
      
      // Check if it's our domain
      if (!url.includes(this.BASE_URL) && !url.startsWith(this.MOBILE_SCHEME)) {
        return { isValid: false };
      }

      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathSegments.length < 2) {
        return { isValid: false };
      }

      const type = pathSegments[0];
      const id = pathSegments[1];

      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return {
        isValid: true,
        type,
        id,
        params
      };

    } catch (error) {
      return { isValid: false };
    }
  }
}