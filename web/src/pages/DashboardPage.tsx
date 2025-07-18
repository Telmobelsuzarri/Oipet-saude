import React from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon,
  PlusIcon,
  ChartBarIcon,
  BellIcon,
  CalendarIcon,
  CameraIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolidIcon,
  PlusIcon as PlusSolidIcon
} from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { useAuthStore } from '@/stores/authStore'
import { getRelativeTime, formatWeight, getSpeciesEmoji } from '@/lib/utils'

// Mock data - replace with real data from API
const mockPets = [
  {
    _id: '1',
    name: 'Rex',
    species: 'dog',
    weight: 25.5,
    avatar: null,
    lastWeightDate: '2025-01-14T10:00:00Z'
  },
  {
    _id: '2', 
    name: 'Mimi',
    species: 'cat',
    weight: 4.2,
    avatar: null,
    lastWeightDate: '2025-01-13T15:30:00Z'
  }
]

const mockStats = {
  totalPets: 2,
  healthRecords: 15,
  weeklyActivity: '+12%',
  notifications: 3
}

const mockRecentActivity = [
  {
    id: '1',
    type: 'weight',
    petName: 'Rex',
    description: 'Peso registrado: 25.5kg',
    time: '2025-01-14T10:00:00Z',
    icon: ChartBarIcon
  },
  {
    id: '2',
    type: 'health',
    petName: 'Mimi',
    description: 'Registro de saúde adicionado',
    time: '2025-01-13T15:30:00Z',
    icon: HeartIcon
  },
  {
    id: '3',
    type: 'photo',
    petName: 'Rex',
    description: 'Nova foto adicionada',
    time: '2025-01-12T12:15:00Z',
    icon: CameraIcon
  }
]

const mockNotifications = [
  {
    id: '1',
    title: 'Hora da medicação do Rex',
    description: 'Lembrete para dar o medicamento',
    time: '2025-01-15T09:00:00Z',
    type: 'reminder'
  },
  {
    id: '2',
    title: 'Check-up de Mimi',
    description: 'Consulta veterinária agendada',
    time: '2025-01-16T14:00:00Z',
    type: 'appointment'
  }
]

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Vamos cuidar dos seus pets hoje
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
          >
            <PlusSolidIcon className="h-5 w-5" />
            <span>Adicionar Registro</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pets</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalPets}</p>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <HeartSolidIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros de Saúde</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.healthRecords}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-glass">
              <ChartBarIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Atividade Semanal</p>
              <p className="text-2xl font-bold text-green-600">{mockStats.weeklyActivity}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <TrophyIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Notificações</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.notifications}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-glass">
              <BellIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Pets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Meus Pets</h2>
              <button className="text-coral-600 hover:text-coral-700 font-medium">
                Ver todos
              </button>
            </div>

            <div className="space-y-4">
              {mockPets.map((pet) => (
                <motion.div
                  key={pet._id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/30 rounded-glass border border-white/20 hover:bg-white/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xl">
                      {getSpeciesEmoji(pet.species)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-600">
                        Último peso: {formatWeight(pet.weight)} • {getRelativeTime(pet.lastWeightDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600 font-medium">Saudável</p>
                      <p className="text-xs text-gray-500">IMC Normal</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {mockPets.length === 0 && (
                <div className="text-center py-12">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum pet cadastrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece adicionando seu primeiro pet!
                  </p>
                  <button className="bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-2 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200">
                    Adicionar Pet
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-glass">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.petName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Upcoming Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Próximos Lembretes</h3>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-amber-50 rounded-glass border border-amber-200">
                    <h4 className="text-sm font-medium text-amber-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-amber-700">
                      {notification.description}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {getRelativeTime(notification.time)}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 bg-white/30 rounded-glass border border-white/20 hover:bg-white/40 transition-all duration-200"
            >
              <div className="p-3 bg-coral-100 rounded-glass mb-3">
                <PlusIcon className="h-6 w-6 text-coral-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Adicionar Pet</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 bg-white/30 rounded-glass border border-white/20 hover:bg-white/40 transition-all duration-200"
            >
              <div className="p-3 bg-teal-100 rounded-glass mb-3">
                <HeartIcon className="h-6 w-6 text-teal-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Registro Saúde</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 bg-white/30 rounded-glass border border-white/20 hover:bg-white/40 transition-all duration-200"
            >
              <div className="p-3 bg-blue-100 rounded-glass mb-3">
                <CameraIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Escanear Comida</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 bg-white/30 rounded-glass border border-white/20 hover:bg-white/40 transition-all duration-200"
            >
              <div className="p-3 bg-purple-100 rounded-glass mb-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Ver Relatórios</span>
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}