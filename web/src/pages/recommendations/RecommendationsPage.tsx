import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  SparklesIcon as SparklesSolid,
  HeartIcon as HeartSolid 
} from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { RecommendationCard } from '@/components/recommendations/RecommendationCard'
import { usePetStore } from '@/stores/petStore'
import { 
  aiRecommendationService, 
  type RecommendationPackage,
  type NutritionRecommendation,
  type ActivityRecommendation,
  type HealthRecommendation
} from '@/services/aiRecommendationService'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'nutrition' | 'activity' | 'health'
type PriorityFilter = 'all' | 'high' | 'medium' | 'low'

export const RecommendationsPage: React.FC = () => {
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [recommendations, setRecommendations] = useState<RecommendationPackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<Set<string>>(new Set())
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set())

  const { pets } = usePetStore()

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0]._id)
    }
  }, [pets, selectedPetId])

  useEffect(() => {
    if (selectedPetId) {
      generateRecommendations()
    }
  }, [selectedPetId])

  const generateRecommendations = async () => {
    if (!selectedPetId) return

    setLoading(true)
    setError(null)

    try {
      const result = await aiRecommendationService.generateRecommendations(selectedPetId)
      setRecommendations(result)
    } catch (err) {
      setError('Erro ao gerar recomendações. Tente novamente.')
      console.error('Erro ao gerar recomendações:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRecommendation = (id: string) => {
    setAcceptedRecommendations(prev => new Set([...prev, id]))
    // Aqui você poderia salvar no backend ou localStorage
    console.log('Recomendação aceita:', id)
  }

  const handleDismissRecommendation = (id: string) => {
    setDismissedRecommendations(prev => new Set([...prev, id]))
    // Aqui você poderia salvar no backend ou localStorage
    console.log('Recomendação dispensada:', id)
  }

  const handleOpenProduct = (url: string) => {
    // Integração com WebView ou redirecionamento
    const fullUrl = `https://oipetcomidadeverdade.com.br${url}`
    window.open(fullUrl, '_blank')
  }

  const getFilteredRecommendations = () => {
    if (!recommendations) return []

    let allRecommendations: (NutritionRecommendation | ActivityRecommendation | HealthRecommendation)[] = []

    if (filter === 'all' || filter === 'nutrition') {
      allRecommendations.push(...recommendations.nutrition)
    }
    if (filter === 'all' || filter === 'activity') {
      allRecommendations.push(...recommendations.activity)
    }
    if (filter === 'all' || filter === 'health') {
      allRecommendations.push(...recommendations.health)
    }

    // Filtrar por prioridade
    if (priorityFilter !== 'all') {
      allRecommendations = allRecommendations.filter(rec => {
        if ('priority' in rec) {
          return rec.priority === priorityFilter
        }
        if ('urgency' in rec) {
          const urgencyMap = { immediate: 'high', soon: 'medium', routine: 'low' }
          return urgencyMap[rec.urgency] === priorityFilter
        }
        return false
      })
    }

    // Remover recomendações aceitas ou dispensadas
    return allRecommendations.filter(rec => 
      !acceptedRecommendations.has(rec.id) && !dismissedRecommendations.has(rec.id)
    )
  }

  const selectedPet = pets.find(p => p._id === selectedPetId)
  const filteredRecommendations = getFilteredRecommendations()

  const getFilterCount = (filterType: FilterType) => {
    if (!recommendations) return 0
    switch (filterType) {
      case 'nutrition': return recommendations.nutrition.length
      case 'activity': return recommendations.activity.length
      case 'health': return recommendations.health.length
      case 'all': return recommendations.nutrition.length + recommendations.activity.length + recommendations.health.length
      default: return 0
    }
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <SparklesSolid className="h-8 w-8 text-coral-500 mr-3" />
              Recomendações IA
            </h1>
            <p className="text-gray-600 mt-1">
              Sugestões personalizadas baseadas nos dados de saúde do seu pet
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateRecommendations}
            disabled={loading || !selectedPetId}
            className="flex items-center space-x-2 bg-coral-500 text-white px-6 py-3 rounded-glass hover:bg-coral-600 transition-colors disabled:bg-gray-400"
          >
            <ArrowPathIcon className={cn('h-5 w-5', loading && 'animate-spin')} />
            <span>{loading ? 'Analisando...' : 'Atualizar'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Pet Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selecionar Pet
              </h2>
              <p className="text-gray-600">
                Escolha o pet para receber recomendações personalizadas
              </p>
            </div>
            
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent text-lg font-medium"
            >
              <option value="">Selecione um pet</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>
          </div>
        </GlassCard>
      </motion.div>

      {/* Summary Cards */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Recomendações</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.summary.totalRecommendations}</p>
                </div>
                <div className="p-3 bg-coral-100 text-coral-600 rounded-glass">
                  <LightBulbIcon className="h-6 w-6" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alta Prioridade</p>
                  <p className="text-2xl font-bold text-red-600">{recommendations.summary.highPriorityCount}</p>
                </div>
                <div className="p-3 bg-red-100 text-red-600 rounded-glass">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tempo Implementação</p>
                  <p className="text-2xl font-bold text-blue-600">{recommendations.summary.estimatedImplementationTime}</p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-glass">
                  <ClockIcon className="h-6 w-6" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aceitas</p>
                  <p className="text-2xl font-bold text-green-600">{acceptedRecommendations.size}</p>
                </div>
                <div className="p-3 bg-green-100 text-green-600 rounded-glass">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
              </div>
            </GlassWidget>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-teal-500 mr-2" />
              Insights Personalizados
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Trends */}
              {recommendations.insights.healthTrends.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <HeartSolid className="h-5 w-5 text-red-500 mr-2" />
                    Tendências de Saúde
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.insights.healthTrends.map((trend, index) => (
                      <li key={index} className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Areas */}
              {recommendations.insights.improvementAreas.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-orange-500 mr-2" />
                    Áreas de Melhoria
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.insights.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Filters */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FunnelIcon className="h-6 w-6 text-gray-600 mr-2" />
                  Filtros
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredRecommendations.length} de {recommendations.summary.totalRecommendations} recomendações
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Type filters */}
                {(['all', 'nutrition', 'activity', 'health'] as FilterType[]).map((filterType) => (
                  <motion.button
                    key={filterType}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(filterType)}
                    className={cn(
                      'px-4 py-2 rounded-glass border transition-all text-sm font-medium',
                      filter === filterType
                        ? 'bg-coral-500 text-white border-coral-500'
                        : 'bg-white/50 text-gray-700 border-gray-200 hover:bg-white/70'
                    )}
                  >
                    {filterType === 'all' ? 'Todas' : 
                     filterType === 'nutrition' ? 'Nutrição' :
                     filterType === 'activity' ? 'Atividade' : 'Saúde'}
                    <span className="ml-2 text-xs bg-black/10 px-2 py-1 rounded-full">
                      {getFilterCount(filterType)}
                    </span>
                  </motion.button>
                ))}

                {/* Priority filters */}
                <div className="border-l border-gray-200 pl-3">
                  {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((priority) => (
                    <motion.button
                      key={priority}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriorityFilter(priority)}
                      className={cn(
                        'px-3 py-1 rounded-glass text-xs font-medium mr-2 transition-all',
                        priorityFilter === priority
                          ? priority === 'high' ? 'bg-red-500 text-white' :
                            priority === 'medium' ? 'bg-orange-500 text-white' :
                            priority === 'low' ? 'bg-gray-500 text-white' :
                            'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {priority === 'all' ? 'Todas' : 
                       priority === 'high' ? 'Alta' :
                       priority === 'medium' ? 'Média' : 'Baixa'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Analisando dados de saúde e gerando recomendações personalizadas...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="border border-red-200 bg-red-50">
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao Gerar Recomendações</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRecommendations}
                className="bg-red-500 text-white px-6 py-2 rounded-glass hover:bg-red-600 transition-colors"
              >
                Tentar Novamente
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Recommendations List */}
      {filteredRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recomendações para {selectedPet?.name}
            </h2>
            
            <div className="space-y-6">
              <AnimatePresence>
                {filteredRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAccept={handleAcceptRecommendation}
                    onDismiss={handleDismissRecommendation}
                    onOpenProduct={handleOpenProduct}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && recommendations && filteredRecommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma recomendação encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Todas as recomendações foram aceitas ou dispensadas, ou os filtros não encontraram resultados.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFilter('all')
                setPriorityFilter('all')
              }}
              className="bg-coral-500 text-white px-6 py-2 rounded-glass hover:bg-coral-600 transition-colors"
            >
              Limpar Filtros
            </motion.button>
          </GlassCard>
        </motion.div>
      )}

      {/* No Pet Selected */}
      {!selectedPetId && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="text-center py-12">
            <SparklesSolid className="h-16 w-16 text-coral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um Pet
            </h3>
            <p className="text-gray-600">
              Escolha um pet para receber recomendações personalizadas baseadas em IA
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}