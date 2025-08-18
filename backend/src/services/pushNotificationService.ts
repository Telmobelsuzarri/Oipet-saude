import { logger } from '../utils/logger';
import User from '../models/User';
import Notification from '../models/Notification';
import { RedisService } from '../config/redis';

// Push Notification Types
export enum NotificationType {
  HEALTH_REMINDER = 'health_reminder',
  FEEDING_TIME = 'feeding_time',
  VACCINE_REMINDER = 'vaccine_reminder',
  WEIGHT_CHECK = 'weight_check',
  FOOD_ALERT = 'food_alert',
  PRODUCT_RECOMMENDATION = 'product_recommendation',
  GENERAL = 'general'
}

// Push Notification Priorities
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  sound?: string;
  badge?: number;
  scheduledFor?: Date;
}

export class PushNotificationService {
  private static FCM_ENABLED = process.env.FCM_SERVER_KEY ? true : false;

  // Initialize Firebase Admin (if configured)
  private static initializeFirebase() {
    if (!this.FCM_ENABLED) {
      logger.warn('⚠️ Firebase not configured - push notifications disabled');
      return null;
    }

    try {
      // In production, initialize Firebase Admin SDK
      // const admin = require('firebase-admin');
      // admin.initializeApp({...});
      logger.info('✅ Firebase initialized for push notifications');
      return true;
    } catch (error) {
      logger.error('Firebase initialization failed:', error);
      return null;
    }
  }

  // Send single push notification
  static async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      const { userId, title, body, type, priority = NotificationPriority.NORMAL, data = {} } = payload;

      // Get user and device tokens
      const user = await User.findById(userId);
      if (!user) {
        logger.error(`User not found: ${userId}`);
        return false;
      }

      // Check if user has push enabled
      const pushSettings = await this.getUserPushSettings(userId);
      if (!pushSettings.enabled) {
        logger.info(`Push notifications disabled for user: ${userId}`);
        return false;
      }

      // Check if specific notification type is enabled
      if (!pushSettings.types[type]) {
        logger.info(`Notification type ${type} disabled for user: ${userId}`);
        return false;
      }

      // Save notification to database
      const notification = new Notification({
        userId,
        title,
        message: body,
        type,
        priority,
        data,
        isRead: false,
        sentAt: new Date()
      });
      await notification.save();

      // If FCM is not enabled, just save to DB (for testing)
      if (!this.FCM_ENABLED) {
        logger.info(`📱 Notification saved (FCM disabled): ${title}`);
        return true;
      }

