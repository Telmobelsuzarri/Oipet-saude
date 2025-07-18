import React from 'react'
import { motion } from 'framer-motion'
import { BellIcon } from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

import { useNotificationStore } from '@/stores/notificationStore'

interface NotificationBellProps {
  onClick: () => void
  className?: string
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, className = '' }) => {
  const { unreadCount } = useNotificationStore()
  const hasUnread = unreadCount > 0

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative p-2 rounded-full hover:bg-white/20 transition-colors ${className}`}
    >
      {hasUnread ? (
        <BellSolidIcon className="h-6 w-6 text-coral-600" />
      ) : (
        <BellIcon className="h-6 w-6 text-gray-600" />
      )}
      
      {hasUnread && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}
      
      {hasUnread && (
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-coral-500 opacity-20"
        />
      )}
    </motion.button>
  )
}