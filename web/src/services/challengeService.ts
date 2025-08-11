import {
  WeeklyChallenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeProgress,
  UserChallengeParticipation,
  ChallengeLeaderboard,
  LeaderboardEntry,
  RequirementType,
  RewardType
} from '@/types/challenges'
import { addWeeks, startOfWeek, endOfWeek, isWithinInterval, addDays } from 'date-fns'

// Mock data for weekly challenges
const createMockChallenges = (): WeeklyChallenge[] => {
  const now = new Date()
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 }) // Sunday
  const nextWeekStart = addWeeks(thisWeekStart, 1)
  const nextWeekEnd = addWeeks(thisWeekEnd, 1)

  return [
    {
      id: 'health-hero-week',
      title: 'Herói da Saúde',
      description: 'Registre o peso do seu pet todos os dias desta semana',
      icon: '⚖️',
      category: ChallengeCategory.HEALTH,
      difficulty: ChallengeDifficulty.EASY,
      startDate: thisWeekStart,
      endDate: thisWeekEnd,
      status: ChallengeStatus.ACTIVE,
      progress: {
        current: 3,
        target: 7,
        percentage: 43,
        milestones: [
          {
            id: 'milestone-1',
            title: '3 Dias Consecutivos',
            description: 'Registre peso por 3 dias seguidos',
            target: 3,
            reward: { type: RewardType.XP, amount: 50 },
            completed: true,
            completedAt: new Date()
          },
          {
            id: 'milestone-2',
            title: '5 Dias Consecutivos',
            description: 'Registre peso por 5 dias seguidos',
            target: 5,
            reward: { type: RewardType.XP, amount: 100 },
            completed: false
          },
          {
            id: 'milestone-3',
            title: 'Semana Completa',
            description: 'Complete todos os 7 dias',
            target: 7,
            reward: { type: RewardType.BADGE, amount: 1, badge: 'health-champion' },
            completed: false
          }
        ]
      },
      rewards: [
        { type: RewardType.XP, amount: 200 },
        { type: RewardType.BADGE, amount: 1, badge: 'health-hero' }
      ],
      requirements: [
        {
          type: RequirementType.WEIGHT_RECORDS,
          target: 7,
          description: 'Registrar peso do pet 7 vezes'
        }
      ],
      participants: 1247,
      completions: 312
    },
    {
      id: 'food-photographer',
      title: 'Fotógrafo Gastronômico',
      description: 'Tire 15 fotos dos alimentos do seu pet esta semana',
      icon: '📸',
      category: ChallengeCategory.FEEDING,
      difficulty: ChallengeDifficulty.MEDIUM,
      startDate: thisWeekStart,
      endDate: thisWeekEnd,
      status: ChallengeStatus.ACTIVE,
      progress: {
        current: 8,
        target: 15,
        percentage: 53,
        milestones: [
          {
            id: 'milestone-1',
            title: 'Primeira Sessão',
            description: '5 fotos registradas',
            target: 5,
            reward: { type: RewardType.XP, amount: 30 },
            completed: true,
            completedAt: addDays(thisWeekStart, 2)
          },
          {
            id: 'milestone-2',
            title: 'Meio Caminho',
            description: '10 fotos registradas',
            target: 10,
            reward: { type: RewardType.COINS, amount: 50 },
            completed: false
          }
        ]
      },
      rewards: [
        { type: RewardType.XP, amount: 150 },
        { type: RewardType.COINS, amount: 100 }
      ],
      requirements: [
        {
          type: RequirementType.FOOD_PHOTOS,
          target: 15,
          description: 'Tirar 15 fotos de alimentos'
        }
      ],
      participants: 892,
      completions: 156
    },
    {
      id: 'active-week',
      title: 'Semana Ativa',
      description: 'Registre 300 minutos de exercício para seu pet',
      icon: '🏃',
      category: ChallengeCategory.EXERCISE,
      difficulty: ChallengeDifficulty.HARD,
      startDate: thisWeekStart,
      endDate: thisWeekEnd,
      status: ChallengeStatus.ACTIVE,
      progress: {
        current: 180,
        target: 300,
        percentage: 60,
        milestones: [
          {
            id: 'milestone-1',
            title: 'Aquecimento',
            description: '60 minutos de exercício',
            target: 60,
            reward: { type: RewardType.XP, amount: 40 },
            completed: true,
            completedAt: addDays(thisWeekStart, 1)
          },
          {
            id: 'milestone-2',
            title: 'Ritmo Forte',
            description: '150 minutos de exercício',
            target: 150,
            reward: { type: RewardType.XP, amount: 80 },
            completed: true,
            completedAt: addDays(thisWeekStart, 4)
          }
        ]
      },
      rewards: [
        { type: RewardType.XP, amount: 300 },
        { type: RewardType.BADGE, amount: 1, badge: 'fitness-master' }
      ],
      requirements: [
        {
          type: RequirementType.EXERCISE_MINUTES,
          target: 300,
          description: 'Registrar 300 minutos de exercício'
        }
      ],
      participants: 654,
      completions: 89
    },
    {
      id: 'learning-journey',
      title: 'Jornada do Conhecimento',
      description: 'Visualize 5 relatórios de saúde e receba 3 recomendações IA',
      icon: '📚',
      category: ChallengeCategory.LEARNING,
      difficulty: ChallengeDifficulty.EASY,
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      status: ChallengeStatus.UPCOMING,
      progress: {
        current: 0,
        target: 8,
        percentage: 0,
        milestones: []
      },
      rewards: [
        { type: RewardType.XP, amount: 120 },
        { type: RewardType.BADGE, amount: 1, badge: 'knowledge-seeker' }
      ],
      requirements: [
        {
          type: RequirementType.REPORT_VIEWS,
          target: 5,
          description: 'Visualizar 5 relatórios de saúde'
        },
        {
          type: RequirementType.LEARNING_COMPLETED,
          target: 3,
          description: 'Receber 3 recomendações da IA'
        }
      ],
      participants: 0,
      completions: 0
    }
  ]
}

