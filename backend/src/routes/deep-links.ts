import { Router } from 'express';
import { DeepLinkService } from '../services/deepLinkService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Generate product deep link
router.post('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { utm_source, utm_medium, utm_campaign, referrer } = req.body;

    const links = DeepLinkService.generateProductLink(productId, {
      utm_source,
      utm_medium,
      utm_campaign,
      referrer
    });

    res.json({
      success: true,
      productId,
      links
    });
  } catch (error) {
    logger.error('Generate product link error:', error);
    res.status(500).json({ error: 'Erro ao gerar link do produto' });
  }
});

// Generate pet deep link
router.post('/pet/:petId', authMiddleware, async (req, res) => {
  try {
    const { petId } = req.params;

    const links = DeepLinkService.generatePetLink(petId);

    res.json({
      success: true,
      petId,
      links
    });
  } catch (error) {
    logger.error('Generate pet link error:', error);
    res.status(500).json({ error: 'Erro ao gerar link do pet' });
  }
});

// Generate health record deep link
router.post('/health/:petId/:recordId?', authMiddleware, async (req, res) => {
  try {
    const { petId, recordId } = req.params;

    const links = DeepLinkService.generateHealthLink(petId, recordId);

    res.json({
      success: true,
      petId,
      recordId,
      links
    });
  } catch (error) {
    logger.error('Generate health link error:', error);
    res.status(500).json({ error: 'Erro ao gerar link de saúde' });
  }
});

// Generate food scan deep link
router.post('/scan/:scanId', authMiddleware, async (req, res) => {
  try {
    const { scanId } = req.params;

    const links = DeepLinkService.generateFoodScanLink(scanId);

    res.json({
      success: true,
      scanId,
      links
    });
  } catch (error) {
    logger.error('Generate scan link error:', error);
    res.status(500).json({ error: 'Erro ao gerar link do escaneamento' });
  }
});

// Generate shareable link with tracking
router.post('/share', authMiddleware, async (req, res) => {
  try {
    const { type, id, customMessage } = req.body;

    if (!type || !id) {
      return res.status(400).json({
        error: 'type e id são obrigatórios'
      });
    }

    if (!['product', 'pet', 'health', 'scan'].includes(type)) {
      return res.status(400).json({
        error: 'type deve ser: product, pet, health ou scan'
      });
    }

    const shareLink = await DeepLinkService.generateShareLink(
      type,
      id,
      req.user?.id,
      customMessage
    );

    res.json({
      success: true,
      shareLink
    });
  } catch (error) {
    logger.error('Generate share link error:', error);
    res.status(500).json({ error: 'Erro ao gerar link de compartilhamento' });
  }
});

// Short URL redirect with tracking
router.get('/s/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');
    const ip = req.ip;

    const { redirectUrl } = await DeepLinkService.trackLinkClick(
      trackingId,
      { userAgent, referrer, ip }
    );

    // Smart redirect based on user agent
    const smartRedirect = DeepLinkService.getSmartRedirect(redirectUrl, userAgent);

    if (smartRedirect.shouldRedirectToApp) {
      // Try app first, fallback to web
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redirecionando...</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <script>
            setTimeout(() => {
              window.location.href = "${smartRedirect.fallbackUrl}";
            }, 3000);
            
            window.location.href = "${smartRedirect.redirectUrl}";
          </script>
          <p>Redirecionando para o app OiPet Saúde...</p>
          <p><a href="${smartRedirect.fallbackUrl}">Clique aqui se não foi redirecionado</a></p>
        </body>
        </html>
      `);
    } else {
      res.redirect(redirectUrl);
    }
  } catch (error) {
    logger.error('Short URL redirect error:', error);
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Link não encontrado</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Link não encontrado ou expirado</h1>
        <p><a href="${DeepLinkService.getAppStoreLinks().web}">Ir para OiPet Saúde</a></p>
      </body>
      </html>
    `);
  }
});

// Get link analytics
router.get('/analytics/:trackingId', authMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;

    const analytics = await DeepLinkService.getLinkAnalytics(trackingId);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    logger.error('Get link analytics error:', error);
    res.status(500).json({ error: 'Erro ao obter analytics do link' });
  }
});

// Generate QR code data
router.post('/qr', async (req, res) => {
  try {
    const { type, id } = req.body;

    if (!type || !id) {
      return res.status(400).json({
        error: 'type e id são obrigatórios'
      });
    }

    if (!['product', 'pet', 'health', 'scan'].includes(type)) {
      return res.status(400).json({
        error: 'type deve ser: product, pet, health ou scan'
      });
    }

    const qrData = DeepLinkService.generateQRCodeData(type, id);

    res.json({
      success: true,
      qr: qrData
    });
  } catch (error) {
    logger.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Erro ao gerar QR code' });
  }
});

// Validate deep link
router.post('/validate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'url é obrigatória'
      });
    }

    const validation = DeepLinkService.validateDeepLink(url);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    logger.error('Validate link error:', error);
    res.status(500).json({ error: 'Erro ao validar link' });
  }
});

// Get app store links
router.get('/app-store', (req, res) => {
  try {
    const links = DeepLinkService.getAppStoreLinks();

    res.json({
      success: true,
      appStore: links
    });
  } catch (error) {
    logger.error('Get app store links error:', error);
    res.status(500).json({ error: 'Erro ao obter links da loja' });
  }
});

// Universal app redirect
router.get('/app/*', (req, res) => {
  try {
    const path = req.params[0];
    const userAgent = req.get('User-Agent');
    
    const targetUrl = `${process.env.BASE_URL || 'https://oipet-saude.vercel.app'}/${path}`;
    const smartRedirect = DeepLinkService.getSmartRedirect(targetUrl, userAgent);
    
    if (smartRedirect.shouldRedirectToApp) {
      const appStoreLinks = DeepLinkService.getAppStoreLinks();
      const isIOS = userAgent?.includes('iPhone') || userAgent?.includes('iPad');
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OiPet Saúde</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            .logo { max-width: 200px; margin-bottom: 20px; }
            .btn { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #E85A5A; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 10px;
            }
          </style>
        </head>
        <body>
          <h1>OiPet Saúde</h1>
          <p>Baixe nosso app para a melhor experiência!</p>
          <a href="${isIOS ? appStoreLinks.ios : appStoreLinks.android}" class="btn">
            ${isIOS ? 'Baixar na App Store' : 'Baixar no Google Play'}
          </a>
          <a href="${targetUrl}" class="btn">Continuar no navegador</a>
        </body>
        </html>
      `);
    } else {
      res.redirect(targetUrl);
    }
  } catch (error) {
    logger.error('Universal app redirect error:', error);
    res.redirect(process.env.BASE_URL || 'https://oipet-saude.vercel.app');
  }
});

export default router;