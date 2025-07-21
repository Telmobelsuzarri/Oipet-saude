import { Types } from 'mongoose'
import { Notification } from '../models/Notification'
import { User } from '../models/User'
import { Pet } from '../models/Pet'
import { EmailService } from './emailService'

export interface CreateNotificationData {
  userId: Types.ObjectId | string
  title: string
  message: string
  type: 'health' | 'medication' | 'appointment' | 'feeding' | 'exercise' | 'general'
  petId?: Types.ObjectId | string
  actionUrl?: string
  scheduledFor?: Date
  isEmail?: boolean
  isPush?: boolean
}

export interface NotificationFilters {
  userId?: Types.ObjectId | string
  type?: string
  isRead?: boolean
  startDate?: Date
  endDate?: Date
  limit?: number
  skip?: number
}

export class NotificationService {
  /**
   * Criar nova notificação
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = new Notification({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        petId: data.petId,
        actionUrl: data.actionUrl,
        scheduledFor: data.scheduledFor || new Date(),
        isRead: false,
        isSent: false,
        metadata: {
          isEmail: data.isEmail || false,
          isPush: data.isPush || true
        }
      })

      await notification.save()

      // Se for para enviar imediatamente
      if (!data.scheduledFor || data.scheduledFor <= new Date()) {
        await this.sendNotification(notification._id)
      }

      return notification
    } catch (error) {
      throw new Error(`Error creating notification: ${error}`)
    }
  }

  /**
   * Enviar notificação (email e/ou push)
   */
  static async sendNotification(notificationId: Types.ObjectId | string) {
    try {
      const notification = await Notification.findById(notificationId)
        .populate('userId', 'name email')
        .populate('petId', 'name')

      if (!notification) {
        throw new Error('Notification not found')
      }

      const user = notification.userId as any
      const pet = notification.petId as any

      // Enviar email se configurado
      if (notification.metadata?.isEmail && user.email) {
        await EmailService.sendNotification(user.email, {
          name: user.name,
          petName: pet?.name || 'Seu Pet',
          message: notification.message,
          actionUrl: notification.actionUrl
        })
      }

      // TODO: Implementar push notification com FCM
      if (notification.metadata?.isPush) {
        await this.sendPushNotification(notification)
      }

      // Marcar como enviada
      notification.isSent = true
      notification.sentAt = new Date()
      await notification.save()

      return notification
    } catch (error) {
      throw new Error(`Error sending notification: ${error}`)
    }
  }

  /**
   * Listar notificações do usuário
   */
  static async getUserNotifications(filters: NotificationFilters) {
    try {
      const query: any = {}

      if (filters.userId) {
        query.userId = filters.userId
      }

      if (filters.type) {
        query.type = filters.type
      }

      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {}
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate
        }
      }

      const notifications = await Notification.find(query)
        .populate('petId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0)

      const total = await Notification.countDocuments(query)
      const unreadCount = await Notification.countDocuments({
        ...query,
        isRead: false
      })

      return {
        notifications,
        total,
        unreadCount,
        pagination: {
          limit: filters.limit || 50,
          skip: filters.skip || 0,
          hasMore: (filters.skip || 0) + notifications.length < total
        }
      }
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error}`)
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: Types.ObjectId | string, userId: Types.ObjectId | string) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      )

      if (!notification) {
        throw new Error('Notification not found or unauthorized')
      }

      return notification
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error}`)
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async markAllAsRead(userId: Types.ObjectId | string) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )

      return { success: true }
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error}`)
    }
  }

  /**
   * Criar notificação de lembrete de medicação
   */
  static async createMedicationReminder(
    userId: Types.ObjectId | string,
    petId: Types.ObjectId | string,
    medication: string,
    scheduledFor: Date
  ) {
    return this.createNotification({
      userId,
      petId,
      title: '💊 Hora da medicação',
      message: `Não se esqueça de dar ${medication} para seu pet!`,
      type: 'medication',
      scheduledFor,
      isEmail: true,
      isPush: true
    })
  }

  /**
   * Enviar push notification (placeholder para FCM)
   */
  private static async sendPushNotification(notification: any) {
    // TODO: Implementar FCM (Firebase Cloud Messaging)
    console.log(`🔔 Push notification sent: ${notification.title}`)
    
    return {
      success: true,
      messageId: `fcm_${Date.now()}`,
      notification: {
        title: notification.title,
        body: notification.message
      }
    }
  }
}