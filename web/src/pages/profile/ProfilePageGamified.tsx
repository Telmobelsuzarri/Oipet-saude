import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrophyIcon,
  FireIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
  CameraIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { TrophyIcon as TrophySolid } from '@heroicons/react/24/solid'

import { GlassCard, GlassContainer } from '@/components/ui/GlassContainer'
import { useAuthStore } from '@/stores/authStore'
import { usePetStore } from '@/stores/petStore'
import { gamificationService, Achievement, Challenge, UserGameProfile } from '@/services/gamificationService'

const LevelProgressBar: React.FC<{ 
  level: number
  currentXP: number
  requiredXP: number
  totalXP: number
  title: string
}> = ({ level, currentXP, requiredXP, totalXP, title }) => {
  const progress = (currentXP / requiredXP) * 100

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Nível {level}</h3>
          <p className="text-coral-600 font-medium">{title}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">XP Total</div>
          <div className="text-xl font-bold text-gray-900">{totalXP.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{currentXP} XP</span>
          <span>{requiredXP} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-coral-500 to-coral-600 h-4 rounded-full relative overflow-hidden max-w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        {requiredXP - currentXP} XP para o próximo nível
      </div>
    </GlassCard>
  )
}

const AchievementCard: React.FC<{ 
  achievement: Achievement
  isUnlocked: boolean
}> = ({ achievement, isUnlocked }) => {
  const getRarityStyles = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50'
      case 'rare':
        return 'border-blue-300 bg-blue-50'
      case 'epic':
        return 'border-purple-300 bg-purple-50'
      case 'legendary':
        return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityTextColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600'
      case 'rare': return 'text-blue-600'
      case 'epic': return 'text-purple-600'
      case 'legendary': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        p-4 rounded-lg border-2 transition-all duration-200
        ${getRarityStyles(achievement.rarity)}
        ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}
      `}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{achievement.icon}</div>
        <h4 className={`font-semibold ${getRarityTextColor(achievement.rarity)}`}>
          {achievement.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          {achievement.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {achievement.rarity}
          </span>
          <div className="flex items-center space-x-1 text-coral-600">
            <TrophySolid className="h-4 w-4" />
            <span className="text-sm font-medium">{achievement.points}</span>
          </div>
        </div>
        
        {achievement.progress && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-coral-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {achievement.progress.current}/{achievement.progress.target}
            </div>
          </div>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-green-600">
            Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ChallengeCard: React.FC<{ 
  challenge: Challenge
  onClaim?: (challengeId: string) => void
}> = ({ challenge, onClaim }) => {
  const progress = (challenge.progress / challenge.target) * 100
  const isCompleted = challenge.progress >= challenge.target
  
  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return 'bg-orange-100 text-orange-800'
      case 'weekly': return 'bg-blue-100 text-blue-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{challenge.icon}</div>
          <div>
            <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
          {challenge.type === 'daily' ? 'Diário' : 
           challenge.type === 'weekly' ? 'Semanal' : 'Mensal'}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progresso</span>
          <span>{challenge.progress}/{challenge.target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-coral-500'}`}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1 text-blue-600">
            <StarIcon className="h-4 w-4" />
            <span>{challenge.reward.xp} XP</span>
          </div>
          <div className="flex items-center space-x-1 text-coral-600">
            <TrophySolid className="h-4 w-4" />
            <span>{challenge.reward.points} pts</span>
          </div>
          {challenge.participants && (
            <div className="text-gray-500">
              {challenge.participants} participando
            </div>
          )}
        </div>
        
        {isCompleted && !challenge.isCompleted && onClaim && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClaim(challenge.id)}
            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600"
          >
            Resgatar
          </motion.button>
        )}
        
        {challenge.isCompleted && (
          <div className="text-green-600 text-sm font-medium">
            ✅ Concluído
          </div>
        )}
      </div>
    </GlassCard>
  )
}

