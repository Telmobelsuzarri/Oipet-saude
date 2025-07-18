/**
 * Notification Service - Versão simplificada
 */

import { logger } from '@/utils/logger';
import { Notification } from '@/models/Notification';

export class NotificationService {
  async createNotification(userId: string, data: any) {
    try {
      const notification = new Notification({
        userId,
        ...data,
        createdAt: new Date()
      });

      await notification.save();
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();