import { useCallback } from 'react'
import { useNotificationStore, Notification } from '@/stores/notificationStore'

export const useNotifications = () => {
  const store = useNotificationStore()

  const showNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      priority?: Notification['priority']
      petId?: string
      petName?: string
      actionUrl?: string
      scheduledFor?: Date
    }
  ) => {
    store.addNotification({
      type,
      title,
      message,
      priority: options?.priority || 'medium',
      petId: options?.petId,
      petName: options?.petName,
      actionUrl: options?.actionUrl,
      scheduledFor: options?.scheduledFor
    })
  }, [store])

  const showSuccess = useCallback((title: string, message: string, options?: { actionUrl?: string }) => {
    showNotification('system', title, message, { ...options, priority: 'low' })
  }, [showNotification])

  const showError = useCallback((title: string, message: string, options?: { actionUrl?: string }) => {
    showNotification('system', title, message, { ...options, priority: 'high' })
  }, [showNotification])

  const showReminder = useCallback((
    title: string, 
    message: string, 
    petName: string, 
    options?: { 
      petId?: string
      scheduledFor?: Date 
      actionUrl?: string 
    }
  ) => {
    showNotification('reminder', title, message, {
      ...options,
      petName,
      priority: 'high'
    })
  }, [showNotification])

  const showHealthAlert = useCallback((
    title: string, 
    message: string, 
    petName: string, 
    options?: { 
      petId?: string
      actionUrl?: string 
    }
  ) => {
    showNotification('health', title, message, {
      ...options,
      petName,
      priority: 'medium'
    })
  }, [showNotification])

  const showAppointmentReminder = useCallback((
    title: string, 
    message: string, 
    petName: string, 
    scheduledFor: Date,
    options?: { 
      petId?: string
      actionUrl?: string 
    }
  ) => {
    showNotification('appointment', title, message, {
      ...options,
      petName,
      scheduledFor,
      priority: 'high'
    })
  }, [showNotification])

  const showAchievement = useCallback((
    title: string, 
    message: string, 
    petName: string, 
    options?: { 
      petId?: string
      actionUrl?: string 
    }
  ) => {
    showNotification('achievement', title, message, {
      ...options,
      petName,
      priority: 'low'
    })
  }, [showNotification])

  return {
    // Store methods
    ...store,
    
    // Helper methods
    showNotification,
    showSuccess,
    showError,
    showReminder,
    showHealthAlert,
    showAppointmentReminder,
    showAchievement
  }
}