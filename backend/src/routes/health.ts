/**
 * Rotas de registros de saúde
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

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
router.get('/pets/:petId', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de histórico de saúde
  res.json({
    success: true,
    message: 'Health history endpoint - a implementar',
    data: []
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
router.post('/pets/:petId', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de criação de registro de saúde
  res.status(201).json({
    success: true,
    message: 'Create health record endpoint - a implementar',
    data: null
  });
}));

export default router;