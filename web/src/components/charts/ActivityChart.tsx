import React from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

interface ActivityData {
  date: string
  type: string
  duration: number
  intensity: 'low' | 'medium' | 'high'
  calories?: number
}

interface ActivityChartProps {
  data: ActivityData[]
  petName: string
  className?: string
}

const intensityColors = {
  low: { bg: 'bg-green-100', text: 'text-green-600', fill: '#10b981' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-600', fill: '#f59e0b' },
  high: { bg: 'bg-red-100', text: 'text-red-600', fill: '#ef4444' }
}

const activityTypeLabels: { [key: string]: string } = {
  walk: 'Caminhada',
  run: 'Corrida',
  play: 'Brincadeira',
  swim: 'Natação',
  training: 'Treinamento',
  other: 'Outro'
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, petName, className = '' }) => {
  if (data.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <PlayIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Nenhuma atividade registrada para {petName}</p>
      </div>
    )
  }

  // Calculate stats
  const totalDuration = data.reduce((sum, activity) => sum + activity.duration, 0)
  const totalCalories = data.reduce((sum, activity) => sum + (activity.calories || 0), 0)
  const mostFrequentType = data.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const favoriteActivity = Object.entries(mostFrequentType).sort(([,a], [,b]) => b - a)[0]

  // Prepare chart data (last 7 days)
  const chartData = data.slice(-7).map((activity, index) => ({
    ...activity,
    x: index,
    y: activity.duration,
    color: intensityColors[activity.intensity].fill
  }))

  const maxDuration = Math.max(...chartData.map(d => d.y), 60) // minimum 60 minutes for scale
  const chartHeight = 150
  const chartWidth = 300
  const barWidth = 30
  const padding = 20

  return (
    <div className={`bg-white/30 rounded-glass border border-white/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PlayIcon className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
        </div>
        <div className="text-xs text-gray-500">
          Últimos 7 registros
        </div>
      </div>

      {/* Chart */}
      <div className="relative mb-4">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => (
            <line
              key={index}
              x1={padding}
              y1={padding + fraction * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={padding + fraction * (chartHeight - 2 * padding)}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Bars */}
          {chartData.map((activity, index) => {
            const barHeight = (activity.y / maxDuration) * (chartHeight - 2 * padding)
            const x = padding + index * (barWidth + 10)
            const y = chartHeight - padding - barHeight

            return (
              <motion.rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={activity.color}
                rx="4"
                initial={{ height: 0, y: chartHeight - padding }}
                animate={{ height: barHeight, y }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="cursor-pointer"
              >
                <title>{`${activityTypeLabels[activity.type]} - ${activity.duration}min`}</title>
              </motion.rect>
            )
          })}

          {/* Y-axis labels */}
          {[0, 0.5, 1].map((fraction, index) => (
            <text
              key={index}
              x={padding - 5}
              y={padding + fraction * (chartHeight - 2 * padding) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {Math.round((1 - fraction) * maxDuration)}min
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mb-4">
        {Object.entries(intensityColors).map(([intensity, colors]) => (
          <div key={intensity} className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${colors.bg} border-2`} style={{ borderColor: colors.fill }} />
            <span className="text-xs text-gray-600 capitalize">{intensity}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/50">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">{totalDuration}min</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FireIcon className="h-4 w-4 text-gray-500" />
            <p className="text-xs text-gray-500">Calorias</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">{totalCalories}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <PlayIcon className="h-4 w-4 text-gray-500" />
            <p className="text-xs text-gray-500">Favorita</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {favoriteActivity ? activityTypeLabels[favoriteActivity[0]] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}