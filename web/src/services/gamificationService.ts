export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'health' | 'activity' | 'consistency' | 'social' | 'special'
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
  progress?: {
    current: number
    target: number
  }
  requirements: {
    type: 'weight_records' | 'activity_days' | 'consecutive_days' | 'total_activities' | 'scan_foods' | 'pet_registration' | 'health_score'
    value: number
    period?: 'daily' | 'weekly' | 'monthly' | 'total'
  }[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: string
  achievementId: string
}

export interface Streak {
  type: 'daily_check' | 'weekly_weigh' | 'activity_log'
  current: number
  best: number
  lastUpdate: string
}

export interface LevelSystem {
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  title: string
  benefits: string[]
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'event'
  category: 'health' | 'activity' | 'nutrition' | 'social'
  target: number
  progress: number
  reward: {
    xp: number
    badge?: string
    points: number
  }
  startDate: string
  endDate: string
  isCompleted: boolean
  participants?: number
}

export interface UserGameProfile {
  userId: string
  level: LevelSystem
  totalPoints: number
  achievements: Achievement[]
  badges: Badge[]
  streaks: Streak[]
  activeChallenges: Challenge[]
  completedChallenges: Challenge[]
  stats: {
    totalActivities: number
    totalWeighIns: number
    totalHealthRecords: number
    totalFoodScans: number
    daysActive: number
    consecutiveDays: number
  }
}

// Mock achievements database
const mockAchievements: Achievement[] = [
  {
    id: 'first_pet',
    title: 'Primeiro Amigo',
    description: 'Cadastre seu primeiro pet',
    icon: '🐾',
    category: 'health',
    points: 100,
    rarity: 'common',
    requirements: [
      { type: 'pet_registration', value: 1 }
    ]
  },
  {
    id: 'weight_warrior',
    title: 'Guerreiro do Peso',
    description: 'Registre o peso do seu pet 10 vezes',
    icon: '⚖️',
    category: 'health',
    points: 250,
    rarity: 'common',
    requirements: [
      { type: 'weight_records', value: 10 }
    ]
  },
  {
    id: 'activity_enthusiast',
    title: 'Entusiasta de Atividades',
    description: 'Complete 50 atividades físicas',
    icon: '🏃',
    category: 'activity',
    points: 500,
    rarity: 'rare',
    requirements: [
      { type: 'total_activities', value: 50 }
    ]
  },
  {
    id: 'consistent_carer',
    title: 'Cuidador Consistente',
    description: 'Faça check-ins diários por 7 dias seguidos',
    icon: '📅',
    category: 'consistency',
    points: 300,
    rarity: 'rare',
    requirements: [
      { type: 'consecutive_days', value: 7 }
    ]
  },
  {
    id: 'food_scanner_pro',
    title: 'Scanner Profissional',
    description: 'Escaneie 25 alimentos diferentes',
    icon: '📸',
    category: 'health',
    points: 400,
    rarity: 'rare',
    requirements: [
      { type: 'scan_foods', value: 25 }
    ]
  },
  {
    id: 'health_master',
    title: 'Mestre da Saúde',
    description: 'Mantenha score de saúde acima de 90%',
    icon: '👑',
    category: 'health',
    points: 1000,
    rarity: 'epic',
    requirements: [
      { type: 'health_score', value: 90 }
    ]
  },
  {
    id: 'legend',
    title: 'Lenda OiPet',
    description: 'Complete 100 dias de atividade consecutiva',
    icon: '🏆',
    category: 'consistency',
    points: 2000,
    rarity: 'legendary',
    requirements: [
      { type: 'consecutive_days', value: 100 }
    ]
  }
]

// Mock challenges database
const mockChallenges: Challenge[] = [
  {
    id: 'daily_walk',
    title: 'Caminhada Diária',
    description: 'Registre uma caminhada hoje',
    type: 'daily',
    category: 'activity',
    target: 1,
    progress: 0,
    reward: { xp: 50, points: 25 },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  },
  {
    id: 'weekly_weigh',
    title: 'Pesagem Semanal',
    description: 'Registre o peso do seu pet 3 vezes esta semana',
    type: 'weekly',
    category: 'health',
    target: 3,
    progress: 1,
    reward: { xp: 200, points: 100, badge: 'weight_tracker' },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false,
    participants: 157
  },
  {
    id: 'monthly_explorer',
    title: 'Explorador Mensal',
    description: 'Complete 20 atividades diferentes este mês',
    type: 'monthly',
    category: 'activity',
    target: 20,
    progress: 8,
    reward: { xp: 500, points: 250, badge: 'explorer' },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false,
    participants: 89
  }
]

class GamificationService {
  private readonly API_DELAY = 800

