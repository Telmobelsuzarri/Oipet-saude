import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { NotificationToast, NotificationToastContainer } from '@/components/notifications/NotificationToast'

interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  showToast: (toast: Omit<ToastNotification, 'id'>) => void
  removeToast: (id: string) => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useToast must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastNotification[]>([])

  const showToast = React.useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const contextValue = React.useMemo(() => ({
    showToast,
    removeToast
  }), [showToast, removeToast])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      <NotificationToastContainer>
        <AnimatePresence>
          {toasts.map(toast => (
            <NotificationToast
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </NotificationToastContainer>
    </NotificationContext.Provider>
  )
}