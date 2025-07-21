import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScaleIcon,
  BeakerIcon,
  FireIcon,
  MoonIcon,
  FaceSmileIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { usePetStore } from '@/stores/petStore'
import { healthTrackingService, type DailyHealthRecord, type HealthAlert } from '@/services/healthTrackingService'
import { cn } from '@/lib/utils'

export const HealthTrackingPage: React.FC = () => {
  const { pets, selectedPet, setSelectedPet } = usePetStore()
  const [currentRecord, setCurrentRecord] = useState<Partial<DailyHealthRecord> | null>(null)
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'trends' | 'goals'>('daily')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (selectedPet) {
      loadTodayRecord()
      loadHealthAlerts()
    }
  }, [selectedPet])

  const loadTodayRecord = async () => {
    if (!selectedPet) return

    try {
      const records = await healthTrackingService.getHealthRecords(selectedPet._id)
      const todayRecord = records.find(r => r.date === today)
      
      setCurrentRecord(todayRecord || {
        petId: selectedPet._id,
        date: today,
        weight: undefined,
        waterIntake: undefined,
        foodIntake: undefined,
        activity: undefined,
        sleep: undefined,
        mood: undefined,
        medications: [],
        notes: ''
      })
    } catch (error) {
      console.error('Erro ao carregar registro:', error)
    }
  }

  const loadHealthAlerts = async () => {
    if (!selectedPet) return

    try {
      const alerts = await healthTrackingService.getHealthAlerts(selectedPet._id, true)
      setHealthAlerts(alerts)
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    }
  }

  const handleSaveRecord = async () => {
    if (!selectedPet || !currentRecord) return

    setIsLoading(true)
    try {
      await healthTrackingService.addHealthRecord({
        petId: selectedPet._id,
        date: today,
        weight: currentRecord.weight,
        waterIntake: currentRecord.waterIntake,
        foodIntake: currentRecord.foodIntake,
        activity: currentRecord.activity,
        sleep: currentRecord.sleep,
        mood: currentRecord.mood,
        medications: currentRecord.medications || [],
        notes: currentRecord.notes || ''
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      loadHealthAlerts() // Recarregar alertas após salvar
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateRecord = (field: string, value: any) => {
    setCurrentRecord(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateNestedRecord = (field: string, subfield: string, value: any) => {
    setCurrentRecord(prev => {
      if (!prev) return null
      return {
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev],
          [subfield]: value
        }
      }
    })
  }

  if (!selectedPet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <GlassCard>
            <div className="p-8">
              <FaceSmileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selecione um Pet
              </h2>
              <p className="text-gray-600 mb-6">
                Escolha um pet para começar o tracking de saúde
              </p>
              <div className="space-y-2">
                {pets.map(pet => (
                  <motion.button
                    key={pet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPet(pet)}
                    className="w-full p-3 text-left bg-white rounded-glass border border-gray-200 hover:border-coral-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
                        <span className="text-coral-600 font-medium">
                          {pet.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pet.name}</p>
                        <p className="text-sm text-gray-500">{pet.breed}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tracking de Saúde 📊
            </h1>
            <p className="text-gray-600">
              Acompanhe a saúde e bem-estar de {selectedPet.name}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/50 rounded-glass px-4 py-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-amber-500" />
              Alertas de Saúde
            </h2>
            <div className="space-y-3">
              {healthAlerts.slice(0, 3).map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <GlassCard className={cn(
                    "border-l-4",
                    alert.severity === 'critical' ? "border-red-500 bg-red-50" :
                    alert.severity === 'warning' ? "border-amber-500 bg-amber-50" :
                    "border-blue-500 bg-blue-50"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                        {alert.recommendations.length > 0 && (
                          <ul className="mt-2 text-xs text-gray-500 space-y-1">
                            {alert.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => healthTrackingService.markAlertAsRead(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Tracking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Metrics */}
          <div className="space-y-6">
            {/* Weight */}
            <GlassCard>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-glass">
                  <ScaleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Peso</h3>
                  <p className="text-sm text-gray-600">Registre o peso atual</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 15.5"
                  value={currentRecord?.weight || ''}
                  onChange={(e) => updateRecord('weight', parseFloat(e.target.value) || undefined)}
                  className="flex-1 px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <span className="text-gray-500 font-medium">kg</span>
              </div>
            </GlassCard>

            {/* Water Intake */}
            <GlassCard>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-glass">
                  <BeakerIcon className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Consumo de Água</h3>
                  <p className="text-sm text-gray-600">Quantidade de água ingerida</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="Ex: 800"
                  value={currentRecord?.waterIntake || ''}
                  onChange={(e) => updateRecord('waterIntake', parseInt(e.target.value) || undefined)}
                  className="flex-1 px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <span className="text-gray-500 font-medium">ml</span>
              </div>
            </GlassCard>

            {/* Food Intake */}
            <GlassCard>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-glass">
                  <FireIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Alimentação</h3>
                  <p className="text-sm text-gray-600">Quantidade de ração consumida</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="Ex: 400"
                  value={currentRecord?.foodIntake || ''}
                  onChange={(e) => updateRecord('foodIntake', parseInt(e.target.value) || undefined)}
                  className="flex-1 px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <span className="text-gray-500 font-medium">g</span>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Advanced Metrics */}
          <div className="space-y-6">
            {/* Activity */}
            <GlassCard>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-glass">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Atividade Física</h3>
                  <p className="text-sm text-gray-600">Passos e exercícios do dia</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Ex: 8000"
                    value={currentRecord?.activity?.steps || ''}
                    onChange={(e) => updateNestedRecord('activity', 'steps', parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 text-sm">passos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Ex: 45"
                    value={currentRecord?.activity?.exerciseMinutes || ''}
                    onChange={(e) => updateNestedRecord('activity', 'exerciseMinutes', parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 text-sm">min</span>
                </div>
                <select
                  value={currentRecord?.activity?.intensity || 'moderate'}
                  onChange={(e) => updateNestedRecord('activity', 'intensity', e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                >
                  <option value="low">Baixa intensidade</option>
                  <option value="moderate">Intensidade moderada</option>
                  <option value="high">Alta intensidade</option>
                </select>
              </div>
            </GlassCard>

            {/* Sleep */}
            <GlassCard>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-glass">
                  <MoonIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sono</h3>
                  <p className="text-sm text-gray-600">Qualidade e duração do sono</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 14"
                    value={currentRecord?.sleep?.hours || ''}
                    onChange={(e) => updateNestedRecord('sleep', 'hours', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 text-sm">horas</span>
                </div>
                <select
                  value={currentRecord?.sleep?.quality || 'good'}
                  onChange={(e) => updateNestedRecord('sleep', 'quality', e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                >
                  <option value="poor">Sono ruim</option>
                  <option value="fair">Sono regular</option>
                  <option value="good">Sono bom</option>
                  <option value="excellent">Sono excelente</option>
                </select>
              </div>
            </GlassCard>

            {/* Mood */}
            <GlassCard>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-glass">
                  <FaceSmileIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Humor e Energia</h3>
                  <p className="text-sm text-gray-600">Estado emocional do pet</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energia (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentRecord?.mood?.energy || 3}
                    onChange={(e) => updateNestedRecord('mood', 'energy', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Baixa</span>
                    <span>Alta</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Felicidade (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentRecord?.mood?.happiness || 3}
                    onChange={(e) => updateNestedRecord('mood', 'happiness', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Triste</span>
                    <span>Feliz</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apetite (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentRecord?.mood?.appetite || 3}
                    onChange={(e) => updateNestedRecord('mood', 'appetite', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Sem fome</span>
                    <span>Faminto</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8">
          <GlassCard>
            <h3 className="font-semibold text-gray-900 mb-4">Observações do Dia</h3>
            <textarea
              placeholder="Adicione observações sobre o comportamento, saúde ou qualquer coisa relevante sobre o dia do seu pet..."
              value={currentRecord?.notes || ''}
              onChange={(e) => updateRecord('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
            />
          </GlassCard>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveRecord}
            disabled={isLoading}
            className={cn(
              "px-8 py-4 rounded-glass font-medium text-white transition-all flex items-center space-x-2",
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-coral-500 hover:bg-coral-600"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5" />
                <span>Salvar Registro do Dia</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <GlassCard className="bg-green-50 border-green-200">
                <div className="flex items-center space-x-3 text-green-800">
                  <CheckIcon className="h-6 w-6" />
                  <span className="font-medium">Registro salvo com sucesso!</span>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}