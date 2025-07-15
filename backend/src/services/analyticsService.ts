/**
 * Serviço de analytics e relatórios
 */

import { User } from '@/models/User';
import { Pet } from '@/models/Pet';
import { HealthRecord } from '@/models/HealthRecord';
import { Notification } from '@/models/Notification';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  pets: {
    total: number;
    bySpecies: {
      dogs: number;
      cats: number;
      others: number;
    };
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    averageAge: number;
    averageWeight: number;
  };
  health: {
    totalRecords: number;
    recordsToday: number;
    recordsThisWeek: number;
    recordsThisMonth: number;
    mostTrackedActivities: Array<{ activity: string; count: number }>;
    commonSymptoms: Array<{ symptom: string; count: number }>;
  };
  notifications: {
    total: number;
    sent: number;
    unread: number;
    byCategory: {
      general: number;
      health: number;
      medication: number;
      feeding: number;
      activity: number;
      system: number;
    };
  };
}

export interface UserEngagementStats {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  averageSessionDuration: number;
  mostActiveHours: Array<{ hour: number; users: number }>;
  platformDistribution: {
    web: number;
    mobile: number;
  };
}

export interface PetHealthTrends {
  weightTrends: Array<{
    date: string;
    averageWeight: number;
    petCount: number;
  }>;
  activityTrends: Array<{
    date: string;
    totalActivities: number;
    averageDuration: number;
  }>;
  commonHealthIssues: Array<{
    symptom: string;
    count: number;
    percentage: number;
  }>;
  vaccinationStatus: {
    upToDate: number;
    overdue: number;
    unknown: number;
  };
  breedPopularity: Array<{
    breed: string;
    count: number;
    percentage: number;
  }>;
}

export interface TimeRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface ReportData {
  summary: DashboardStats;
  engagement: UserEngagementStats;
  healthTrends: PetHealthTrends;
  generatedAt: Date;
  period: string;
}

