/**
 * Rotas de usuários
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido
 */
router.get('/profile', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de perfil
  res.json({
    success: true,
    message: 'Profile endpoint - a implementar',
    data: null
  });
}));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Users]
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
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.put('/profile', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de atualização de perfil
  res.json({
    success: true,
    message: 'Update profile endpoint - a implementar',
    data: null
  });
}));

export default router;