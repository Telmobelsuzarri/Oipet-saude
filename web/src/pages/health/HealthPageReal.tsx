import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ScaleIcon,
  BeakerIcon,
  FireIcon,
  MoonIcon,
  FaceSmileIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { usePetStore } from '@/stores/petStore'
import { healthTrackingService, type DailyHealthRecord, type HealthAlert, type HealthTrend } from '@/services/healthTrackingService'
import { cn } from '@/lib/utils'

export const HealthPageReal: React.FC = () => {
  const { pets, selectedPet, setSelectedPet } = usePetStore()
  const [todayRecord, setTodayRecord] = useState<DailyHealthRecord | null>(null)
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([])
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (selectedPet) {
      loadHealthData()
    } else if (pets.length > 0) {
      setSelectedPet(pets[0])
    }
  }, [selectedPet, pets])

  const loadHealthData = async () => {
    if (!selectedPet) return

    setIsLoading(true)
    try {
      // Carregar registro de hoje
      const records = await healthTrackingService.getHealthRecords(selectedPet._id)
      const todayRec = records.find(r => r.date === today)
      setTodayRecord(todayRec || null)

      // Carregar alertas
      const alerts = await healthTrackingService.getHealthAlerts(selectedPet._id, true)
      setHealthAlerts(alerts.slice(0, 3))

      // Carregar tendências
      const trends = await healthTrackingService.getHealthTrends(selectedPet._id, '30d')
      setHealthTrends(trends)

      // Carregar estatísticas
      const stats = await healthTrackingService.getHealthStatistics(selectedPet._id, '30d')
      setStatistics(stats)

    } catch (error) {
      console.error('Erro ao carregar dados de saúde:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'weight': return ScaleIcon
      case 'water': return BeakerIcon
      case 'activity': return ChartBarIcon
      default: return FireIcon
    }
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'weight': return 'blue'
      case 'water': return 'cyan'
      case 'activity': return 'green'
      default: return 'orange'
    }
  }

  const getTrendIcon = (trend: HealthTrend['trend']) => {
    switch (trend) {
      case 'increasing': return ArrowTrendingUpIcon
      case 'decreasing': return ArrowTrendingDownIcon
      default: return ArrowRightIcon
    }
  }

  const getTrendColor = (trend: HealthTrend['trend'], metric: string) => {
    if (trend === 'stable') return 'text-gray-500'
    
    // Para peso, diminuir pode ser bom ou ruim dependendo do contexto
    if (metric === 'weight') {
      return trend === 'increasing' ? 'text-amber-600' : 'text-blue-600'
    }
    
    // Para atividade e água, aumentar é geralmente bom
    return trend === 'increasing' ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de saúde...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Saúde de {selectedPet?.name} 🏥
              </h1>
              <p className="text-gray-600">
                Monitoramento completo de saúde e bem-estar
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/app/health/tracking"
                className="px-4 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Adicionar Dados</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mb-8">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {pets.map(pet => (
                <motion.button
                  key={pet.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPet(pet)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-glass border transition-all min-w-0 flex-shrink-0",
                    selectedPet?._id === pet._id
                      ? "bg-coral-500 text-white border-coral-500"
                      : "bg-white/50 text-gray-700 border-gray-200 hover:border-coral-300"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedPet?._id === pet._id ? "bg-white/20" : "bg-coral-100"
                  )}>
                    <span className={cn(
                      "font-medium",
                      selectedPet?._id === pet._id ? "text-white" : "text-coral-600"
                    )}>
                      {pet.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{pet.name}</p>
                    <p className={cn(
                      "text-sm",
                      selectedPet?._id === pet._id ? "text-white/80" : "text-gray-500"
                    )}>
                      {pet.breed}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Alertas de Saúde
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard className={cn(
                    "border-l-4",
                    alert.severity === 'critical' ? "border-red-500 bg-red-50" :
                    alert.severity === 'warning' ? "border-amber-500 bg-amber-50" :
                    "border-blue-500 bg-blue-50"
                  )}>
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className={cn(
                        "h-6 w-6 mt-1",
                        alert.severity === 'critical' ? "text-red-600" :
                        alert.severity === 'warning' ? "text-amber-600" :
                        "text-blue-600"
                      )} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas de Hoje */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Registro de Hoje
            </h2>
            {!todayRecord && (
              <Link
                to="/app/health/tracking"
                className="text-coral-600 hover:text-coral-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>Adicionar dados</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>

          {todayRecord ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Peso */}
              {todayRecord.weight && (
                <GlassWidget>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-glass">
                      <ScaleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Peso</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.weight.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                </GlassWidget>
              )}

              {/* Água */}
              {todayRecord.waterIntake && (
                <GlassWidget>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan-100 rounded-glass">
                      <BeakerIcon className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Água</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.waterIntake} ml
                      </p>
                    </div>
                  </div>
                </GlassWidget>
              )}

              {/* Atividade */}
              {todayRecord.activity && (
                <GlassWidget>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-glass">
                      <ChartBarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Passos</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.activity.steps.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassWidget>
              )}

              {/* Sono */}
              {todayRecord.sleep && (
                <GlassWidget>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-glass">
                      <MoonIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sono</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.sleep.hours.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </GlassWidget>
              )}
            </div>
          ) : (
            <GlassCard className="text-center py-12">
              <FaceSmileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum registro hoje
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione os dados de saúde do {selectedPet?.name} para começar o tracking
              </p>
              <Link
                to="/app/health/tracking"
                className="inline-flex items-center px-4 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Adicionar Dados
              </Link>
            </GlassCard>
          )}
        </div>

        {/* Tendências */}
        {healthTrends.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Tendências (30 dias)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthTrends.map(trend => {
                const IconComponent = getTrendIcon(trend.trend)
                const color = getTrendColor(trend.trend, trend.metric)
                
                return (
                  <motion.div
                    key={trend.metric}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "p-2 rounded-glass",
                            `bg-${getMetricColor(trend.metric)}-100`
                          )}>
                            {React.createElement(getMetricIcon(trend.metric), {
                              className: `h-5 w-5 text-${getMetricColor(trend.metric)}-600`
                            })}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {trend.metric === 'weight' ? 'Peso' :
                               trend.metric === 'water' ? 'Água' :
                               trend.metric === 'activity' ? 'Atividade' : trend.metric}
                            </p>
                            <p className="text-sm text-gray-600">
                              {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)} {trend.unit}
                            </p>
                          </div>
                        </div>
                        <div className={cn("flex items-center", color)}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {statistics && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Estatísticas (30 dias)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Peso Médio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.weight.average.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.weight.min.toFixed(1)} - {statistics.weight.max.toFixed(1)} kg
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Água Diária</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {Math.round(statistics.water.average)} ml
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: {(statistics.water.total / 1000).toFixed(1)}L
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Passos Diários</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(statistics.activity.averageSteps).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: {Math.round(statistics.activity.totalSteps / 1000)}k
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Sono Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics.sleep.average.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500">
                    Por dia
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard>
            <div className="text-center p-6">
              <ChartBarIcon className="h-12 w-12 text-coral-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ver Relatórios
              </h3>
              <p className="text-gray-600 mb-4">
                Gere relatórios detalhados de saúde
              </p>
              <Link
                to="/app/reports"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-glass hover:bg-gray-200 transition-colors"
              >
                Ver Relatórios
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-center p-6">
              <PlusIcon className="h-12 w-12 text-coral-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tracking Diário
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione dados de saúde do dia
              </p>
              <Link
                to="/app/health/tracking"
                className="inline-flex items-center px-4 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
              >
                Adicionar Dados
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}