class AnalyticsService {
  /**
   * Obter estatísticas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Estatísticas de usuários
      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: thisWeek } }),
        User.countDocuments({ createdAt: { $gte: thisMonth } })
      ]);

      // Estatísticas de pets
      const [
        totalPets,
        dogCount,
        catCount,
        otherCount,
        newPetsToday,
        newPetsThisWeek,
        newPetsThisMonth,
        petAgeStats,
        petWeightStats
      ] = await Promise.all([
        Pet.countDocuments(),
        Pet.countDocuments({ species: 'dog' }),
        Pet.countDocuments({ species: 'cat' }),
        Pet.countDocuments({ species: 'other' }),
        Pet.countDocuments({ createdAt: { $gte: today } }),
        Pet.countDocuments({ createdAt: { $gte: thisWeek } }),
        Pet.countDocuments({ createdAt: { $gte: thisMonth } }),
        Pet.aggregate([
          {
            $group: {
              _id: null,
              avgAge: { $avg: '$age' }
            }
          }
        ]),
        Pet.aggregate([
          {
            $group: {
              _id: null,
              avgWeight: { $avg: '$weight' }
            }
          }
        ])
      ]);

      // Estatísticas de saúde
      const [
        totalHealthRecords,
        healthRecordsToday,
        healthRecordsThisWeek,
        healthRecordsThisMonth,
        activityStats,
        symptomStats
      ] = await Promise.all([
        HealthRecord.countDocuments(),
        HealthRecord.countDocuments({ createdAt: { $gte: today } }),
        HealthRecord.countDocuments({ createdAt: { $gte: thisWeek } }),
        HealthRecord.countDocuments({ createdAt: { $gte: thisMonth } }),
        HealthRecord.aggregate([
          { $match: { activity: { $exists: true } } },
          { $group: { _id: '$activity.type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { activity: '$_id', count: 1, _id: 0 } }
        ]),
        HealthRecord.aggregate([
          { $match: { symptoms: { $exists: true, $ne: [] } } },
          { $unwind: '$symptoms' },
          { $group: { _id: '$symptoms', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { symptom: '$_id', count: 1, _id: 0 } }
        ])
      ]);

      // Estatísticas de notificações
      const [
        totalNotifications,
        sentNotifications,
        unreadNotifications,
        notificationsByCategory
      ] = await Promise.all([
        Notification.countDocuments(),
        Notification.countDocuments({ sent: true }),
        Notification.countDocuments({ isRead: false }),
        Notification.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
      ]);

      // Processar estatísticas de notificações por categoria
      const notificationCategoryStats = {
        general: 0,
        health: 0,
        medication: 0,
        feeding: 0,
        activity: 0,
        system: 0
      };

      notificationsByCategory.forEach(stat => {
        if (notificationCategoryStats.hasOwnProperty(stat._id)) {
          notificationCategoryStats[stat._id] = stat.count;
        }
      });

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth
        },
        pets: {
          total: totalPets,
          bySpecies: {
            dogs: dogCount,
            cats: catCount,
            others: otherCount
          },
          newToday: newPetsToday,
          newThisWeek: newPetsThisWeek,
          newThisMonth: newPetsThisMonth,
          averageAge: petAgeStats[0]?.avgAge || 0,
          averageWeight: Math.round((petWeightStats[0]?.avgWeight || 0) * 10) / 10
        },
        health: {
          totalRecords: totalHealthRecords,
          recordsToday: healthRecordsToday,
          recordsThisWeek: healthRecordsThisWeek,
          recordsThisMonth: healthRecordsThisMonth,
          mostTrackedActivities: activityStats,
          commonSymptoms: symptomStats
        },
        notifications: {
          total: totalNotifications,
          sent: sentNotifications,
          unread: unreadNotifications,
          byCategory: notificationCategoryStats
        }
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de engajamento de usuários
   */
  async getUserEngagementStats(): Promise<UserEngagementStats> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ lastLoginAt: { $gte: yesterday } }),
        User.countDocuments({ lastLoginAt: { $gte: lastWeek } }),
        User.countDocuments({ lastLoginAt: { $gte: lastMonth } })
      ]);

      // Calcular retenção (simplificado para este exemplo)
      const day1Retention = Math.round((dailyActiveUsers / totalUsers) * 100);
      const day7Retention = Math.round((weeklyActiveUsers / totalUsers) * 100);
      const day30Retention = Math.round((monthlyActiveUsers / totalUsers) * 100);

      return {
        totalUsers,
        activeUsers: {
          daily: dailyActiveUsers,
          weekly: weeklyActiveUsers,
          monthly: monthlyActiveUsers
        },
        userRetention: {
          day1: day1Retention,
          day7: day7Retention,
          day30: day30Retention
        },
        averageSessionDuration: 0, // Placeholder - seria calculado com dados de sessão
        mostActiveHours: [], // Placeholder - seria calculado com dados de login
        platformDistribution: {
          web: Math.round(totalUsers * 0.6), // Placeholder
          mobile: Math.round(totalUsers * 0.4) // Placeholder
        }
      };
    } catch (error) {
      logger.error('Error getting user engagement stats:', error);
      throw error;
    }
  }

  /**
   * Obter tendências de saúde dos pets
   */
  async getPetHealthTrends(days: number = 30): Promise<PetHealthTrends> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Tendências de peso
      const weightTrends = await HealthRecord.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            weight: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            averageWeight: { $avg: '$weight' },
            petCount: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            date: '$_id',
            averageWeight: { $round: ['$averageWeight', 1] },
            petCount: 1,
            _id: 0
          }
        }
      ]);

      // Tendências de atividade
      const activityTrends = await HealthRecord.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            activity: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            totalActivities: { $sum: 1 },
            averageDuration: { $avg: '$activity.duration' }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            date: '$_id',
            totalActivities: 1,
            averageDuration: { $round: ['$averageDuration', 0] },
            _id: 0
          }
        }
      ]);

      // Problemas de saúde comuns
      const commonHealthIssues = await HealthRecord.aggregate([
        {
          $match: {
            symptoms: { $exists: true, $ne: [] }
          }
        },
        { $unwind: '$symptoms' },
        {
          $group: {
            _id: '$symptoms',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const totalSymptoms = commonHealthIssues.reduce((acc, item) => acc + item.count, 0);
      const healthIssuesWithPercentage = commonHealthIssues.map(issue => ({
        symptom: issue._id,
        count: issue.count,
        percentage: Math.round((issue.count / totalSymptoms) * 100)
      }));

      // Popularidade de raças
      const breedPopularity = await Pet.aggregate([
        {
          $group: {
            _id: '$breed',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const totalPets = await Pet.countDocuments();
      const breedPopularityWithPercentage = breedPopularity.map(breed => ({
        breed: breed._id,
        count: breed.count,
        percentage: Math.round((breed.count / totalPets) * 100)
      }));

      return {
        weightTrends,
        activityTrends,
        commonHealthIssues: healthIssuesWithPercentage,
        vaccinationStatus: {
          upToDate: 0, // Placeholder - seria calculado com dados de vacinação
          overdue: 0,
          unknown: totalPets
        },
        breedPopularity: breedPopularityWithPercentage
      };
    } catch (error) {
      logger.error('Error getting pet health trends:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório completo
   */
  async generateReport(timeRange?: TimeRangeFilter): Promise<ReportData> {
    try {
      const period = timeRange 
        ? `${timeRange.startDate.toISOString().split('T')[0]} - ${timeRange.endDate.toISOString().split('T')[0]}`
        : 'Última semana';

      const [summary, engagement, healthTrends] = await Promise.all([
        this.getDashboardStats(),
        this.getUserEngagementStats(),
        this.getPetHealthTrends()
      ]);

      return {
        summary,
        engagement,
        healthTrends,
        generatedAt: new Date(),
        period
      };
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Obter métricas em tempo real
   */
  async getRealTimeMetrics(): Promise<any> {
    try {
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
      const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

      const [
        activeUsersLastHour,
        newRegistrationsLastHour,
        healthRecordsLast5Min,
        notificationsLast5Min
      ] = await Promise.all([
        User.countDocuments({ lastLoginAt: { $gte: lastHour } }),
        User.countDocuments({ createdAt: { $gte: lastHour } }),
        HealthRecord.countDocuments({ createdAt: { $gte: last5Minutes } }),
        Notification.countDocuments({ createdAt: { $gte: last5Minutes } })
      ]);

      return {
        timestamp: now,
        activeUsersLastHour,
        newRegistrationsLastHour,
        healthRecordsLast5Min,
        notificationsLast5Min,
        systemLoad: {
          cpu: 0, // Placeholder - seria obtido do sistema
          memory: 0, // Placeholder - seria obtido do sistema
          database: 'healthy' // Placeholder - seria verificado
        }
      };
    } catch (error) {
      logger.error('Error getting real-time metrics:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de uso por período
   */
  async getUsageStatsByPeriod(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [
        userRegistrations,
        petRegistrations,
        healthRecords,
        notifications
      ] = await Promise.all([
        User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Pet.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        HealthRecord.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Notification.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        })
      ]);

      return {
        period: {
          start: startDate,
          end: endDate
        },
        userRegistrations,
        petRegistrations,
        healthRecords,
        notifications,
        totalActivity: userRegistrations + petRegistrations + healthRecords + notifications
      };
    } catch (error) {
      logger.error('Error getting usage stats by period:', error);
      throw error;
    }
  }

  /**
   * Obter top usuários por atividade
   */
  async getTopActiveUsers(limit: number = 10): Promise<any[]> {
    try {
      const topUsers = await HealthRecord.aggregate([
        {
          $lookup: {
            from: 'pets',
            localField: 'petId',
            foreignField: '_id',
            as: 'pet'
          }
        },
        { $unwind: '$pet' },
        {
          $group: {
            _id: '$pet.userId',
            recordCount: { $sum: 1 },
            lastActivity: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userName: '$user.name',
            userEmail: '$user.email',
            recordCount: 1,
            lastActivity: 1
          }
        },
        { $sort: { recordCount: -1 } },
        { $limit: limit }
      ]);

      return topUsers;
    } catch (error) {
      logger.error('Error getting top active users:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;