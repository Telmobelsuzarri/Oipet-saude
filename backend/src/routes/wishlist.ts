import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import Wishlist from '../models/Wishlist';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user!.id })
      .populate('products.petId', 'name species');

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user!.id,
        products: []
      });
      await wishlist.save();
    }

    res.json({
      success: true,
      wishlist: {
        id: wishlist._id,
        products: wishlist.products,
        count: wishlist.products.length,
        highPriorityCount: wishlist.getHighPriorityItems().length
      }
    });
  } catch (error) {
    logger.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Erro ao obter lista de desejos' });
  }
});

// Add product to wishlist
router.post('/add', async (req, res) => {
  try {
    const { productId, name, price, imageUrl, petId, notes, priority } = req.body;

    if (!productId || !name || !price || !imageUrl) {
      return res.status(400).json({ 
        error: 'productId, name, price e imageUrl são obrigatórios' 
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user!.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user!.id,
        products: []
      });
    }

    // Check if product already exists
    const existingProduct = wishlist.products.find(
      (p: any) => p.productId === productId
    );

    if (existingProduct) {
      return res.status(400).json({ 
        error: 'Produto já está na lista de desejos' 
      });
    }

    await wishlist.addProduct({
      productId,
      name,
      price,
      imageUrl,
      petId,
      notes,
      priority: priority || 'medium'
    });

    res.json({
      success: true,
      message: 'Produto adicionado à lista de desejos',
      wishlist: {
        id: wishlist._id,
        count: wishlist.products.length
      }
    });

    logger.info(`Product ${productId} added to wishlist by user ${req.user!.id}`);

  } catch (error) {
    logger.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Erro ao adicionar à lista de desejos' });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user!.id });

    if (!wishlist) {
      return res.status(404).json({ error: 'Lista de desejos não encontrada' });
    }

    const productExists = wishlist.products.some(
      (p: any) => p.productId === productId
    );

    if (!productExists) {
      return res.status(404).json({ 
        error: 'Produto não encontrado na lista de desejos' 
      });
    }

    await wishlist.removeProduct(productId);

    res.json({
      success: true,
      message: 'Produto removido da lista de desejos',
      wishlist: {
        id: wishlist._id,
        count: wishlist.products.length
      }
    });

    logger.info(`Product ${productId} removed from wishlist by user ${req.user!.id}`);

  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Erro ao remover da lista de desejos' });
  }
});

// Update product priority
router.patch('/priority/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Prioridade deve ser: low, medium ou high' 
      });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user!.id });

    if (!wishlist) {
      return res.status(404).json({ error: 'Lista de desejos não encontrada' });
    }

    await wishlist.updateProductPriority(productId, priority);

    res.json({
      success: true,
      message: 'Prioridade atualizada com sucesso'
    });

  } catch (error) {
    logger.error('Update priority error:', error);
    res.status(500).json({ error: 'Erro ao atualizar prioridade' });
  }
});

// Add notes to product
router.patch('/notes/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { notes } = req.body;

    const wishlist = await Wishlist.findOne({ userId: req.user!.id });

    if (!wishlist) {
      return res.status(404).json({ error: 'Lista de desejos não encontrada' });
    }

    const product = wishlist.products.find((p: any) => p.productId === productId);

    if (!product) {
      return res.status(404).json({ 
        error: 'Produto não encontrado na lista de desejos' 
      });
    }

    product.notes = notes;
    await wishlist.save();

    res.json({
      success: true,
      message: 'Observações atualizadas com sucesso'
    });

  } catch (error) {
    logger.error('Update notes error:', error);
    res.status(500).json({ error: 'Erro ao atualizar observações' });
  }
});

// Get high priority items
router.get('/priority/high', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user!.id })
      .populate('products.petId', 'name species');

    if (!wishlist) {
      return res.json({
        success: true,
        products: []
      });
    }

    const highPriorityItems = wishlist.getHighPriorityItems();

    res.json({
      success: true,
      products: highPriorityItems,
      count: highPriorityItems.length
    });

  } catch (error) {
    logger.error('Get high priority items error:', error);
    res.status(500).json({ error: 'Erro ao obter itens prioritários' });
  }
});

// Clear entire wishlist
router.delete('/clear', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user!.id });

    if (!wishlist) {
      return res.status(404).json({ error: 'Lista de desejos não encontrada' });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Lista de desejos limpa com sucesso'
    });

    logger.info(`Wishlist cleared by user ${req.user!.id}`);

  } catch (error) {
    logger.error('Clear wishlist error:', error);
    res.status(500).json({ error: 'Erro ao limpar lista de desejos' });
  }
});

// Get wishlist statistics
router.get('/stats', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user!.id });

    if (!wishlist) {
      return res.json({
        success: true,
        stats: {
          totalItems: 0,
          totalValue: 0,
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
          oldestItem: null,
          newestItem: null
        }
      });
    }

    const products = wishlist.products;
    const totalValue = products.reduce((sum, p: any) => sum + p.price, 0);
    
    const priorityCounts = products.reduce((acc, p: any) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedByDate = products.sort((a: any, b: any) => 
      a.addedAt.getTime() - b.addedAt.getTime()
    );

    const stats = {
      totalItems: products.length,
      totalValue: Math.round(totalValue * 100) / 100,
      highPriority: priorityCounts.high || 0,
      mediumPriority: priorityCounts.medium || 0,
      lowPriority: priorityCounts.low || 0,
      oldestItem: sortedByDate[0] || null,
      newestItem: sortedByDate[sortedByDate.length - 1] || null
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Get wishlist stats error:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user!.id });

    const isInWishlist = wishlist?.products.some(
      (p: any) => p.productId === productId
    ) || false;

    res.json({
      success: true,
      inWishlist: isInWishlist
    });

  } catch (error) {
    logger.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Erro ao verificar lista de desejos' });
  }
});

export default router;