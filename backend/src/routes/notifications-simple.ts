/**
 * Rotas de notificações - Versão simplificada
 */

import express from 'express';
import { authenticate } from '@/middleware/auth';
import { notificationService } from '@/services/notificationService-simple';

const router = express.Router();

/**
 * GET /api/notifications
 * Obter notificações do usuário
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getUserNotifications(userId);
    
    res.json({
      success: true,
      data: notifications,
      message: 'Notificações obtidas com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao obter notificações'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marcar notificação como lida
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    
    res.json({
      success: true,
      data: notification,
      message: 'Notificação marcada como lida'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao marcar notificação como lida'
    });
  }
});

export default router;