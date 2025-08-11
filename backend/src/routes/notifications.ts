/**
 * Rotas de notificações
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { auth as authenticate, requireAdmin } from '@/middleware/auth';
import { notificationService } from '@/services/notificationService';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obter notificações do usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Limite por página
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Mostrar apenas não lidas
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, health, medication, feeding, activity, system]
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de notificações
 *       401:
 *         description: Token inválido
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';
  const category = req.query.category as string;
  
  const result = await notificationService.getUserNotifications(
    req.user._id,
    page,
    limit,
    unreadOnly,
    category
  );
  
  res.json({
    success: true,
    message: 'Notificações obtidas com sucesso',
    data: result
  });
}));

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Obter notificações não lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de notificações
 *     responses:
 *       200:
 *         description: Notificações não lidas
 *       401:
 *         description: Token inválido
 */
router.get('/unread', authenticate, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  const notifications = await notificationService.getUnreadNotifications(req.user._id, limit);
  
  res.json({
    success: true,
    message: 'Notificações não lidas obtidas com sucesso',
    data: notifications
  });
}));

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Obter estatísticas de notificações
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das notificações
 *       401:
 *         description: Token inválido
 */
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const stats = await notificationService.getNotificationStats(req.user._id);
  
  res.json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
}));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcar notificação como lida
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *       404:
 *         description: Notificação não encontrada
 *       401:
 *         description: Token inválido
 */
router.put('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  
  res.json({
    success: true,
    message: 'Notificação marcada como lida',
    data: { notification }
  });
}));

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marcar todas as notificações como lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as notificações marcadas como lidas
 *       401:
 *         description: Token inválido
 */
router.put('/read-all', authenticate, asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  
  res.json({
    success: true,
    message: 'Todas as notificações marcadas como lidas'
  });
}));

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Deletar notificação
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação deletada
 *       404:
 *         description: Notificação não encontrada
 *       401:
 *         description: Token inválido
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  
  res.json({
    success: true,
    message: 'Notificação deletada com sucesso'
  });
}));

// Rotas administrativas
/**
 * @swagger
 * /api/notifications/admin/broadcast:
 *   post:
 *     summary: Enviar notificação para todos os usuários (Admin)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Novidade na OiPet"
 *               message:
 *                 type: string
 *                 example: "Confira as novas funcionalidades do app"
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 example: "info"
 *               category:
 *                 type: string
 *                 enum: [general, health, medication, feeding, activity, system]
 *                 example: "general"
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *                 description: Data para envio (opcional)
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Data de expiração (opcional)
 *     responses:
 *       201:
 *         description: Notificação enviada com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post('/admin/broadcast', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const notifications = await notificationService.createBroadcastNotification(req.body);
  
  res.status(201).json({
    success: true,
    message: `Notificação enviada para ${notifications.length} usuários`,
    data: { count: notifications.length }
  });
}));

/**
 * @swagger
 * /api/notifications/admin/send:
 *   post:
 *     summary: Enviar notificação para usuário específico (Admin)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60f7b2b3e4b0a4001f8b4567"
 *               title:
 *                 type: string
 *                 example: "Mensagem personalizada"
 *               message:
 *                 type: string
 *                 example: "Sua mensagem aqui"
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 example: "info"
 *               category:
 *                 type: string
 *                 enum: [general, health, medication, feeding, activity, system]
 *                 example: "general"
 *     responses:
 *       201:
 *         description: Notificação enviada com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post('/admin/send', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Notificação enviada com sucesso',
    data: { notification }
  });
}));

/**
 * @swagger
 * /api/notifications/admin/cleanup:
 *   delete:
 *     summary: Limpar notificações expiradas (Admin)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações expiradas removidas
 *       403:
 *         description: Acesso negado
 */
router.delete('/admin/cleanup', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const deletedCount = await notificationService.deleteExpiredNotifications();
  
  res.json({
    success: true,
    message: `${deletedCount} notificações expiradas removidas`,
    data: { deletedCount }
  });
}));

export default router;