const StatsCard: React.FC<{
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
}> = ({ title, value, icon, color }) => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-glass ${color}`}>
        {icon}
      </div>
    </div>
  </GlassCard>
)

export const ProfilePageGamified: React.FC = () => {
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null)
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  
  const { user } = useAuthStore()
  const { pets } = usePetStore()

  useEffect(() => {
    if (user) {
      loadGameProfile()
      loadChallenges()
    }
  }, [user])

  const loadGameProfile = async () => {
    if (!user) return
    
    try {
      const profile = await gamificationService.getUserGameProfile(user.id)
      setGameProfile(profile)
    } catch (error) {
      console.error('Error loading game profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChallenges = async () => {
    if (!user) return
    
    try {
      const challenges = await gamificationService.getAvailableChallenges(user.id)
      setActiveChallenges(challenges)
    } catch (error) {
      console.error('Error loading challenges:', error)
    }
  }

  const handleClaimChallenge = async (challengeId: string) => {
    if (!user) return
    
    try {
      const result = await gamificationService.completeChallenge(user.id, challengeId)
      if (result.success) {
        // Show success notification
        console.log('Challenge completed!', result.rewards)
        // Reload data
        await loadGameProfile()
        await loadChallenges()
      }
    } catch (error) {
      console.error('Error claiming challenge:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  if (!gameProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Erro ao carregar perfil de gamificação</p>
      </div>
    )
  }

  const unlockedAchievements = gameProfile.achievements.filter(a => a.unlockedAt)
  const lockedAchievements = gameProfile.achievements.filter(a => !a.unlockedAt)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <TrophyIcon className="h-10 w-10 text-coral-500" />
          <h1 className="text-3xl font-bold text-gray-900">Perfil Gamificado</h1>
        </div>
        <p className="text-gray-600">
          Acompanhe seu progresso e conquiste novos níveis cuidando do seu pet!
        </p>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LevelProgressBar
          level={gameProfile.level.currentLevel}
          currentXP={gameProfile.level.currentXP}
          requiredXP={gameProfile.level.xpToNextLevel}
          totalXP={gameProfile.level.totalXP}
          title={gameProfile.level.title}
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Pontos"
            value={gameProfile.totalPoints.toLocaleString()}
            icon={<TrophyIcon className="h-6 w-6" />}
            color="bg-coral-100 text-coral-600"
          />
          <StatsCard
            title="Conquistas"
            value={`${unlockedAchievements.length}/${gameProfile.achievements.length}`}
            icon={<StarIcon className="h-6 w-6" />}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatsCard
            title="Sequência Atual"
            value={`${gameProfile.streaks[0]?.current || 0} dias`}
            icon={<FireIcon className="h-6 w-6" />}
            color="bg-orange-100 text-orange-600"
          />
          <StatsCard
            title="Desafios Concluídos"
            value={gameProfile.completedChallenges.length}
            icon={<ChartBarIcon className="h-6 w-6" />}
            color="bg-green-100 text-green-600"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/20 p-1 rounded-glass">
        {[
          { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
          { id: 'achievements', label: 'Conquistas', icon: TrophyIcon },
          { id: 'challenges', label: 'Desafios', icon: CalendarIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-glass transition-all
              ${activeTab === tab.id 
                ? 'bg-white text-coral-600 shadow-glass-lg' 
                : 'text-gray-600 hover:bg-white/30'
              }
            `}
          >
            <tab.icon className="h-5 w-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                  <HeartIcon className="h-8 w-8 text-coral-500" />
                  <div>
                    <div className="font-medium">Registros de Saúde</div>
                    <div className="text-2xl font-bold text-gray-900">{gameProfile.stats.totalHealthRecords}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                  <CameraIcon className="h-8 w-8 text-teal-500" />
                  <div>
                    <div className="font-medium">Fotos de Alimentos</div>
                    <div className="text-2xl font-bold text-gray-900">{gameProfile.stats.totalFoodScans}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium">Atividades</div>
                    <div className="text-2xl font-bold text-gray-900">{gameProfile.stats.totalActivities}</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Streaks */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sequências</h3>
              <div className="space-y-4">
                {gameProfile.streaks.map(streak => (
                  <div key={streak.type} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {gamificationService.getStreakIcon(streak.type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {streak.type === 'daily_check' ? 'Check-ins Diários' :
                           streak.type === 'weekly_weigh' ? 'Pesagens Semanais' : 'Atividades'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Melhor sequência: {streak.best} dias
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-coral-600">{streak.current}</div>
                      <div className="text-sm text-gray-600">dias</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Conquistas Desbloqueadas ({unlockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unlockedAchievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Próximas Conquistas ({lockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {lockedAchievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Active Challenges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Desafios Ativos ({activeChallenges.filter(c => !c.isCompleted).length})
              </h3>
              <div className="space-y-4">
                {activeChallenges
                  .filter(c => !c.isCompleted)
                  .map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClaim={handleClaimChallenge}
                    />
                  ))}
              </div>
            </div>

            {/* Completed Challenges */}
            {gameProfile.completedChallenges.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Desafios Concluídos ({gameProfile.completedChallenges.length})
                </h3>
                <div className="space-y-4">
                  {gameProfile.completedChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}