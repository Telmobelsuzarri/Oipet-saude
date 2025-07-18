import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { XMarkIcon, HeartIcon, ScaleIcon, PlayIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

import { GlassContainer } from '@/components/ui/GlassContainer'
import { useNotifications } from '@/hooks/useNotifications'

interface AddHealthRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (record: any) => void
  petId?: string
  petName?: string
}

interface HealthRecordForm {
  date: string
  weight?: number
  height?: number
  activity?: {
    type: string
    duration: number
    intensity: 'low' | 'medium' | 'high'
  }
  calories?: number
  notes?: string
}

const activityTypes = [
  { value: 'walk', label: 'Caminhada' },
  { value: 'run', label: 'Corrida' },
  { value: 'play', label: 'Brincadeira' },
  { value: 'swim', label: 'Natação' },
  { value: 'training', label: 'Treinamento' },
  { value: 'other', label: 'Outro' }
]

const intensityOptions = [
  { value: 'low', label: 'Baixa', color: 'text-green-600' },
  { value: 'medium', label: 'Média', color: 'text-yellow-600' },
  { value: 'high', label: 'Alta', color: 'text-red-600' }
]

export const AddHealthRecordModal: React.FC<AddHealthRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  petId, 
  petName 
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [includeActivity, setIncludeActivity] = React.useState(false)
  const { showSuccess, showHealthAlert, showAchievement } = useNotifications()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HealthRecordForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      height: undefined,
      activity: {
        type: 'walk',
        duration: 30,
        intensity: 'medium'
      },
      calories: undefined,
      notes: '',
    },
  })

  const handleClose = () => {
    reset()
    setIncludeActivity(false)
    onClose()
  }

  const onSubmit = async (data: HealthRecordForm) => {
    setIsLoading(true)
    try {
      // Mock API call since backend is not implemented
      const mockRecord = {
        _id: Date.now().toString(),
        petId: petId || 'unknown',
        date: data.date,
        weight: data.weight,
        height: data.height,
        activity: includeActivity ? data.activity : undefined,
        calories: data.calories,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success(`Registro de saúde adicionado${petName ? ` para ${petName}` : ''}!`)
      
      // Show success notification
      showSuccess(
        'Registro de saúde adicionado!',
        `Dados de saúde${petName ? ` de ${petName}` : ''} foram salvos com sucesso`,
        { actionUrl: '/app/health' }
      )
      
      // Check for achievements and alerts
      if (data.weight && data.weight > 0) {
        if (data.weight >= 30) {
          showHealthAlert(
            'Peso elevado detectado',
            'O peso está acima do recomendado. Considere consultar um veterinário.',
            petName || 'Pet',
            { petId, actionUrl: '/app/health' }
          )
        }
      }
      
      if (data.activity && data.activity.duration >= 60) {
        showAchievement(
          'Meta de exercícios atingida!',
          `${data.activity.duration} minutos de ${data.activity.type} completados`,
          petName || 'Pet',
          { petId, actionUrl: '/app/health' }
        )
      }
      
      onSuccess?.(mockRecord)
      handleClose()
    } catch (error: any) {
      toast.error('Erro ao salvar registro de saúde')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <GlassContainer variant="modal" className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-coral-100 rounded-glass">
                    <HeartIcon className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Registro de Saúde</h2>
                    {petName && (
                      <p className="text-sm text-gray-600">Para {petName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Registro *
                  </label>
                  <input
                    {...register('date', { required: 'Data é obrigatória' })}
                    type="date"
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                {/* Physical Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weight */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <ScaleIcon className="h-4 w-4" />
                      <span>Peso (kg)</span>
                    </label>
                    <input
                      {...register('weight', {
                        min: { value: 0.1, message: 'Peso deve ser maior que 0' },
                        max: { value: 200, message: 'Peso deve ser menor que 200kg' }
                      })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: 25.5"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                    )}
                  </div>

                  {/* Height */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <ScaleIcon className="h-4 w-4" />
                      <span>Altura (cm)</span>
                    </label>
                    <input
                      {...register('height', {
                        min: { value: 1, message: 'Altura deve ser maior que 0' },
                        max: { value: 200, message: 'Altura deve ser menor que 200cm' }
                      })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: 60"
                    />
                    {errors.height && (
                      <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                    )}
                  </div>
                </div>

                {/* Activity Section */}
                <div>
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={includeActivity}
                      onChange={(e) => setIncludeActivity(e.target.checked)}
                      className="rounded border-gray-300 text-coral-500 focus:ring-coral-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <PlayIcon className="h-4 w-4" />
                      <span>Incluir atividade física</span>
                    </span>
                  </label>

                  {includeActivity && (
                    <div className="space-y-4 p-4 bg-white/30 rounded-glass border border-white/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Activity Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Atividade
                          </label>
                          <select
                            {...register('activity.type')}
                            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                          >
                            {activityTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duração (minutos)
                          </label>
                          <input
                            {...register('activity.duration', {
                              min: { value: 1, message: 'Duração deve ser maior que 0' },
                              max: { value: 480, message: 'Duração deve ser menor que 8 horas' }
                            })}
                            type="number"
                            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                            placeholder="Ex: 30"
                          />
                          {errors.activity?.duration && (
                            <p className="mt-1 text-sm text-red-600">{errors.activity.duration.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Intensity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intensidade
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {intensityOptions.map((option) => (
                            <label key={option.value} className="flex items-center space-x-2 p-3 bg-white/30 rounded-glass border border-white/20 hover:bg-white/40 transition-colors cursor-pointer">
                              <input
                                {...register('activity.intensity')}
                                type="radio"
                                value={option.value}
                                className="text-coral-500 focus:ring-coral-500"
                              />
                              <span className={`text-sm font-medium ${option.color}`}>
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calorias Consumidas
                  </label>
                  <input
                    {...register('calories', {
                      min: { value: 0, message: 'Calorias devem ser maior que 0' },
                      max: { value: 10000, message: 'Calorias devem ser menor que 10000' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ex: 1200"
                  />
                  {errors.calories && (
                    <p className="mt-1 text-sm text-red-600">{errors.calories.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Observações sobre o estado de saúde, comportamento, etc..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-700 bg-white/50 border border-white/20 rounded-glass hover:bg-white/70 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      'Salvar Registro'
                    )}
                  </motion.button>
                </div>
              </form>
            </GlassContainer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}