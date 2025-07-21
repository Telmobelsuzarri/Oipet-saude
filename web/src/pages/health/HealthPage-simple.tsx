import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

// Temporary GlassWidget since we're using the simple version
const GlassWidget: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <GlassContainer className={className}>{children}</GlassContainer>
)

export const HealthPage: React.FC = () => {
  const { user, logout } = useAuthStore()

  // Mock data para demonstração
  const healthMetrics = [
    { 
      id: 1, 
      icon: '💧', 
      title: 'Água', 
      value: '350ml', 
      target: '500ml', 
      color: 'from-blue-400 to-blue-600',
      percentage: 70 
    },
    { 
      id: 2, 
      icon: '🔥', 
      title: 'Calorias', 
      value: '450', 
      target: '600 kcal', 
      color: 'from-orange-400 to-red-600',
      percentage: 75 
    },
    { 
      id: 3, 
      icon: '😴', 
      title: 'Sono', 
      value: '12h', 
      target: '14h', 
      color: 'from-purple-400 to-purple-600',
      percentage: 85 
    },
    { 
      id: 4, 
      icon: '🏃', 
      title: 'Passos', 
      value: '8.5k', 
      target: '10k', 
      color: 'from-green-400 to-green-600',
      percentage: 85 
    }
  ]

  const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const activityData = [65, 80, 70, 90, 85, 95, 88]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-lg border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <OiPetLogo size="md" showText={true} />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Saúde dos Pets</h1>
                <p className="text-sm text-gray-600">Monitore a saúde do seu pet</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/app/dashboard"
                className="text-coral-600 hover:text-coral-700 font-medium text-sm"
              >
                ← Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.[0] || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Usuário'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Pet Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐕</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rex</h2>
              <p className="text-sm text-gray-500">Golden Retriever • 3 anos</p>
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric) => (
            <GlassWidget key={metric.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{metric.icon}</div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Meta</span>
                  <span>{metric.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
            </GlassWidget>
          ))}
        </div>

        {/* Progress Circle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <GlassContainer className="p-8 col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Progresso Diário
            </h3>
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - 0.75)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">75%</span>
                <span className="text-sm text-gray-500">Completo</span>
              </div>
            </div>
          </GlassContainer>

          {/* Weekly Activity */}
          <GlassContainer className="p-8 col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Atividade Semanal
            </h3>
            <div className="flex items-end justify-between h-32 mb-2">
              {activityData.map((value, index) => (
                <div key={index} className="flex-1 mx-1">
                  <div 
                    className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                    style={{ height: `${value}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {weekDays.map((day, index) => (
                <div key={index} className="flex-1 text-center">
                  <span className="text-xs text-gray-500">{day}</span>
                </div>
              ))}
            </div>
          </GlassContainer>
        </div>

        {/* Daily Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassContainer className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚶</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Caminhada Diária</h3>
                  <p className="text-sm text-gray-500">30 min restantes</p>
                </div>
              </div>
              <button className="text-green-600 hover:text-green-700">
                ▶️
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: '60%' }} />
            </div>
          </GlassContainer>

          <GlassContainer className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎾</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tempo de Brincadeira</h3>
                  <p className="text-sm text-gray-500">15 min restantes</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700">
                ▶️
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" style={{ width: '70%' }} />
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  )
}