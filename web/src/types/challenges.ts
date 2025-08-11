export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  icon: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  startDate: Date
  endDate: Date
  status: ChallengeStatus
  progress: ChallengeProgress
  rewards: ChallengeReward[]
  requirements: ChallengeRequirement[]
  participants: number
  completions: number
}

export enum ChallengeCategory {
  HEALTH = 'health',
  FEEDING = 'feeding',
  EXERCISE = 'exercise',
  CARE = 'care',
  SOCIAL = 'social',
  LEARNING = 'learning'
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface ChallengeProgress {
  current: number
  target: number
  percentage: number
  milestones: ChallengeMilestone[]
  completedAt?: Date
}

export interface ChallengeMilestone {
  id: string
  title: string
  description: string
  target: number
  reward: ChallengeReward
  completed: boolean
  completedAt?: Date
}

export interface ChallengeReward {
  type: RewardType
  amount: number
  item?: string
  badge?: string
  achievement?: string
}

export enum RewardType {
  XP = 'xp',
  COINS = 'coins',
  BADGE = 'badge',
  ACHIEVEMENT = 'achievement',
  ITEM = 'item',
  DISCOUNT = 'discount'
}

export interface ChallengeRequirement {
  type: RequirementType
  target: number
  description: string
  category?: string
}

export enum RequirementType {
  WEIGHT_RECORDS = 'weight_records',
  HEALTH_CHECKUPS = 'health_checkups',
  FOOD_PHOTOS = 'food_photos',
  EXERCISE_MINUTES = 'exercise_minutes',
  WATER_INTAKE = 'water_intake',
  REPORT_VIEWS = 'report_views',
  DAYS_ACTIVE = 'days_active',
  SOCIAL_SHARES = 'social_shares',
  VET_APPOINTMENTS = 'vet_appointments',
  LEARNING_COMPLETED = 'learning_completed'
}

export interface UserChallengeParticipation {
  id: string
  userId: string
  challengeId: string
  petId?: string
  startedAt: Date
  lastActivityAt: Date
  status: ChallengeStatus
  progress: ChallengeProgress
  completedMilestones: string[]
  earnedRewards: ChallengeReward[]
}

export interface ChallengeLeaderboard {
  challengeId: string
  entries: LeaderboardEntry[]
  userRank?: number
  totalParticipants: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  petName?: string
  petAvatar?: string
  progress: number
  completedAt?: Date
  rank: number
}

export interface ChallengeNotification {
  id: string
  challengeId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export enum NotificationType {
  CHALLENGE_STARTED = 'challenge_started',
  MILESTONE_REACHED = 'milestone_reached',
  CHALLENGE_COMPLETED = 'challenge_completed',
  CHALLENGE_EXPIRED = 'challenge_expired',
  RANK_CHANGED = 'rank_changed',
  NEW_CHALLENGE = 'new_challenge',
  REMINDER = 'reminder'
}