  async getUserGameProfile(userId: string): Promise<UserGameProfile> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))

    // Mock user profile
    const mockProfile: UserGameProfile = {
      userId,
      level: {
        currentLevel: 8,
        currentXP: 1450,
        xpToNextLevel: 550,
        totalXP: 3450,
        title: 'Cuidador Experiente',
        benefits: [
          'Acesso a relatórios avançados',
          'Personalização de notificações',
          'Prioridade no suporte'
        ]
      },
      totalPoints: 2750,
      achievements: mockAchievements.map(achievement => ({
        ...achievement,
        unlockedAt: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        progress: achievement.unlockedAt ? undefined : {
          current: Math.floor(achievement.requirements[0].value * Math.random()),
          target: achievement.requirements[0].value
        }
      })),
      badges: [
        {
          id: 'early_adopter',
          name: 'Adotante Precoce',
          description: 'Um dos primeiros 100 usuários',
          icon: '🌟',
          color: 'gold',
          earnedAt: '2025-01-10T10:00:00Z',
          achievementId: 'first_pet'
        },
        {
          id: 'consistent_week',
          name: 'Semana Consistente',
          description: 'Check-ins diários por uma semana',
          icon: '📅',
          color: 'blue',
          earnedAt: '2025-01-12T15:30:00Z',
          achievementId: 'consistent_carer'
        }
      ],
      streaks: [
        {
          type: 'daily_check',
          current: 5,
          best: 12,
          lastUpdate: new Date().toISOString()
        },
        {
          type: 'weekly_weigh',
          current: 3,
          best: 8,
          lastUpdate: new Date().toISOString()
        },
        {
          type: 'activity_log',
          current: 2,
          best: 15,
          lastUpdate: new Date().toISOString()
        }
      ],
      activeChallenges: mockChallenges.filter(c => !c.isCompleted),
      completedChallenges: [
        {
          ...mockChallenges[0],
          id: 'completed_daily_walk',
          title: 'Caminhada de Ontem',
          isCompleted: true,
          progress: 1
        }
      ],
      stats: {
        totalActivities: 34,
        totalWeighIns: 15,
        totalHealthRecords: 28,
        totalFoodScans: 12,
        daysActive: 25,
        consecutiveDays: 5
      }
    }

    return mockProfile
  }

  async getAvailableChallenges(userId: string): Promise<Challenge[]> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    return mockChallenges
  }

  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    return true
  }

  async completeChallenge(userId: string, challengeId: string): Promise<{
    success: boolean
    rewards: { xp: number; points: number; badge?: string }
  }> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    
    const challenge = mockChallenges.find(c => c.id === challengeId)
    if (!challenge) {
      return { success: false, rewards: { xp: 0, points: 0 } }
    }

    return {
      success: true,
      rewards: challenge.reward
    }
  }

  async checkAchievements(userId: string, action: {
    type: 'weight_record' | 'activity_complete' | 'food_scan' | 'daily_checkin' | 'pet_register'
    data?: any
  }): Promise<Achievement[]> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    
    // Mock achievement checking logic
    const newAchievements: Achievement[] = []
    
    // Simulate chance of unlocking achievement
    if (Math.random() > 0.8) {
      const unlockedAchievement = mockAchievements.find(a => a.id === 'weight_warrior')
      if (unlockedAchievement) {
        newAchievements.push({
          ...unlockedAchievement,
          unlockedAt: new Date().toISOString()
        })
      }
    }

    return newAchievements
  }

  async updateStreak(userId: string, streakType: Streak['type']): Promise<Streak> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    
    return {
      type: streakType,
      current: Math.floor(Math.random() * 10) + 1,
      best: Math.floor(Math.random() * 20) + 5,
      lastUpdate: new Date().toISOString()
    }
  }

  // Utility methods
  getLevelTitle(level: number): string {
    if (level >= 50) return 'Mestre OiPet'
    if (level >= 25) return 'Especialista em Pets'
    if (level >= 15) return 'Cuidador Experiente'
    if (level >= 10) return 'Tutor Dedicado'
    if (level >= 5) return 'Amigo dos Animais'
    return 'Iniciante'
  }

  getXPForLevel(level: number): number {
    return level * 200 + Math.floor(level / 5) * 100
  }

  getRarityColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common': return 'text-gray-600'
      case 'rare': return 'text-blue-600'
      case 'epic': return 'text-purple-600'
      case 'legendary': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  getRarityBorder(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common': return 'border-gray-300'
      case 'rare': return 'border-blue-300'
      case 'epic': return 'border-purple-300'
      case 'legendary': return 'border-yellow-300'
      default: return 'border-gray-300'
    }
  }

  formatPoints(points: number): string {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k`
    }
    return points.toString()
  }

  getCategoryIcon(category: Achievement['category']): string {
    switch (category) {
      case 'health': return '💚'
      case 'activity': return '🏃'
      case 'consistency': return '📅'
      case 'social': return '👥'
      case 'special': return '⭐'
      default: return '🏆'
    }
  }

  getStreakIcon(type: Streak['type']): string {
    switch (type) {
      case 'daily_check': return '📱'
      case 'weekly_weigh': return '⚖️'
      case 'activity_log': return '🏃'
      default: return '🔥'
    }
  }

  calculateHealthScore(stats: UserGameProfile['stats']): number {
    const weights = {
      activities: 0.3,
      weighIns: 0.2,
      healthRecords: 0.3,
      consistency: 0.2
    }

    const activityScore = Math.min(100, (stats.totalActivities / 50) * 100)
    const weighInScore = Math.min(100, (stats.totalWeighIns / 20) * 100)
    const healthScore = Math.min(100, (stats.totalHealthRecords / 30) * 100)
    const consistencyScore = Math.min(100, (stats.consecutiveDays / 30) * 100)

    return Math.round(
      activityScore * weights.activities +
      weighInScore * weights.weighIns +
      healthScore * weights.healthRecords +
      consistencyScore * weights.consistency
    )
  }
}

export const gamificationService = new GamificationService()
export type { UserGameProfile, Achievement, Badge, Streak, Challenge, LevelSystem }