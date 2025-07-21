// Report Service Real - Geração de relatórios funcionais com dados reais
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subDays, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { healthTrackingService, type DailyHealthRecord, type HealthTrend } from './healthTrackingService'
import { usePetStore } from '@/stores/petStore'

export interface ReportFilter {
  petIds?: string[]
  startDate?: string
  endDate?: string
  reportType: 'health' | 'weight' | 'activity' | 'nutrition' | 'complete'
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includePhotos: boolean
  language: 'pt-BR' | 'en-US'
}

export interface ReportMetadata {
  title: string
  subtitle: string
  period: string
  generatedAt: string
  petCount: number
  recordCount: number
  reportType: string
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill?: boolean
  }>
}

export interface ReportSection {
  id: string
  title: string
  type: 'chart' | 'table' | 'summary' | 'text'
  data: any
  description?: string
}

export interface ReportData {
  metadata: ReportMetadata
  sections: ReportSection[]
  summary: {
    totalRecords: number
    averageWeight?: number
    totalActivity?: number
    healthScore: number
    trends: HealthTrend[]
    recommendations: string[]
  }
  pets: Array<{
    id: string
    name: string
    breed: string
    records: DailyHealthRecord[]
  }>
}

class ReportServiceReal {
  
  async generateReport(filter: ReportFilter): Promise<ReportData> {
    // Obter pets
    const pets = usePetStore.getState().pets
    
    const selectedPets = filter.petIds 
      ? pets.filter(p => filter.petIds!.includes(p._id))
      : pets

    if (selectedPets.length === 0) {
      throw new Error('Nenhum pet selecionado para o relatório')
    }

    // Calcular período
    const { startDate, endDate } = this.calculatePeriod(filter.period, filter.startDate, filter.endDate)

    // Coletar dados de saúde
    const petsWithRecords = await Promise.all(
      selectedPets.map(async (pet) => {
        const records = await healthTrackingService.getHealthRecords(
          pet._id,
          new Date(startDate),
          new Date(endDate)
        )
        return { ...pet, records }
      })
    )

    // Gerar seções baseadas no tipo de relatório
    const sections = await this.generateSections(filter.reportType, petsWithRecords, startDate, endDate)

    // Calcular estatísticas e resumo
    const summary = this.calculateSummary(petsWithRecords)

    // Metadata do relatório
    const metadata: ReportMetadata = {
      title: this.getReportTitle(filter.reportType),
      subtitle: `Relatório de ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })} até ${format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}`,
      period: this.getPeriodText(filter.period),
      generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      petCount: selectedPets.length,
      recordCount: petsWithRecords.reduce((sum, pet) => sum + pet.records.length, 0),
      reportType: filter.reportType
    }

    return {
      metadata,
      sections,
      summary,
      pets: petsWithRecords
    }
  }

  private calculatePeriod(period: string, customStart?: string, customEnd?: string) {
    const now = new Date()
    let startDate: string, endDate: string

    switch (period) {
      case 'week':
        startDate = startOfWeek(now).toISOString().split('T')[0]
        endDate = endOfWeek(now).toISOString().split('T')[0]
        break
      case 'month':
        startDate = startOfMonth(now).toISOString().split('T')[0]
        endDate = endOfMonth(now).toISOString().split('T')[0]
        break
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        startDate = quarterStart.toISOString().split('T')[0]
        endDate = endOfMonth(new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 2, 1)).toISOString().split('T')[0]
        break
      case 'year':
        startDate = startOfYear(now).toISOString().split('T')[0]
        endDate = endOfYear(now).toISOString().split('T')[0]
        break
      case 'custom':
        startDate = customStart || subDays(now, 30).toISOString().split('T')[0]
        endDate = customEnd || now.toISOString().split('T')[0]
        break
      default:
        startDate = subDays(now, 30).toISOString().split('T')[0]
        endDate = now.toISOString().split('T')[0]
    }

