import React from 'react'
import { motion } from 'framer-motion'
import { GlassContainer } from '@/components/ui/GlassContainer'

interface ActivityTimelineProps {
  activities: Array<{
    id: string
    type: 'health' | 'food' | 'exercise' | 'medication' | 'vet' | 'grooming'
    title: string
    description?: string
    timestamp: Date
    value?: string | number
    unit?: string
    status?: 'success' | 'warning' | 'info' | 'error'
  }>
  className?: string
  showHeader?: boolean
  maxItems?: number
}

const activityConfig = {
  health: {
    icon: '❤️',
    color: 'coral',
    bgColor: 'bg-red-50/80',
    borderColor: 'border-red-200/60',
    textColor: 'text-red-800'
  },
  food: {
    icon: '🍖',
    color: 'orange',
    bgColor: 'bg-orange-50/80',
    borderColor: 'border-orange-200/60',
    textColor: 'text-orange-800'
  },
  exercise: {
    icon: '🏃',
    color: 'green',
    bgColor: 'bg-green-50/80',
    borderColor: 'border-green-200/60',
    textColor: 'text-green-800'
  },
  medication: {
    icon: '💊',
    color: 'purple',
    bgColor: 'bg-purple-50/80',
    borderColor: 'border-purple-200/60',
    textColor: 'text-purple-800'
  },
  vet: {
    icon: '🏥',
    color: 'blue',
    bgColor: 'bg-blue-50/80',
    borderColor: 'border-blue-200/60',
    textColor: 'text-blue-800'
  },
  grooming: {
    icon: '✂️',
    color: 'teal',
    bgColor: 'bg-teal-50/80',
    borderColor: 'border-teal-200/60',
    textColor: 'text-teal-800'
  }
}

const statusColors = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  error: 'bg-red-500'
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins} min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  className = '',
  showHeader = true,
  maxItems = 10
}) => {
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems)

  return (
    <GlassContainer variant="widget" className={`p-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Timeline de Atividades
          </h3>
          <p className="text-sm text-gray-600">
            Últimas {sortedActivities.length} atividades registradas
          </p>
        </div>
      )}

      {/* Timeline Container */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-transparent" />

        {/* Activities */}
        <div className="space-y-4">
          {sortedActivities.map((activity, index) => {
            const config = activityConfig[activity.type]
            
            return (
              <motion.div
                key={activity.id}
                className="relative flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    className={`w-12 h-12 ${config.bgColor} ${config.borderColor} border-2 rounded-full flex items-center justify-center glass-effect shadow-sm`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-lg">{config.icon}</span>
                  </motion.div>
                  
                  {/* Status Indicator */}
                  {activity.status && (
                    <motion.div
                      className={`absolute -top-1 -right-1 w-4 h-4 ${statusColors[activity.status]} rounded-full border-2 border-white shadow-sm`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + (index * 0.1), type: "spring" }}
                    />
                  )}
                </div>

                {/* Content Card */}
                <motion.div
                  className="flex-1 glass-widget p-4 rounded-glass border border-white/20 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${config.textColor} mb-1`}>
                        {activity.title}
                      </h4>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Value Display */}
                    {activity.value && (
                      <div className="text-right ml-4">
                        <span className="text-lg font-bold text-gray-900">
                          {activity.value}
                        </span>
                        {activity.unit && (
                          <span className="text-sm text-gray-600 ml-1">
                            {activity.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    
                    {/* Type Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                      {activity.type === 'health' && 'Saúde'}
                      {activity.type === 'food' && 'Alimentação'}
                      {activity.type === 'exercise' && 'Exercício'}
                      {activity.type === 'medication' && 'Medicação'}
                      {activity.type === 'vet' && 'Veterinário'}
                      {activity.type === 'grooming' && 'Higiene'}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {sortedActivities.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma atividade ainda
            </h4>
            <p className="text-gray-600 text-sm">
              As atividades do seu pet aparecerão aqui
            </p>
          </motion.div>
        )}
      </div>

      {/* View All Button */}
      {activities.length > maxItems && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button className="text-sm font-medium text-coral-600 hover:text-coral-700 transition-colors">
            Ver todas as atividades ({activities.length})
          </button>
        </motion.div>
      )}
    </GlassContainer>
  )
}

// Componente helper para criar atividades mock
export const createMockActivities = (): ActivityTimelineProps['activities'] => [
  {
    id: '1',
    type: 'health',
    title: 'Peso registrado',
    description: 'Monitoramento semanal de peso',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    value: '15.2',
    unit: 'kg',
    status: 'success'
  },
  {
    id: '2',
    type: 'food',
    title: 'Refeição da manhã',
    description: 'Ração premium + suplemento',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
    value: '250',
    unit: 'g',
    status: 'success'
  },
  {
    id: '3',
    type: 'exercise',
    title: 'Caminhada no parque',
    description: 'Exercício matinal',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h atrás
    value: '45',
    unit: 'min',
    status: 'success'
  },
  {
    id: '4',
    type: 'medication',
    title: 'Vitamina D',
    description: 'Suplemento diário',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    status: 'info'
  },
  {
    id: '5',
    type: 'vet',
    title: 'Consulta de rotina',
    description: 'Check-up mensal com Dr. Silva',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    status: 'success'
  },
  {
    id: '6',
    type: 'grooming',
    title: 'Banho e tosa',
    description: 'Higiene quinzenal',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
    status: 'success'
  }
]