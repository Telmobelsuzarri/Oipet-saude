import { Router } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Public health check endpoint (no auth required)
router.get('/health', async (req, res) => {
  try {
    const health = await MonitoringService.getHealthCheck();
    
    // Return appropriate HTTP status
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check (requires auth)
router.get('/health/detailed', authMiddleware, async (req, res) => {
  try {
    // Only allow admin users to see detailed health
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const health = await MonitoringService.getHealthCheck();
    const metrics = await MonitoringService.getMetrics();
    
    res.json({
      health,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// System metrics endpoint (admin only)
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const metrics = await MonitoringService.getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({ error: 'Erro ao obter métricas' });
  }
});

// Database status
router.get('/status/database', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const dbStatus = await MonitoringService.checkDatabase();
    res.json(dbStatus);
  } catch (error) {
    logger.error('Database status error:', error);
    res.status(500).json({ error: 'Erro ao verificar status do banco' });
  }
});

// Redis status
router.get('/status/redis', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const redisStatus = await MonitoringService.checkRedis();
    res.json(redisStatus);
  } catch (error) {
    logger.error('Redis status error:', error);
    res.status(500).json({ error: 'Erro ao verificar status do Redis' });
  }
});

// External services status
router.get('/status/external', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const externalStatus = await MonitoringService.checkExternalServices();
    res.json(externalStatus);
  } catch (error) {
    logger.error('External services status error:', error);
    res.status(500).json({ error: 'Erro ao verificar serviços externos' });
  }
});

// Force metrics collection (admin only)
router.post('/metrics/collect', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await MonitoringService.logMetrics();
    res.json({ success: true, message: 'Métricas coletadas com sucesso' });
  } catch (error) {
    logger.error('Manual metrics collection error:', error);
    res.status(500).json({ error: 'Erro ao coletar métricas' });
  }
});

// Readiness probe (for orchestrators like Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    const dbStatus = await MonitoringService.checkDatabase();
    
    if (dbStatus.status === 'ok') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
    }
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({ status: 'not ready', reason: 'internal error' });
  }
});

// Liveness probe (for orchestrators like Kubernetes)
router.get('/alive', (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;