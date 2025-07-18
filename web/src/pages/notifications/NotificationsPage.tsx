import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { useNotifications } from '@/hooks/useNotifications'
import { Notification } from '@/stores/notificationStore'
import { getRelativeTime } from '@/lib/utils'

const NotificationFilterTabs = ({ 
  activeFilter, 
  onFilterChange 
}: { 
  activeFilter: string
  onFilterChange: (filter: string) => void 
}) => {
  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: 'Não lidas' },
    { id: 'reminder', label: 'Lembretes' },
    { id: 'health', label: 'Saúde' },
    { id: 'achievement', label: 'Conquistas' }
  ]

  return (
    <div className="flex space-x-2 mb-6">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-4 py-2 rounded-glass text-sm font-medium transition-all duration-200
            ${activeFilter === filter.id 
              ? 'bg-coral-500 text-white shadow-glass-lg' 
              : 'bg-white/20 text-gray-700 hover:bg-white/30'
            }
          `}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  )
}

const NotificationCard: React.FC<{
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  onAction: (url?: string) => void
}> = ({ notification, onRead, onDelete, onAction }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return '⏰'
      case 'appointment': return '📅'
      case 'health': return '💊'
      case 'achievement': return '🏆'
      case 'system': return '⚙️'
      default: return '📢'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-amber-100 border-amber-200'
      case 'appointment': return 'bg-blue-100 border-blue-200'
      case 'health': return 'bg-coral-100 border-coral-200'
      case 'achievement': return 'bg-green-100 border-green-200'
      case 'system': return 'bg-purple-100 border-purple-200'
      default: return 'bg-gray-100 border-gray-200'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        p-4 rounded-glass border transition-all duration-200
        ${getTypeColor(notification.type)}
        ${!notification.isRead ? 'ring-2 ring-coral-300' : ''}
        hover:shadow-glass-lg
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">
            {getTypeIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {notification.title}
              </h3>
              {notification.petName && (
                <span className="text-xs bg-white/50 px-2 py-1 rounded-full text-gray-600">
                  {notification.petName}
                </span>
              )}
              {notification.priority === 'high' && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  Urgente
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 mb-2">
              {notification.message}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>
                {getRelativeTime(notification.createdAt.toISOString())}
              </span>
              {notification.scheduledFor && (
                <span>
                  Agendado para: {getRelativeTime(notification.scheduledFor.toISOString())}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!notification.isRead && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRead(notification.id)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Marcar como lida"
            >
              <EyeIcon className="h-4 w-4 text-gray-600" />
            </motion.button>
          )}
          
          {notification.actionUrl && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction(notification.actionUrl)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Abrir"
            >
              <CheckIcon className="h-4 w-4 text-gray-600" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(notification.id)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Excluir"
          >
            <TrashIcon className="h-4 w-4 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications()

  const [activeFilter, setActiveFilter] = React.useState('all')

  const filteredNotifications = React.useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead)
      case 'reminder':
        return notifications.filter(n => n.type === 'reminder')
      case 'health':
        return notifications.filter(n => n.type === 'health')
      case 'achievement':
        return notifications.filter(n => n.type === 'achievement')
      default:
        return notifications
    }
  }, [notifications, activeFilter])

  const handleAction = (url?: string) => {
    if (url) {
      navigate(url)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notificações?')) {
      clearAll()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellSolidIcon className="h-8 w-8 text-coral-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
              <p className="text-gray-600 mt-1">
                Gerencie todas as suas notificações e lembretes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Marcar todas como lidas</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-glass hover:bg-gray-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Limpar todas</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </GlassWidget>
        
        <GlassWidget className="p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-coral-600">{unreadCount}</p>
            <p className="text-sm text-gray-600">Não lidas</p>
          </div>
        </GlassWidget>
        
        <GlassWidget className="p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {notifications.filter(n => n.type === 'reminder').length}
            </p>
            <p className="text-sm text-gray-600">Lembretes</p>
          </div>
        </GlassWidget>
        
        <GlassWidget className="p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.type === 'achievement').length}
            </p>
            <p className="text-sm text-gray-600">Conquistas</p>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <NotificationFilterTabs 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando notificações...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <GlassCard className="text-center py-12">
            <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-gray-600">
              {activeFilter === 'all' 
                ? 'Você não tem notificações no momento'
                : `Nenhuma notificação encontrada para o filtro "${activeFilter}"`
              }
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}