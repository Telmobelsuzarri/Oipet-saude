import React from 'react'
import { motion } from 'framer-motion'
import { GlassContainer } from '@/components/ui/GlassContainer'

interface WeeklyBarChartProps {
  data: Array<{
    day: string
    value: number
    label?: string
  }>
  maxValue?: number
  color?: 'coral' | 'teal' | 'blue' | 'green' | 'purple' | 'orange'
  title?: string
  subtitle?: string
  height?: number
  showValues?: boolean
  animate?: boolean
  className?: string
}

const colorMap = {
  coral: {
    primary: '#E85A5A',
    secondary: 'rgba(232, 90, 90, 0.3)',
    gradient: ['#E85A5A', '#FF6B6B']
  },
  teal: {
    primary: '#5AA3A3',
    secondary: 'rgba(90, 163, 163, 0.3)',
    gradient: ['#5AA3A3', '#4ECDC4']
  },
  blue: {
    primary: '#3B82F6',
    secondary: 'rgba(59, 130, 246, 0.3)',
    gradient: ['#3B82F6', '#1E40AF']
  },
  green: {
    primary: '#10B981',
    secondary: 'rgba(16, 185, 129, 0.3)',
    gradient: ['#10B981', '#059669']
  },
  purple: {
    primary: '#8B5CF6',
    secondary: 'rgba(139, 92, 246, 0.3)',
    gradient: ['#8B5CF6', '#7C3AED']
  },
  orange: {
    primary: '#F59E0B',
    secondary: 'rgba(245, 158, 11, 0.3)',
    gradient: ['#F59E0B', '#D97706']
  }
}

const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  maxValue = Math.max(...data.map(d => d.value)) || 100,
  color = 'coral',
  title,
  subtitle,
  height = 200,
  showValues = true,
  animate = true,
  className = ''
}) => {
  const colors = colorMap[color]

  return (
    <GlassContainer variant="widget" className={`p-6 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div className="relative" style={{ height }}>
        <div className="flex items-end justify-between h-full gap-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40) // 40px for labels
            const percentage = (item.value / maxValue) * 100

            return (
              <div key={item.day} className="flex flex-col items-center flex-1">
                {/* Value Label */}
                {showValues && item.value > 0 && (
                  <motion.div
                    className="text-xs font-medium text-gray-700 mb-1 text-center"
                    initial={animate ? { opacity: 0, y: -10 } : undefined}
                    animate={animate ? { opacity: 1, y: 0 } : undefined}
                    transition={animate ? {
                      duration: 0.5,
                      delay: 0.5 + (index * 0.1)
                    } : undefined}
                  >
                    {item.label || item.value}
                  </motion.div>
                )}

                {/* Bar */}
                <div className="relative flex-1 w-full max-w-[40px] flex flex-col justify-end">
                  {/* Background bar */}
                  <div 
                    className="w-full bg-gray-100 rounded-lg relative overflow-hidden"
                    style={{ height: height - 40 }}
                  >
                    {/* Animated fill */}
                    <motion.div
                      className="absolute bottom-0 left-0 w-full rounded-lg shadow-sm"
                      style={{
                        background: `linear-gradient(to top, ${colors.gradient[0]}, ${colors.gradient[1]})`,
                      }}
                      initial={animate ? { height: 0 } : { height: barHeight }}
                      animate={animate ? { height: barHeight } : undefined}
                      transition={animate ? {
                        duration: 0.8,
                        delay: 0.2 + (index * 0.1),
                        ease: "easeOut"
                      } : undefined}
                    />
                    
                    {/* Glass overlay effect */}
                    <div 
                      className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg"
                      style={{ 
                        background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
                      }}
                    />

                    {/* Highlight effect */}
                    {barHeight > 20 && (
                      <motion.div
                        className="absolute top-2 left-1 right-1 h-3 bg-white/30 rounded-sm"
                        initial={animate ? { opacity: 0 } : undefined}
                        animate={animate ? { opacity: 1 } : undefined}
                        transition={animate ? {
                          duration: 0.3,
                          delay: 1.0 + (index * 0.1)
                        } : undefined}
                      />
                    )}
                  </div>
                </div>

                {/* Day Label */}
                <motion.div
                  className="text-xs font-medium text-gray-600 mt-2 text-center"
                  initial={animate ? { opacity: 0 } : undefined}
                  animate={animate ? { opacity: 1 } : undefined}
                  transition={animate ? {
                    duration: 0.3,
                    delay: 0.1 + (index * 0.05)
                  } : undefined}
                >
                  {weekDays[index] || item.day}
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Grid lines (opcional) */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((percentage) => (
            <div
              key={percentage}
              className="absolute left-0 right-0 border-t border-gray-200/50"
              style={{ bottom: `${percentage}%` }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      {maxValue && (
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>0</span>
          <span className="text-gray-700 font-medium">
            Máx: {maxValue}
          </span>
        </div>
      )}
    </GlassContainer>
  )
}

// Componente helper para múltiplos datasets
interface MultiWeeklyBarChartProps {
  datasets: Array<{
    data: WeeklyBarChartProps['data']
    color: WeeklyBarChartProps['color']
    label: string
  }>
  maxValue?: number
  title?: string
  subtitle?: string
  height?: number
  className?: string
}

export const MultiWeeklyBarChart: React.FC<MultiWeeklyBarChartProps> = ({
  datasets,
  maxValue = Math.max(...datasets.flatMap(d => d.data.map(item => item.value))) || 100,
  title,
  subtitle,
  height = 200,
  className = ''
}) => {
  return (
    <GlassContainer variant="widget" className={`p-6 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mb-3">
              {subtitle}
            </p>
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {datasets.map((dataset, index) => {
              const colors = colorMap[dataset.color]
              return (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ background: colors.primary }}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {dataset.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="relative" style={{ height }}>
        <div className="flex items-end justify-between h-full gap-2">
          {weekDays.map((day, dayIndex) => (
            <div key={day} className="flex flex-col items-center flex-1">
              {/* Grouped Bars */}
              <div className="relative flex-1 w-full flex items-end justify-center gap-1">
                {datasets.map((dataset, datasetIndex) => {
                  const item = dataset.data[dayIndex]
                  if (!item) return null

                  const barHeight = (item.value / maxValue) * (height - 40)
                  const colors = colorMap[dataset.color]

                  return (
                    <div key={datasetIndex} className="flex-1 max-w-[15px]">
                      <div 
                        className="w-full bg-gray-100 rounded-sm relative overflow-hidden"
                        style={{ height: height - 40 }}
                      >
                        <motion.div
                          className="absolute bottom-0 left-0 w-full rounded-sm"
                          style={{
                            background: `linear-gradient(to top, ${colors.gradient[0]}, ${colors.gradient[1]})`,
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: barHeight }}
                          transition={{
                            duration: 0.8,
                            delay: 0.2 + (dayIndex * 0.1) + (datasetIndex * 0.05),
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Day Label */}
              <div className="text-xs font-medium text-gray-600 mt-2">
                {day}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassContainer>
  )
}