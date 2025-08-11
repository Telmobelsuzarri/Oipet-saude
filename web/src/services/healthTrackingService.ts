// Health Tracking Service - Sistema de coleta e análise de dados de saúde
import { usePetStore } from '@/stores/petStore'
import { gamificationService } from './gamificationService'

// Interfaces para dados de saúde
export interface HealthMetric {
  id: string
  petId: string
  userId: string
  type: 'weight' | 'activity' | 'food' | 'water' | 'sleep' | 'medication' | 'mood'
  value: number
  unit: string
  timestamp: Date
  notes?: string
  metadata?: Record<string, any>
}

export interface DailyHealthRecord {
  id: string
  petId: string
  date: string // YYYY-MM-DD format
  weight?: number // kg
  waterIntake?: number // ml
  foodIntake?: number // g
  activity?: {
    steps: number
    exerciseMinutes: number
    intensity: 'low' | 'moderate' | 'high'
  }
  sleep?: {
    hours: number
    quality: 'poor' | 'fair' | 'good' | 'excellent'
  }
  mood?: {
    energy: number // 1-5
    happiness: number // 1-5
    appetite: number // 1-5
  }
  medications?: Array<{
    name: string
    dosage: string
    time: string
    given: boolean
  }>
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface HealthAlert {
  id: string
  petId: string
  type: 'weight_change' | 'activity_low' | 'medication_missed' | 'abnormal_behavior'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  recommendations: string[]
  isRead: boolean
  createdAt: Date
}

export interface HealthTrend {
  metric: string
  period: '7d' | '30d' | '90d'
  trend: 'increasing' | 'decreasing' | 'stable'
  change: number
  unit: string
  significance: 'low' | 'moderate' | 'high'
}

export interface HealthGoal {
  id: string
  petId: string
  type: 'weight_loss' | 'weight_gain' | 'activity_increase' | 'custom'
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  targetDate: Date
  isActive: boolean
  progress: number // 0-100%
  createdAt: Date
}

class HealthTrackingService {
  private healthRecords: DailyHealthRecord[] = []
  private healthMetrics: HealthMetric[] = []
  private healthAlerts: HealthAlert[] = []
  private healthGoals: HealthGoal[] = []

  constructor() {
    this.loadFromStorage()
    this.generateMockData() // Para demonstração
  }

  // ==================== CRUD Operations ====================

