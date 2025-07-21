import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  UsersIcon, 
  HeartIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

interface AnalyticsData {
  userGrowth: {
    period: string
    users: number
    growth: number
  }[]
  petRegistrations: {
    period: string
    pets: number
    growth: number
  }[]
  healthRecords: {
    period: string
    records: number
    growth: number
  }[]
  engagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    avgSessionTime: number
    bounceRate: number
    retention: {
      day1: number
      day7: number
      day30: number
    }
  }
  topFeatures: {
    feature: string
    usage: number
    growth: number
  }[]
}

interface DateRange {
  start: Date
  end: Date
  label: string
}

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    end: new Date(),
    label: '30 dias'
  })

  const dateRanges: DateRange[] = [
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: '7 dias'
    },
    {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: '30 dias'
    },
    {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: '90 dias'
    }
  ]

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Simulando dados até a API estar pronta
        const mockData: AnalyticsData = {
          userGrowth: [
            { period: '2025-01-01', users: 1200, growth: 5.2 },
            { period: '2025-01-08', users: 1320, growth: 10.0 },
            { period: '2025-01-15', users: 1450, growth: 9.8 },
            { period: '2025-01-22', users: 1620, growth: 11.7 },
            { period: '2025-01-29', users: 1847, growth: 14.0 }
          ],
          petRegistrations: [
            { period: '2025-01-01', pets: 2100, growth: 8.5 },
            { period: '2025-01-08', pets: 2340, growth: 11.4 },
            { period: '2025-01-15', pets: 2580, growth: 10.3 },
            { period: '2025-01-22', pets: 2890, growth: 12.0 },
            { period: '2025-01-29', pets: 3254, growth: 12.6 }
          ],
          healthRecords: [
            { period: '2025-01-01', records: 14200, growth: 15.2 },
            { period: '2025-01-08', records: 15800, growth: 11.3 },
            { period: '2025-01-15', records: 16900, growth: 7.0 },
            { period: '2025-01-22', records: 17800, growth: 5.3 },
            { period: '2025-01-29', records: 18943, growth: 6.4 }
          ],
          engagement: {
            dailyActiveUsers: 342,
            weeklyActiveUsers: 1204,
            monthlyActiveUsers: 1847,
            avgSessionTime: 18.5,
            bounceRate: 23.4,
            retention: {
              day1: 78.5,
              day7: 45.2,
              day30: 23.8
            }
          },
          topFeatures: [
            { feature: 'Registro de Peso', usage: 89.2, growth: 12.5 },
            { feature: 'Monitoramento de Saúde', usage: 76.8, growth: 18.3 },
            { feature: 'Cadastro de Pets', usage: 95.1, growth: 8.7 },
            { feature: 'Histórico Médico', usage: 54.3, growth: 25.1 },
            { feature: 'Notificações', usage: 67.9, growth: -3.2 }
          ]
        }
        
        setAnalytics(mockData)
        
      } catch (err) {
        setError('Erro ao carregar dados de analytics')
        console.error('Analytics load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [selectedRange])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowTrendingUpIcon className="h-3 w-3" />
    if (growth < 0) return <ArrowTrendingDownIcon className="h-3 w-3" />
    return null
  }

  const generateReport = () => {
    console.log('Gerando relatório de analytics...')
    // Implementar geração de relatório
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Administrativo</h1>
            <p className="text-gray-600 mt-1">Análise detalhada de dados e métricas do sistema</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedRange.label}
            onChange={(e) => {
              const range = dateRanges.find(r => r.label === e.target.value)
              if (range) setSelectedRange(range)
            }}
            className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            className="flex items-center space-x-2 bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Exportar Relatório</span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-glass p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Métricas de Engajamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos Diários</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.dailyActiveUsers}</p>
              <p className="text-xs text-gray-500 mt-1">DAU</p>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <UsersIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos Semanais</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.weeklyActiveUsers}</p>
              <p className="text-xs text-gray-500 mt-1">WAU</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-glass">
              <EyeIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tempo Médio de Sessão</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.avgSessionTime}min</p>
              <p className="text-xs text-gray-500 mt-1">Por usuário</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-glass">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Rejeição</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement.bounceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Bounce Rate</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-glass">
              <ArrowTrendingDownIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Gráficos de Crescimento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crescimento de Usuários</h3>
            <UsersIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.userGrowth.slice(-3).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(item.users)}
                    </span>
                    <span className={`text-xs flex items-center ${getGrowthColor(item.growth)}`}>
                      {getGrowthIcon(item.growth)}
                      <span className="ml-1">{item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-600"
                      style={{ width: `${Math.min(100, (item.users / 2000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registro de Pets</h3>
            <HeartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.petRegistrations.slice(-3).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(item.pets)}
                    </span>
                    <span className={`text-xs flex items-center ${getGrowthColor(item.growth)}`}>
                      {getGrowthIcon(item.growth)}
                      <span className="ml-1">{item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600"
                      style={{ width: `${Math.min(100, (item.pets / 4000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registros de Saúde</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.healthRecords.slice(-3).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(item.records)}
                    </span>
                    <span className={`text-xs flex items-center ${getGrowthColor(item.growth)}`}>
                      {getGrowthIcon(item.growth)}
                      <span className="ml-1">{item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ width: `${Math.min(100, (item.records / 20000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Retenção e Funcionalidades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Taxa de Retenção</h3>
            <PresentationChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retenção D1</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${analytics.engagement.retention.day1}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {analytics.engagement.retention.day1}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retenção D7</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600"
                    style={{ width: `${analytics.engagement.retention.day7}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {analytics.engagement.retention.day7}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retenção D30</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-600"
                    style={{ width: `${analytics.engagement.retention.day30}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {analytics.engagement.retention.day30}%
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Funcionalidades Mais Usadas</h3>
            <FunnelIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.topFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {feature.feature}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{feature.usage}%</span>
                      <span className={`text-xs flex items-center ${getGrowthColor(feature.growth)}`}>
                        {getGrowthIcon(feature.growth)}
                        <span className="ml-1">{feature.growth > 0 ? '+' : ''}{feature.growth.toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}