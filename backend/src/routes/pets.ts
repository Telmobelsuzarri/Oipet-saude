/**
 * Rotas de pets
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Listar pets do usuário
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pets
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
 *                         $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Token inválido
 */
router.get('/', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de listagem de pets
  res.json({
    success: true,
    message: 'List pets endpoint - a implementar',
    data: []
  });
}));

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Criar novo pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rex"
 *               species:
 *                 type: string
 *                 enum: ["dog", "cat", "other"]
 *                 example: "dog"
 *               breed:
 *                 type: string
 *                 example: "Golden Retriever"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2022-01-15"
 *               weight:
 *                 type: number
 *                 example: 25.5
 *               height:
 *                 type: number
 *                 example: 60
 *               gender:
 *                 type: string
 *                 enum: ["male", "female"]
 *                 example: "male"
 *               isNeutered:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Pet criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.post('/', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de criação de pet
  res.status(201).json({
    success: true,
    message: 'Create pet endpoint - a implementar',
    data: null
  });
}));

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Obter detalhes de um pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pet
 *     responses:
 *       200:
 *         description: Detalhes do pet
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Pet não encontrado
 */
router.get('/:id', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de detalhes do pet
  res.json({
    success: true,
    message: 'Get pet endpoint - a implementar',
    data: null
  });
}));

export default router;