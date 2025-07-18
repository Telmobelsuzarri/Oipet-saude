import React from 'react'
import { motion } from 'framer-motion'
import { ScaleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface WeightData {
  date: string
  weight: number
}

interface WeightChartProps {
  data: WeightData[]
  petName: string
  className?: string
}

export const WeightChart: React.FC<WeightChartProps> = ({ data, petName, className = '' }) => {
  if (data.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <ScaleIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Nenhum dado de peso registrado para {petName}</p>
      </div>
    )
  }

  // Calculate chart dimensions and scaling
  const chartHeight = 200
  const chartWidth = 400
  const padding = 20

  // Find min and max values
  const weights = data.map(d => d.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const weightRange = maxWeight - minWeight || 1

  // Calculate trend
  const firstWeight = weights[0]
  const lastWeight = weights[weights.length - 1]
  const trend = lastWeight - firstWeight
  const trendPercentage = firstWeight > 0 ? ((trend / firstWeight) * 100).toFixed(1) : '0.0'

  // Generate SVG path
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((point.weight - minWeight) / weightRange) * (chartHeight - 2 * padding)
    return { x, y, weight: point.weight, date: point.date }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  // Generate area fill path
  const areaPath = [
    `M ${points[0].x} ${chartHeight - padding}`,
    ...points.map(point => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${chartHeight - padding}`,
    'Z'
  ].join(' ')

  return (
    <div className={`bg-white/30 rounded-glass border border-white/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ScaleIcon className="h-5 w-5 text-coral-600" />
          <h3 className="text-lg font-semibold text-gray-900">Evolução do Peso</h3>
        </div>
        <div className="flex items-center space-x-2">
          {trend > 0 ? (
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
          ) : trend < 0 ? (
            <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
          ) : (
            <div className="h-5 w-5 bg-gray-400 rounded-full" />
          )}
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trendPercentage}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
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
              opacity="0.5"
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Main line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="#e85a5a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#e85a5a"
              stroke="#ffffff"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 1 }}
              className="cursor-pointer hover:r-6 transition-all"
            >
              <title>{`${point.weight}kg - ${new Date(point.date).toLocaleDateString()}`}</title>
            </motion.circle>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e85a5a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e85a5a" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200/50">
        <div className="text-center">
          <p className="text-xs text-gray-500">Atual</p>
          <p className="text-lg font-semibold text-gray-900">{lastWeight}kg</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Mínimo</p>
          <p className="text-lg font-semibold text-gray-900">{minWeight}kg</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Máximo</p>
          <p className="text-lg font-semibold text-gray-900">{maxWeight}kg</p>
        </div>
      </div>
    </div>
  )
}