import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  FireIcon,
  HeartIcon,
  ShoppingBagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid'

import { GlassWidget } from '@/components/ui/GlassContainer'
import { usePetStore } from '@/stores/petStore'
import { 
  aiRecommendationService, 
  type RecommendationPackage,
  type NutritionRecommendation,
  type ActivityRecommendation,
  type HealthRecommendation
} from '@/services/aiRecommendationService'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SmartRecommendationWidgetProps {
  petId?: string
  className?: string
}

export const SmartRecommendationWidget: React.FC<SmartRecommendationWidgetProps> = ({
  petId,
  className
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationPackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  
  const { pets } = usePetStore()
  const navigate = useNavigate()

  // Usar primeiro pet se nenhum ID for fornecido
  const targetPetId = petId || (pets.length > 0 ? pets[0]._id : null)

  useEffect(() => {
    if (targetPetId && !dismissed) {
      loadRecommendations()
    }
  }, [targetPetId, dismissed])

  const loadRecommendations = async () => {
    if (!targetPetId) return

    setLoading(true)
    setError(null)

    try {
      const result = await aiRecommendationService.generateRecommendations(targetPetId)
      setRecommendations(result)
    } catch (err) {
      setError('Erro ao carregar recomendações')
      console.error('Erro ao carregar recomendações:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTopRecommendations = () => {
    if (!recommendations) return []

    const allRecommendations: (NutritionRecommendation | ActivityRecommendation | HealthRecommendation)[] = [
      ...recommendations.nutrition,
      ...recommendations.activity,
      ...recommendations.health
    ]

    // Priorizar por urgência/prioridade e pegar apenas os 3 mais importantes
    return allRecommendations
      .sort((a, b) => {
        const getPriorityScore = (rec: any) => {
          if ('priority' in rec) {
            return rec.priority === 'high' ? 3 : rec.priority === 'medium' ? 2 : 1
          }
          if ('urgency' in rec) {
            return rec.urgency === 'immediate' ? 3 : rec.urgency === 'soon' ? 2 : 1
          }
          return 1
        }
        return getPriorityScore(b) - getPriorityScore(a)
      })
      .slice(0, 3)
  }

  const getRecommendationIcon = (recommendation: any) => {
    if ('type' in recommendation && ['food', 'supplement', 'treats', 'hydration'].includes(recommendation.type)) {
      return <FireIcon className="h-4 w-4" />
    }
    if ('duration' in recommendation) {
      return <FireIcon className="h-4 w-4" />
    }
    return <HeartIcon className="h-4 w-4" />
  }

  const getRecommendationColor = (recommendation: any) => {
    if ('priority' in recommendation) {
      return recommendation.priority === 'high' ? 'text-red-500' : 
             recommendation.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'
    }
    if ('urgency' in recommendation) {
      return recommendation.urgency === 'immediate' ? 'text-red-500' :
             recommendation.urgency === 'soon' ? 'text-orange-500' : 'text-blue-500'
    }
    return 'text-gray-500'
  }

  if (dismissed) {
    return null
  }

  if (!targetPetId || !pets.length) {
    return null
  }

  const selectedPet = pets.find(p => p._id === targetPetId)
  const topRecommendations = getTopRecommendations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <GlassWidget className="relative overflow-hidden">
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-coral-500 to-teal-500 rounded-glass text-white">
            <SparklesSolid className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              Recomendações IA
            </h3>
            <p className="text-gray-600 text-sm">
              {selectedPet ? `Para ${selectedPet.name}` : 'Seus pets'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-coral-500 border-t-transparent mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Analisando dados...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={loadRecommendations}
              className="text-coral-600 hover:text-coral-700 text-sm font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Recommendations */}
        {!loading && !error && recommendations && (
          <>
            {/* Summary */}
            <div className="bg-gradient-to-r from-coral-50 to-teal-50 rounded-glass p-3 mb-4 border border-coral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-coral-600">
                    {recommendations.summary.totalRecommendations}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Recomendações Disponíveis
                    </p>
                    {recommendations.summary.highPriorityCount > 0 && (
                      <p className="text-xs text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        {recommendations.summary.highPriorityCount} de alta prioridade
                      </p>
                    )}
                  </div>
                </div>
                {recommendations.nutrition.some(n => n.oipetProduct) && (
                  <div className="text-xs text-teal-600 flex items-center">
                    <ShoppingBagIcon className="h-3 w-3 mr-1" />
                    Produtos OiPet
                  </div>
                )}
              </div>
            </div>

            {/* Top Recommendations List */}
            {topRecommendations.length > 0 && (
              <div className="space-y-3 mb-4">
                {topRecommendations.map((recommendation, index) => {
                  const IconComponent = getRecommendationIcon(recommendation)
                  const color = getRecommendationColor(recommendation)
                  
                  return (
                    <div
                      key={recommendation.id}
                      className="flex items-start space-x-3 p-3 bg-white/30 rounded-glass border border-gray-100"
                    >
                      <div className={cn('p-1.5 rounded-full bg-white/50', color)}>
                        {IconComponent}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {recommendation.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {recommendation.description}
                        </p>
                        {'oipetProduct' in recommendation && recommendation.oipetProduct && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-800">
                              <ShoppingBagIcon className="h-3 w-3 mr-1" />
                              {recommendation.oipetProduct.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quick Insights */}
            {recommendations.insights.healthTrends.length > 0 && (
              <div className="bg-blue-50 rounded-glass p-3 mb-4 border border-blue-200">
                <h4 className="text-xs font-medium text-blue-900 mb-2 uppercase tracking-wider">
                  Insight Principal
                </h4>
                <p className="text-sm text-blue-800">
                  {recommendations.insights.healthTrends[0]}
                </p>
              </div>
            )}

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/recommendations')}
              className="w-full bg-gradient-to-r from-coral-500 to-teal-500 text-white px-4 py-3 rounded-glass hover:from-coral-600 hover:to-teal-600 transition-all font-medium text-sm flex items-center justify-center space-x-2"
            >
              <span>Ver Todas as Recomendações</span>
              <ArrowRightIcon className="h-4 w-4" />
            </motion.button>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && (!recommendations || recommendations.summary.totalRecommendations === 0) && (
          <div className="text-center py-6">
            <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">
              Nenhuma recomendação disponível no momento
            </p>
            <p className="text-xs text-gray-400">
              Continue registrando dados de saúde para receber sugestões personalizadas
            </p>
          </div>
        )}

        {/* No Pet State */}
        {!targetPetId && (
          <div className="text-center py-6">
            <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">
              Cadastre um pet para receber recomendações
            </p>
            <button
              onClick={() => navigate('/app/pets')}
              className="text-coral-600 hover:text-coral-700 text-sm font-medium"
            >
              Cadastrar Pet
            </button>
          </div>
        )}
      </GlassWidget>
    </motion.div>
  )
}