  async addHealthRecord(record: Omit<DailyHealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyHealthRecord> {
    const newRecord: DailyHealthRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Verificar se já existe registro para esta data
    const existingIndex = this.healthRecords.findIndex(
      r => r.petId === record.petId && r.date === record.date
    )

    if (existingIndex >= 0) {
      // Atualizar registro existente
      this.healthRecords[existingIndex] = {
        ...this.healthRecords[existingIndex],
        ...newRecord,
        id: this.healthRecords[existingIndex].id,
        createdAt: this.healthRecords[existingIndex].createdAt,
        updatedAt: new Date()
      }
    } else {
      // Adicionar novo registro
      this.healthRecords.push(newRecord)
    }

    this.saveToStorage()
    this.analyzeAndGenerateAlerts(newRecord)
    
    // Integração com gamificação - dar XP por registrar dados de saúde
    if (typeof window !== 'undefined' && record.weight) {
      try {
        gamificationService.checkAchievements(record.petId, { 
          type: 'weight_record', 
          data: { weight: record.weight } 
        })
      } catch (error) {
        console.log('Gamification integration error:', error)
      }
    }
    
    return newRecord
  }

  async addHealthMetric(metric: Omit<HealthMetric, 'id' | 'timestamp'>): Promise<HealthMetric> {
    const newMetric: HealthMetric = {
      ...metric,
      id: this.generateId(),
      timestamp: new Date()
    }

    this.healthMetrics.push(newMetric)
    this.saveToStorage()

    // Atualizar registro diário se aplicável
    this.updateDailyRecordFromMetric(newMetric)

    return newMetric
  }

  async getHealthRecords(petId: string, startDate?: Date, endDate?: Date): Promise<DailyHealthRecord[]> {
    let records = this.healthRecords.filter(r => r.petId === petId)

    if (startDate) {
      records = records.filter(r => new Date(r.date) >= startDate)
    }

    if (endDate) {
      records = records.filter(r => new Date(r.date) <= endDate)
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getHealthMetrics(petId: string, type?: HealthMetric['type'], limit?: number): Promise<HealthMetric[]> {
    let metrics = this.healthMetrics.filter(m => m.petId === petId)

    if (type) {
      metrics = metrics.filter(m => m.type === type)
    }

    metrics = metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (limit) {
      metrics = metrics.slice(0, limit)
    }

    return metrics
  }

  // ==================== Health Analysis ====================

  async getHealthTrends(petId: string, period: HealthTrend['period'] = '30d'): Promise<HealthTrend[]> {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const records = await this.getHealthRecords(petId, startDate)
    const trends: HealthTrend[] = []

    // Analisar tendência de peso
    const weights = records.filter(r => r.weight).map(r => r.weight!).reverse()
    if (weights.length >= 3) {
      const weightTrend = this.calculateTrend(weights)
      trends.push({
        metric: 'weight',
        period,
        trend: weightTrend.direction,
        change: weightTrend.change,
        unit: 'kg',
        significance: Math.abs(weightTrend.change) > 0.5 ? 'high' : 'moderate'
      })
    }

    // Analisar tendência de atividade
    const activities = records.filter(r => r.activity).map(r => r.activity!.steps).reverse()
    if (activities.length >= 3) {
      const activityTrend = this.calculateTrend(activities)
      trends.push({
        metric: 'activity',
        period,
        trend: activityTrend.direction,
        change: activityTrend.change,
        unit: 'passos',
        significance: Math.abs(activityTrend.change) > 1000 ? 'high' : 'moderate'
      })
    }

    // Analisar tendência de consumo de água
    const waterIntakes = records.filter(r => r.waterIntake).map(r => r.waterIntake!).reverse()
    if (waterIntakes.length >= 3) {
      const waterTrend = this.calculateTrend(waterIntakes)
      trends.push({
        metric: 'water',
        period,
        trend: waterTrend.direction,
        change: waterTrend.change,
        unit: 'ml',
        significance: Math.abs(waterTrend.change) > 100 ? 'high' : 'moderate'
      })
    }

    return trends
  }

  private calculateTrend(values: number[]): { direction: HealthTrend['trend'], change: number } {
    if (values.length < 2) return { direction: 'stable', change: 0 }

    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const change = secondAvg - firstAvg
    const changePercent = Math.abs(change / firstAvg) * 100

    if (changePercent < 5) return { direction: 'stable', change }
    return { direction: change > 0 ? 'increasing' : 'decreasing', change }
  }

  // ==================== Health Alerts ====================

  private analyzeAndGenerateAlerts(record: DailyHealthRecord): void {
    const alerts: Omit<HealthAlert, 'id' | 'createdAt'>[] = []

    // Verificar mudança drástica de peso
    if (record.weight) {
      const recentWeights = this.healthRecords
        .filter(r => r.petId === record.petId && r.weight && r.date !== record.date)
        .slice(0, 7)
        .map(r => r.weight!)

      if (recentWeights.length > 0) {
        const avgWeight = recentWeights.reduce((sum, w) => sum + w, 0) / recentWeights.length
        const weightChange = Math.abs(record.weight - avgWeight)
        const changePercent = (weightChange / avgWeight) * 100

        if (changePercent > 10) {
          alerts.push({
            petId: record.petId,
            type: 'weight_change',
            severity: changePercent > 20 ? 'critical' : 'warning',
            title: 'Mudança significativa de peso',
            message: `O peso do pet mudou ${changePercent.toFixed(1)}% em relação à média recente.`,
            recommendations: [
              'Consulte um veterinário se a mudança persistir',
              'Verifique a alimentação e atividade física',
              'Monitore com mais frequência'
            ],
            isRead: false
          })
        }
      }
    }

    // Verificar baixa atividade
    if (record.activity && record.activity.steps < 3000) {
      alerts.push({
        petId: record.petId,
        type: 'activity_low',
        severity: 'warning',
        title: 'Baixa atividade física',
        message: `Apenas ${record.activity.steps} passos registrados hoje.`,
        recommendations: [
          'Aumente o tempo de passeios',
          'Incentive brincadeiras',
          'Verifique se há sinais de desconforto'
        ],
        isRead: false
      })
    }

    // Verificar medicações perdidas
    if (record.medications) {
      const missedMeds = record.medications.filter(med => !med.given)
      if (missedMeds.length > 0) {
        alerts.push({
          petId: record.petId,
          type: 'medication_missed',
          severity: 'critical',
          title: 'Medicação não administrada',
          message: `${missedMeds.length} medicação(ões) não foram dadas hoje.`,
          recommendations: [
            'Administre as medicações assim que possível',
            'Configure lembretes',
            'Consulte o veterinário se necessário'
          ],
          isRead: false
        })
      }
    }

    // Adicionar alertas ao sistema
    alerts.forEach(alert => {
      this.healthAlerts.push({
        ...alert,
        id: this.generateId(),
        createdAt: new Date()
      })
    })

    this.saveToStorage()
  }

  async getHealthAlerts(petId: string, unreadOnly: boolean = false): Promise<HealthAlert[]> {
    let alerts = this.healthAlerts.filter(a => a.petId === petId)

    if (unreadOnly) {
      alerts = alerts.filter(a => !a.isRead)
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const alert = this.healthAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.isRead = true
      this.saveToStorage()
    }
  }

  // ==================== Health Goals ====================

  async createHealthGoal(goal: Omit<HealthGoal, 'id' | 'progress' | 'createdAt'>): Promise<HealthGoal> {
    const newGoal: HealthGoal = {
      ...goal,
      id: this.generateId(),
      progress: 0,
      createdAt: new Date()
    }

    this.healthGoals.push(newGoal)
    this.saveToStorage()
    return newGoal
  }

  async getHealthGoals(petId: string, activeOnly: boolean = false): Promise<HealthGoal[]> {
    let goals = this.healthGoals.filter(g => g.petId === petId)

    if (activeOnly) {
      goals = goals.filter(g => g.isActive)
    }

    // Atualizar progresso dos goals
    goals.forEach(goal => {
      goal.progress = this.calculateGoalProgress(goal)
    })

    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  private calculateGoalProgress(goal: HealthGoal): number {
    // Lógica simplificada para calcular progresso
    const progressRatio = goal.currentValue / goal.targetValue
    return Math.min(100, Math.max(0, progressRatio * 100))
  }

  // ==================== Utility Methods ====================

  private updateDailyRecordFromMetric(metric: HealthMetric): void {
    const today = new Date().toISOString().split('T')[0]
    const recordIndex = this.healthRecords.findIndex(
      r => r.petId === metric.petId && r.date === today
    )

    if (recordIndex >= 0) {
      const record = this.healthRecords[recordIndex]
      
      switch (metric.type) {
        case 'weight':
          record.weight = metric.value
          break
        case 'water':
          record.waterIntake = metric.value
          break
        case 'food':
          record.foodIntake = metric.value
          break
        case 'activity':
          if (!record.activity) record.activity = { steps: 0, exerciseMinutes: 0, intensity: 'low' }
          record.activity.steps = metric.value
          break
      }

      record.updatedAt = new Date()
      this.saveToStorage()
    }
  }

  private generateId(): string {
    return `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('oipet_health_tracking')
      if (stored) {
        const data = JSON.parse(stored)
        this.healthRecords = data.healthRecords || []
        this.healthMetrics = data.healthMetrics || []
        this.healthAlerts = data.healthAlerts || []
        this.healthGoals = data.healthGoals || []
      }
    } catch (error) {
      console.error('Erro ao carregar dados de saúde:', error)
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        healthRecords: this.healthRecords,
        healthMetrics: this.healthMetrics,
        healthAlerts: this.healthAlerts,
        healthGoals: this.healthGoals
      }
      localStorage.setItem('oipet_health_tracking', JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar dados de saúde:', error)
    }
  }

  // ==================== Mock Data Generation ====================

  private generateMockData(): void {
    if (this.healthRecords.length > 0) return // Já tem dados

    // Gerar dados dos últimos 30 dias para pets existentes
    let pets = usePetStore.getState().pets
    
    // Se não há pets, criar alguns pets mock
    if (pets.length === 0) {
      // Criar pets mock no localStorage para demonstração
      const mockPets = [
        {
          _id: 'mock-pet-1',
          userId: 'mock-user',
          name: 'Rex',
          species: 'dog' as const,
          breed: 'Golden Retriever',
          birthDate: '2020-06-15',
          weight: 25.5,
          height: 60,
          gender: 'male' as const,
          isNeutered: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock-pet-2',
          userId: 'mock-user',
          name: 'Mimi',
          species: 'cat' as const,
          breed: 'Persa',
          birthDate: '2019-03-20',
          weight: 4.2,
          height: 25,
          gender: 'female' as const,
          isNeutered: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      // Atualizar o petStore com pets mock
      usePetStore.setState({ 
        pets: mockPets, 
        selectedPet: mockPets[0] 
      })
      
      pets = mockPets
    }
    
    pets.forEach(pet => {
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const baseWeight = 15 + Math.random() * 10 // 15-25kg
        const weightVariation = (Math.random() - 0.5) * 0.5 // ±0.25kg
        
        const record: DailyHealthRecord = {
          id: this.generateId(),
          petId: pet._id,
          date: dateStr,
          weight: baseWeight + weightVariation,
          waterIntake: 800 + Math.random() * 400, // 800-1200ml
          foodIntake: 300 + Math.random() * 200, // 300-500g
          activity: {
            steps: Math.floor(5000 + Math.random() * 7000), // 5000-12000 passos
            exerciseMinutes: Math.floor(30 + Math.random() * 60), // 30-90 min
            intensity: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as any
          },
          sleep: {
            hours: 12 + Math.random() * 4, // 12-16 horas
            quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as any
          },
          mood: {
            energy: Math.floor(3 + Math.random() * 3), // 3-5
            happiness: Math.floor(3 + Math.random() * 3), // 3-5
            appetite: Math.floor(3 + Math.random() * 3) // 3-5
          },
          notes: i % 7 === 0 ? 'Dia de banho e escovação' : '',
          createdAt: date,
          updatedAt: date
        }

        this.healthRecords.push(record)
      }

      // Criar alguns goals de exemplo
      this.healthGoals.push({
        id: this.generateId(),
        petId: pet.id,
        type: 'weight_loss',
        title: 'Perder peso',
        description: 'Reduzir 2kg até o final do mês',
        targetValue: 18,
        currentValue: 20,
        unit: 'kg',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        progress: 50,
        createdAt: new Date()
      })
    })

    this.saveToStorage()
  }

  // ==================== Data Export ====================

  async exportHealthData(petId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const records = await this.getHealthRecords(petId)
    const metrics = await this.getHealthMetrics(petId)
    
    if (format === 'json') {
      return JSON.stringify({
        healthRecords: records,
        healthMetrics: metrics,
        exportDate: new Date().toISOString()
      }, null, 2)
    } else {
      // CSV export para relatórios
      const csvHeaders = 'Data,Peso,Água,Comida,Passos,Exercício,Sono,Energia,Humor,Apetite,Notas\n'
      const csvData = records.map(record => {
        return [
          record.date,
          record.weight || '',
          record.waterIntake || '',
          record.foodIntake || '',
          record.activity?.steps || '',
          record.activity?.exerciseMinutes || '',
          record.sleep?.hours || '',
          record.mood?.energy || '',
          record.mood?.happiness || '',
          record.mood?.appetite || '',
          `"${record.notes || ''}"`
        ].join(',')
      }).join('\n')

      return csvHeaders + csvData
    }
  }

  // ==================== Statistics ====================

  async getHealthStatistics(petId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const records = await this.getHealthRecords(petId, startDate)

    if (records.length === 0) {
      return null
    }

    const weights = records.filter(r => r.weight).map(r => r.weight!)
    const waters = records.filter(r => r.waterIntake).map(r => r.waterIntake!)
    const activities = records.filter(r => r.activity).map(r => r.activity!.steps)
    const sleeps = records.filter(r => r.sleep).map(r => r.sleep!.hours)

    return {
      period,
      recordCount: records.length,
      weight: {
        average: weights.length ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0,
        min: weights.length ? Math.min(...weights) : 0,
        max: weights.length ? Math.max(...weights) : 0,
        trend: weights.length > 1 ? this.calculateTrend(weights) : null
      },
      water: {
        average: waters.length ? waters.reduce((sum, w) => sum + w, 0) / waters.length : 0,
        total: waters.reduce((sum, w) => sum + w, 0)
      },
      activity: {
        averageSteps: activities.length ? activities.reduce((sum, a) => sum + a, 0) / activities.length : 0,
        totalSteps: activities.reduce((sum, a) => sum + a, 0)
      },
      sleep: {
        average: sleeps.length ? sleeps.reduce((sum, s) => sum + s, 0) / sleeps.length : 0
      }
    }
  }
}

// Singleton instance
export const healthTrackingService = new HealthTrackingService()
export default healthTrackingService