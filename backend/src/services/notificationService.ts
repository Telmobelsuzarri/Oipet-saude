/**
 * Serviço de notificações
 */

import { Notification, INotification } from '@/models/Notification';
import { User } from '@/models/User';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface CreateNotificationData {
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category?: 'general' | 'health' | 'medication' | 'feeding' | 'activity' | 'system';
  data?: any;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface PaginatedNotifications {
  notifications: INotification[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  unreadCount: number;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  todayCount: number;
  categoryStats: {
    general: number;
    health: number;
    medication: number;
    feeding: number;
    activity: number;
    system: number;
  };
  typeStats: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
}

class NotificationService {
  /**
   * Criar nova notificação
   */
  async createNotification(notificationData: CreateNotificationData): Promise<INotification> {
    try {
      const notification = new Notification({
        ...notificationData,
        userId: notificationData.userId ? new mongoose.Types.ObjectId(notificationData.userId) : undefined,
        scheduledFor: notificationData.scheduledFor || new Date(),
        expiresAt: notificationData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      });

      await notification.save();

      logger.info(`Notification created: ${notification._id} for user: ${notificationData.userId || 'all'}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Criar notificação para todos os usuários
   */
  async createBroadcastNotification(notificationData: Omit<CreateNotificationData, 'userId'>): Promise<INotification[]> {
    try {
      const users = await User.find({ isActive: true }).select('_id');
      const notifications = [];

      for (const user of users) {
        const notification = await this.createNotification({
          ...notificationData,
          userId: user._id.toString()
        });
        notifications.push(notification);
      }

      logger.info(`Broadcast notification created for ${users.length} users`);
      return notifications;
    } catch (error) {
      logger.error('Error creating broadcast notification:', error);
      throw error;
    }
  }

  /**
   * Obter notificações do usuário
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
    category?: string
  ): Promise<PaginatedNotifications> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = {
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { userId: null } // Notificações globais
        ],
        expiresAt: { $gt: new Date() }
      };
      
      if (unreadOnly) {
        filters.isRead = false;
      }
      
      if (category) {
        filters.category = category;
      }

      // Buscar notificações
      const notifications = await Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Contar total e não lidas
      const total = await Notification.countDocuments(filters);
      const unreadCount = await Notification.countDocuments({
        ...filters,
        isRead: false
      });

      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        unreadCount
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { userId: null }
        ]
      });

      if (!notification) {
        throw createError('Notificação não encontrada', 404);
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      logger.info(`Notification marked as read: ${notificationId} by user: ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        {
          $or: [
            { userId: new mongoose.Types.ObjectId(userId) },
            { userId: null }
          ],
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      logger.info(`All notifications marked as read for user: ${userId}`);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!notification) {
        throw createError('Notificação não encontrada', 404);
      }

      await Notification.findByIdAndDelete(notificationId);

      logger.info(`Notification deleted: ${notificationId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Deletar notificações expiradas
   */
  async deleteExpiredNotifications(): Promise<number> {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      logger.info(`Deleted ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting expired notifications:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de notificações
   */
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const filters = {
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { userId: null }
        ],
        expiresAt: { $gt: new Date() }
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalNotifications,
        unreadCount,
        todayCount,
        categoryStats,
        typeStats
      ] = await Promise.all([
        Notification.countDocuments(filters),
        Notification.countDocuments({ ...filters, isRead: false }),
        Notification.countDocuments({ ...filters, createdAt: { $gte: today } }),
        Notification.aggregate([
          { $match: filters },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Notification.aggregate([
          { $match: filters },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      ]);

      // Processar estatísticas por categoria
      const categoryStatsObj = {
        general: 0,
        health: 0,
        medication: 0,
        feeding: 0,
        activity: 0,
        system: 0
      };

      categoryStats.forEach(stat => {
        if (categoryStatsObj.hasOwnProperty(stat._id)) {
          categoryStatsObj[stat._id] = stat.count;
        }
      });

      // Processar estatísticas por tipo
      const typeStatsObj = {
        info: 0,
        success: 0,
        warning: 0,
        error: 0
      };

      typeStats.forEach(stat => {
        if (typeStatsObj.hasOwnProperty(stat._id)) {
          typeStatsObj[stat._id] = stat.count;
        }
      });

      return {
        totalNotifications,
        unreadCount,
        todayCount,
        categoryStats: categoryStatsObj,
        typeStats: typeStatsObj
      };
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de lembrete de medicação
   */
  async sendMedicationReminder(userId: string, petName: string, medicationName: string, dosage: string): Promise<INotification> {
    try {
      return await this.createNotification({
        userId,
        title: '💊 Lembrete de Medicação',
        message: `Está na hora de dar ${medicationName} (${dosage}) para ${petName}`,
        type: 'warning',
        category: 'medication',
        data: {
          petName,
          medicationName,
          dosage
        }
      });
    } catch (error) {
      logger.error('Error sending medication reminder:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de lembrete de alimentação
   */
  async sendFeedingReminder(userId: string, petName: string): Promise<INotification> {
    try {
      return await this.createNotification({
        userId,
        title: '🍽️ Hora da Alimentação',
        message: `Está na hora de alimentar ${petName}`,
        type: 'info',
        category: 'feeding',
        data: {
          petName
        }
      });
    } catch (error) {
      logger.error('Error sending feeding reminder:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de lembrete de atividade
   */
  async sendActivityReminder(userId: string, petName: string): Promise<INotification> {
    try {
      return await this.createNotification({
        userId,
        title: '🏃 Hora da Atividade',
        message: `${petName} precisa de exercício! Que tal um passeio?`,
        type: 'info',
        category: 'activity',
        data: {
          petName
        }
      });
    } catch (error) {
      logger.error('Error sending activity reminder:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de alerta de saúde
   */
  async sendHealthAlert(userId: string, petName: string, alertMessage: string, alertType: 'warning' | 'error' = 'warning'): Promise<INotification> {
    try {
      return await this.createNotification({
        userId,
        title: '🚨 Alerta de Saúde',
        message: `${petName}: ${alertMessage}`,
        type: alertType,
        category: 'health',
        data: {
          petName,
          alertMessage
        }
      });
    } catch (error) {
      logger.error('Error sending health alert:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de sistema
   */
  async sendSystemNotification(title: string, message: string, userId?: string): Promise<INotification | INotification[]> {
    try {
      const notificationData = {
        title: `🔔 ${title}`,
        message,
        type: 'info' as const,
        category: 'system' as const
      };

      if (userId) {
        return await this.createNotification({
          ...notificationData,
          userId
        });
      } else {
        return await this.createBroadcastNotification(notificationData);
      }
    } catch (error) {
      logger.error('Error sending system notification:', error);
      throw error;
    }
  }

  /**
   * Obter notificações não lidas
   */
  async getUnreadNotifications(userId: string, limit: number = 10): Promise<INotification[]> {
    try {
      const notifications = await Notification.find({
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { userId: null }
        ],
        isRead: false,
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      return notifications;
    } catch (error) {
      logger.error('Error getting unread notifications:', error);
      throw error;
    }
  }

  /**
   * Agendar notificação
   */
  async scheduleNotification(notificationData: CreateNotificationData): Promise<INotification> {
    try {
      if (!notificationData.scheduledFor || notificationData.scheduledFor <= new Date()) {
        throw createError('Data de agendamento deve ser no futuro', 400);
      }

      const notification = await this.createNotification(notificationData);

      logger.info(`Notification scheduled: ${notification._id} for ${notificationData.scheduledFor}`);
      return notification;
    } catch (error) {
      logger.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Processar notificações agendadas
   */
  async processScheduledNotifications(): Promise<number> {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        scheduledFor: { $lte: now },
        sent: false,
        expiresAt: { $gt: now }
      });

      let processedCount = 0;

      for (const notification of scheduledNotifications) {
        try {
          // Aqui você pode adicionar lógica para enviar push notifications
          // Por exemplo, usando Firebase Cloud Messaging
          
          notification.sent = true;
          notification.sentAt = new Date();
          await notification.save();
          
          processedCount++;
        } catch (error) {
          logger.error(`Error processing scheduled notification ${notification._id}:`, error);
        }
      }

      if (processedCount > 0) {
        logger.info(`Processed ${processedCount} scheduled notifications`);
      }

      return processedCount;
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;