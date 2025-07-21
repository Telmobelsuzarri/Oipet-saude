import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  HeartIcon, 
  ChartBarIcon, 
  BellIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ServerIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

interface DashboardStats {
  totalUsers: number
  totalPets: number
  totalHealthRecords: number
  totalNotifications: number
  activeUsers: number
  serverUptime: string
  databaseSize: string
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user?: string
  }>
}

interface RealtimeMetrics {
  currentUsers: number
  requestsPerMinute: number
  errorRate: number
  avgResponseTime: number
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPets: 0,
    totalHealthRecords: 0,
    totalNotifications: 0,
    activeUsers: 0,
    serverUptime: '0h 0m',
    databaseSize: '0 MB',
    recentActivity: []
  })
  
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    currentUsers: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    avgResponseTime: 0
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Simulando dados até a API estar pronta
        const mockStats: DashboardStats = {
          totalUsers: 1847,
          totalPets: 3254,
          totalHealthRecords: 18943,
          totalNotifications: 7621,
          activeUsers: 342,
          serverUptime: '7d 14h 32m',
          databaseSize: '847 MB',
          recentActivity: [
            {
              id: '1',
              type: 'user_registration',
              description: 'Novo usuário registrado',
              timestamp: '2 minutos atrás',
              user: 'João Silva'
            },
            {
              id: '2',
              type: 'pet_added',
              description: 'Novo pet adicionado',
              timestamp: '5 minutos atrás',
              user: 'Maria Santos'
            },
            {
              id: '3',
              type: 'health_record',
              description: 'Registro de saúde criado',
              timestamp: '8 minutos atrás',
              user: 'Carlos Oliveira'
            },
            {
              id: '4',
              type: 'notification_sent',
              description: 'Notificação enviada',
              timestamp: '12 minutos atrás'
            }
          ]
        }
        
        const mockRealtime: RealtimeMetrics = {
          currentUsers: 45,
          requestsPerMinute: 127,
          errorRate: 0.3,
          avgResponseTime: 234
        }
        
        setStats(mockStats)
        setRealtimeMetrics(mockRealtime)
        
      } catch (err) {
        setError('Erro ao carregar dados do dashboard')
        console.error('Dashboard load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
    
    // Atualizar métricas em tempo real a cada 30 segundos
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        ...prev,
        currentUsers: prev.currentUsers + Math.floor(Math.random() * 10 - 5),
        requestsPerMinute: prev.requestsPerMinute + Math.floor(Math.random() * 20 - 10),
        errorRate: Math.max(0, prev.errorRate + (Math.random() * 0.2 - 0.1)),
        avgResponseTime: prev.avgResponseTime + Math.floor(Math.random() * 50 - 25)
      }))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UsersIcon className="h-4 w-4 text-blue-600" />
      case 'pet_added':
        return <HeartIcon className="h-4 w-4 text-green-600" />
      case 'health_record':
        return <ChartBarIcon className="h-4 w-4 text-purple-600" />
      case 'notification_sent':
        return <BellIcon className="h-4 w-4 text-orange-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100'
      case 'pet_added':
        return 'bg-green-100'
      case 'health_record':
        return 'bg-purple-100'
      case 'notification_sent':
        return 'bg-orange-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com Logo OiPet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <OiPetLogo size="lg" showText={true} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Visão geral do sistema OiPet Saúde</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Sistema Online</span>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-glass p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +12% este mês
              </p>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <UsersIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPets.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +18% este mês
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-glass">
              <HeartIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros de Saúde</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHealthRecords.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +25% este mês
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-glass">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <EyeIcon className="h-3 w-3 mr-1" />
                Agora online
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <BellIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Métricas em Tempo Real */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Métricas em Tempo Real</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Usuários Online</span>
              <span className="font-bold text-green-600">{realtimeMetrics.currentUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Req/min</span>
              <span className="font-bold text-blue-600">{realtimeMetrics.requestsPerMinute}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Erro</span>
              <span className="font-bold text-red-600">{realtimeMetrics.errorRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tempo Resposta</span>
              <span className="font-bold text-gray-700">{realtimeMetrics.avgResponseTime}ms</span>
            </div>
          </div>
        </GlassCard>

        {/* Atividade Recente */}
        <GlassCard className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-glass ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <p className="text-xs text-gray-500">
                      por {activity.user}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Informações do Sistema */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status do Sistema</h3>
            <ServerIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime do Servidor</span>
              <span className="font-bold text-green-600">{stats.serverUptime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uso de CPU</span>
              <span className="font-bold text-blue-600">23%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uso de Memória</span>
              <span className="font-bold text-yellow-600">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Espaço em Disco</span>
              <span className="font-bold text-gray-700">45%</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Banco de Dados</h3>
            <CircleStackIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tamanho do Banco</span>
              <span className="font-bold text-gray-700">{stats.databaseSize}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conexões Ativas</span>
              <span className="font-bold text-blue-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Queries/seg</span>
              <span className="font-bold text-green-600">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Último Backup</span>
              <span className="font-bold text-gray-700">2h atrás</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}