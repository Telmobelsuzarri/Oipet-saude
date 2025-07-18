import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  ChartBarIcon,
  HeartIcon,
  ScaleIcon,
  ClockIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { WeightChart } from '@/components/charts/WeightChart'
import { ActivityChart } from '@/components/charts/ActivityChart'
import { HealthStatsWidget } from '@/components/charts/HealthStatsWidget'
import { 
  formatWeight,
  formatHeight,
  getRelativeTime,
  formatDate,
  formatTime,
  getMoodEmoji,
  getSpeciesEmoji
} from '@/lib/utils'

// Mock data - replace with real data from API
const mockPets = [
  { _id: '1', name: 'Rex', species: 'dog', avatar: null },
  { _id: '2', name: 'Mimi', species: 'cat', avatar: null },
  { _id: '3', name: 'Bob', species: 'dog', avatar: null }
]

const mockHealthRecords = [
  {
    _id: '1',
    petId: '1',
    petName: 'Rex',
    date: '2025-01-15T10:00:00Z',
    weight: 25.5,
    height: 60.0,
    activity: {
      type: 'Caminhada',
      duration: 45,
      intensity: 'medium'
    },
    mood: 'happy',
    feeding: {
      type: 'Ração Premium',
      amount: 200,
      times: 2
    },
    water: 1.5,
    sleep: 8,
    notes: 'Pet muito ativo hoje, brincou bastante no parque.',
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    _id: '2',
    petId: '2',
    petName: 'Mimi',
    date: '2025-01-15T08:30:00Z',
    weight: 4.2,
    activity: {
      type: 'Brincadeira',
      duration: 20,
      intensity: 'low'
    },
    mood: 'neutral',
    feeding: {
      type: 'Ração Gatos',
      amount: 80,
      times: 3
    },
    water: 0.3,
    sleep: 14,
    notes: 'Comportamento normal, dormiu mais que o usual.',
    createdAt: '2025-01-15T08:30:00Z'
  },
  {
    _id: '3',
    petId: '1',
    petName: 'Rex',
    date: '2025-01-14T16:20:00Z',
    weight: 25.3,
    activity: {
      type: 'Corrida',
      duration: 30,
      intensity: 'high'
    },
    mood: 'very_happy',
    feeding: {
      type: 'Ração Premium',
      amount: 200,
      times: 2
    },
    water: 1.2,
    sleep: 9,
    notes: 'Excelente performance na corrida, muito energético.',
    createdAt: '2025-01-14T16:20:00Z'
  }
]

const mockStats = {
  totalRecords: 15,
  weeklyAvgWeight: 24.8,
  weeklyActivity: 180, // minutes
  lastRecord: '2025-01-15T10:00:00Z'
}

// Mock data for charts
const mockWeightData = [
  { date: '2025-01-08', weight: 24.8 },
  { date: '2025-01-09', weight: 24.9 },
  { date: '2025-01-10', weight: 25.0 },
  { date: '2025-01-11', weight: 25.1 },
  { date: '2025-01-12', weight: 25.2 },
  { date: '2025-01-13', weight: 25.3 },
  { date: '2025-01-14', weight: 25.3 },
  { date: '2025-01-15', weight: 25.5 }
]

const mockActivityData = [
  { date: '2025-01-08', type: 'walk', duration: 30, intensity: 'medium' as const, calories: 120 },
  { date: '2025-01-09', type: 'play', duration: 45, intensity: 'high' as const, calories: 180 },
  { date: '2025-01-10', type: 'walk', duration: 25, intensity: 'low' as const, calories: 100 },
  { date: '2025-01-11', type: 'run', duration: 20, intensity: 'high' as const, calories: 160 },
  { date: '2025-01-12', type: 'walk', duration: 35, intensity: 'medium' as const, calories: 140 },
  { date: '2025-01-13', type: 'play', duration: 40, intensity: 'medium' as const, calories: 160 },
  { date: '2025-01-14', type: 'run', duration: 30, intensity: 'high' as const, calories: 200 }
]

const mockHealthData = {
  weight: 25.5,
  height: 60,
  imc: 23.2,
  lastWeightChange: 0.2,
  healthStatus: 'good' as const,
  lastCheckup: '2025-01-10'
}

interface HealthRecordCardProps {
  record: typeof mockHealthRecords[0]
  onEdit: (recordId: string) => void
  onDelete: (recordId: string) => void
}

