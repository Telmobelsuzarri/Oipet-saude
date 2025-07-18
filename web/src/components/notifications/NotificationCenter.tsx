import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  BellIcon,
  XMarkIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  HeartIcon,
  CalendarIcon,
  TrophyIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { useNotificationStore, Notification } from '@/stores/notificationStore'
import { getRelativeTime } from '@/lib/utils'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'reminder':
      return ClockIcon
    case 'appointment':
      return CalendarIcon
    case 'health':
      return HeartIcon
    case 'achievement':
      return TrophyIcon
    case 'system':
      return InformationCircleIcon
    default:
      return BellIcon
  }
}

const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
  const baseColors = {
    reminder: 'bg-amber-100 text-amber-800 border-amber-200',
    appointment: 'bg-blue-100 text-blue-800 border-blue-200',
    health: 'bg-coral-100 text-coral-800 border-coral-200',
    achievement: 'bg-green-100 text-green-800 border-green-200',
    system: 'bg-purple-100 text-purple-800 border-purple-200'
  }
  
  const priorityIntensity = {
    high: 'ring-2 ring-red-300',
    medium: 'ring-1 ring-yellow-300',
    low: ''
  }
  
  return `${baseColors[type]} ${priorityIntensity[priority]}`
}

const NotificationItem: React.FC<{
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  onAction: (url?: string) => void
}> = ({ notification, onRead, onDelete, onAction }) => {
  const Icon = getNotificationIcon(notification.type)
  const colorClass = getNotificationColor(notification.type, notification.priority)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-glass border ${colorClass} ${
        !notification.isRead ? 'bg-opacity-80' : 'bg-opacity-40'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium">
                {notification.title}
                {notification.petName && (
                  <span className="ml-2 text-xs opacity-75">
                    ({notification.petName})
                  </span>
                )}
              </h4>
              <p className="text-xs mt-1 opacity-90">
                {notification.message}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs opacity-75">
                  {getRelativeTime(notification.createdAt.toISOString())}
                </span>
                {notification.scheduledFor && (
                  <span className="text-xs opacity-75">
                    • {getRelativeTime(notification.scheduledFor.toISOString())}
                  </span>
                )}
                {notification.priority === 'high' && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    Urgente
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              {!notification.isRead && (
                <button
                  onClick={() => onRead(notification.id)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Marcar como lida"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
              
              {notification.actionUrl && (
                <button
                  onClick={() => onAction(notification.actionUrl)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Abrir"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                title="Excluir"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotificationStore()

  const handleAction = (url?: string) => {
    if (url) {
      navigate(url)
      onClose()
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notificações?')) {
      clearAll()
    }
  }

  const unreadNotifications = notifications.filter(n => !n.isRead)
  const readNotifications = notifications.filter(n => n.isRead)

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 w-96 max-w-[90vw] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <BellSolidIcon className="h-5 w-5 text-coral-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notificações
              </h2>
              {unreadCount > 0 && (
                <span className="bg-coral-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-coral-600 hover:text-coral-700 font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Limpar todas
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Carregando notificações...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-sm text-gray-600">
                  Você receberá notificações sobre seus pets aqui
                </p>
              </div>
            ) : (
              <>
                {/* Unread notifications */}
                {unreadNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Não lidas ({unreadNotifications.length})
                    </h3>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {unreadNotifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={markAsRead}
                            onDelete={deleteNotification}
                            onAction={handleAction}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Read notifications */}
                {readNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Lidas ({readNotifications.length})
                    </h3>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {readNotifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={markAsRead}
                            onDelete={deleteNotification}
                            onAction={handleAction}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}