const mockParticipations: UserChallengeParticipation[] = [
  {
    id: 'participation-1',
    userId: '1',
    challengeId: 'health-hero-week',
    petId: 'pet-1',
    startedAt: startOfWeek(new Date(), { weekStartsOn: 1 }),
    lastActivityAt: new Date(),
    status: ChallengeStatus.ACTIVE,
    progress: {
      current: 3,
      target: 7,
      percentage: 43,
      milestones: []
    },
    completedMilestones: ['milestone-1'],
    earnedRewards: [{ type: RewardType.XP, amount: 50 }]
  }
]

class ChallengeService {
  private challenges: WeeklyChallenge[] = createMockChallenges()
  private participations: UserChallengeParticipation[] = mockParticipations

  // Get all active challenges
  async getActiveChallenges(): Promise<WeeklyChallenge[]> {
    return this.challenges.filter(challenge => 
      challenge.status === ChallengeStatus.ACTIVE ||
      challenge.status === ChallengeStatus.UPCOMING
    )
  }

  // Get challenges by category
  async getChallengesByCategory(category: ChallengeCategory): Promise<WeeklyChallenge[]> {
    return this.challenges.filter(challenge => challenge.category === category)
  }

  // Get user's challenge participations
  async getUserChallenges(userId: string): Promise<UserChallengeParticipation[]> {
    return this.participations.filter(participation => participation.userId === userId)
  }

