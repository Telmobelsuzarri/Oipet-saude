/**
 * Rotas de registros de saúde
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate } from '@/middleware/auth';
import { validate, healthValidators } from '@/utils/validators';
import { healthService } from '@/services/healthService';

const router = express.Router();

/**
 * @swagger
 * /api/health/pets/{petId}:
 *   get:
 *     summary: Obter histórico de saúde de um pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pet
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de registros por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *     responses:
 *       200:
 *         description: Histórico de saúde
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HealthRecord'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Pet não encontrado
 */
router.get('/pets/:petId', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
  
  const result = await healthService.getPetHealthRecords(
    req.params.petId,
    req.user._id,
    page,
    limit,
    startDate,
    endDate
  );
  
  res.json({
    success: true,
    message: 'Histórico de saúde obtido com sucesso',
    data: result
  });
}));

/**
 * @swagger
 * /api/health/pets/{petId}:
 *   post:
 *     summary: Criar registro de saúde para um pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-15"
 *               weight:
 *                 type: number
 *                 example: 25.5
 *               height:
 *                 type: number
 *                 example: 60
 *               activity:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: "caminhada"
 *                   duration:
 *                     type: number
 *                     example: 30
 *                   intensity:
 *                     type: string
 *                     enum: ["low", "medium", "high"]
 *                     example: "medium"
 *               calories:
 *                 type: number
 *                 example: 1200
 *               notes:
 *                 type: string
 *                 example: "Pet muito ativo hoje"
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Pet não encontrado
 */
router.post('/pets/:petId', authenticate, asyncHandler(async (req, res) => {
  const recordData = {
    ...req.body,
    petId: req.params.petId
  };
  
  const healthRecord = await healthService.createHealthRecord(req.user._id, recordData);
  
  res.status(201).json({
    success: true,
    message: 'Registro de saúde criado com sucesso',
    data: { healthRecord }
  });
}));

/**
 * @swagger
 * /api/health/{id}:
 *   get:
 *     summary: Obter registro de saúde por ID
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro de saúde obtido com sucesso
 *       404:
 *         description: Registro não encontrado
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const healthRecord = await healthService.getHealthRecordById(req.params.id, req.user._id);
  
  res.json({
    success: true,
    message: 'Registro de saúde obtido com sucesso',
    data: { healthRecord }
  });
}));

/**
 * @swagger
 * /api/health/{id}:
 *   put:
 *     summary: Atualizar registro de saúde
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *       404:
 *         description: Registro não encontrado
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const healthRecord = await healthService.updateHealthRecord(req.params.id, req.user._id, req.body);
  
  res.json({
    success: true,
    message: 'Registro de saúde atualizado com sucesso',
    data: { healthRecord }
  });
}));

/**
 * @swagger
 * /api/health/{id}:
 *   delete:
 *     summary: Deletar registro de saúde
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro deletado com sucesso
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await healthService.deleteHealthRecord(req.params.id, req.user._id);
  
  res.json({
    success: true,
    message: 'Registro de saúde deletado com sucesso'
  });
}));

/**
 * @swagger
 * /api/health/pets/{petId}/stats:
 *   get:
 *     summary: Obter estatísticas de saúde do pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Estatísticas de saúde
 *       404:
 *         description: Pet não encontrado
 */
router.get('/pets/:petId/stats', authenticate, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const stats = await healthService.getPetHealthStats(req.params.petId, req.user._id, days);
  
  res.json({
    success: true,
    message: 'Estatísticas de saúde obtidas com sucesso',
    data: stats
  });
}));

/**
 * @swagger
 * /api/health/pets/{petId}/weight-history:
 *   get:
 *     summary: Obter histórico de peso do pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *     responses:
 *       200:
 *         description: Histórico de peso
 *       404:
 *         description: Pet não encontrado
 */
router.get('/pets/:petId/weight-history', authenticate, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days as string) || 90;
  const weightHistory = await healthService.getWeightHistory(req.params.petId, req.user._id, days);
  
  res.json({
    success: true,
    message: 'Histórico de peso obtido com sucesso',
    data: weightHistory
  });
}));

/**
 * @swagger
 * /api/health/pets/{petId}/activity-summary:
 *   get:
 *     summary: Obter resumo de atividades do pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Resumo de atividades
 *       404:
 *         description: Pet não encontrado
 */
router.get('/pets/:petId/activity-summary', authenticate, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const activitySummary = await healthService.getActivitySummary(req.params.petId, req.user._id, days);
  
  res.json({
    success: true,
    message: 'Resumo de atividades obtido com sucesso',
    data: activitySummary
  });
}));

/**
 * @swagger
 * /api/health/pets/{petId}/medications:
 *   get:
 *     summary: Obter próximas medicações do pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Próximas medicações
 *       404:
 *         description: Pet não encontrado
 */
router.get('/pets/:petId/medications', authenticate, asyncHandler(async (req, res) => {
  const medications = await healthService.getUpcomingMedications(req.params.petId, req.user._id);
  
  res.json({
    success: true,
    message: 'Próximas medicações obtidas com sucesso',
    data: medications
  });
}));

/**
 * @swagger
 * /api/health/pets/{petId}/alerts:
 *   get:
 *     summary: Obter alertas de saúde do pet
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alertas de saúde
 *       404:
 *         description: Pet não encontrado
 */
router.get('/pets/:petId/alerts', authenticate, asyncHandler(async (req, res) => {
  const alerts = await healthService.getHealthAlerts(req.params.petId, req.user._id);
  
  res.json({
    success: true,
    message: 'Alertas de saúde obtidos com sucesso',
    data: alerts
  });
}));

export default router;