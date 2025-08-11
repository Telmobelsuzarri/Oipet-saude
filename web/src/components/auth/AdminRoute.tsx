import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { message } from 'antd'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (!user?.isAdmin) {
    message.error('Acesso negado. Você precisa de permissões de administrador.')
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}