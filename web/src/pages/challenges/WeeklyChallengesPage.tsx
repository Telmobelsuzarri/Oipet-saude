import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrophyIcon,
  FireIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import { GlassCard } from '@/components/ui/GlassContainer'
import { challengeService } from '@/services/challengeService'
import { useAuthStore } from '@/stores/authStore'
import { usePetStore } from '@/stores/petStore'
import {
  WeeklyChallenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
  UserChallengeParticipation,
  RewardType
} from '@/types/challenges'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const WeeklyChallengesPage: React.FC = () => {
  const { user } = useAuthStore()
  const { pets } = usePetStore()
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([])
  const [userChallenges, setUserChallenges] = useState<UserChallengeParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all')
  const [weeklyStats, setWeeklyStats] = useState({
    activeChallenges: 0,
    completedThisWeek: 0,
    totalXPEarned: 0,
    currentStreak: 0
  })

  useEffect(() => {
    if (user) {
      loadChallenges()
      loadWeeklyStats()
    }
  }, [user])

  const loadChallenges = async () => {
    setLoading(true)
    try {
      const [activeChallenges, userParticipations] = await Promise.all([
        challengeService.getActiveChallenges(),
        challengeService.getUserChallenges(user!.id)
      ])
      
      setChallenges(activeChallenges)
      setUserChallenges(userParticipations)
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWeeklyStats = async () => {
    try {
      const stats = await challengeService.getWeeklyStats(user!.id)
      setWeeklyStats(stats)
    } catch (error) {
      console.error('Error loading weekly stats:', error)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const activePet = pets.length > 0 ? pets[0] : undefined
      await challengeService.joinChallenge(user!.id, challengeId, activePet?._id)
      await loadChallenges()
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }

  const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
    switch (difficulty) {
      case ChallengeDifficulty.EASY: return 'text-green-600 bg-green-100'
      case ChallengeDifficulty.MEDIUM: return 'text-yellow-600 bg-yellow-100'
      case ChallengeDifficulty.HARD: return 'text-orange-600 bg-orange-100'
      case ChallengeDifficulty.EXPERT: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: ChallengeCategory) => {
    switch (category) {
      case ChallengeCategory.HEALTH: return '🏥'
      case ChallengeCategory.FEEDING: return '🍽️'
      case ChallengeCategory.EXERCISE: return '🏃'
      case ChallengeCategory.CARE: return '💝'
      case ChallengeCategory.SOCIAL: return '👥'
      case ChallengeCategory.LEARNING: return '📚'
      default: return '🎯'
    }
  }

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.ACTIVE: return 'text-green-600 bg-green-100'
      case ChallengeStatus.UPCOMING: return 'text-blue-600 bg-blue-100'
      case ChallengeStatus.COMPLETED: return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUserParticipation = (challengeId: string) => {
    return userChallenges.find(uc => uc.challengeId === challengeId)
  }

  const filteredChallenges = selectedCategory === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <TrophyIcon className="h-8 w-8 mr-3 text-coral-500" />
            Desafios Semanais
          </h1>
          <p className="text-gray-600">
            Complete desafios e ganhe XP, badges e recompensas especiais!
          </p>
        </motion.div>

        {/* Weekly Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <FireIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.activeChallenges}</p>
              <p className="text-sm text-gray-600">Desafios Ativos</p>
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.completedThisWeek}</p>
              <p className="text-sm text-gray-600">Completados</p>
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <StarIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalXPEarned}</p>
              <p className="text-sm text-gray-600">XP Ganho</p>
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <TrophyIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.currentStreak}</p>
              <p className="text-sm text-gray-600">Sequência</p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-glass transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-coral-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              }`}
            >
              Todos
            </motion.button>
            {Object.values(ChallengeCategory).map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-glass transition-colors flex items-center space-x-2 ${
                  selectedCategory === category
                    ? 'bg-coral-500 text-white'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                <span>{getCategoryIcon(category)}</span>
                <span className="capitalize">{category}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => {
            const participation = getUserParticipation(challenge.id)
            const isParticipating = !!participation
            const daysLeft = differenceInDays(challenge.endDate, new Date())
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{challenge.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                              {challenge.status === ChallengeStatus.ACTIVE ? 'ATIVO' : 
                               challenge.status === ChallengeStatus.UPCOMING ? 'EM BREVE' : 'COMPLETO'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-lg">{getCategoryIcon(challenge.category)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

                    {/* Progress Bar (if participating) */}
                    {isParticipating && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-semibold">{participation.progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-coral-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${participation.progress.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>{participation.progress.current} / {participation.progress.target}</span>
                          <span>{participation.completedMilestones.length} marcos alcançados</span>
                        </div>
                      </div>
                    )}

                    {/* Rewards */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <GiftIcon className="h-4 w-4 mr-1" />
                        Recompensas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {challenge.rewards.map((reward, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center"
                          >
                            {reward.type === RewardType.XP && '⭐'}
                            {reward.type === RewardType.BADGE && '🏆'}
                            {reward.type === RewardType.COINS && '💰'}
                            <span className="ml-1">
                              {reward.amount} {reward.type === RewardType.XP ? 'XP' : 
                                           reward.type === RewardType.COINS ? 'moedas' : 'badge'}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {challenge.participants}
                        </span>
                        <span className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {challenge.completions} completos
                        </span>
                      </div>
                      {challenge.status === ChallengeStatus.ACTIVE && (
                        <span className="flex items-center text-orange-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {daysLeft}d restantes
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      {challenge.status === ChallengeStatus.UPCOMING ? (
                        <button
                          disabled
                          className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-glass cursor-not-allowed"
                        >
                          Em Breve
                        </button>
                      ) : isParticipating ? (
                        <div className="flex items-center justify-center py-2 px-4 bg-green-100 text-green-700 rounded-glass">
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Participando
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="w-full py-2 px-4 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors flex items-center justify-center"
                        >
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Participar
                        </motion.button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedCategory === 'all' 
                ? 'Nenhum desafio disponível no momento.'
                : `Nenhum desafio de ${selectedCategory} disponível.`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}