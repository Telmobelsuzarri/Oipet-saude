import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'

export interface HealthRecord {
  _id: string
  petId: string
  petName: string
  date: string
  weight?: number
  height?: number
  activity?: {
    type: string
    duration: number
    intensity: 'low' | 'medium' | 'high'
    calories?: number
  }
  calories?: number
  notes?: string
}

export interface Pet {
  _id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  birthDate: string
  weight: number
  height: number
  gender: 'male' | 'female'
  isNeutered: boolean
  avatar?: string
}

export interface ReportFilter {
  petIds?: string[]
  startDate?: string
  endDate?: string
  reportType: 'health' | 'weight' | 'activity' | 'nutrition' | 'complete'
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export interface ReportData {
  metadata: {
    title: string
    period: string
    generatedAt: string
    petCount: number
    recordCount: number
  }
  pets: Pet[]
  healthRecords: HealthRecord[]
  summary: {
    averageWeight: number
    weightChange: number
    totalActivities: number
    totalCalories: number
    healthScore: number
  }
  charts: {
    weightEvolution: Array<{ date: string; weight: number; petName: string }>
    activityDistribution: Array<{ type: string; count: number; duration: number }>
    caloriesTrend: Array<{ date: string; calories: number }>
  }
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includePhotos: boolean
  language: 'pt-BR' | 'en-US'
}

// Mock data - replace with real API calls
const mockPets: Pet[] = [
  {
    _id: '1',
    name: 'Rex',
    species: 'dog',
    breed: 'Golden Retriever',
    birthDate: '2020-06-15',
    weight: 25.5,
    height: 60,
    gender: 'male',
    isNeutered: true
  },
  {
    _id: '2',
    name: 'Mimi',
    species: 'cat',
    breed: 'Persa',
    birthDate: '2019-03-20',
    weight: 4.2,
    height: 25,
    gender: 'female',
    isNeutered: true
  }
]

const mockHealthRecords: HealthRecord[] = [
  {
    _id: '1',
    petId: '1',
    petName: 'Rex',
    date: '2025-01-15',
    weight: 25.5,
    height: 60,
    activity: {
      type: 'caminhada',
      duration: 45,
      intensity: 'medium',
      calories: 180
    },
    calories: 180,
    notes: 'Pet animado durante a caminhada'
  },
  {
    _id: '2',
    petId: '1',
    petName: 'Rex',
    date: '2025-01-14',
    weight: 25.3,
    activity: {
      type: 'brincadeira',
      duration: 30,
      intensity: 'high',
      calories: 150
    },
    calories: 150
  },
  {
    _id: '3',
    petId: '2',
    petName: 'Mimi',
    date: '2025-01-15',
    weight: 4.2,
    height: 25,
    activity: {
      type: 'brincadeira',
      duration: 20,
      intensity: 'low',
      calories: 45
    },
    calories: 45
  }
]

class ReportService {
  private readonly API_DELAY = 1000