const HealthRecordCard: React.FC<HealthRecordCardProps> = ({ record, onEdit, onDelete }) => {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'Leve'
      case 'medium': return 'Moderada'
      case 'high': return 'Intensa'
      default: return 'N/A'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard hover className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full flex items-center justify-center text-white">
              {getSpeciesEmoji(mockPets.find(p => p._id === record.petId)?.species || 'dog')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{record.petName}</h3>
              <p className="text-sm text-gray-600">
                {formatDate(record.date)} • {formatTime(record.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl`}>{getMoodEmoji(record.mood)}</span>
            <div className="text-right">
              <button
                onClick={() => onEdit(record._id)}
                className="text-sm text-gray-500 hover:text-gray-700 mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(record._id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {record.weight && (
            <div className="text-center p-3 bg-white/30 rounded-glass">
              <ScaleIcon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Peso</p>
              <p className="font-semibold text-gray-900">{formatWeight(record.weight)}</p>
            </div>
          )}
          {record.activity && (
            <div className="text-center p-3 bg-white/30 rounded-glass">
              <PlayIcon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Atividade</p>
              <p className="font-semibold text-gray-900">{record.activity.duration}min</p>
            </div>
          )}
          {record.water && (
            <div className="text-center p-3 bg-white/30 rounded-glass">
              <div className="h-5 w-5 mx-auto mb-1 text-blue-600">💧</div>
              <p className="text-xs text-gray-500">Água</p>
              <p className="font-semibold text-gray-900">{record.water}L</p>
            </div>
          )}
          {record.sleep && (
            <div className="text-center p-3 bg-white/30 rounded-glass">
              <ClockIcon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Sono</p>
              <p className="font-semibold text-gray-900">{record.sleep}h</p>
            </div>
          )}
        </div>

        {/* Activity Details */}
        {record.activity && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {record.activity.type}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(record.activity.intensity)}`}>
                {getIntensityLabel(record.activity.intensity)}
              </span>
            </div>
          </div>
        )}

        {/* Feeding Info */}
        {record.feeding && (
          <div className="mb-4 p-3 bg-amber-50/50 rounded-glass border border-amber-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">{record.feeding.type}</p>
                <p className="text-xs text-amber-700">
                  {record.feeding.amount}g • {record.feeding.times}x por dia
                </p>
              </div>
              <div className="text-amber-600">🍽️</div>
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="p-3 bg-gray-50/50 rounded-glass">
            <div className="flex items-start space-x-2">
              <DocumentTextIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{record.notes}</p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-200/50">
          <p className="text-xs text-gray-500">
            Registrado {getRelativeTime(record.createdAt)}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const HealthPage: React.FC = () => {
  const [selectedPet, setSelectedPet] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [dateFilter, setDateFilter] = React.useState<string>('7') // days
  const [showFilters, setShowFilters] = React.useState(false)

  const filteredRecords = mockHealthRecords.filter(record => {
    const matchesPet = selectedPet === 'all' || record.petId === selectedPet
    const matchesSearch = record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.activity?.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Date filter
    const recordDate = new Date(record.date)
    const now = new Date()
    const daysAgo = parseInt(dateFilter)
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    const matchesDate = recordDate >= cutoffDate

    return matchesPet && matchesSearch && matchesDate
  })

  const handleEditRecord = (recordId: string) => {
    console.log('Edit record:', recordId)
    // Open edit modal or navigate to edit page
  }

  const handleDeleteRecord = (recordId: string) => {
    console.log('Delete record:', recordId)
    // Show confirmation dialog
  }

  const selectedPetData = mockPets.find(p => p._id === selectedPet)

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
            <h1 className="text-3xl font-bold text-gray-900">Saúde dos Pets</h1>
            <p className="text-gray-600 mt-1">
              Monitore a saúde e bem-estar dos seus pets
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Novo Registro</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Registros</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalRecords}</p>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <DocumentTextIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peso Médio Semanal</p>
              <p className="text-2xl font-bold text-gray-900">{formatWeight(mockStats.weeklyAvgWeight)}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-glass">
              <ScaleIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Atividade Semanal</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.weeklyActivity}min</p>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <PlayIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Último Registro</p>
              <p className="text-2xl font-bold text-gray-900">{getRelativeTime(mockStats.lastRecord)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-glass">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeightChart 
              data={mockWeightData} 
              petName={selectedPetData?.name || 'Rex'}
              className="h-full"
            />
            <ActivityChart 
              data={mockActivityData} 
              petName={selectedPetData?.name || 'Rex'}
              className="h-full"
            />
          </div>
        </div>
        <div className="xl:col-span-1">
          <HealthStatsWidget 
            data={mockHealthData} 
            className="h-full"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassContainer variant="widget" className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Pet Selection */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Pet
              </label>
              <select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Todos os pets</option>
                {mockPets.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <MagnifyingGlassIcon className="absolute left-3 bottom-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por pet, atividade ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="14">Últimos 14 dias</option>
                <option value="30">Último mês</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último ano</option>
              </select>
            </div>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Records List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {filteredRecords.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Registros de Saúde
                {selectedPetData && (
                  <span className="text-coral-600 ml-2">- {selectedPetData.name}</span>
                )}
              </h2>
              <p className="text-sm text-gray-600">
                {filteredRecords.length} registro{filteredRecords.length !== 1 ? 's' : ''} encontrado{filteredRecords.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredRecords.map((record) => (
                  <HealthRecordCard
                    key={record._id}
                    record={record}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteRecord}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <GlassCard className="text-center py-12">
            <HeartSolidIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedPet !== 'all' || dateFilter !== '7'
                ? 'Nenhum registro encontrado' 
                : 'Nenhum registro de saúde'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedPet !== 'all' || dateFilter !== '7'
                ? 'Tente ajustar os filtros para encontrar registros'
                : 'Comece registrando as informações de saúde dos seus pets'
              }
            </p>
            {(!searchTerm && selectedPet === 'all' && dateFilter === '7') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
              >
                Criar Primeiro Registro
              </motion.button>
            )}
          </GlassCard>
        )}
      </motion.div>

      {/* Quick Add Button - Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-glass-lg hover:bg-coral-600 focus-ring"
        >
          <PlusIcon className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  )
}