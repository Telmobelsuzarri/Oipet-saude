/**
 * NotificationService - Serviço de notificações
 */

import { apiService } from './api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export class NotificationService {
  /**
   * Inicializar serviço de notificações
   */
  static async initialize() {
    if (!Device.isDevice) {
      console.warn('Notificações só funcionam em dispositivos físicos');
      return;
    }

    // Configurar comportamento das notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Solicitar permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão para notificações negada');
      return;
    }

    // Obter token para push notifications
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Notification token:', token);

    // Configurar canal para Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E85A5A',
      });
    }

    return token;
  }

  /**
   * Obter notificações do usuário
   */
  static async getNotifications(page = 1, limit = 20, unreadOnly = false, category?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
      ...(category && { category }),
    });
    
    return await apiService.get(`/notifications?${params}`);
  }

  /**
   * Obter notificações não lidas
   */
  static async getUnreadNotifications(limit = 10) {
    return await apiService.get(`/notifications/unread?limit=${limit}`);
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string) {
    return await apiService.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async markAllAsRead() {
    return await apiService.put('/notifications/read-all');
  }

  /**
   * Deletar notificação
   */
  static async deleteNotification(notificationId: string) {
    return await apiService.delete(`/notifications/${notificationId}`);
  }

  /**
   * Obter estatísticas de notificações
   */
  static async getNotificationStats() {
    return await apiService.get('/notifications/stats');
  }

  /**
   * Agendar notificação local
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Date | number,
    data?: any
  ) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });
  }

  /**
   * Cancelar notificação local
   */
  static async cancelLocalNotification(notificationId: string) {
    return await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancelar todas as notificações locais
   */
  static async cancelAllLocalNotifications() {
    return await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obter notificações agendadas
   */
  static async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Limpar badge de notificações
   */
  static async clearBadge() {
    return await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Definir badge count
   */
  static async setBadgeCount(count: number) {
    return await Notifications.setBadgeCountAsync(count);
  }
}