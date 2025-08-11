import { useState, useEffect } from 'react'
import { notificationService, Notification } from '@/services/notificationService'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load initial notifications
    const allNotifications = notificationService.getNotifications()
    setNotifications(allNotifications)
    setUnreadCount(allNotifications.filter(n => !n.read).length)

    // Subscribe to changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
      setUnreadCount(updatedNotifications.filter(n => !n.read).length)
    })

    return unsubscribe
  }, [])

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
  }

  const markAllAsRead = () => {
    notificationService.markAllAsRead()
  }

  const deleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId)
  }

  const clearAll = () => {
    notificationService.clearAllNotifications()
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
}