import React from 'react'
import { motion } from 'framer-motion'
import { 
  CameraIcon, 
  SparklesIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { FoodScannerModal } from '@/components/modals/FoodScannerModal'
import { useNotifications } from '@/hooks/useNotifications'
import { RecognitionResult } from '@/services/foodRecognitionService'
import { getRelativeTime } from '@/lib/utils'

interface FoodScanHistory {
  id: string
  foodName: string
  petName: string
  petId: string
  imageUrl: string
  confidence: number
  portionSize: number
  safetyLevel: 'safe' | 'caution' | 'toxic' | 'dangerous'
  scannedAt: Date
  calories: number
}

// Mock scan history
const mockScanHistory: FoodScanHistory[] = [
  {
    id: '1',
    foodName: 'Peito de Frango',
    petName: 'Rex',
    petId: '1',
    imageUrl: '/api/placeholder/150/150',
    confidence: 0.95,
    portionSize: 150,
    safetyLevel: 'safe',
    scannedAt: new Date('2025-01-15T10:30:00Z'),
    calories: 248
  },
  {
    id: '2',
    foodName: 'Chocolate',
    petName: 'Mimi',
    petId: '2',
    imageUrl: '/api/placeholder/150/150',
    confidence: 0.88,
    portionSize: 50,
    safetyLevel: 'dangerous',
    scannedAt: new Date('2025-01-14T16:20:00Z'),
    calories: 273
  },
  {
    id: '3',
    foodName: 'Cenoura',
    petName: 'Rex',
    petId: '1',
    imageUrl: '/api/placeholder/150/150',
    confidence: 0.92,
    portionSize: 80,
    safetyLevel: 'safe',
    scannedAt: new Date('2025-01-13T08:45:00Z'),
    calories: 33
  }
]

const mockStats = {
  totalScans: 24,
  safeFood: 18,
  dangerousFood: 3,
  lastScan: '2025-01-15T10:30:00Z'
}

const SafetyBadge: React.FC<{ level: string }> = ({ level }) => {
  const getConfig = () => {
    switch (level) {
      case 'safe':
        return { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100', label: 'Seguro' }
      case 'caution':
        return { icon: ExclamationTriangleIcon, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Cuidado' }
      case 'toxic':
        return { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-100', label: 'Tóxico' }
      case 'dangerous':
        return { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-100', label: 'Perigoso' }
      default:
        return { icon: ExclamationTriangleIcon, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Desconhecido' }
    }
  }
  
  const config = getConfig()
  const Icon = config.icon
  
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bg}`}>
      <Icon className={`h-3 w-3 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  )
}

const ScanHistoryCard: React.FC<{ scan: FoodScanHistory }> = ({ scan }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/20 rounded-glass p-4 border border-white/20 hover:bg-white/30 transition-colors"
  >
    <div className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-glass flex items-center justify-center">
        <PhotoIcon className="h-8 w-8 text-gray-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{scan.foodName}</h4>
          <SafetyBadge level={scan.safetyLevel} />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
          <span>Pet: {scan.petName}</span>
          <span>•</span>
          <span>{scan.portionSize}g</span>
          <span>•</span>
          <span>{scan.calories} kcal</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Confiança: {Math.round(scan.confidence * 100)}%</span>
          <span>{getRelativeTime(scan.scannedAt.toISOString())}</span>
        </div>
      </div>
    </div>
  </motion.div>
)

export const FoodScannerPage: React.FC = () => {
  const [showScanner, setShowScanner] = React.useState(false)
  const [scanHistory, setScanHistory] = React.useState(mockScanHistory)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterLevel, setFilterLevel] = React.useState<string>('all')
  
  const { showSuccess } = useNotifications()

  const handleFoodScanned = (result: RecognitionResult) => {
    // Add to history
    const newScan: FoodScanHistory = {
      id: Date.now().toString(),
      foodName: result.food.name,
      petName: 'Pet Atual', // This would come from context
      petId: '1', // This would come from context
      imageUrl: '/api/placeholder/150/150',
      confidence: result.confidence,
      portionSize: result.detectedPortionSize,
      safetyLevel: result.food.toxicityLevel,
      scannedAt: new Date(),
      calories: result.food.nutritionalInfo.calories
    }
    
    setScanHistory(prev => [newScan, ...prev])
    
    showSuccess(
      'Alimento escaneado!',
      `${result.food.name} foi adicionado ao histórico`
    )
  }

  const filteredHistory = React.useMemo(() => {
    return scanHistory.filter(scan => {
      const matchesSearch = scan.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scan.petName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterLevel === 'all' || scan.safetyLevel === filterLevel
      return matchesSearch && matchesFilter
    })
  }, [scanHistory, searchTerm, filterLevel])

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CameraIcon className="h-8 w-8 text-coral-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scanner de Alimentos</h1>
              <p className="text-gray-600 mt-1">
                Escaneie alimentos para verificar se são seguros para seus pets
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
          >
            <CameraIcon className="h-5 w-5" />
            <span>Escanear Alimento</span>
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
              <p className="text-sm text-gray-600">Total de Scans</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalScans}</p>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <CameraIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>
        
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alimentos Seguros</p>
              <p className="text-2xl font-bold text-green-600">{mockStats.safeFood}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>
        
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alimentos Perigosos</p>
              <p className="text-2xl font-bold text-red-600">{mockStats.dangerousFood}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-glass">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </GlassWidget>
        
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Último Scan</p>
              <p className="text-2xl font-bold text-gray-900">{getRelativeTime(mockStats.lastScan)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-glass">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Como usar o Scanner</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-coral-100 rounded-glass mb-3 inline-block">
                <CameraIcon className="h-8 w-8 text-coral-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. Escaneie</h4>
              <p className="text-sm text-gray-600">
                Aponte a câmera para o alimento que deseja verificar
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-teal-100 rounded-glass mb-3 inline-block">
                <SparklesIcon className="h-8 w-8 text-teal-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. Analise</h4>
              <p className="text-sm text-gray-600">
                Nosso AI identifica o alimento e verifica a segurança
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-glass mb-3 inline-block">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. Decida</h4>
              <p className="text-sm text-gray-600">
                Receba recomendações sobre dar ou não o alimento
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por alimento ou pet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-glass focus:bg-white/30 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'safe', label: 'Seguros' },
                { value: 'caution', label: 'Cuidado' },
                { value: 'dangerous', label: 'Perigosos' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterLevel(filter.value)}
                  className={`px-4 py-2 rounded-glass text-sm font-medium transition-all duration-200 ${
                    filterLevel === filter.value
                      ? 'bg-coral-500 text-white shadow-glass-lg'
                      : 'bg-white/20 text-gray-700 hover:bg-white/30'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Histórico de Escaneamentos
          </h2>
          <p className="text-sm text-gray-600">
            {filteredHistory.length} resultado{filteredHistory.length !== 1 ? 's' : ''} encontrado{filteredHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {filteredHistory.length === 0 ? (
          <GlassCard className="text-center py-12">
            <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum scan encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterLevel !== 'all' 
                ? 'Tente ajustar os filtros'
                : 'Comece escaneando seu primeiro alimento'
              }
            </p>
            {!searchTerm && filterLevel === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScanner(true)}
                className="bg-coral-500 text-white px-6 py-3 rounded-glass hover:bg-coral-600 transition-colors"
              >
                Fazer Primeiro Scan
              </motion.button>
            )}
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((scan) => (
              <ScanHistoryCard key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Scanner Modal */}
      <FoodScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onFoodScanned={handleFoodScanned}
      />
    </div>
  )
}