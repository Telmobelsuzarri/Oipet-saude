import React from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  HeartIcon,
  FireIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolid,
  FireIcon as FireSolid,
  SparklesIcon as SparklesSolid 
} from '@heroicons/react/24/solid'

import { GlassCard } from '@/components/ui/GlassContainer'
import { 
  type NutritionRecommendation, 
  type ActivityRecommendation, 
  type HealthRecommendation 
} from '@/services/aiRecommendationService'
import { cn } from '@/lib/utils'

interface RecommendationCardProps {
  recommendation: NutritionRecommendation | ActivityRecommendation | HealthRecommendation
  onAccept?: (id: string) => void
  onDismiss?: (id: string) => void
  onOpenProduct?: (url: string) => void
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onDismiss,
  onOpenProduct
}) => {
  const isNutrition = 'type' in recommendation && ['food', 'supplement', 'treats', 'hydration'].includes(recommendation.type)
  const isActivity = 'duration' in recommendation
  const isHealth = 'urgency' in recommendation

  const getTypeIcon = () => {
    if (isNutrition) {
      const nutritionRec = recommendation as NutritionRecommendation
      switch (nutritionRec.type) {
        case 'food': return <FireIcon className="h-5 w-5" />
        case 'supplement': return <SparklesIcon className="h-5 w-5" />
        case 'treats': return <HeartIcon className="h-5 w-5" />
        case 'hydration': return <FireIcon className="h-5 w-5" />
      }
    }
    if (isActivity) return <FireSolid className="h-5 w-5" />
    if (isHealth) return <HeartSolid className="h-5 w-5" />
    return <InformationCircleIcon className="h-5 w-5" />
  }

  const getTypeColor = () => {
    if (isNutrition) {
      const nutritionRec = recommendation as NutritionRecommendation
      switch (nutritionRec.priority) {
        case 'high': return 'coral'
        case 'medium': return 'teal'
        case 'low': return 'gray'
        default: return 'gray'
      }
    }
    if (isActivity) return 'orange'
    if (isHealth) {
      const healthRec = recommendation as HealthRecommendation
      switch (healthRec.urgency) {
        case 'immediate': return 'red'
        case 'soon': return 'orange'
        case 'routine': return 'blue'
        default: return 'gray'
      }
    }
    return 'gray'
  }

  const getPriorityLabel = () => {
    if (isNutrition) {
      const nutritionRec = recommendation as NutritionRecommendation
      return nutritionRec.priority === 'high' ? 'Alta Prioridade' : 
             nutritionRec.priority === 'medium' ? 'Prioridade Média' : 'Baixa Prioridade'
    }
    if (isHealth) {
      const healthRec = recommendation as HealthRecommendation
      return healthRec.urgency === 'immediate' ? 'Urgente' :
             healthRec.urgency === 'soon' ? 'Em Breve' : 'Rotina'
    }
    return 'Recomendação'
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      coral: 'bg-coral-500 text-white',
      teal: 'bg-teal-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white',
      gray: 'bg-gray-500 text-white'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  const getBorderColorClasses = (color: string) => {
    const colorMap = {
      coral: 'border-coral-200 bg-coral-50',
      teal: 'border-teal-200 bg-teal-50',
      orange: 'border-orange-200 bg-orange-50',
      red: 'border-red-200 bg-red-50',
      blue: 'border-blue-200 bg-blue-50',
      gray: 'border-gray-200 bg-gray-50'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  const typeColor = getTypeColor()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className={cn(
        'relative overflow-hidden border-l-4',
        typeColor === 'coral' ? 'border-l-coral-500' :
        typeColor === 'teal' ? 'border-l-teal-500' :
        typeColor === 'orange' ? 'border-l-orange-500' :
        typeColor === 'red' ? 'border-l-red-500' :
        typeColor === 'blue' ? 'border-l-blue-500' :
        'border-l-gray-500'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-glass',
              getColorClasses(typeColor)
            )}>
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {recommendation.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getBorderColorClasses(typeColor)
                )}>
                  {getPriorityLabel()}
                </span>
                {isNutrition && (recommendation as NutritionRecommendation).confidence && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <StarIcon className="h-4 w-4" />
                    <span>{(recommendation as NutritionRecommendation).confidence}% confiança</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Time indicator */}
          {(isNutrition && (recommendation as NutritionRecommendation).timeframe) && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>{(recommendation as NutritionRecommendation).timeframe}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">
          {recommendation.description}
        </p>

        {/* Reasoning */}
        <div className="bg-gray-50 rounded-glass p-3 mb-4">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Por que essa recomendação?</p>
              <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Content specific to type */}
        {isNutrition && (
          <NutritionContent 
            recommendation={recommendation as NutritionRecommendation}
            onOpenProduct={onOpenProduct}
          />
        )}

        {isActivity && (
          <ActivityContent recommendation={recommendation as ActivityRecommendation} />
        )}

        {isHealth && (
          <HealthContent recommendation={recommendation as HealthRecommendation} />
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAccept?.(recommendation.id)}
            className="flex-1 bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors font-medium"
          >
            Aceitar Recomendação
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDismiss?.(recommendation.id)}
            className="px-4 py-2 bg-white/50 text-gray-700 rounded-glass hover:bg-white/70 transition-colors border border-gray-200"
          >
            Dispensar
          </motion.button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Component for nutrition-specific content
const NutritionContent: React.FC<{
  recommendation: NutritionRecommendation
  onOpenProduct?: (url: string) => void
}> = ({ recommendation, onOpenProduct }) => (
  <>
    {/* Nutritional Benefits */}
    {recommendation.nutritionalBenefits.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <SparklesSolid className="h-4 w-4 mr-2 text-teal-500" />
          Benefícios Nutricionais
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {recommendation.nutritionalBenefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* OiPet Product */}
    {recommendation.oipetProduct && (
      <div className="bg-gradient-to-r from-coral-50 to-teal-50 rounded-glass p-4 mb-4 border border-coral-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1 flex items-center">
              <ShoppingBagIcon className="h-4 w-4 mr-2 text-coral-500" />
              Produto Recomendado OiPet
            </h4>
            <p className="text-sm text-gray-700">{recommendation.oipetProduct.name}</p>
            {recommendation.oipetProduct.price && (
              <p className="text-sm font-medium text-coral-600">
                R$ {recommendation.oipetProduct.price.toFixed(2)}
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenProduct?.(recommendation.oipetProduct!.url)}
            className="bg-coral-500 text-white px-3 py-2 rounded-glass text-sm hover:bg-coral-600 transition-colors flex items-center space-x-1"
          >
            <span>Ver Produto</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    )}

    {/* Implementation Tips */}
    {recommendation.implementationTips.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Dicas de Implementação</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {recommendation.implementationTips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="text-coral-500 mr-2 flex-shrink-0">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Expected Results */}
    {recommendation.expectedResults.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Resultados Esperados</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {recommendation.expectedResults.map((result, index) => (
            <li key={index} className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {result}
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
)

// Component for activity-specific content
const ActivityContent: React.FC<{
  recommendation: ActivityRecommendation
}> = ({ recommendation }) => (
  <>
    {/* Activity Details */}
    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
      <div className="bg-gray-50 rounded-glass p-3">
        <span className="font-medium text-gray-700">Duração:</span>
        <p className="text-gray-600">{recommendation.duration} minutos</p>
      </div>
      <div className="bg-gray-50 rounded-glass p-3">
        <span className="font-medium text-gray-700">Intensidade:</span>
        <p className="text-gray-600 capitalize">{recommendation.intensity}</p>
      </div>
      <div className="bg-gray-50 rounded-glass p-3">
        <span className="font-medium text-gray-700">Frequência:</span>
        <p className="text-gray-600">{recommendation.frequency}</p>
      </div>
      <div className="bg-gray-50 rounded-glass p-3">
        <span className="font-medium text-gray-700">Clima:</span>
        <p className="text-gray-600">
          {recommendation.weatherDependent ? 'Dependente do clima' : 'Qualquer clima'}
        </p>
      </div>
    </div>

    {/* Equipment */}
    {recommendation.equipment && recommendation.equipment.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Equipamentos Necessários</h4>
        <div className="flex flex-wrap gap-2">
          {recommendation.equipment.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Benefits */}
    {recommendation.benefits.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Benefícios</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {recommendation.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
)

// Component for health-specific content
const HealthContent: React.FC<{
  recommendation: HealthRecommendation
}> = ({ recommendation }) => (
  <>
    {/* Symptoms */}
    {recommendation.symptoms && recommendation.symptoms.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-orange-500" />
          Sintomas Observados
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {recommendation.symptoms.map((symptom, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0" />
              {symptom}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Recommendations */}
    {recommendation.recommendations.length > 0 && (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Recomendações</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {recommendation.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Veterinary Consultation */}
    {recommendation.veterinaryConsult && (
      <div className="bg-red-50 border border-red-200 rounded-glass p-3 mb-4">
        <div className="flex items-center">
          <HeartSolid className="h-5 w-5 text-red-500 mr-2" />
          <span className="font-medium text-red-800">
            Consulta veterinária recomendada
          </span>
        </div>
      </div>
    )}

    {/* Monitoring */}
    <div className="bg-blue-50 border border-blue-200 rounded-glass p-3 mb-4">
      <h4 className="font-medium text-blue-900 mb-2">Monitoramento</h4>
      <div className="text-sm text-blue-800 space-y-1">
        <p><span className="font-medium">Métricas:</span> {recommendation.monitoring.metrics.join(', ')}</p>
        <p><span className="font-medium">Frequência:</span> {recommendation.monitoring.frequency}</p>
        {recommendation.monitoring.alerts.length > 0 && (
          <div>
            <span className="font-medium">Alertas:</span>
            <ul className="mt-1 space-y-1">
              {recommendation.monitoring.alerts.map((alert, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </>
)