    return { startDate, endDate }
  }

  private async generateSections(
    reportType: string, 
    petsWithRecords: any[], 
    startDate: string, 
    endDate: string
  ): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    switch (reportType) {
      case 'weight':
        sections.push(...await this.generateWeightSections(petsWithRecords))
        break
      case 'activity':
        sections.push(...await this.generateActivitySections(petsWithRecords))
        break
      case 'nutrition':
        sections.push(...await this.generateNutritionSections(petsWithRecords))
        break
      case 'health':
        sections.push(...await this.generateHealthSections(petsWithRecords))
        break
      case 'complete':
        sections.push(...await this.generateCompleteSections(petsWithRecords))
        break
    }

    return sections
  }

  private async generateWeightSections(petsWithRecords: any[]): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    // Gráfico de evolução do peso
    const weightChart = this.createWeightChart(petsWithRecords)
    if (weightChart) {
      sections.push({
        id: 'weight-evolution',
        title: 'Evolução do Peso',
        type: 'chart',
        data: weightChart,
        description: 'Acompanhamento da evolução do peso ao longo do período'
      })
    }

    // Tabela de estatísticas de peso
    const weightStats = this.createWeightStatsTable(petsWithRecords)
    sections.push({
      id: 'weight-stats',
      title: 'Estatísticas de Peso',
      type: 'table',
      data: weightStats,
      description: 'Resumo estatístico dos dados de peso'
    })

    return sections
  }

  private async generateActivitySections(petsWithRecords: any[]): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    // Gráfico de atividade diária
    const activityChart = this.createActivityChart(petsWithRecords)
    if (activityChart) {
      sections.push({
        id: 'activity-daily',
        title: 'Atividade Diária',
        type: 'chart',
        data: activityChart,
        description: 'Passos e minutos de exercício por dia'
      })
    }

    // Resumo de atividade
    const activitySummary = this.createActivitySummary(petsWithRecords)
    sections.push({
      id: 'activity-summary',
      title: 'Resumo de Atividade',
      type: 'summary',
      data: activitySummary,
      description: 'Estatísticas gerais de atividade física'
    })

    return sections
  }

  private async generateNutritionSections(petsWithRecords: any[]): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    // Gráfico de consumo de água e comida
    const nutritionChart = this.createNutritionChart(petsWithRecords)
    if (nutritionChart) {
      sections.push({
        id: 'nutrition-intake',
        title: 'Consumo de Água e Alimentação',
        type: 'chart',
        data: nutritionChart,
        description: 'Monitoramento do consumo diário de água e ração'
      })
    }

    return sections
  }

  private async generateHealthSections(petsWithRecords: any[]): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    // Score de saúde geral
    const healthScore = this.calculateHealthScore(petsWithRecords)
    sections.push({
      id: 'health-score',
      title: 'Indicador de Saúde',
      type: 'summary',
      data: {
        score: healthScore,
        level: this.getHealthLevel(healthScore),
        description: this.getHealthDescription(healthScore)
      },
      description: 'Indicador geral de saúde baseado em múltiplas métricas'
    })

    // Alertas e recomendações
    const recommendations = await this.generateRecommendations(petsWithRecords)
    sections.push({
      id: 'recommendations',
      title: 'Recomendações',
      type: 'text',
      data: {
        items: recommendations
      },
      description: 'Sugestões baseadas na análise dos dados'
    })

    return sections
  }

  private async generateCompleteSections(petsWithRecords: any[]): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    // Incluir todas as seções
    sections.push(...await this.generateWeightSections(petsWithRecords))
    sections.push(...await this.generateActivitySections(petsWithRecords))
    sections.push(...await this.generateNutritionSections(petsWithRecords))
    sections.push(...await this.generateHealthSections(petsWithRecords))

    return sections
  }

  private createWeightChart(petsWithRecords: any[]): ChartData | null {
    if (petsWithRecords.length === 0) return null

    const allDates = new Set<string>()
    petsWithRecords.forEach(pet => {
      pet.records.forEach((record: DailyHealthRecord) => {
        if (record.weight) allDates.add(record.date)
      })
    })

    const sortedDates = Array.from(allDates).sort()
    if (sortedDates.length === 0) return null

    const datasets = petsWithRecords.map((pet, index) => {
      const data = sortedDates.map(date => {
        const record = pet.records.find((r: DailyHealthRecord) => r.date === date)
        return record?.weight || null
      })

      const colors = ['#E85A5A', '#5AA3A3', '#A35AA3', '#5AE85A', '#E8E85A']
      const color = colors[index % colors.length]

      return {
        label: pet.name,
        data,
        borderColor: color,
        backgroundColor: color + '20',
        fill: false
      }
    })

    return {
      labels: sortedDates.map(date => format(new Date(date), 'dd/MM', { locale: ptBR })),
      datasets
    }
  }

  private createActivityChart(petsWithRecords: any[]): ChartData | null {
    if (petsWithRecords.length === 0) return null

    const allDates = new Set<string>()
    petsWithRecords.forEach(pet => {
      pet.records.forEach((record: DailyHealthRecord) => {
        if (record.activity) allDates.add(record.date)
      })
    })

    const sortedDates = Array.from(allDates).sort()
    if (sortedDates.length === 0) return null

    const datasets = petsWithRecords.map((pet, index) => {
      const stepsData = sortedDates.map(date => {
        const record = pet.records.find((r: DailyHealthRecord) => r.date === date)
        return record?.activity?.steps || 0
      })

      const colors = ['#34D399', '#60A5FA', '#F87171', '#FBBF24', '#A78BFA']
      const color = colors[index % colors.length]

      return {
        label: `${pet.name} - Passos`,
        data: stepsData,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true
      }
    })

    return {
      labels: sortedDates.map(date => format(new Date(date), 'dd/MM', { locale: ptBR })),
      datasets
    }
  }

  private createNutritionChart(petsWithRecords: any[]): ChartData | null {
    if (petsWithRecords.length === 0) return null

    const allDates = new Set<string>()
    petsWithRecords.forEach(pet => {
      pet.records.forEach((record: DailyHealthRecord) => {
        if (record.waterIntake || record.foodIntake) allDates.add(record.date)
      })
    })

    const sortedDates = Array.from(allDates).sort()
    if (sortedDates.length === 0) return null

    const datasets: any[] = []

    petsWithRecords.forEach((pet, index) => {
      const waterData = sortedDates.map(date => {
        const record = pet.records.find((r: DailyHealthRecord) => r.date === date)
        return record?.waterIntake || 0
      })

      const foodData = sortedDates.map(date => {
        const record = pet.records.find((r: DailyHealthRecord) => r.date === date)
        return record?.foodIntake || 0
      })

      const colors = ['#06B6D4', '#F59E0B']
      
      datasets.push({
        label: `${pet.name} - Água (ml)`,
        data: waterData,
        borderColor: colors[0],
        backgroundColor: colors[0] + '20',
        yAxisID: 'y'
      })

      datasets.push({
        label: `${pet.name} - Ração (g)`,
        data: foodData,
        borderColor: colors[1],
        backgroundColor: colors[1] + '20',
        yAxisID: 'y1'
      })
    })

    return {
      labels: sortedDates.map(date => format(new Date(date), 'dd/MM', { locale: ptBR })),
      datasets
    }
  }

  private createWeightStatsTable(petsWithRecords: any[]) {
    return {
      headers: ['Pet', 'Peso Inicial', 'Peso Final', 'Variação', 'Peso Médio'],
      rows: petsWithRecords.map(pet => {
        const weights = pet.records
          .filter((r: DailyHealthRecord) => r.weight)
          .map((r: DailyHealthRecord) => r.weight!)
          .sort()

        if (weights.length === 0) {
          return [pet.name, '-', '-', '-', '-']
        }

        const initial = weights[0]
        const final = weights[weights.length - 1]
        const average = weights.reduce((sum, w) => sum + w, 0) / weights.length
        const variation = final - initial

        return [
          pet.name,
          `${initial.toFixed(1)} kg`,
          `${final.toFixed(1)} kg`,
          `${variation >= 0 ? '+' : ''}${variation.toFixed(1)} kg`,
          `${average.toFixed(1)} kg`
        ]
      })
    }
  }

  private createActivitySummary(petsWithRecords: any[]) {
    const summary = petsWithRecords.map(pet => {
      const activities = pet.records.filter((r: DailyHealthRecord) => r.activity)
      
      if (activities.length === 0) {
        return {
          petName: pet.name,
          totalDays: 0,
          averageSteps: 0,
          totalSteps: 0,
          averageExercise: 0
        }
      }

      const totalSteps = activities.reduce((sum: number, r: DailyHealthRecord) => sum + (r.activity?.steps || 0), 0)
      const totalExercise = activities.reduce((sum: number, r: DailyHealthRecord) => sum + (r.activity?.exerciseMinutes || 0), 0)

      return {
        petName: pet.name,
        totalDays: activities.length,
        averageSteps: Math.round(totalSteps / activities.length),
        totalSteps,
        averageExercise: Math.round(totalExercise / activities.length)
      }
    })

    return { pets: summary }
  }

  private calculateSummary(petsWithRecords: any[]) {
    const totalRecords = petsWithRecords.reduce((sum, pet) => sum + pet.records.length, 0)
    
    // Calcular peso médio
    const allWeights: number[] = []
    petsWithRecords.forEach(pet => {
      pet.records.forEach((record: DailyHealthRecord) => {
        if (record.weight) allWeights.push(record.weight)
      })
    })
    const averageWeight = allWeights.length > 0 ? allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length : undefined

    // Calcular atividade total
    const totalActivity = petsWithRecords.reduce((sum, pet) => {
      return sum + pet.records.reduce((petSum: number, record: DailyHealthRecord) => {
        return petSum + (record.activity?.steps || 0)
      }, 0)
    }, 0)

    // Calcular score de saúde
    const healthScore = this.calculateHealthScore(petsWithRecords)

    // Gerar tendências (usar o primeiro pet como exemplo)
    const trends: HealthTrend[] = []
    if (petsWithRecords.length > 0) {
      // Em uma implementação real, calcularíamos tendências para todos os pets
      // Por agora, vamos criar um exemplo simples
    }

    // Gerar recomendações
    const recommendations = [
      'Mantenha a consistência no registro de dados diários',
      'Monitore variações significativas de peso',
      'Certifique-se de que seu pet está bebendo água suficiente',
      'Acompanhe os níveis de atividade física regularmente'
    ]

    return {
      totalRecords,
      averageWeight,
      totalActivity,
      healthScore,
      trends,
      recommendations
    }
  }

  private calculateHealthScore(petsWithRecords: any[]): number {
    if (petsWithRecords.length === 0) return 0

    let totalScore = 0
    let petCount = 0

    petsWithRecords.forEach(pet => {
      if (pet.records.length === 0) return

      let petScore = 50 // Base score
      const recentRecords = pet.records.slice(-7) // Últimos 7 registros

      // Pontuação baseada na consistência dos dados
      const consistency = (recentRecords.length / 7) * 20
      petScore += consistency

      // Pontuação baseada na atividade
      const avgActivity = recentRecords.reduce((sum: number, r: DailyHealthRecord) => 
        sum + (r.activity?.steps || 0), 0) / recentRecords.length
      if (avgActivity > 8000) petScore += 15
      else if (avgActivity > 5000) petScore += 10
      else if (avgActivity > 3000) petScore += 5

      // Pontuação baseada no consumo de água
      const avgWater = recentRecords.reduce((sum: number, r: DailyHealthRecord) => 
        sum + (r.waterIntake || 0), 0) / recentRecords.length
      if (avgWater > 800) petScore += 10
      else if (avgWater > 500) petScore += 5

      // Pontuação baseada na estabilidade do peso
      const weights = recentRecords.filter(r => r.weight).map(r => r.weight!)
      if (weights.length >= 2) {
        const weightVariation = Math.abs(weights[weights.length - 1] - weights[0])
        if (weightVariation < 0.5) petScore += 5
      }

      totalScore += Math.min(100, Math.max(0, petScore))
      petCount++
    })

    return petCount > 0 ? Math.round(totalScore / petCount) : 0
  }

  private getHealthLevel(score: number): string {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Regular'
    return 'Precisa Atenção'
  }

  private getHealthDescription(score: number): string {
    if (score >= 80) return 'Seu pet está mantendo excelentes hábitos de saúde!'
    if (score >= 60) return 'Bom acompanhamento, continue monitorando regularmente.'
    if (score >= 40) return 'Há espaço para melhorias no cuidado com a saúde.'
    return 'Recomenda-se maior atenção aos cuidados de saúde do pet.'
  }

  private async generateRecommendations(petsWithRecords: any[]): Promise<string[]> {
    const recommendations: string[] = []

    petsWithRecords.forEach(pet => {
      const recentRecords = pet.records.slice(-7)
      
      // Verificar atividade baixa
      const avgSteps = recentRecords.reduce((sum: number, r: DailyHealthRecord) => 
        sum + (r.activity?.steps || 0), 0) / recentRecords.length
      
      if (avgSteps < 5000) {
        recommendations.push(`${pet.name}: Aumentar atividade física (média de ${Math.round(avgSteps)} passos/dia)`)
      }

      // Verificar consumo de água
      const avgWater = recentRecords.reduce((sum: number, r: DailyHealthRecord) => 
        sum + (r.waterIntake || 0), 0) / recentRecords.length
      
      if (avgWater < 500) {
        recommendations.push(`${pet.name}: Monitorar consumo de água (média de ${Math.round(avgWater)}ml/dia)`)
      }

      // Verificar variação de peso
      const weights = recentRecords.filter(r => r.weight).map(r => r.weight!)
      if (weights.length >= 2) {
        const weightChange = Math.abs(weights[weights.length - 1] - weights[0])
        if (weightChange > 1) {
          recommendations.push(`${pet.name}: Mudança significativa de peso detectada (${weightChange.toFixed(1)}kg)`)
        }
      }
    })

    // Recomendações gerais se não houver específicas
    if (recommendations.length === 0) {
      recommendations.push(
        'Continue mantendo o bom acompanhamento da saúde do seu pet',
        'Lembre-se de registrar os dados diariamente para melhor precisão',
        'Consulte um veterinário regularmente para check-ups preventivos'
      )
    }

    return recommendations
  }

  private getReportTitle(reportType: string): string {
    switch (reportType) {
      case 'weight': return 'Relatório de Peso'
      case 'activity': return 'Relatório de Atividade'
      case 'nutrition': return 'Relatório Nutricional'
      case 'health': return 'Relatório de Saúde'
      case 'complete': return 'Relatório Completo de Saúde'
      default: return 'Relatório de Saúde'
    }
  }

  private getPeriodText(period: string): string {
    switch (period) {
      case 'week': return 'Última semana'
      case 'month': return 'Último mês'
      case 'quarter': return 'Último trimestre'
      case 'year': return 'Último ano'
      case 'custom': return 'Período personalizado'
      default: return 'Período selecionado'
    }
  }

  // Método para exportar relatório
  async exportReport(reportData: ReportData, options: ExportOptions): Promise<{ url: string; filename: string }> {
    const filename = this.generateFilename(reportData.metadata.title, options.format)
    
    let content = ''
    
    switch (options.format) {
      case 'json':
        content = JSON.stringify(reportData, null, 2)
        break
      case 'csv':
        content = this.generateCSV(reportData)
        break
      case 'pdf':
      case 'excel':
        // Para PDF/Excel, retornar mock URL por enquanto (M8.3)
        return {
          url: '#',
          filename: filename
        }
    }
    
    // Para JSON e CSV, criar blob e URL
    const blob = new Blob([content], { 
      type: options.format === 'json' ? 'application/json' : 'text/csv' 
    })
    const url = URL.createObjectURL(blob)
    
    return { url, filename }
  }

  private generateCSV(reportData: ReportData): string {
    let csv = 'Pet,Data,Peso,Água,Ração,Passos,Exercício,Sono,Notas\n'
    
    reportData.pets.forEach(pet => {
      pet.records.forEach(record => {
        csv += [
          pet.name,
          record.date,
          record.weight || '',
          record.waterIntake || '',
          record.foodIntake || '',
          record.activity?.steps || '',
          record.activity?.exerciseMinutes || '',
          record.sleep?.hours || '',
          `"${record.notes || ''}"`
        ].join(',') + '\n'
      })
    })

    return csv
  }

  private generateFilename(title: string, format: string): string {
    const date = new Date().toISOString().split('T')[0]
    const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return `${sanitizedTitle}-${date}.${format}`
  }
}

// Singleton instance
export const reportServiceReal = new ReportServiceReal()
export default reportServiceReal