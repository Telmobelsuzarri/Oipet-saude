import { Types } from 'mongoose'
import { User } from '../models/User'
import { Pet } from '../models/Pet'
import { HealthRecord } from '../models/HealthRecord'
import { Notification } from '../models/Notification'

export interface DashboardMetrics {
  users: {
    total: number
    active: number
    newThisMonth: number
    retentionRate: number
  }
  pets: {
    total: number
    bySpecies: Array<{ species: string; count: number }>
    averageAge: number
    newThisMonth: number
  }
  health: {
    totalRecords: number
    recordsThisMonth: number
    averageRecordsPerPet: number
  }
  notifications: {
    totalSent: number
    sentThisMonth: number
    openRate: number
  }
}

export class AnalyticsService {
  /**
   * Registrar evento de analytics
   */
  static async trackEvent(userId: string, event: string, data?: any) {
    try {
      console.log('📊 Analytics Event:', {
        userId,
        event,
        data,
        timestamp: new Date()
      })

      return {
        success: true,
        eventId: `event_${Date.now()}`,
        timestamp: new Date()
      }
    } catch (error) {
      throw new Error(`Error tracking event: ${error}`)
    }
  }

  /**
   * Obter métricas do dashboard administrativo
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Métricas de usuários
      const totalUsers = await User.countDocuments()
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: thisMonth }
      })
      const activeUsers = await User.countDocuments({
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })

      // Métricas de pets
      const totalPets = await Pet.countDocuments()
      const newPetsThisMonth = await Pet.countDocuments({
        createdAt: { $gte: thisMonth }
      })

      const petsBySpecies = await Pet.aggregate([
        {
          $group: {
            _id: '$species',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            species: '$_id',
            count: 1,
            _id: 0
          }
        }
      ])

      // Métricas de saúde
      const totalHealthRecords = await HealthRecord.countDocuments()
      const healthRecordsThisMonth = await HealthRecord.countDocuments({
        date: { $gte: thisMonth }
      })

      // Métricas de notificações
      const totalNotifications = await Notification.countDocuments()
      const sentNotifications = await Notification.countDocuments({ isSent: true })
      const readNotifications = await Notification.countDocuments({ isRead: true })

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
        },
        pets: {
          total: totalPets,
          bySpecies: petsBySpecies,
          averageAge: 2.5, // Placeholder
          newThisMonth: newPetsThisMonth
        },
        health: {
          totalRecords: totalHealthRecords,
          recordsThisMonth: healthRecordsThisMonth,
          averageRecordsPerPet: totalPets > 0 ? totalHealthRecords / totalPets : 0
        },
        notifications: {
          totalSent: sentNotifications,
          sentThisMonth: totalNotifications,
          openRate: sentNotifications > 0 ? (readNotifications / sentNotifications) * 100 : 0
        }
      }
    } catch (error) {
      throw new Error(`Error getting dashboard metrics: ${error}`)
    }
  }

  /**
   * Gerar relatório de analytics
   */
  static async generateReport(type: 'daily' | 'weekly' | 'monthly') {
    try {
      const metrics = await this.getDashboardMetrics()
      
      return {
        reportType: type,
        generatedAt: new Date(),
        metrics,
        summary: {
          totalUsers: metrics.users.total,
          activeUsers: metrics.users.active,
          totalPets: metrics.pets.total,
          healthRecords: metrics.health.totalRecords,
          engagementRate: metrics.users.retentionRate
        }
      }
    } catch (error) {
      throw new Error(`Error generating report: ${error}`)
    }
  }
}