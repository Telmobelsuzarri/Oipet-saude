import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  _id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  isAdmin: boolean
  isEmailVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  refreshToken: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const response = await api.auth.login(email, password)
          
          const { user, accessToken, refreshToken } = response.data.data
          
          // Store tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          
          // Set axios default authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
          
          toast.success(`Bem-vindo(a), ${user.name}!`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Erro ao fazer login'
          toast.error(message)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          
          const response = await api.auth.register(data)
          
          // Para o registro, vamos apenas mostrar sucesso sem fazer login automático
          set({ isLoading: false })
          
          toast.success(`Conta criada com sucesso! Verifique seu email.`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Erro ao criar conta'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        // Clear axios default authorization header
        delete apiClient.defaults.headers.common['Authorization']
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        
        toast.success('Logout realizado com sucesso')
      },

      updateUser: (data: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...data }
          })
        }
      },

      refreshToken: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }
          
          const response = await apiClient.post<{ data: { accessToken: string; refreshToken: string } }>('/auth/refresh', {
            refreshToken,
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          
          // Update tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Set axios default authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        } catch (error) {
          // If refresh fails, logout the user
          get().logout()
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Set up axios authorization header on app load
          const accessToken = localStorage.getItem('accessToken')
          if (accessToken && state?.isAuthenticated) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          }
        }
      },
    }
  )
)