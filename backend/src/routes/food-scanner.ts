import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../config/storage';
import { FoodRecognitionService } from '../services/foodRecognitionService';
import { logger } from '../utils/logger';
import FoodScan from '../models/FoodScan';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Scan food with image upload
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    const { petId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Imagem é obrigatória' });
    }

    if (!petId) {
      return res.status(400).json({ error: 'Pet ID é obrigatório' });
    }

    // Get image URL
    const imageUrl = `/uploads/food-scans/${req.file.filename}`;

    // Process the scan
    const result = await FoodRecognitionService.processFoodScan(
      imageUrl,
      petId,
      req.user!.id
    );

    res.json({
      success: true,
      scan: result
    });

  } catch (error) {
    logger.error('Food scan error:', error);
    res.status(500).json({ 
      error: 'Erro ao processar escaneamento',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Scan food with image URL (for testing)
router.post('/scan-url', async (req, res) => {
  try {
    const { imageUrl, petId } = req.body;

    if (!imageUrl || !petId) {
      return res.status(400).json({ 
        error: 'imageUrl e petId são obrigatórios' 
      });
    }

    const result = await FoodRecognitionService.processFoodScan(
      imageUrl,
      petId,
      req.user!.id
    );

    res.json({
      success: true,
      scan: result
    });

  } catch (error) {
    logger.error('Food scan URL error:', error);
    res.status(500).json({ 
      error: 'Erro ao processar escaneamento',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check food safety
router.post('/check-safety', async (req, res) => {
  try {
    const { food, species } = req.body;

    if (!food || !species) {
      return res.status(400).json({ 
        error: 'food e species são obrigatórios' 
      });
    }

    if (!['dog', 'cat'].includes(species)) {
      return res.status(400).json({ 
        error: 'Species deve ser "dog" ou "cat"' 
      });
    }

    const safety = FoodRecognitionService.checkFoodSafety(food, species as 'dog' | 'cat');

    res.json({
      success: true,
      food,
      species,
      safety
    });

  } catch (error) {
    logger.error('Food safety check error:', error);
    res.status(500).json({ error: 'Erro ao verificar segurança do alimento' });
  }
});

// Get nutritional info
router.get('/nutrition/:food', async (req, res) => {
  try {
    const { food } = req.params;
    const quantity = parseInt(req.query.quantity as string) || 100;

    const nutrition = FoodRecognitionService.getNutritionalInfo(food, quantity);

    if (!nutrition) {
      return res.status(404).json({ 
        error: 'Informação nutricional não encontrada',
        food 
      });
    }

    res.json({
      success: true,
      nutrition
    });

  } catch (error) {
    logger.error('Nutrition info error:', error);
    res.status(500).json({ error: 'Erro ao obter informação nutricional' });
  }
});

// Get scan history
router.get('/history', async (req, res) => {
  try {
    const { petId, limit } = req.query;

    const history = await FoodRecognitionService.getScanHistory(
      req.user!.id,
      petId as string,
      parseInt(limit as string) || 20
    );

    res.json({
      success: true,
      scans: history,
      count: history.length
    });

  } catch (error) {
    logger.error('Scan history error:', error);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
});

// Get specific scan
router.get('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await FoodScan.findOne({
      _id: scanId,
      userId: req.user!.id
    }).populate('petId', 'name species avatar');

    if (!scan) {
      return res.status(404).json({ error: 'Escaneamento não encontrado' });
    }

    res.json({
      success: true,
      scan
    });

  } catch (error) {
    logger.error('Get scan error:', error);
    res.status(500).json({ error: 'Erro ao obter escaneamento' });
  }
});

// Delete scan
router.delete('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const result = await FoodScan.deleteOne({
      _id: scanId,
      userId: req.user!.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Escaneamento não encontrado' });
    }

    res.json({
      success: true,
      message: 'Escaneamento deletado com sucesso'
    });

  } catch (error) {
    logger.error('Delete scan error:', error);
    res.status(500).json({ error: 'Erro ao deletar escaneamento' });
  }
});

// Get food recommendations
router.get('/recommendations/:petId', async (req, res) => {
  try {
    const { petId } = req.params;

    const recommendations = await FoodRecognitionService.getRecommendations(petId);

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    logger.error('Recommendations error:', error);
    res.status(500).json({ error: 'Erro ao obter recomendações' });
  }
});

// Generate feeding plan
router.get('/feeding-plan/:petId', async (req, res) => {
  try {
    const { petId } = req.params;

    const plan = await FoodRecognitionService.generateFeedingPlan(petId);

    res.json({
      success: true,
      plan
    });

  } catch (error) {
    logger.error('Feeding plan error:', error);
    res.status(500).json({ error: 'Erro ao gerar plano alimentar' });
  }
});

// Batch check multiple foods
router.post('/batch-check', async (req, res) => {
  try {
    const { foods, species } = req.body;

    if (!foods || !Array.isArray(foods) || !species) {
      return res.status(400).json({ 
        error: 'foods (array) e species são obrigatórios' 
      });
    }

    const results = foods.map(food => ({
      food,
      ...FoodRecognitionService.checkFoodSafety(food, species as 'dog' | 'cat')
    }));

    res.json({
      success: true,
      species,
      results
    });

  } catch (error) {
    logger.error('Batch check error:', error);
    res.status(500).json({ error: 'Erro ao verificar alimentos' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.id;

    const [
      totalScans,
      safeScans,
      toxicScans,
      recentScans
    ] = await Promise.all([
      FoodScan.countDocuments({ userId }),
      FoodScan.countDocuments({ userId, safetyStatus: 'safe' }),
      FoodScan.countDocuments({ userId, safetyStatus: 'toxic' }),
      FoodScan.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('recognizedFood safetyStatus createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        totalScans,
        safeScans,
        toxicScans,
        cautionScans: totalScans - safeScans - toxicScans,
        safetyRate: totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 0,
        recentScans
      }
    });

  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

export default router;