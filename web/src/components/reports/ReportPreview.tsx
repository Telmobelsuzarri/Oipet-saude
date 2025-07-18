import React from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  ScaleIcon,
  FireIcon,
  HeartIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { reportService, type ReportData } from '@/services/reportService'
import { cn } from '@/lib/utils'

interface ReportPreviewProps {
  data: ReportData
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  const { metadata, pets, healthRecords, summary, charts } = data

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ComponentType<any>,
    color: string = 'gray',
    trend?: 'up' | 'down' | 'neutral'
  ) => {
    const Icon = icon || ChartBarIcon
    const TrendIcon = trend === 'up' ? ArrowTrendingUpIcon : 
                     trend === 'down' ? ArrowTrendingDownIcon : null

    const colorClasses = {
      coral: 'bg-coral-100 text-coral-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      gray: 'bg-gray-100 text-gray-600'
    }

    return (
      <GlassWidget className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {TrendIcon && (
                <TrendIcon className={cn(
                  'h-5 w-5',
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                )} />
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-glass', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </GlassWidget>
    )
  }

  const renderChart = (title: string, data: any[], type: 'line' | 'bar' | 'pie') => {
    return (
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-glass flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Gráfico: {title}</p>
            <p className="text-xs">{data.length} pontos de dados</p>
          </div>
        </div>
      </GlassCard>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'orange'
    return 'red'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Regular'
    return 'Atenção'
  }

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {metadata.title}
              </h2>
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{metadata.period}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span>{metadata.petCount} pets</span>
                  <span>•</span>
                  <span>{metadata.recordCount} registros</span>
                  <span>•</span>
                  <span>Gerado em {new Date(metadata.generatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 text-gray-600">
                <DocumentTextIcon className="h-5 w-5" />
                <span className="text-sm">Relatório Completo</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Summary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Resumo Geral</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {renderMetricCard(
            'Peso Médio',
            `${summary.averageWeight}kg`,
            'Todos os pets',
            ScaleIcon,
            'blue'
          )}
          
          {renderMetricCard(
            'Variação de Peso',
            `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange}kg`,
            'No período',
            ScaleIcon,
            summary.weightChange > 0 ? 'green' : summary.weightChange < 0 ? 'red' : 'gray',
            summary.weightChange > 0 ? 'up' : summary.weightChange < 0 ? 'down' : 'neutral'
          )}
          
          {renderMetricCard(
            'Atividades',
            summary.totalActivities,
            'Registros de exercício',
            FireIcon,
            'orange'
          )}
          
          {renderMetricCard(
            'Calorias Queimadas',
            `${summary.totalCalories} kcal`,
            'Total no período',
            FireIcon,
            'red'
          )}
          
          {renderMetricCard(
            'Score de Saúde',
            `${summary.healthScore}%`,
            getHealthScoreLabel(summary.healthScore),
            TrophyIcon,
            getHealthScoreColor(summary.healthScore)
          )}
        </div>
      </motion.div>

      {/* Pets Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Pets Incluídos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => {
            const petRecords = healthRecords.filter(r => r.petId === pet._id)
            const latestWeight = petRecords
              .filter(r => r.weight)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight

            return (
              <GlassCard key={pet._id}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-coral-400 to-teal-400 flex items-center justify-center text-white text-xl">
                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {pet.species} • {pet.breed}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Peso: {latestWeight ? `${latestWeight}kg` : 'N/A'}</span>
                      <span>Registros: {petRecords.length}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </motion.div>

      {/* Charts */}
      {(charts.weightEvolution.length > 0 || charts.activityDistribution.length > 0 || charts.caloriesTrend.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Análises Visuais</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.weightEvolution.length > 0 && renderChart(
              'Evolução do Peso',
              charts.weightEvolution,
              'line'
            )}
            
            {charts.activityDistribution.length > 0 && renderChart(
              'Distribuição de Atividades',
              charts.activityDistribution,
              'pie'
            )}
            
            {charts.caloriesTrend.length > 0 && renderChart(
              'Tendência de Calorias',
              charts.caloriesTrend,
              'bar'
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Records */}
      {healthRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Registros Recentes</h3>
          <GlassCard>
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calorias
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {healthRecords.slice(0, 10).map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.petName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.weight ? `${record.weight}kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.activity ? (
                          <div>
                            <div className="font-medium">{record.activity.type}</div>
                            <div className="text-xs">
                              {reportService.formatDuration(record.activity.duration)} • {reportService.getIntensityLabel(record.activity.intensity)}
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.calories ? `${record.calories} kcal` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {healthRecords.length > 10 && (
              <div className="px-6 py-3 bg-gray-50/30 text-center text-sm text-gray-500">
                Mostrando 10 de {healthRecords.length} registros
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* No Data State */}
      {healthRecords.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="text-center py-12">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum dado encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Não há registros de saúde para o período selecionado
            </p>
            <p className="text-sm text-gray-500">
              Adicione registros de saúde aos seus pets para gerar relatórios completos
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}