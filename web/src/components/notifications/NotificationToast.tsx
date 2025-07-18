import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface NotificationToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  onClose: () => void
  duration?: number
}

const typeConfig = {
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50/80',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900'
  },
  error: {
    icon: XCircleIcon,
    bgColor: 'bg-red-50/80',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900'
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50/80',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-amber-50/80',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900'
  }
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 5000
}) => {
  const config = typeConfig[type]
  const Icon = config.icon

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        ${config.bgColor} ${config.borderColor} 
        border rounded-glass p-4 shadow-glass-lg backdrop-blur-sm
        max-w-md w-full mx-auto
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className="text-sm text-gray-700 opacity-90">
            {message}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export const NotificationToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {children}
    </div>
  )
}