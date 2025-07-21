import { Router, Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { NotificationService } from '../services/notificationService-simple'
import { Types } from 'mongoose'

const router = Router()

/**
 * @route   GET /api/notifications
 * @desc    Obter notificações do usuário
 * @access  Private
 */
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const {
      type,
      isRead,
      startDate,
      endDate,
      limit = 20,
      skip = 0
    } = req.query

    const filters = {
      userId,
      type: type as string,
      isRead: isRead ? isRead === 'true' : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string)
    }

    const result = await NotificationService.getUserNotifications(filters)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error getting notifications:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações'
    })
  }
})

/**
 * @route   POST /api/notifications
 * @desc    Criar nova notificação
 * @access  Private
 */
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const {
      title,
      message,
      type,
      petId,
      actionUrl,
      scheduledFor,
      isEmail,
      isPush
    } = req.body

    // Validação básica
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, message e type são obrigatórios'
      })
    }

    const notificationData = {
      userId,
      title,
      message,
      type,
      petId: petId ? new Types.ObjectId(petId) : undefined,
      actionUrl,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      isEmail: isEmail || false,
      isPush: isPush !== false // default true
    }

    const notification = await NotificationService.createNotification(notificationData)

    res.status(201).json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao criar notificação'
    })
  }
})

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificação como lida
 * @access  Private
 */
router.put('/:id/read', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const notificationId = req.params.id

    if (!Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificação inválido'
      })
    }

    const notification = await NotificationService.markAsRead(
      new Types.ObjectId(notificationId),
      new Types.ObjectId(userId)
    )

    res.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificação como lida'
    })
  }
})

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas as notificações como lidas
 * @access  Private
 */
router.put('/read-all', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    await NotificationService.markAllAsRead(new Types.ObjectId(userId))

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar todas as notificações como lidas'
    })
  }
})

/**
 * @route   POST /api/notifications/test
 * @desc    Enviar notificação de teste
 * @access  Private
 */
router.post('/test', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const notification = await NotificationService.createNotification({
      userId: new Types.ObjectId(userId),
      title: '🧪 Notificação de Teste',
      message: 'Esta é uma notificação de teste do sistema OiPet Saúde!',
      type: 'general',
      isEmail: true,
      isPush: true
    })

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação de teste enviada com sucesso!'
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar notificação de teste'
    })
  }
})

export default router