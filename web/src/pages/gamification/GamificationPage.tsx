import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  GiftIcon,
  ChevronRightIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { 
  TrophyIcon as TrophySolidIcon,
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { ChallengeCard } from '@/components/gamification/ChallengeCard'
import { StreakWidget } from '@/components/gamification/StreakWidget'
import { LevelProgress } from '@/components/gamification/LevelProgress'
import { gamificationService, type UserGameProfile, type Challenge } from '@/services/gamificationService'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'overview', name: 'Visão Geral', icon: ChartBarIcon },
  { id: 'achievements', name: 'Conquistas', icon: TrophyIcon },
  { id: 'challenges', name: 'Desafios', icon: StarIcon },
  { id: 'streaks', name: 'Sequências', icon: FireIcon },
  { id: 'leaderboard', name: 'Ranking', icon: UserGroupIcon }
]

export const GamificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [userProfile, setUserProfile] = useState<UserGameProfile | null>(null)
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    loadUserProfile()
    loadChallenges()
  }, [])

  const loadUserProfile = async () => {
    if (!user?._id) return
    
    try {
      const profile = await gamificationService.getUserGameProfile(user._id)
      setUserProfile(profile)
    } catch (error) {
      console.error('Erro ao carregar perfil de gamificação:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChallenges = async () => {
    if (!user?._id) return
    
    try {
      const challenges = await gamificationService.getAvailableChallenges(user._id)
      setAvailableChallenges(challenges)
    } catch (error) {
      console.error('Erro ao carregar desafios:', error)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?._id) return
    
    try {
      await gamificationService.joinChallenge(user._id, challengeId)
      loadChallenges()
      loadUserProfile()
    } catch (error) {
      console.error('Erro ao participar do desafio:', error)
    }
  }

  const renderOverview = () => {
    if (!userProfile) return null

    const healthScore = gamificationService.calculateHealthScore(userProfile.stats)

    return (
      <div className="space-y-8">
        {/* Level and XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LevelProgress level={userProfile.level} />
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pontos Totais</p>
                  <p className="text-2xl font-bold text-coral-600">
                    {gamificationService.formatPoints(userProfile.totalPoints)}
                  </p>
                </div>
                <div className="p-3 bg-coral-100 rounded-glass">
                  <GiftIcon className="h-6 w-6 text-coral-600" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Score de Saúde</p>
                  <p className="text-2xl font-bold text-green-600">
                    {healthScore}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-glass">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conquistas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userProfile.achievements.filter(a => a.unlockedAt).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-glass">
                  <TrophySolidIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dias Ativos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userProfile.stats.daysActive}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-glass">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </GlassWidget>
          </div>
        </motion.div>

        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sequências Ativas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {userProfile.streaks.map((streak) => (
              <StreakWidget key={streak.type} streak={streak} />
            ))}
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Conquistas Recentes</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('achievements')}
              className="text-coral-600 hover:text-coral-700 font-medium flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ChevronRightIcon className="h-4 w-4" />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProfile.achievements
              .filter(a => a.unlockedAt)
              .slice(0, 3)
              .map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={true}
                />
              ))}
          </div>
        </motion.div>
      </div>
    )
  }

  const renderAchievements = () => {
    if (!userProfile) return null

    const unlockedAchievements = userProfile.achievements.filter(a => a.unlockedAt)
    const lockedAchievements = userProfile.achievements.filter(a => !a.unlockedAt)

    return (
      <div className="space-y-8">
        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Progresso das Conquistas
                </h3>
                <p className="text-gray-600">
                  {unlockedAchievements.length} de {userProfile.achievements.length} conquistadas
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((unlockedAchievements.length / userProfile.achievements.length) * 100)}%
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-coral-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(unlockedAchievements.length / userProfile.achievements.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <span>Conquistas Desbloqueadas</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={true}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <LockClosedIcon className="h-6 w-6 text-gray-400" />
              <span>Conquistas em Progresso</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={false}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderChallenges = () => {
    if (!userProfile) return null

    return (
      <div className="space-y-8">
        {/* Active Challenges */}
        {userProfile.activeChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Desafios Ativos
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userProfile.activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isActive={true}
                  onJoin={() => handleJoinChallenge(challenge.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Desafios Disponíveis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isActive={false}
                onJoin={() => handleJoinChallenge(challenge.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Completed Challenges */}
        {userProfile.completedChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Desafios Concluídos
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userProfile.completedChallenges.slice(0, 4).map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isActive={false}
                  isCompleted={true}
                  onJoin={() => {}}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'achievements':
        return renderAchievements()
      case 'challenges':
        return renderChallenges()
      case 'streaks':
        return renderOverview() // Simplified for now
      case 'leaderboard':
        return (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ranking em Breve
            </h3>
            <p className="text-gray-600">
              Compare seu progresso com outros tutores
            </p>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral-500 border-t-transparent" />
      </div>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">
              Gamificação 🎮
            </h1>
            <p className="text-gray-600 mt-1">
              Conquiste badges e suba de nível cuidando dos seus pets
            </p>
          </div>
          
          {userProfile && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Nível Atual</div>
              <div className="text-2xl font-bold text-coral-600">
                {userProfile.level.currentLevel}
              </div>
              <div className="text-sm text-gray-600">
                {userProfile.level.title}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard>
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-3 rounded-glass font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-coral-500 text-white'
                    : 'text-gray-700 hover:bg-white/50'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  )
}