  // Join a challenge
  async joinChallenge(userId: string, challengeId: string, petId?: string): Promise<UserChallengeParticipation> {
    const challenge = this.challenges.find(c => c.id === challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    // Check if user is already participating
    const existingParticipation = this.participations.find(
      p => p.userId === userId && p.challengeId === challengeId
    )
    if (existingParticipation) {
      return existingParticipation
    }

    const participation: UserChallengeParticipation = {
      id: `participation-${Date.now()}`,
      userId,
      challengeId,
      petId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      status: ChallengeStatus.ACTIVE,
      progress: {
        current: 0,
        target: challenge.requirements.reduce((sum, req) => sum + req.target, 0),
        percentage: 0,
        milestones: []
      },
      completedMilestones: [],
      earnedRewards: []
    }

    this.participations.push(participation)
    challenge.participants += 1

    return participation
  }

  // Update challenge progress
  async updateProgress(
    userId: string,
    challengeId: string,
    requirementType: RequirementType,
    amount: number = 1
  ): Promise<void> {
    const participation = this.participations.find(
      p => p.userId === userId && p.challengeId === challengeId
    )
    if (!participation) return

    const challenge = this.challenges.find(c => c.id === challengeId)
    if (!challenge) return

    const requirement = challenge.requirements.find(r => r.type === requirementType)
    if (!requirement) return

    // Update progress
    participation.progress.current = Math.min(
      participation.progress.current + amount,
      participation.progress.target
    )
    participation.progress.percentage = Math.round(
      (participation.progress.current / participation.progress.target) * 100
    )
    participation.lastActivityAt = new Date()

    // Check for milestone completions
    challenge.progress.milestones.forEach(async milestone => {
      if (!participation.completedMilestones.includes(milestone.id) &&
          participation.progress.current >= milestone.target) {
        participation.completedMilestones.push(milestone.id)
        participation.earnedRewards.push(milestone.reward)
        milestone.completed = true
        milestone.completedAt = new Date()

        // Create notification for milestone completion
        try {
          const { notificationService } = await import('./notificationService')
          await notificationService.createChallengeMilestone(
            challenge.title,
            milestone.title,
            milestone.reward.type === 'xp' ? milestone.reward.amount : 0
          )
        } catch (error) {
          console.log('Notification creation error:', error)
        }
      }
    })

    // Check for challenge completion
    if (participation.progress.current >= participation.progress.target) {
      participation.status = ChallengeStatus.COMPLETED
      participation.progress.completedAt = new Date()
      participation.earnedRewards.push(...challenge.rewards)
      challenge.completions += 1

      // Award XP and update gamification
      const totalXP = participation.earnedRewards
        .filter(reward => reward.type === RewardType.XP)
        .reduce((sum, reward) => sum + reward.amount, 0)

      if (totalXP > 0) {
        // Integration with gamification service
        const { gamificationService } = await import('./gamificationService')
        await gamificationService.awardXP(userId, totalXP, 'challenge_completed')
      }

      // Create notification for challenge completion
      try {
        const { notificationService } = await import('./notificationService')
        await notificationService.createChallengeCompleted(challenge.title, totalXP)
      } catch (error) {
        console.log('Notification creation error:', error)
      }
    }

    // Update challenge progress (for display purposes)
    challenge.progress.current = participation.progress.current
    challenge.progress.percentage = participation.progress.percentage
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId: string, userId?: string): Promise<ChallengeLeaderboard> {
    const participations = this.participations
      .filter(p => p.challengeId === challengeId)
      .sort((a, b) => {
        if (a.progress.percentage !== b.progress.percentage) {
          return b.progress.percentage - a.progress.percentage
        }
        return a.lastActivityAt.getTime() - b.lastActivityAt.getTime()
      })

    const entries: LeaderboardEntry[] = participations.map((participation, index) => ({
      userId: participation.userId,
      userName: `Usuário ${participation.userId}`,
      userAvatar: `https://ui-avatars.com/api/?name=User${participation.userId}&background=E85A5A&color=fff`,
      petName: participation.petId ? `Pet ${participation.petId}` : undefined,
      progress: participation.progress.percentage,
      completedAt: participation.progress.completedAt,
      rank: index + 1
    }))

    const userRank = userId ? entries.find(entry => entry.userId === userId)?.rank : undefined

    return {
      challengeId,
      entries: entries.slice(0, 100), // Top 100
      userRank,
      totalParticipants: participations.length
    }
  }

  // Get challenge by ID
  async getChallengeById(challengeId: string): Promise<WeeklyChallenge | null> {
    return this.challenges.find(c => c.id === challengeId) || null
  }

  // Get upcoming challenges
  async getUpcomingChallenges(): Promise<WeeklyChallenge[]> {
    return this.challenges.filter(challenge => challenge.status === ChallengeStatus.UPCOMING)
  }

  // Get completed challenges for user
  async getCompletedChallenges(userId: string): Promise<UserChallengeParticipation[]> {
    return this.participations.filter(
      p => p.userId === userId && p.status === ChallengeStatus.COMPLETED
    )
  }

  // Calculate weekly stats
  async getWeeklyStats(userId: string): Promise<{
    activeChallenges: number
    completedThisWeek: number
    totalXPEarned: number
    currentStreak: number
  }> {
    const userParticipations = await this.getUserChallenges(userId)
    const completedThisWeek = await this.getCompletedChallenges(userId)
    
    const activeChallenges = userParticipations.filter(p => p.status === ChallengeStatus.ACTIVE).length
    const totalXPEarned = userParticipations.reduce((sum, p) => {
      return sum + p.earnedRewards
        .filter(reward => reward.type === RewardType.XP)
        .reduce((xpSum, reward) => xpSum + reward.amount, 0)
    }, 0)

    return {
      activeChallenges,
      completedThisWeek: completedThisWeek.length,
      totalXPEarned,
      currentStreak: 0 // TODO: Implement streak calculation
    }
  }
}

export const challengeService = new ChallengeService()