import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrophyIcon, 
  ArrowRightIcon,
  FireIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

import { GlassCard } from '@/components/ui/GlassContainer'
import { challengeService } from '@/services/challengeService'
import { useAuthStore } from '@/stores/authStore'
import { WeeklyChallenge, UserChallengeParticipation, ChallengeStatus } from '@/types/challenges'

export const ChallengesWidget: React.FC = () => {
  const { user } = useAuthStore()
  const [activeChallenges, setActiveChallenges] = useState<WeeklyChallenge[]>([])
  const [userParticipations, setUserParticipations] = useState<UserChallengeParticipation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadChallengesData()
    }
  }, [user])

  const loadChallengesData = async () => {
    if (!user) return

    try {
      const [challenges, participations] = await Promise.all([
        challengeService.getActiveChallenges(),
        challengeService.getUserChallenges(user.id)
      ])

      // Filter only active challenges and get top 3
      const activeOnly = challenges
        .filter(c => c.status === ChallengeStatus.ACTIVE)
        .slice(0, 3)
      
      setActiveChallenges(activeOnly)
      setUserParticipations(participations)
    } catch (error) {
      console.error('Error loading challenges data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserParticipation = (challengeId: string) => {
    return userParticipations.find(up => up.challengeId === challengeId)
  }

  const getCategoryIcon = (challenge: WeeklyChallenge) => {
    return challenge.icon || '🎯'
  }

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </GlassCard>
    )
  }

  if (activeChallenges.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sem Desafios Ativos</h3>
        <p className="text-gray-600 text-sm mb-4">
          Nenhum desafio disponível no momento
        </p>
        <Link
          to="/app/challenges"
          className="inline-flex items-center text-coral-600 hover:text-coral-700 font-medium text-sm"
        >
          Ver todos os desafios
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrophyIcon className="h-6 w-6 text-coral-500" />
          <h3 className="text-lg font-semibold text-gray-900">Desafios Ativos</h3>
        </div>
        <Link
          to="/app/challenges"
          className="text-coral-600 hover:text-coral-700 text-sm font-medium flex items-center"
        >
          Ver todos
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-3">
        {activeChallenges.map((challenge, index) => {
          const participation = getUserParticipation(challenge.id)
          const isParticipating = !!participation
          const progress = participation?.progress.percentage || 0

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/30 rounded-glass p-4 border border-white/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(challenge)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                {isParticipating && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{progress}%</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isParticipating && (
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-coral-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {participation.progress.current} / {participation.progress.target}
                    </span>
                    <span>{participation.completedMilestones.length} marcos</span>
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <FireIcon className="h-3 w-3" />
                    <span>{challenge.participants} participantes</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {challenge.rewards.map((reward, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                    >
                      {reward.type === 'xp' && '⭐'}
                      {reward.type === 'badge' && '🏆'}
                      {reward.type === 'coins' && '💰'}
                      {reward.amount}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <Link
          to="/app/challenges"
          className="w-full bg-coral-500 hover:bg-coral-600 text-white text-center py-2 px-4 rounded-glass transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <TrophyIcon className="h-4 w-4" />
          <span>Explorar Desafios</span>
        </Link>
      </div>
    </GlassCard>
  )
}