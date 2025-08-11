import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { ProductView } from '../models/ProductView';

const router = express.Router();

// POST /api/ecommerce-analytics/track-view - Rastrear visualização de produto
router.post('/track-view', [
  auth,
  body('productId').isString().notEmpty(),
  body('userId').optional().isString(),
  body('sessionId').optional().isString(),
  body('referrer').optional().isString(),
  body('userAgent').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { productId, userId, sessionId, referrer, userAgent } = req.body;

    await ProductView.create({
      productId,
      userId: userId || req.user?.userId,
      sessionId,
      referrer,
      userAgent,
      viewedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Visualização registrada'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/ecommerce-analytics/product-views - Visualizações por produto
router.get('/product-views', [
  auth,
  query('productId').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    const { productId, startDate, endDate, limit = 50 } = req.query;
    
    const filter: any = {};
    
    if (productId) {
      filter.productId = productId;
    }
    
    if (startDate || endDate) {
      filter.viewedAt = {};
      if (startDate) {
        filter.viewedAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.viewedAt.$lte = new Date(endDate as string);
      }
    }

    const views = await ProductView.find(filter)
      .sort({ viewedAt: -1 })
      .limit(parseInt(limit as string))
      .populate('userId', 'name email');

    const totalViews = await ProductView.countDocuments(filter);

    res.json({
      success: true,
      data: {
        views,
        total: totalViews
      }
    });
  } catch (error) {
    console.error('Product views error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/ecommerce-analytics/popular-products - Produtos mais visualizados
router.get('/popular-products', [
  auth,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    const { startDate, endDate, limit = 10 } = req.query;
    
    const matchFilter: any = {};
    
    if (startDate || endDate) {
      matchFilter.viewedAt = {};
      if (startDate) {
        matchFilter.viewedAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        matchFilter.viewedAt.$lte = new Date(endDate as string);
      }
    }

    const popularProducts = await ProductView.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$productId',
          totalViews: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          lastViewed: { $max: '$viewedAt' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $project: {
          productId: '$_id',
          totalViews: 1,
          uniqueUserCount: 1,
          lastViewed: 1,
          _id: 0
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    res.json({
      success: true,
      data: popularProducts
    });
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/ecommerce-analytics/conversion-metrics - Métricas de conversão
router.get('/conversion-metrics', [
  auth,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    
    const matchFilter: any = {};
    
    if (startDate || endDate) {
      matchFilter.viewedAt = {};
      if (startDate) {
        matchFilter.viewedAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        matchFilter.viewedAt.$lte = new Date(endDate as string);
      }
    }

    // Analytics básicos de visualizações
    const totalViews = await ProductView.countDocuments(matchFilter);
    const uniqueProducts = await ProductView.distinct('productId', matchFilter);
    const uniqueUsers = await ProductView.distinct('userId', matchFilter);

    // Métricas por período (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyViews = await ProductView.countDocuments({
      ...matchFilter,
      viewedAt: { $gte: sevenDaysAgo }
    });

    // Visualizações por dia (últimos 7 dias)
    const dailyViews = await ProductView.aggregate([
      {
        $match: {
          ...matchFilter,
          viewedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$viewedAt'
            }
          },
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $project: {
          date: '$_id',
          views: 1,
          uniqueUserCount: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueProducts: uniqueProducts.length,
        uniqueUsers: uniqueUsers.length,
        weeklyViews,
        dailyViews,
        conversionRate: 0, // Placeholder - seria calculado com dados de compra
        averageViewsPerProduct: uniqueProducts.length > 0 ? totalViews / uniqueProducts.length : 0
      }
    });
  } catch (error) {
    console.error('Conversion metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/ecommerce-analytics/dashboard - Dashboard analytics resumido
router.get('/dashboard', [auth], async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Views hoje
    const todayViews = await ProductView.countDocuments({
      viewedAt: { $gte: today }
    });

    // Views ontem
    const yesterdayViews = await ProductView.countDocuments({
      viewedAt: { $gte: yesterday, $lt: today }
    });

    // Views última semana
    const weekViews = await ProductView.countDocuments({
      viewedAt: { $gte: weekAgo }
    });

    // Top 5 produtos mais visualizados hoje
    const topProductsToday = await ProductView.aggregate([
      { $match: { viewedAt: { $gte: today } } },
      {
        $group: {
          _id: '$productId',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        $project: {
          productId: '$_id',
          views: 1,
          _id: 0
        }
      }
    ]);

    const growthRate = yesterdayViews > 0 
      ? ((todayViews - yesterdayViews) / yesterdayViews * 100).toFixed(1)
      : '0';

    res.json({
      success: true,
      data: {
        todayViews,
        yesterdayViews,
        weekViews,
        growthRate: parseFloat(growthRate),
        topProductsToday
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;