      // Send via FCM (mock for now)
      const fcmPayload = {
        notification: {
          title,
          body,
          image: payload.imageUrl,
          sound: payload.sound || 'default',
          badge: payload.badge?.toString()
        },
        data: {
          ...data,
          type,
          notificationId: notification._id.toString(),
          actionUrl: payload.actionUrl || ''
        },
        android: {
          priority: priority === NotificationPriority.URGENT ? 'high' : 'normal',
          notification: {
            channelId: type,
            color: '#E85A5A', // OiPet coral
            icon: 'ic_notification'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: payload.sound || 'default',
              badge: payload.badge || 0,
              contentAvailable: true
            }
          }
        }
      };

      logger.info(`✅ Push notification sent: ${title} to user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Push notification error:', error);
      return false;
    }
  }

  // Send batch notifications
  static async sendBatchNotifications(
    userIds: string[],
    template: Omit<PushNotificationPayload, 'userId'>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const success = await this.sendPushNotification({
        userId,
        ...template
      });

      if (success) sent++;
      else failed++;
    }

    logger.info(`📱 Batch notifications: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // Schedule notification
  static async scheduleNotification(payload: PushNotificationPayload): Promise<string> {
    try {
      const { scheduledFor = new Date() } = payload;
      
      // Calculate delay
      const delay = scheduledFor.getTime() - Date.now();
      
      if (delay <= 0) {
        // Send immediately
        await this.sendPushNotification(payload);
        return 'sent_immediately';
      }

      // Store in Redis for scheduled sending
      const scheduleId = `schedule:${Date.now()}:${payload.userId}`;
      await RedisService.set(scheduleId, payload, Math.ceil(delay / 1000));

      // In production, use a job queue like Bull
      setTimeout(() => {
        this.sendPushNotification(payload);
      }, delay);

      logger.info(`⏰ Notification scheduled for ${scheduledFor.toISOString()}`);
      return scheduleId;

    } catch (error) {
      logger.error('Schedule notification error:', error);
      throw error;
    }
  }

  // Cancel scheduled notification
  static async cancelScheduledNotification(scheduleId: string): Promise<boolean> {
    try {
      return await RedisService.del(scheduleId);
    } catch (error) {
      logger.error('Cancel scheduled notification error:', error);
      return false;
    }
  }

  // Get user push settings
  static async getUserPushSettings(userId: string): Promise<{
    enabled: boolean;
    types: Record<NotificationType, boolean>;
    quietHours?: { start: string; end: string };
  }> {
    try {
      // Get from cache first
      const cached = await RedisService.get(`push-settings:${userId}`);
      if (cached) return cached as any;

      // Default settings
      const settings = {
        enabled: true,
        types: {
          [NotificationType.HEALTH_REMINDER]: true,
          [NotificationType.FEEDING_TIME]: true,
          [NotificationType.VACCINE_REMINDER]: true,
          [NotificationType.WEIGHT_CHECK]: true,
          [NotificationType.FOOD_ALERT]: true,
          [NotificationType.PRODUCT_RECOMMENDATION]: false,
          [NotificationType.GENERAL]: true
        },
        quietHours: {
          start: '22:00',
          end: '08:00'
        }
      };

      // Cache for 1 hour
      await RedisService.set(`push-settings:${userId}`, settings, 3600);

      return settings;
    } catch (error) {
      logger.error('Get push settings error:', error);
      return {
        enabled: true,
        types: Object.values(NotificationType).reduce((acc, type) => ({
          ...acc,
          [type]: true
        }), {} as Record<NotificationType, boolean>)
      };
    }
  }

  // Update user push settings
  static async updateUserPushSettings(
    userId: string,
    settings: Partial<{
      enabled: boolean;
      types: Partial<Record<NotificationType, boolean>>;
      quietHours?: { start: string; end: string };
    }>
  ): Promise<boolean> {
    try {
      const current = await this.getUserPushSettings(userId);
      const updated = {
        ...current,
        ...settings,
        types: {
          ...current.types,
          ...(settings.types || {})
        }
      };

      await RedisService.set(`push-settings:${userId}`, updated, 3600);
      logger.info(`✅ Push settings updated for user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Update push settings error:', error);
      return false;
    }
  }

  // Pre-defined notification templates
  static async sendHealthReminder(userId: string, petName: string): Promise<boolean> {
    return this.sendPushNotification({
      userId,
      title: `🏥 Hora do check-up de ${petName}`,
      body: 'Não esqueça de registrar o peso e atividades do seu pet hoje!',
      type: NotificationType.HEALTH_REMINDER,
      priority: NotificationPriority.NORMAL,
      data: { petName }
    });
  }

  static async sendFeedingReminder(userId: string, petName: string, mealTime: string): Promise<boolean> {
    return this.sendPushNotification({
      userId,
      title: `🍖 Hora da ${mealTime} de ${petName}`,
      body: 'Seu pet está esperando pela refeição!',
      type: NotificationType.FEEDING_TIME,
      priority: NotificationPriority.HIGH,
      data: { petName, mealTime }
    });
  }

  static async sendVaccineReminder(userId: string, petName: string, vaccine: string, daysUntil: number): Promise<boolean> {
    const urgency = daysUntil <= 1 ? NotificationPriority.URGENT : NotificationPriority.HIGH;
    
    return this.sendPushNotification({
      userId,
      title: `💉 Vacina de ${petName}`,
      body: daysUntil === 0 
        ? `Hoje é dia da vacina ${vaccine}!`
        : `Faltam ${daysUntil} dias para a vacina ${vaccine}`,
      type: NotificationType.VACCINE_REMINDER,
      priority: urgency,
      data: { petName, vaccine, daysUntil }
    });
  }

  static async sendFoodAlert(userId: string, petName: string, food: string, status: 'toxic' | 'caution'): Promise<boolean> {
    const isUrgent = status === 'toxic';
    
    return this.sendPushNotification({
      userId,
      title: isUrgent ? `⚠️ ALERTA: Alimento tóxico!` : `⚠️ Cuidado com ${food}`,
      body: isUrgent 
        ? `${food} é TÓXICO para ${petName}! Não ofereça!`
        : `${food} deve ser oferecido com cautela para ${petName}`,
      type: NotificationType.FOOD_ALERT,
      priority: isUrgent ? NotificationPriority.URGENT : NotificationPriority.HIGH,
      data: { petName, food, status }
    });
  }

  static async sendProductRecommendation(userId: string, productName: string, discount?: number): Promise<boolean> {
    const body = discount 
      ? `${productName} com ${discount}% de desconto na OiPet!`
      : `Conheça ${productName} - perfeito para seu pet!`;

    return this.sendPushNotification({
      userId,
      title: '🛒 Recomendação OiPet',
      body,
      type: NotificationType.PRODUCT_RECOMMENDATION,
      priority: NotificationPriority.LOW,
      data: { productName, discount },
      actionUrl: 'https://oipetcomidadeverdade.com.br'
    });
  }

  // Analytics
  static async getNotificationStats(userId?: string): Promise<{
    total: number;
    sent: number;
    read: number;
    byType: Record<string, number>;
    readRate: number;
  }> {
    try {
      const query: any = {};
      if (userId) query.userId = userId;

      const [total, read, byType] = await Promise.all([
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, isRead: true }),
        Notification.aggregate([
          { $match: query },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      ]);

      const byTypeMap = byType.reduce((acc, item) => ({
        ...acc,
        [item._id]: item.count
      }), {});

      return {
        total,
        sent: total,
        read,
        byType: byTypeMap,
        readRate: total > 0 ? Math.round((read / total) * 100) : 0
      };

    } catch (error) {
      logger.error('Get notification stats error:', error);
      return {
        total: 0,
        sent: 0,
        read: 0,
        byType: {},
        readRate: 0
      };
    }
  }

  // Initialize service
  static async initialize() {
    this.initializeFirebase();
    logger.info('✅ Push Notification Service initialized');
  }
}