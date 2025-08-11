import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { ProductService } from '../services/productService';

const router = express.Router();
const productService = new ProductService();

// GET /api/products - Listar produtos com filtros
router.get('/', [
  query('category').optional().isString(),
  query('petType').optional().isIn(['dog', 'cat', 'both']),
  query('ageGroup').optional().isIn(['puppy', 'adult', 'senior', 'all']),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['name', 'price', 'rating', 'newest']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('inStock').optional().isBoolean(),
  query('minPrice').optional().isFloat({ min: 0 }),  
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('brand').optional().isString()
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

    const filters = {
      category: req.query.category as string,
      petType: req.query.petType as 'dog' | 'cat' | 'both',
      ageGroup: req.query.ageGroup as 'puppy' | 'adult' | 'senior' | 'all',
      search: req.query.search as string,
      sortBy: req.query.sortBy as 'name' | 'price' | 'rating' | 'newest',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
      inStock: req.query.inStock === 'true',
      priceRange: req.query.minPrice || req.query.maxPrice ? {
        min: parseFloat(req.query.minPrice as string) || 0,
        max: parseFloat(req.query.maxPrice as string) || 9999
      } : undefined,
      brand: req.query.brand as string
    };

    const result = await productService.getProducts(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/products/:id - Obter produto específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/products/categories - Listar categorias
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await productService.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/products/search - Busca avançada de produtos
router.post('/search', [
  auth,
  body('query').isString().isLength({ min: 1, max: 100 }),
  body('filters').optional().isObject()
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

    const { query, filters } = req.body;
    const searchFilters = {
      search: query,
      ...filters,
      limit: 20
    };

    const result = await productService.getProducts(searchFilters);

    res.json({
      success: true,
      data: result.products
    });
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/products/recommendations - Recomendações baseadas no pet
router.post('/recommendations', [
  auth,
  body('petId').isString(),
  body('limit').optional().isInt({ min: 1, max: 20 })
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

    const { petId, limit = 8 } = req.body;
    const recommendations = await productService.getRecommendationsForPet(petId, limit);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/products/brands - Listar marcas disponíveis
router.get('/brands', async (req: Request, res: Response) => {
  try {
    const brands = await productService.getBrands();

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Brands fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/products/track-view - Rastrear visualização de produto (analytics)
router.post('/track-view', [
  auth,
  body('productId').isString(),
  body('userId').optional().isString()
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

    const { productId, userId } = req.body;
    await productService.trackProductView(productId, userId || req.user?.userId);

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

export default router;