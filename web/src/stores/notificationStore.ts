import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'reminder' | 'appointment' | 'health' | 'achievement' | 'system' | 'stock_alert'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  petId?: string
  petName?: string
  isRead: boolean
  read?: boolean // Para compatibilidade com notificações do foodGalleryService
  createdAt: Date
  timestamp?: Date // Para compatibilidade com notificações do foodGalleryService
  scheduledFor?: Date
  actionUrl?: string
  data?: any // Dados adicionais específicos do tipo de notificação
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  fetchNotifications: () => Promise<void>
  getUnreadCount: () => number
}

const generateId = () => Math.random().toString(36).substr(2, 9)

// Função para carregar notificações do localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const storedNotifications = localStorage.getItem('oipet_notifications')
    if (!storedNotifications) return []
    
    const notifications = JSON.parse(storedNotifications)
    return notifications.map((notif: any) => ({
      ...notif,
      // Normalizar campos para o formato esperado
      isRead: notif.isRead ?? notif.read ?? false,
      createdAt: notif.createdAt ? new Date(notif.createdAt) : (notif.timestamp ? new Date(notif.timestamp) : new Date()),
      timestamp: notif.timestamp ? new Date(notif.timestamp) : undefined,
      scheduledFor: notif.scheduledFor ? new Date(notif.scheduledFor) : undefined,
      priority: notif.priority || 'medium',
      // Adicionar URL de ação para notificações de estoque
      actionUrl: notif.type === 'stock_alert' ? '/app/gallery' : notif.actionUrl
    }))
  } catch (error) {
    console.error('Erro ao carregar notificações:', error)
    return []
  }
}

// Função para salvar notificações no localStorage
const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem('oipet_notifications', JSON.stringify(notifications))
  } catch (error) {
    console.error('Erro ao salvar notificações:', error)
  }
}

export const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => {
  // Carregar notificações do localStorage na inicialização
  const initialNotifications = loadNotificationsFromStorage()
  
  return {
    notifications: initialNotifications,
    unreadCount: initialNotifications.filter(n => !n.isRead).length,
    isLoading: false,
    error: null,

    addNotification: (notificationData) => {
      const newNotification: Notification = {
        ...notificationData,
        id: generateId(),
        createdAt: new Date(),
        isRead: false
      }
      
      set(state => {
        const updatedNotifications = [newNotification, ...state.notifications]
        saveNotificationsToStorage(updatedNotifications)
        return {
          notifications: updatedNotifications,
          unreadCount: state.unreadCount + 1
        }
      })
    },

    markAsRead: (id) => {
      set(state => {
        const updatedNotifications = state.notifications.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true, read: true }
            : notification
        )
        saveNotificationsToStorage(updatedNotifications)
        return {
          notifications: updatedNotifications,
          unreadCount: Math.max(0, state.unreadCount - 1)
        }
      })
    },

    markAllAsRead: () => {
      set(state => {
        const updatedNotifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          read: true
        }))
        saveNotificationsToStorage(updatedNotifications)
        return {
          notifications: updatedNotifications,
          unreadCount: 0
        }
      })
    },

    deleteNotification: (id) => {
      set(state => {
        const notification = state.notifications.find(n => n.id === id)
        const wasUnread = notification && !notification.isRead
        const updatedNotifications = state.notifications.filter(n => n.id !== id)
        saveNotificationsToStorage(updatedNotifications)
        
        return {
          notifications: updatedNotifications,
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        }
      })
    },

    clearAll: () => {
      saveNotificationsToStorage([])
      set({
        notifications: [],
        unreadCount: 0
      })
    },

    fetchNotifications: async () => {
      set({ isLoading: true, error: null })
      
      try {
        // Recarregar notificações do localStorage
        const notifications = loadNotificationsFromStorage()
        
        set({
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length,
          isLoading: false
        })
      } catch (error) {
        set({
          error: 'Erro ao carregar notificações',
          isLoading: false
        })
      }
    },

    getUnreadCount: () => {
      return get().unreadCount
    }
  }
})