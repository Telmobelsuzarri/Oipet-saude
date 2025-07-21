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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { reportServiceReal as reportService, type ReportData } from '@/services/reportServiceReal'
import { cn } from '@/lib/utils'

interface ReportPreviewProps {
  data: ReportData
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  
  // Simplificar adaptador - trabalhar diretamente com os dados do reportServiceReal
  const { metadata, pets = [], summary = {} } = data || {}
  
  // Verificar se temos dados válidos
  if (!data) {
    return (
      <div className="text-center py-12">
        <p>Nenhum dado para exibir</p>
      </div>
    )
  }

  // Extrair registros de saúde dos pets de forma segura
  const healthRecords = pets.flatMap(pet => 
    (pet.records || []).map(record => ({
      _id: record.id || `${pet._id}-${record.date}`,
      petId: pet._id,
      petName: pet.name,
      date: record.date,
      weight: record.weight,
      height: undefined,
      activity: record.activity ? {
        type: record.activity.intensity || 'Exercício',
        duration: record.activity.exerciseMinutes || 0,
        intensity: record.activity.intensity || 'moderate',
        calories: undefined
      } : undefined,
      calories: undefined,
      notes: record.notes
    }))
  )

  // Criar charts baseados nos dados reais
  const weightEvolution = pets.flatMap(pet => {
    console.log('Pet:', pet.name, 'Records:', pet.records?.length || 0)
    return (pet.records || [])
      .filter(r => {
        console.log('Record date:', r.date, 'weight:', r.weight)
        return r.weight
      })
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        weight: Number(r.weight!.toFixed(1)),
        petName: pet.name
      }))
  })
  
  console.log('weightEvolution final:', weightEvolution)

  // Agrupar atividades por intensidade
  const activityGroups = healthRecords.reduce((acc, record) => {
    if (record.activity) {
      const intensity = record.activity.intensity || 'moderate'
      const intensityLabel = intensity === 'low' ? 'Baixa' : 
                            intensity === 'high' ? 'Alta' : 'Moderada'
      acc[intensityLabel] = (acc[intensityLabel] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const activityDistribution = Object.entries(activityGroups).map(([type, count]) => ({
    type,
    count,
    name: type
  }))

  const charts = {
    weightEvolution,
    activityDistribution,
    caloriesTrend: []
  }

  // Adapter final de summary
  const adaptedSummary = {
    averageWeight: summary.averageWeight || 0,
    weightChange: 0,
    totalActivities: summary.totalActivity || 0,
    totalCalories: 0,
    healthScore: summary.healthScore || 0
  }

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
    console.log(`Renderizando gráfico ${title} com dados:`, data, 'tipo:', type)
    
    const colors = ['#E85A5A', '#5AA3A3', '#A35AA3', '#5AE85A', '#E8E85A']
    
    const renderLineChart = () => (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke={colors[0]} 
            strokeWidth={2}
            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
    
    const renderBarChart = () => (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="type" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Bar dataKey="count" fill={colors[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
    
    const renderPieChart = () => (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )

    return (
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="h-64">
          {data.length === 0 ? (
            <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-glass flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Nenhum dado disponível</p>
                <p className="text-xs">Adicione registros para ver gráficos</p>
              </div>
            </div>
          ) : (
            <>
              {type === 'line' && renderLineChart()}
              {type === 'bar' && renderBarChart()}
              {type === 'pie' && renderPieChart()}
            </>
          )}
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
                  <span>{metadata?.petCount || pets.length} pets</span>
                  <span>•</span>
                  <span>{metadata?.recordCount || healthRecords.length} registros</span>
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
            `${adaptedSummary.averageWeight.toFixed(1)}kg`,
            'Todos os pets',
            ScaleIcon,
            'blue'
          )}
          
          {renderMetricCard(
            'Variação de Peso',
            `${adaptedSummary.weightChange > 0 ? '+' : ''}${adaptedSummary.weightChange}kg`,
            'No período',
            ScaleIcon,
            adaptedSummary.weightChange > 0 ? 'green' : adaptedSummary.weightChange < 0 ? 'red' : 'gray',
            adaptedSummary.weightChange > 0 ? 'up' : adaptedSummary.weightChange < 0 ? 'down' : 'neutral'
          )}
          
          {renderMetricCard(
            'Atividades',
            adaptedSummary.totalActivities,
            'Registros de exercício',
            FireIcon,
            'orange'
          )}
          
          {renderMetricCard(
            'Calorias Queimadas',
            `${adaptedSummary.totalCalories} kcal`,
            'Total no período',
            FireIcon,
            'red'
          )}
          
          {renderMetricCard(
            'Score de Saúde',
            `${adaptedSummary.healthScore}%`,
            getHealthScoreLabel(adaptedSummary.healthScore),
            TrophyIcon,
            getHealthScoreColor(adaptedSummary.healthScore)
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
                              {record.activity.duration}min • {record.activity.intensity}
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