/**
 * Rotas de usuários
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { validate, authValidators, queryValidators } from '@/utils/validators';
import { userService } from '@/services/userService';
import { logger } from '@/utils/logger';

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
 *       401:
 *         description: Token inválido
 */
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  
  res.json({
    success: true,
    message: 'Perfil obtido com sucesso',
    data: { user }
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
router.put('/profile', authenticate, validate(authValidators.updateProfile), asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  
  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: { user }
  });
}));

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Alterar senha do usuário
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
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 */
router.put('/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Senha atual e nova senha são obrigatórias'
    });
  }
  
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  
  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
}));

/**
 * @swagger
 * /api/users/deactivate:
 *   delete:
 *     summary: Desativar conta do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta desativada com sucesso
 */
router.delete('/deactivate', authenticate, asyncHandler(async (req, res) => {
  await userService.deactivateAccount(req.user._id);
  
  res.json({
    success: true,
    message: 'Conta desativada com sucesso'
  });
}));

// Rotas administrativas
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuários (Admin)
 *     tags: [Users, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou email
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
router.get('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  
  const result = await userService.getUsers(page, limit, search, isActive);
  
  res.json({
    success: true,
    message: 'Usuários obtidos com sucesso',
    data: result
  });
}));

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Estatísticas de usuários (Admin)
 *     tags: [Users, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos usuários
 */
router.get('/stats', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();
  
  res.json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
}));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter usuário por ID (Admin)
 *     tags: [Users, Admin]
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
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  
  res.json({
    success: true,
    message: 'Usuário obtido com sucesso',
    data: { user }
  });
}));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar usuário (Admin)
 *     tags: [Users, Admin]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.put('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  
  res.json({
    success: true,
    message: 'Usuário atualizado com sucesso',
    data: { user }
  });
}));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deletar usuário (Admin)
 *     tags: [Users, Admin]
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
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Não é possível deletar administrador
 */
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  
  res.json({
    success: true,
    message: 'Usuário deletado com sucesso'
  });
}));

export default router;