/**
 * Rotas de autenticação
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { authService } from '@/services/authService';
import { auth as authenticate } from '@/middleware/auth';
import { validate, authValidators } from '@/utils/validators';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 example: "(11) 99999-9999"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já existe
 */
router.post('/register', validate(authValidators.register), asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;
  
  const result = await authService.register({
    email,
    password,
    name,
    phone,
  });
  
  logger.info(`New user registered: ${email}`);
  
  res.status(201).json({
    success: true,
    message: 'Usuário registrado com sucesso',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', validate(authValidators.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.login(email, password);
  
  logger.info(`User logged in: ${email}`);
  
  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
}));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Token de refresh inválido
 */
router.post('/refresh', validate(authValidators.refreshToken), asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.refreshToken(refreshToken);
  
  res.json({
    success: true,
    message: 'Token renovado com sucesso',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Token inválido
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
    data: null,
  });
}));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de reset enviado
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/forgot-password', validate(authValidators.forgotPassword), asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  await authService.generatePasswordResetToken(email);
  
  res.json({
    success: true,
    message: 'Se o email existir, você receberá instruções para reset de senha',
    data: null,
  });
}));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Resetar senha com token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/reset-password', validate(authValidators.resetPassword), asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  await authService.resetPassword(token, password);
  
  res.json({
    success: true,
    message: 'Senha resetada com sucesso',
    data: null,
  });
}));

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar email com token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verificado com sucesso
 *       400:
 *         description: Token inválido
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  const user = await authService.verifyEmail(token);
  
  res.json({
    success: true,
    message: 'Email verificado com sucesso',
    data: { user },
  });
}));

/**
 * @swagger
 * /api/auth/fcm-token:
 *   put:
 *     summary: Atualizar token FCM
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token FCM atualizado
 *       401:
 *         description: Token inválido
 */
router.put('/fcm-token', authenticate, validate(authValidators.updateFCMToken), asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  
  await authService.updateFCMToken(req.user._id, fcmToken);
  
  res.json({
    success: true,
    message: 'Token FCM atualizado com sucesso',
    data: null,
  });
}));

export default router;