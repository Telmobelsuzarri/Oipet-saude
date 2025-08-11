export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'urgent'
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  read: boolean
  relatedId?: string
  relatedType?: 'appointment' | 'health' | 'food' | 'recommendation' | 'system'
  actionUrl?: string
  actionLabel?: string
}

class NotificationService {
  private notifications: Notification[] = []
  private subscribers: ((notifications: Notification[]) => void)[] = []

  constructor() {
    // Load notifications from localStorage
    this.loadNotifications()
  }

  // Create a new notification
  async createNotification(data: Omit<Notification, 'timestamp' | 'read'>): Promise<Notification> {
    const notification: Notification = {
      ...data,
      timestamp: new Date(),
      read: false
    }

    this.notifications.unshift(notification)
    this.saveNotifications()
    this.notifySubscribers()

    // If it's urgent or critical, also show a browser notification
    if (data.priority === 'critical' || data.priority === 'high') {
      this.showBrowserNotification(notification)
    }

    return notification
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read)
  }

  // Get notifications by type
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type)
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      this.notifySubscribers()
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
    this.saveNotifications()
    this.notifySubscribers()
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.saveNotifications()
    this.notifySubscribers()
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = []
    this.saveNotifications()
    this.notifySubscribers()
  }

  // Subscribe to notification changes
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // Private methods
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('oipet_notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('oipet_notifications', JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.notifications))
  }

  private async showBrowserNotification(notification: Notification): Promise<void> {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return
    }

    // Check permission
    if (Notification.permission === 'granted') {
      this.createBrowserNotification(notification)
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        this.createBrowserNotification(notification)
      }
    }
  }

  private createBrowserNotification(notification: Notification): void {
    const options: NotificationOptions = {
      body: notification.message,
      icon: '/oipet-icon.png',
      badge: '/oipet-badge.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'critical',
      actions: notification.actionUrl ? [
        {
          action: 'open',
          title: notification.actionLabel || 'Ver mais'
        }
      ] : []
    }

    const browserNotification = new Notification(notification.title, options)

    browserNotification.onclick = () => {
      window.focus()
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
      this.markAsRead(notification.id)
    }
  }

  // Create predefined notifications
  async createStockAlert(foodName: string, quantity: number): Promise<Notification> {
    return this.createNotification({
      id: `stock-${Date.now()}`,
      title: '📦 Estoque Baixo',
      message: `${foodName} está acabando! Restam apenas ${quantity} unidades.`,
      type: 'warning',
      priority: 'medium',
      relatedType: 'food',
      actionUrl: '/app/gallery',
      actionLabel: 'Ver Estoque'
    })
  }

  async createHealthReminder(petName: string, activity: string): Promise<Notification> {
    return this.createNotification({
      id: `health-${Date.now()}`,
      title: '🏥 Lembrete de Saúde',
      message: `Hora de ${activity} para ${petName}!`,
      type: 'reminder',
      priority: 'medium',
      relatedType: 'health',
      actionUrl: '/app/health',
      actionLabel: 'Registrar'
    })
  }

  async createAchievementUnlocked(achievementName: string, xpGained: number): Promise<Notification> {
    return this.createNotification({
      id: `achievement-${Date.now()}`,
      title: '🏆 Conquista Desbloqueada!',
      message: `Você desbloqueou "${achievementName}" e ganhou ${xpGained} XP!`,
      type: 'success',
      priority: 'low',
      relatedType: 'system',
      actionUrl: '/app/profile',
      actionLabel: 'Ver Conquistas'
    })
  }

  async createRecommendation(title: string, message: string): Promise<Notification> {
    return this.createNotification({
      id: `recommendation-${Date.now()}`,
      title: `💡 ${title}`,
      message,
      type: 'info',
      priority: 'low',
      relatedType: 'recommendation',
      actionUrl: '/app/recommendations',
      actionLabel: 'Ver Recomendações'
    })
  }

  async createChallengeMilestone(challengeTitle: string, milestoneTitle: string, xpGained: number): Promise<Notification> {
    return this.createNotification({
      id: `challenge-milestone-${Date.now()}`,
      title: '🎯 Marco Alcançado!',
      message: `Você alcançou "${milestoneTitle}" no desafio "${challengeTitle}" e ganhou ${xpGained} XP!`,
      type: 'success',
      priority: 'medium',
      relatedType: 'system',
      actionUrl: '/app/challenges',
      actionLabel: 'Ver Desafios'
    })
  }

  async createChallengeCompleted(challengeTitle: string, totalXP: number): Promise<Notification> {
    return this.createNotification({
      id: `challenge-completed-${Date.now()}`,
      title: '🏆 Desafio Concluído!',
      message: `Parabéns! Você completou "${challengeTitle}" e ganhou ${totalXP} XP total!`,
      type: 'success',
      priority: 'high',
      relatedType: 'system',
      actionUrl: '/app/challenges',
      actionLabel: 'Ver Desafios'
    })
  }
}

export const notificationService = new NotificationService()