import React from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  ScaleIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface HealthData {
  weight: number
  height: number
  imc: number
  lastWeightChange: number
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor'
  lastCheckup: string
}

interface HealthStatsWidgetProps {
  data: HealthData
  petName: string
  className?: string
}

const healthStatusConfig = {
  excellent: { color: 'text-green-600', bg: 'bg-green-100', label: 'Excelente' },
  good: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Bom' },
  fair: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Regular' },
  poor: { color: 'text-red-600', bg: 'bg-red-100', label: 'Ruim' }
}

const getIMCStatus = (imc: number) => {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600' }
  if (imc < 25) return { label: 'Peso ideal', color: 'text-green-600' }
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' }
  return { label: 'Obesidade', color: 'text-red-600' }
}

export const HealthStatsWidget: React.FC<HealthStatsWidgetProps> = ({ data, className = '' }) => {
  const imcStatus = getIMCStatus(data.imc)
  const healthConfig = healthStatusConfig[data.healthStatus]

  // Calculate IMC progress (0-40 scale)
  const imcProgress = Math.min((data.imc / 40) * 100, 100)

  return (
    <div className={`bg-white/30 rounded-glass border border-white/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <HeartSolidIcon className="h-5 w-5 text-coral-600" />
          <h3 className="text-lg font-semibold text-gray-900">Estado de Saúde</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${healthConfig.bg} ${healthConfig.color}`}>
          {healthConfig.label}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Weight */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-coral-100 rounded-glass">
            <ScaleIcon className="h-6 w-6 text-coral-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Peso</p>
            <div className="flex items-center space-x-2">
              <p className="text-xl font-bold text-gray-900">{data.weight}kg</p>
              {data.lastWeightChange !== 0 && (
                <div className="flex items-center space-x-1">
                  {data.lastWeightChange > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    data.lastWeightChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.lastWeightChange > 0 ? '+' : ''}{data.lastWeightChange}kg
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Height */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-100 rounded-glass">
            <ChartBarIcon className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Altura</p>
            <p className="text-xl font-bold text-gray-900">{data.height}cm</p>
          </div>
        </div>
      </div>

      {/* IMC Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">IMC</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">{data.imc.toFixed(1)}</span>
            <span className={`ml-2 text-xs font-medium ${imcStatus.color}`}>
              {imcStatus.label}
            </span>
          </div>
        </div>

        {/* IMC Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${imcProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center">
            {/* IMC ranges indicators */}
            <div className="absolute left-[46%] w-0.5 h-full bg-white/50" />
            <div className="absolute left-[62%] w-0.5 h-full bg-white/50" />
            <div className="absolute left-[75%] w-0.5 h-full bg-white/50" />
          </div>
        </div>

        {/* IMC Scale Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Baixo</span>
          <span>Ideal</span>
          <span>Sobrepeso</span>
          <span>Obeso</span>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Health Score */}
        <div className="text-center p-4 bg-white/20 rounded-glass">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-300"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                className={healthConfig.color}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - 0.85) }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">85%</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">Score de Saúde</p>
        </div>

        {/* Last Checkup */}
        <div className="text-center p-4 bg-white/20 rounded-glass">
          <HeartIcon className="h-8 w-8 text-coral-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">
            {new Date(data.lastCheckup).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-600">Último Check-up</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-glass p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Recomendações</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {data.imc > 25 && (
            <li>• Considere reduzir a quantidade de ração diária</li>
          )}
          {data.imc < 18.5 && (
            <li>• Aumente a frequência das refeições</li>
          )}
          {data.lastWeightChange > 2 && (
            <li>• Monitore ganho de peso recente</li>
          )}
          <li>• Mantenha exercícios regulares</li>
          <li>• Agende consulta veterinária de rotina</li>
        </ul>
      </div>
    </div>
  )
}