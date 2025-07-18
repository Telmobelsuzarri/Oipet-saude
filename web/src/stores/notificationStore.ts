import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'reminder' | 'appointment' | 'health' | 'achievement' | 'system'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  petId?: string
  petName?: string
  isRead: boolean
  createdAt: Date
  scheduledFor?: Date
  actionUrl?: string
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

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Hora da medicação do Rex',
    message: 'Não esqueça de dar o medicamento para hipertensão',
    priority: 'high',
    petId: '1',
    petName: 'Rex',
    isRead: false,
    createdAt: new Date('2025-01-15T09:00:00Z'),
    scheduledFor: new Date('2025-01-15T14:00:00Z'),
    actionUrl: '/app/pets/1'
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Consulta veterinária - Mimi',
    message: 'Consulta de rotina agendada para amanhã às 14:00',
    priority: 'medium',
    petId: '2',
    petName: 'Mimi',
    isRead: false,
    createdAt: new Date('2025-01-14T10:00:00Z'),
    scheduledFor: new Date('2025-01-16T14:00:00Z'),
    actionUrl: '/app/pets/2'
  },
  {
    id: '3',
    type: 'health',
    title: 'Peso do Rex aumentou',
    message: 'O peso do Rex aumentou 0.5kg desde a última medição',
    priority: 'medium',
    petId: '1',
    petName: 'Rex',
    isRead: true,
    createdAt: new Date('2025-01-13T16:30:00Z'),
    actionUrl: '/app/health'
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Meta de exercícios atingida!',
    message: 'Rex completou 30 minutos de exercícios hoje',
    priority: 'low',
    petId: '1',
    petName: 'Rex',
    isRead: true,
    createdAt: new Date('2025-01-12T18:00:00Z'),
    actionUrl: '/app/health'
  },
  {
    id: '5',
    type: 'system',
    title: 'Atualizações do OiPet',
    message: 'Novas funcionalidades disponíveis no aplicativo',
    priority: 'low',
    isRead: false,
    createdAt: new Date('2025-01-11T12:00:00Z'),
    actionUrl: '/app/settings'
  }
]

export const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.isRead).length,
  isLoading: false,
  error: null,

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      createdAt: new Date(),
      isRead: false
    }
    
    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        isRead: true
      })),
      unreadCount: 0
    }))
  },

  deleteNotification: (id) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id)
      const wasUnread = notification && !notification.isRead
      
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }
    })
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0
    })
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would be an API call
      set({
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.isRead).length,
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
}))