  async generateReport(filter: ReportFilter): Promise<ReportData> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))

    const { startDate, endDate } = this.calculateDateRange(filter.period)
    
    // Filter pets
    let filteredPets = [...mockPets]
    if (filter.petIds && filter.petIds.length > 0) {
      filteredPets = filteredPets.filter(pet => filter.petIds!.includes(pet._id))
    }

    // Filter health records
    let filteredRecords = [...mockHealthRecords]
    if (filter.petIds && filter.petIds.length > 0) {
      filteredRecords = filteredRecords.filter(record => filter.petIds!.includes(record.petId))
    }

    // Filter by date range
    const filterStartDate = filter.startDate || startDate
    const filterEndDate = filter.endDate || endDate
    
    filteredRecords = filteredRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= new Date(filterStartDate) && recordDate <= new Date(filterEndDate)
    })

    // Calculate summary
    const summary = this.calculateSummary(filteredRecords, filteredPets)
    
    // Generate charts data
    const charts = this.generateChartsData(filteredRecords)

    const reportData: ReportData = {
      metadata: {
        title: this.getReportTitle(filter.reportType),
        period: this.formatPeriod(filter.period, filterStartDate, filterEndDate),
        generatedAt: new Date().toISOString(),
        petCount: filteredPets.length,
        recordCount: filteredRecords.length
      },
      pets: filteredPets,
      healthRecords: filteredRecords,
      summary,
      charts
    }

    return reportData
  }

  async exportReport(reportData: ReportData, options: ExportOptions): Promise<{ url: string; filename: string }> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY * 2))

    const filename = this.generateFilename(reportData.metadata.title, options.format)
    
    // Em uma implementação real, isso geraria o arquivo e retornaria a URL
    const mockUrl = this.generateMockFileUrl(reportData, options)

    return {
      url: mockUrl,
      filename
    }
  }

  private calculateDateRange(period: string): { startDate: string; endDate: string } {
    const now = new Date()
    let start: Date
    let end: Date

    switch (period) {
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 })
        end = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        start = quarterStart
        end = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    }
  }

  private calculateSummary(records: HealthRecord[], pets: Pet[]) {
    const totalRecords = records.length
    
    if (totalRecords === 0) {
      return {
        averageWeight: 0,
        weightChange: 0,
        totalActivities: 0,
        totalCalories: 0,
        healthScore: 0
      }
    }

    const weightsRecords = records.filter(r => r.weight)
    const averageWeight = weightsRecords.length > 0 
      ? weightsRecords.reduce((sum, r) => sum + (r.weight || 0), 0) / weightsRecords.length
      : 0

    // Calculate weight change (last vs first record)
    const sortedWeightRecords = weightsRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const weightChange = sortedWeightRecords.length >= 2
      ? (sortedWeightRecords[sortedWeightRecords.length - 1].weight || 0) - (sortedWeightRecords[0].weight || 0)
      : 0

    const totalActivities = records.filter(r => r.activity).length
    const totalCalories = records.reduce((sum, r) => sum + (r.calories || 0), 0)
    
    // Simple health score calculation (0-100)
    const healthScore = Math.min(100, Math.max(0, 
      (totalActivities * 10) + 
      (totalCalories > 0 ? 30 : 0) + 
      (Math.abs(weightChange) < 2 ? 30 : 0) + 
      (totalRecords * 5)
    ))

    return {
      averageWeight: Math.round(averageWeight * 10) / 10,
      weightChange: Math.round(weightChange * 10) / 10,
      totalActivities,
      totalCalories,
      healthScore: Math.round(healthScore)
    }
  }

  private generateChartsData(records: HealthRecord[]) {
    // Weight evolution
    const weightEvolution = records
      .filter(r => r.weight)
      .map(r => ({
        date: r.date,
        weight: r.weight!,
        petName: r.petName
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Activity distribution
    const activityMap = new Map<string, { count: number; duration: number }>()
    records.filter(r => r.activity).forEach(record => {
      const type = record.activity!.type
      const current = activityMap.get(type) || { count: 0, duration: 0 }
      activityMap.set(type, {
        count: current.count + 1,
        duration: current.duration + record.activity!.duration
      })
    })

    const activityDistribution = Array.from(activityMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      duration: data.duration
    }))

    // Calories trend
    const caloriesTrend = records
      .filter(r => r.calories && r.calories > 0)
      .map(r => ({
        date: r.date,
        calories: r.calories!
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      weightEvolution,
      activityDistribution,
      caloriesTrend
    }
  }

  private getReportTitle(type: string): string {
    switch (type) {
      case 'health': return 'Relatório de Saúde'
      case 'weight': return 'Relatório de Peso'
      case 'activity': return 'Relatório de Atividades'
      case 'nutrition': return 'Relatório Nutricional'
      case 'complete': return 'Relatório Completo'
      default: return 'Relatório'
    }
  }

  private formatPeriod(period: string, startDate: string, endDate: string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)

    switch (period) {
      case 'week':
        return `Semana de ${format(start, 'dd/MM')} a ${format(end, 'dd/MM/yyyy')}`
      case 'month':
        return format(start, 'MMMM yyyy')
      case 'quarter':
        return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`
      case 'year':
        return start.getFullYear().toString()
      default:
        return `${format(start, 'dd/MM/yyyy')} a ${format(end, 'dd/MM/yyyy')}`
    }
  }

  private generateFilename(title: string, format: string): string {
    const date = new Date().toISOString().split('T')[0]
    const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return `${sanitizedTitle}-${date}.${format}`
  }

  private generateMockFileUrl(reportData: ReportData, options: ExportOptions): string {
    // Em uma implementação real, isso faria upload do arquivo e retornaria a URL real
    const baseUrl = 'https://api.oipet.com/reports/download'
    const queryParams = new URLSearchParams({
      format: options.format,
      charts: options.includeCharts.toString(),
      photos: options.includePhotos.toString(),
      lang: options.language
    })
    
    return `${baseUrl}?${queryParams.toString()}`
  }

  // Utility methods for formatting
  formatWeight(weight: number): string {
    return `${weight.toFixed(1)}kg`
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  formatCalories(calories: number): string {
    return `${calories} kcal`
  }

  getIntensityLabel(intensity: string): string {
    switch (intensity) {
      case 'low': return 'Baixa'
      case 'medium': return 'Média'
      case 'high': return 'Alta'
      default: return intensity
    }
  }

  getActivityIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'caminhada': return '🚶'
      case 'corrida': return '🏃'
      case 'brincadeira': return '🎾'
      case 'natação': return '🏊'
      case 'bicicleta': return '🚴'
      default: return '🏃'
    }
  }
}

export const reportService = new ReportService()
export type { ReportFilter, ReportData, ExportOptions }