/**
 * Rotas administrativas
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

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
router.get('/dashboard', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de dashboard administrativo
  res.json({
    success: true,
    message: 'Admin dashboard endpoint - a implementar',
    data: {
      totalUsers: 0,
      totalPets: 0,
      activeUsers: 0,
      recentActivity: []
    }
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
router.get('/users', asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de listagem de usuários para admin
  res.json({
    success: true,
    message: 'Admin users endpoint - a implementar',
    data: []
  });
}));

export default router;