/**
 * Rotas administrativas
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { analyticsService } from '@/services/analyticsService';

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Obter dados do dashboard administrativo
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         totalPets:
 *                           type: number
 *                         activeUsers:
 *                           type: number
 *                         recentActivity:
 *                           type: array
 *                           items:
 *                             type: object
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/dashboard', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  
  res.json({
    success: true,
    message: 'Estatísticas do dashboard obtidas com sucesso',
    data: stats
  });
}));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar todos os usuários (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Usuários por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou email
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/users', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const topUsers = await analyticsService.getTopActiveUsers();
  
  res.json({
    success: true,
    message: 'Top usuários ativos obtidos com sucesso',
    data: topUsers
  });
}));

/**
 * @swagger
 * /api/admin/analytics/engagement:
 *   get:
 *     summary: Obter estatísticas de engajamento
 *     tags: [Admin, Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de engajamento
 *       403:
 *         description: Acesso negado
 */
router.get('/analytics/engagement', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const engagement = await analyticsService.getUserEngagementStats();
  
  res.json({
    success: true,
    message: 'Estatísticas de engajamento obtidas com sucesso',
    data: engagement
  });
}));

/**
 * @swagger
 * /api/admin/analytics/health-trends:
 *   get:
 *     summary: Obter tendências de saúde dos pets
 *     tags: [Admin, Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de dias para análise
 *     responses:
 *       200:
 *         description: Tendências de saúde
 *       403:
 *         description: Acesso negado
 */
router.get('/analytics/health-trends', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const trends = await analyticsService.getPetHealthTrends(days);
  
  res.json({
    success: true,
    message: 'Tendências de saúde obtidas com sucesso',
    data: trends
  });
}));

/**
 * @swagger
 * /api/admin/analytics/report:
 *   get:
 *     summary: Gerar relatório completo
 *     tags: [Admin, Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início (opcional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim (opcional)
 *     responses:
 *       200:
 *         description: Relatório completo
 *       403:
 *         description: Acesso negado
 */
router.get('/analytics/report', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const timeRange = req.query.startDate && req.query.endDate ? {
    startDate: new Date(req.query.startDate as string),
    endDate: new Date(req.query.endDate as string)
  } : undefined;
  
  const report = await analyticsService.generateReport(timeRange);
  
  res.json({
    success: true,
    message: 'Relatório gerado com sucesso',
    data: report
  });
}));

/**
 * @swagger
 * /api/admin/analytics/realtime:
 *   get:
 *     summary: Obter métricas em tempo real
 *     tags: [Admin, Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas em tempo real
 *       403:
 *         description: Acesso negado
 */
router.get('/analytics/realtime', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const metrics = await analyticsService.getRealTimeMetrics();
  
  res.json({
    success: true,
    message: 'Métricas em tempo real obtidas com sucesso',
    data: metrics
  });
}));

/**
 * @swagger
 * /api/admin/analytics/usage:
 *   get:
 *     summary: Obter estatísticas de uso por período
 *     tags: [Admin, Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Data de início
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Data de fim
 *     responses:
 *       200:
 *         description: Estatísticas de uso
 *       400:
 *         description: Parâmetros inválidos
 *       403:
 *         description: Acesso negado
 */
router.get('/analytics/usage', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400).json({
      success: false,
      error: 'startDate e endDate são obrigatórios'
    });
  }
  
  const startDate = new Date(req.query.startDate as string);
  const endDate = new Date(req.query.endDate as string);
  
  const usage = await analyticsService.getUsageStatsByPeriod(startDate, endDate);
  
  res.json({
    success: true,
    message: 'Estatísticas de uso obtidas com sucesso',
    data: usage
  });
}));

export default router;