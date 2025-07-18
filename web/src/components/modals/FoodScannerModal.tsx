import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  CameraIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

import { GlassContainer } from '@/components/ui/GlassContainer'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  foodRecognitionService, 
  FoodItem, 
  NutritionalInfo, 
  RecognitionResult 
} from '@/services/foodRecognitionService'

interface FoodScannerModalProps {
  isOpen: boolean
  onClose: () => void
  petId?: string
  petName?: string
  onFoodScanned?: (result: RecognitionResult) => void
}

const NutritionCard: React.FC<{ 
  title: string
  nutrition: NutritionalInfo
  portionSize: number
}> = ({ title, nutrition, portionSize }) => (
  <div className="bg-white/20 rounded-glass p-4 border border-white/20">
    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
      <SparklesIcon className="h-4 w-4 text-teal-600" />
      <span>{title} ({portionSize}g)</span>
    </h4>
    
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Calorias:</span>
        <span className="font-medium">{nutrition.calories} kcal</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Proteína:</span>
        <span className="font-medium">{nutrition.protein}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Carboidratos:</span>
        <span className="font-medium">{nutrition.carbs}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Gordura:</span>
        <span className="font-medium">{nutrition.fat}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Fibra:</span>
        <span className="font-medium">{nutrition.fiber}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Cálcio:</span>
        <span className="font-medium">{nutrition.calcium}mg</span>
      </div>
    </div>
  </div>
)

const SafetyIndicator: React.FC<{ food: FoodItem }> = ({ food }) => {
  const safety = foodRecognitionService.getSafetyRecommendations(food)
  
  const getIcon = () => {
    switch (food.toxicityLevel) {
      case 'safe': return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'caution': return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
      case 'toxic': return <XCircleIcon className="h-6 w-6 text-red-600" />
      case 'dangerous': return <XCircleIcon className="h-6 w-6 text-red-600" />
      default: return <InformationCircleIcon className="h-6 w-6 text-gray-600" />
    }
  }
  
  const getColor = () => {
    switch (food.toxicityLevel) {
      case 'safe': return 'bg-green-100 border-green-200 text-green-800'
      case 'caution': return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      case 'toxic': return 'bg-red-100 border-red-200 text-red-800'
      case 'dangerous': return 'bg-red-100 border-red-200 text-red-800'
      default: return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`p-4 rounded-glass border ${getColor()}`}>
      <div className="flex items-center space-x-3 mb-3">
        {getIcon()}
        <div>
          <h4 className="font-semibold">Segurança: {safety.safetyLevel}</h4>
          <p className="text-sm opacity-90">{food.description}</p>
        </div>
      </div>
      
      {safety.recommendations.length > 0 && (
        <div className="mb-3">
          <h5 className="font-medium mb-2">Recomendações:</h5>
          <ul className="text-sm space-y-1">
            {safety.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {safety.warnings.length > 0 && (
        <div>
          <h5 className="font-medium mb-2">⚠️ Avisos:</h5>
          <ul className="text-sm space-y-1">
            {safety.warnings.map((warning, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-600 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({ 
  isOpen, 
  onClose, 
  petId, 
  petName, 
  onFoodScanned 
}) => {
  const [step, setStep] = React.useState<'camera' | 'analyzing' | 'results'>('camera')
  const [scanResult, setScanResult] = React.useState<RecognitionResult | null>(null)
  const [selectedFood, setSelectedFood] = React.useState<FoodItem | null>(null)
  const [portionSize, setPortionSize] = React.useState(100)
  
  const { showSuccess, showError, showHealthAlert } = useNotifications()

  const handleCapture = async (imageData: string) => {
    setStep('analyzing')
    
    try {
      const result = await foodRecognitionService.recognizeFood(imageData)
      setScanResult(result)
      setSelectedFood(result.food)
      setPortionSize(result.detectedPortionSize)
      setStep('results')
    } catch (error) {
      showError('Erro no escaneamento', 'Não foi possível analisar o alimento')
      setStep('camera')
    }
  }

  const handleConfirmFood = () => {
    if (!scanResult || !selectedFood) return
    
    const safety = foodRecognitionService.getSafetyRecommendations(selectedFood)
    
    // Show appropriate notification
    if (safety.canGive) {
      showSuccess(
        'Alimento escaneado!',
        `${selectedFood.name} foi adicionado ao histórico${petName ? ` de ${petName}` : ''}`,
        { actionUrl: '/app/health' }
      )
    } else {
      showHealthAlert(
        'Alimento não recomendado!',
        `${selectedFood.name} não é seguro para pets`,
        petName || 'Pet',
        { petId, actionUrl: '/app/health' }
      )
    }
    
    // Call callback if provided
    onFoodScanned?.(scanResult)
    
    // Close modal
    handleClose()
  }

  const handleClose = () => {
    setStep('camera')
    setScanResult(null)
    setSelectedFood(null)
    setPortionSize(100)
    onClose()
  }

  const selectAlternativeFood = (food: FoodItem) => {
    setSelectedFood(food)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassContainer variant="modal" className="h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <CameraIcon className="h-6 w-6 text-coral-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Escaneamento de Alimentos
                </h2>
                {petName && (
                  <span className="text-sm text-gray-600 bg-white/20 px-2 py-1 rounded-full">
                    {petName}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              {step === 'camera' && (
                <CameraCapture
                  onCapture={handleCapture}
                  onClose={handleClose}
                />
              )}

              {step === 'analyzing' && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analisando alimento...
                  </h3>
                  <p className="text-gray-600">
                    Identificando o alimento e verificando se é seguro para pets
                  </p>
                </div>
              )}

              {step === 'results' && scanResult && selectedFood && (
                <div className="space-y-6">
                  {/* Recognition Results */}
                  <div className="bg-white/10 rounded-glass p-4 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Alimento Identificado
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedFood.name}</h4>
                        <p className="text-sm text-gray-600">
                          Confiança: {Math.round(scanResult.confidence * 100)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Porção detectada:</p>
                        <input
                          type="number"
                          value={portionSize}
                          onChange={(e) => setPortionSize(Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-white/20 border border-white/30 rounded-glass text-center"
                          min="1"
                          max="1000"
                        />
                        <span className="text-sm text-gray-600 ml-1">g</span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Information */}
                  <SafetyIndicator food={selectedFood} />

                  {/* Nutrition Information */}
                  <NutritionCard
                    title="Informações Nutricionais"
                    nutrition={foodRecognitionService.calculateNutritionForPortion(
                      selectedFood, 
                      portionSize
                    )}
                    portionSize={portionSize}
                  />

                  {/* Alternative Results */}
                  {scanResult.alternatives.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Não é o alimento correto? Tente estas opções:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {scanResult.alternatives.map((alt, index) => (
                          <button
                            key={index}
                            onClick={() => selectAlternativeFood(alt.food)}
                            className={`p-3 rounded-glass border transition-colors text-left ${
                              selectedFood.id === alt.food.id
                                ? 'border-coral-500 bg-coral-50'
                                : 'border-white/20 bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            <h5 className="font-medium text-gray-900">{alt.food.name}</h5>
                            <p className="text-sm text-gray-600">
                              {Math.round(alt.confidence * 100)}% confiança
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
                    <button
                      onClick={() => setStep('camera')}
                      className="px-4 py-2 text-gray-700 hover:bg-white/20 rounded-glass transition-colors"
                    >
                      Escanear Novamente
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirmFood}
                      className="px-6 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
                    >
                      Confirmar Alimento
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </GlassContainer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}