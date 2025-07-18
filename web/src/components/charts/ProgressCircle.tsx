import React from 'react'
import { motion } from 'framer-motion'

interface ProgressCircleProps {
  value: number // 0-100
  maxValue?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: 'coral' | 'teal' | 'blue' | 'green' | 'purple' | 'orange'
  showPercentage?: boolean
  animate?: boolean
  glowEffect?: boolean
  className?: string
}

const sizeMap = {
  sm: { width: 80, height: 80, fontSize: '12px', sublabelFontSize: '10px' },
  md: { width: 120, height: 120, fontSize: '16px', sublabelFontSize: '12px' },
  lg: { width: 160, height: 160, fontSize: '20px', sublabelFontSize: '14px' },
  xl: { width: 200, height: 200, fontSize: '24px', sublabelFontSize: '16px' }
}

const colorMap = {
  coral: {
    primary: '#E85A5A',
    secondary: 'rgba(232, 90, 90, 0.2)',
    gradient: ['#E85A5A', '#FF6B6B'],
    glow: 'rgba(232, 90, 90, 0.4)'
  },
  teal: {
    primary: '#5AA3A3',
    secondary: 'rgba(90, 163, 163, 0.2)',
    gradient: ['#5AA3A3', '#4ECDC4'],
    glow: 'rgba(90, 163, 163, 0.4)'
  },
  blue: {
    primary: '#3B82F6',
    secondary: 'rgba(59, 130, 246, 0.2)',
    gradient: ['#3B82F6', '#1E40AF'],
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  green: {
    primary: '#10B981',
    secondary: 'rgba(16, 185, 129, 0.2)',
    gradient: ['#10B981', '#059669'],
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: 'rgba(139, 92, 246, 0.2)',
    gradient: ['#8B5CF6', '#7C3AED'],
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  orange: {
    primary: '#F59E0B',
    secondary: 'rgba(245, 158, 11, 0.2)',
    gradient: ['#F59E0B', '#D97706'],
    glow: 'rgba(245, 158, 11, 0.4)'
  }
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  maxValue = 100,
  size = 'md',
  strokeWidth = 8,
  label,
  sublabel,
  color = 'coral',
  showPercentage = true,
  animate = true,
  glowEffect = true,
  className = ''
}) => {
  const { width, height, fontSize, sublabelFontSize } = sizeMap[size]
  const colors = colorMap[color]
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100)
  
  // Calculate SVG properties
  const center = width / 2
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const gradientId = `progress-gradient-${color}-${Math.random().toString(36).substr(2, 9)}`
  const filterId = `glow-filter-${color}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* SVG Circle */}
      <div className="relative">
        <svg width={width} height={height} className="transform -rotate-90">
          {/* Definir gradiente */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="100%" stopColor={colors.gradient[1]} />
            </linearGradient>
            
            {/* Filtro de brilho/glow */}
            {glowEffect && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feMorphology operator="dilate" radius="2"/>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.secondary}
            strokeWidth={strokeWidth}
            className="opacity-30"
          />

          {/* Progress Circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animate ? strokeDasharray : strokeDashoffset}
            filter={glowEffect ? `url(#${filterId})` : undefined}
            className="drop-shadow-sm"
            initial={animate ? { strokeDashoffset: strokeDasharray } : undefined}
            animate={animate ? { strokeDashoffset } : undefined}
            transition={animate ? {
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2
            } : undefined}
          />
        </svg>

        {/* Center Content */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ width, height }}
        >
          {showPercentage && (
            <motion.div
              className="font-bold text-gray-900"
              style={{ fontSize }}
              initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={animate ? { duration: 0.5, delay: 0.8 } : undefined}
            >
              {Math.round(percentage)}%
            </motion.div>
          )}
          
          {label && (
            <motion.div
              className="font-medium text-gray-700"
              style={{ fontSize: sublabelFontSize }}
              initial={animate ? { opacity: 0 } : undefined}
              animate={animate ? { opacity: 1 } : undefined}
              transition={animate ? { duration: 0.5, delay: 1.0 } : undefined}
            >
              {label}
            </motion.div>
          )}
        </div>
      </div>

      {/* Sublabel */}
      {sublabel && (
        <motion.div
          className="mt-2 text-center text-gray-600"
          style={{ fontSize: sublabelFontSize }}
          initial={animate ? { opacity: 0, y: 10 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={animate ? { duration: 0.5, delay: 1.2 } : undefined}
        >
          {sublabel}
        </motion.div>
      )}
    </div>
  )
}

// Componente helper para múltiplos círculos (estilo Apple Watch)
interface MultiProgressCircleProps {
  circles: Array<{
    value: number
    maxValue?: number
    color: ProgressCircleProps['color']
    label?: string
  }>
  size?: ProgressCircleProps['size']
  className?: string
}

export const MultiProgressCircle: React.FC<MultiProgressCircleProps> = ({
  circles,
  size = 'lg',
  className = ''
}) => {
  const { width, height } = sizeMap[size]
  const strokeWidth = 8
  const spacing = 12

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="transform -rotate-90">
        <defs>
          {circles.map((circle, index) => {
            const colors = colorMap[circle.color]
            const gradientId = `multi-gradient-${circle.color}-${index}`
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.gradient[0]} />
                <stop offset="100%" stopColor={colors.gradient[1]} />
              </linearGradient>
            )
          })}
        </defs>

        {circles.map((circle, index) => {
          const center = width / 2
          const radius = (width - strokeWidth) / 2 - (index * spacing)
          const circumference = 2 * Math.PI * radius
          const percentage = Math.min(Math.max((circle.value / (circle.maxValue || 100)) * 100, 0), 100)
          const strokeDashoffset = circumference - (percentage / 100) * circumference
          const colors = colorMap[circle.color]

          return (
            <g key={index}>
              {/* Background */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors.secondary}
                strokeWidth={strokeWidth}
                className="opacity-30"
              />
              
              {/* Progress */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={`url(#multi-gradient-${circle.color}-${index})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: 0.2 + (index * 0.2)
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-lg font-bold text-gray-900">
          {circles.length} Metas
        </div>
        <div className="text-sm text-gray-600">
          Em progresso
        </div>
      </div>
    </div>
  )
}