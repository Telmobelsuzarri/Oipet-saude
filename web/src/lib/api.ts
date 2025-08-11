import axios, { AxiosError, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          
          // Update tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Update default headers
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
          
          // Retry original request
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        delete apiClient.defaults.headers.common['Authorization']
        
        // Only show toast if not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
          toast.error('Sessão expirada. Faça login novamente.')
          window.location.href = '/auth/login'
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    // Handle other errors
    if (error.response?.status === 500) {
      toast.error('Erro interno do servidor. Tente novamente.')
    } else if (error.response?.status === 404) {
      // Don't show toast for 404s as they might be intentional
      console.warn('Resource not found:', error.config?.url)
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      toast.error('Erro de conexão. Verifique sua internet.')
    }
    
    return Promise.reject(error)
  }
)

// Mock functions for development
const mockLogin = (email: string, password: string) => {
  // Admin credentials
  if (email === 'admin@oipet.com' && password === 'admin123') {
    return Promise.resolve({
      data: {
        data: {
          user: {
            _id: 'admin-1',
            name: 'Administrador OiPet',
            email: email,
            avatar: null,
            isAdmin: true,
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'mock-admin-token-' + Date.now(),
          refreshToken: 'mock-admin-refresh-' + Date.now(),
        }
      }
    })
  }
  
  // Regular user credentials
  return Promise.resolve({
    data: {
      data: {
        user: {
          _id: '1',
          name: 'Usuário Teste',
          email: email,
          avatar: null,
          isAdmin: false,
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      }
    }
  })
}

const mockRegister = (data: { name: string; email: string; password: string; phone?: string }) => {
  return Promise.resolve({
    data: {
      data: {
        user: {
          id: '1',
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: null,
          isAdmin: false,
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    }
  })
}

// API service functions
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      try {
        return await apiClient.post('/api/auth/login', { email, password })
      } catch (error) {
        console.log('Backend não disponível, usando mock login')
        return mockLogin(email, password)
      }
    },
    
    register: async (data: { name: string; email: string; password: string; phone?: string }) => {
      try {
        return await apiClient.post('/api/auth/register', data)
      } catch (error) {
        console.log('Backend não disponível, usando mock register')
        return mockRegister(data)
      }
    },
    
    logout: () =>
      apiClient.post('/api/auth/logout'),
    
    refreshToken: (refreshToken: string) =>
      apiClient.post('/api/auth/refresh', { refreshToken }),
    
    forgotPassword: (email: string) =>
      apiClient.post('/api/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) =>
      apiClient.post('/api/auth/reset-password', { token, password }),
    
    verifyEmail: (token: string) =>
      apiClient.post('/api/auth/verify-email', { token }),
  },

  // Products endpoints
  products: {
    getProducts: (filters?: any) =>
      apiClient.get('/api/products', { params: filters }),
    
    getProduct: (id: string) =>
      apiClient.get(`/api/products/${id}`),
    
    getCategories: () =>
      apiClient.get('/api/products/categories'),
    
    getBrands: () =>
      apiClient.get('/api/products/brands'),
    
    searchProducts: (query: string, filters?: any) =>
      apiClient.post('/api/products/search', { query, filters }),
    
    getRecommendations: (petId: string, limit?: number) =>
      apiClient.post('/api/products/recommendations', { petId, limit }),
    
    trackView: (productId: string, userId?: string) =>
      apiClient.post('/api/products/track-view', { productId, userId }),
  },

  // User endpoints
  users: {
    getProfile: () =>
      apiClient.get('/api/users/profile'),
    
    updateProfile: (data: any) =>
      apiClient.put('/api/users/profile', data),
    
    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.put('/api/users/change-password', { currentPassword, newPassword }),
    
    uploadAvatar: (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return apiClient.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
  },

  // Pet endpoints
  pets: {
    getAll: (params?: any) =>
      apiClient.get('/api/pets', { params }),
    
    getById: (id: string) =>
      apiClient.get(`/api/pets/${id}`),
    
    create: (data: any) =>
      apiClient.post('/api/pets', data),
    
    update: (id: string, data: any) =>
      apiClient.put(`/api/pets/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/api/pets/${id}`),
    
    calculateIMC: (id: string) =>
      apiClient.get(`/api/pets/${id}/imc`),
    
    uploadPhoto: (id: string, file: File) => {
      const formData = new FormData()
      formData.append('photo', file)
      return apiClient.post(`/api/pets/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
  },

  // Health endpoints
  health: {
    getPetRecords: (petId: string, params?: any) =>
      apiClient.get(`/api/health/pets/${petId}`, { params }),
    
    getRecord: (id: string) =>
      apiClient.get(`/api/health/${id}`),
    
    createRecord: (petId: string, data: any) =>
      apiClient.post(`/api/health/pets/${petId}`, data),
    
    updateRecord: (id: string, data: any) =>
      apiClient.put(`/api/health/${id}`, data),
    
    deleteRecord: (id: string) =>
      apiClient.delete(`/api/health/${id}`),
    
    getPetStats: (petId: string, days?: number) =>
      apiClient.get(`/api/health/pets/${petId}/stats`, { params: { days } }),
    
    getWeightHistory: (petId: string, days?: number) =>
      apiClient.get(`/api/health/pets/${petId}/weight-history`, { params: { days } }),
    
    getActivitySummary: (petId: string, days?: number) =>
      apiClient.get(`/api/health/pets/${petId}/activity-summary`, { params: { days } }),
  },

  // Notification endpoints
  notifications: {
    getAll: (params?: any) =>
      apiClient.get('/api/notifications', { params }),
    
    getUnread: (limit?: number) =>
      apiClient.get('/api/notifications/unread', { params: { limit } }),
    
    markAsRead: (id: string) =>
      apiClient.put(`/api/notifications/${id}/read`),
    
    markAllAsRead: () =>
      apiClient.put('/api/notifications/read-all'),
    
    delete: (id: string) =>
      apiClient.delete(`/api/notifications/${id}`),
    
    getStats: () =>
      apiClient.get('/api/notifications/stats'),
  },

  // Admin endpoints
  admin: {
    getUsers: (params?: any) =>
      apiClient.get('/api/admin/users', { params }),
    
    getUserById: (id: string) =>
      apiClient.get(`/api/admin/users/${id}`),
    
    updateUser: (id: string, data: any) =>
      apiClient.put(`/api/admin/users/${id}`, data),
    
    deleteUser: (id: string) =>
      apiClient.delete(`/api/admin/users/${id}`),
    
    getAnalytics: () =>
      apiClient.get('/api/admin/analytics'),
    
    getDashboardStats: () =>
      apiClient.get('/api/admin/dashboard-stats'),
    
    sendNotification: (data: any) =>
      apiClient.post('/api/admin/notifications', data),
    
    generateReport: (type: string, params?: any) =>
      apiClient.get(`/api/admin/reports/${type}`, { params }),
  },
}

export default apiClient