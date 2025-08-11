import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { HealthReport, DailyHealthRecord } from './healthTrackingService'
import { Pet } from '@/stores/petStore'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export interface ExportOptions {
  format: 'pdf' | 'excel'
  includeCharts?: boolean
  includeRecommendations?: boolean
  template?: 'simple' | 'detailed' | 'professional'
  dateRange?: {
    start: Date
    end: Date
  }
}

class ExportService {
  // Cores OiPet
  private readonly colors = {
    coral: '#E85A5A',
    teal: '#5AA3A3',
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    darkGray: '#374151'
  }

  // Exportar relatório de saúde como PDF
  async exportHealthReportPDF(
    report: HealthReport,
    pet: Pet,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const doc = new jsPDF()
    const template = options.template || 'professional'
    
    // Configurações gerais
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let yPosition = margin

    // Adicionar header com logo OiPet
    this.addPDFHeader(doc, yPosition)
    yPosition += 30

    // Título do relatório
    doc.setFontSize(24)
    doc.setTextColor(this.colors.coral)
    doc.text('Relatório de Saúde', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Informações do pet
    doc.setFontSize(18)
    doc.setTextColor(this.colors.darkGray)
    doc.text(pet.name, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    doc.setFontSize(12)
    doc.setTextColor(this.colors.gray)
    doc.text(`${pet.breed} | ${this.calculateAge(pet.birthDate)} | ${pet.gender === 'male' ? 'Macho' : 'Fêmea'}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Período do relatório
    doc.setFontSize(10)
    doc.text(
      `Período: ${new Date(report.startDate).toLocaleDateString('pt-BR')} - ${new Date(report.endDate).toLocaleDateString('pt-BR')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    )
    yPosition += 15

    // Linha divisória
    doc.setDrawColor(this.colors.lightGray)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Estatísticas resumidas
    if (template === 'professional' || template === 'detailed') {
      yPosition = this.addStatisticsSummary(doc, report, yPosition)
    }

    // Tabela de registros de saúde
    yPosition = this.addHealthRecordsTable(doc, report.data, yPosition)

    // Adicionar gráficos se solicitado
    if (options.includeCharts && report.summary.charts) {
      // Nova página para gráficos
      doc.addPage()
      yPosition = margin
      this.addPDFHeader(doc, yPosition)
      yPosition += 30

      doc.setFontSize(18)
      doc.setTextColor(this.colors.coral)
      doc.text('Gráficos e Análises', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      // Adicionar descrições dos gráficos
      yPosition = this.addChartDescriptions(doc, report.summary.charts, yPosition)
    }

    // Adicionar recomendações se solicitado
    if (options.includeRecommendations && report.summary.insights) {
      if (yPosition > pageHeight - 80) {
        doc.addPage()
        yPosition = margin
        this.addPDFHeader(doc, yPosition)
        yPosition += 30
      }

      yPosition = this.addRecommendations(doc, report.summary.insights, yPosition)
    }

    // Rodapé
    this.addPDFFooter(doc)

    // Salvar o PDF
    const fileName = `relatorio_saude_${pet.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  // Exportar relatório de saúde como Excel
  async exportHealthReportExcel(
    report: HealthReport,
    pet: Pet,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const workbook = XLSX.utils.book_new()

    // Aba de informações gerais
    const infoData = [
      ['Relatório de Saúde - OiPet'],
      [],
      ['Pet', pet.name],
      ['Raça', pet.breed],
      ['Idade', this.calculateAge(pet.birthDate)],
      ['Sexo', pet.gender === 'male' ? 'Macho' : 'Fêmea'],
      [],
      ['Período', `${new Date(report.startDate).toLocaleDateString('pt-BR')} - ${new Date(report.endDate).toLocaleDateString('pt-BR')}`],
      ['Gerado em', new Date().toLocaleDateString('pt-BR')]
    ]
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações')

    // Aba de registros de saúde
    const healthData = this.prepareHealthDataForExcel(report.data)
    const healthSheet = XLSX.utils.json_to_sheet(healthData)
    XLSX.utils.book_append_sheet(workbook, healthSheet, 'Registros de Saúde')

    // Aba de estatísticas
    if (report.summary.statistics) {
      const statsData = this.prepareStatisticsForExcel(report.summary.statistics)
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas')
    }

    // Aba de análises
    if (report.summary.charts) {
      const chartsData = this.prepareChartsDataForExcel(report.summary.charts)
      const chartsSheet = XLSX.utils.json_to_sheet(chartsData.weight || [])
      XLSX.utils.book_append_sheet(workbook, chartsSheet, 'Análise de Peso')

      if (chartsData.activity) {
        const activitySheet = XLSX.utils.json_to_sheet(chartsData.activity)
        XLSX.utils.book_append_sheet(workbook, activitySheet, 'Análise de Atividade')
      }
    }

    // Aba de recomendações
    if (options.includeRecommendations && report.summary.insights) {
      const insightsData = this.prepareInsightsForExcel(report.summary.insights)
      const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData)
      XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Recomendações')
    }

    // Salvar o arquivo Excel
    const fileName = `relatorio_saude_${pet.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  // Métodos auxiliares para PDF

  private addPDFHeader(doc: jsPDF, yPosition: number): void {
    const pageWidth = doc.internal.pageSize.width

    // Logo OiPet (texto estilizado)
    doc.setFontSize(20)
    doc.setTextColor(this.colors.coral)
    doc.text('OiPet', 20, yPosition)
    
    doc.setFontSize(10)
    doc.setTextColor(this.colors.teal)
    doc.text('Saúde', 52, yPosition)

    // Data e hora
    doc.setFontSize(10)
    doc.setTextColor(this.colors.gray)
    doc.text(
      new Date().toLocaleString('pt-BR'),
      pageWidth - 20,
      yPosition,
      { align: 'right' }
    )
  }

  private addPDFFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages()
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Linha divisória
      doc.setDrawColor(this.colors.lightGray)
      doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25)
      
      // Texto do rodapé
      doc.setFontSize(8)
      doc.setTextColor(this.colors.gray)
      doc.text(
        'OiPet - Comida de Verdade para seu Pet',
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      )
      
      // Número da página
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 20,
        pageHeight - 15,
        { align: 'right' }
      )
    }
  }

  private addStatisticsSummary(doc: jsPDF, report: HealthReport, yPosition: number): number {
    const pageWidth = doc.internal.pageSize.width
    const stats = report.summary.statistics

    if (!stats) return yPosition

    doc.setFontSize(14)
    doc.setTextColor(this.colors.darkGray)
    doc.text('Resumo Estatístico', 20, yPosition)
    yPosition += 10

    // Criar cards de estatísticas
    const cardWidth = (pageWidth - 60) / 3
    const cardHeight = 30
    const startX = 20

    // Card 1: Peso
    this.drawStatsCard(
      doc,
      startX,
      yPosition,
      cardWidth,
      cardHeight,
      'Peso Médio',
      `${stats.weight.average.toFixed(1)} kg`,
      `Min: ${stats.weight.min.toFixed(1)} | Max: ${stats.weight.max.toFixed(1)}`
    )

    // Card 2: Atividade
    this.drawStatsCard(
      doc,
      startX + cardWidth + 10,
      yPosition,
      cardWidth,
      cardHeight,
      'Atividade Média',
      `${Math.round(stats.activity.averageSteps)} passos`,
      `${stats.activity.averageMinutes} min/dia`
    )

    // Card 3: Registros
    this.drawStatsCard(
      doc,
      startX + (cardWidth + 10) * 2,
      yPosition,
      cardWidth,
      cardHeight,
      'Total de Registros',
      stats.totalRecords.toString(),
      `${stats.daysWithData} dias com dados`
    )

    return yPosition + cardHeight + 15
  }

  private drawStatsCard(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    value: string,
    subtitle: string
  ): void {
    // Background
    doc.setFillColor(this.colors.lightGray)
    doc.roundedRect(x, y, width, height, 3, 3, 'F')

    // Título
    doc.setFontSize(10)
    doc.setTextColor(this.colors.gray)
    doc.text(title, x + width / 2, y + 8, { align: 'center' })

    // Valor
    doc.setFontSize(14)
    doc.setTextColor(this.colors.darkGray)
    doc.setFont(undefined, 'bold')
    doc.text(value, x + width / 2, y + 18, { align: 'center' })
    doc.setFont(undefined, 'normal')

    // Subtítulo
    doc.setFontSize(8)
    doc.setTextColor(this.colors.gray)
    doc.text(subtitle, x + width / 2, y + 25, { align: 'center' })
  }

  private addHealthRecordsTable(
    doc: jsPDF,
    records: DailyHealthRecord[],
    yPosition: number
  ): number {
    const tableData = records.map(record => [
      new Date(record.date).toLocaleDateString('pt-BR'),
      record.weight ? `${record.weight.toFixed(1)} kg` : '-',
      record.waterIntake ? `${record.waterIntake} ml` : '-',
      record.foodIntake ? `${record.foodIntake} g` : '-',
      record.activity ? `${record.activity.steps} passos` : '-',
      record.sleep ? `${record.sleep.hours.toFixed(1)}h` : '-'
    ])

    doc.autoTable({
      head: [['Data', 'Peso', 'Água', 'Alimentação', 'Atividade', 'Sono']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.coral,
        textColor: '#FFFFFF',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.colors.darkGray
      },
      alternateRowStyles: {
        fillColor: this.colors.lightGray
      },
      margin: { left: 20, right: 20 }
    })

    return (doc as any).lastAutoTable.finalY + 10
  }

  private addChartDescriptions(doc: jsPDF, charts: any, yPosition: number): number {
    // Descrição do gráfico de peso
    if (charts.weight) {
      doc.setFontSize(12)
      doc.setTextColor(this.colors.darkGray)
      doc.setFont(undefined, 'bold')
      doc.text('Evolução do Peso', 20, yPosition)
      doc.setFont(undefined, 'normal')
      yPosition += 8

      doc.setFontSize(10)
      doc.setTextColor(this.colors.gray)
      const weightTrend = this.analyzeWeightTrend(charts.weight)
      doc.text(weightTrend, 20, yPosition, { maxWidth: doc.internal.pageSize.width - 40 })
      yPosition += 20
    }

    // Descrição do gráfico de atividade
    if (charts.activity) {
      doc.setFontSize(12)
      doc.setTextColor(this.colors.darkGray)
      doc.setFont(undefined, 'bold')
      doc.text('Padrão de Atividade', 20, yPosition)
      doc.setFont(undefined, 'normal')
      yPosition += 8

      doc.setFontSize(10)
      doc.setTextColor(this.colors.gray)
      const activityPattern = this.analyzeActivityPattern(charts.activity)
      doc.text(activityPattern, 20, yPosition, { maxWidth: doc.internal.pageSize.width - 40 })
      yPosition += 20
    }

    return yPosition
  }

  private addRecommendations(doc: jsPDF, insights: string[], yPosition: number): number {
    doc.setFontSize(14)
    doc.setTextColor(this.colors.coral)
    doc.text('Recomendações', 20, yPosition)
    yPosition += 10

    insights.forEach((insight, index) => {
      doc.setFontSize(10)
      doc.setTextColor(this.colors.darkGray)
      doc.text(`${index + 1}. ${insight}`, 25, yPosition, { 
        maxWidth: doc.internal.pageSize.width - 45 
      })
      yPosition += 12
    })

    return yPosition
  }

  // Métodos auxiliares para Excel

  private prepareHealthDataForExcel(records: DailyHealthRecord[]): any[] {
    return records.map(record => ({
      'Data': new Date(record.date).toLocaleDateString('pt-BR'),
      'Peso (kg)': record.weight || '',
      'Água (ml)': record.waterIntake || '',
      'Alimentação (g)': record.foodIntake || '',
      'Passos': record.activity?.steps || '',
      'Exercício (min)': record.activity?.exerciseMinutes || '',
      'Sono (horas)': record.sleep?.hours || '',
      'Qualidade do Sono': record.sleep?.quality || '',
      'Humor': record.mood ? `Energia: ${record.mood.energy}/5, Felicidade: ${record.mood.happiness}/5` : '',
      'Observações': record.notes || ''
    }))
  }

  private prepareStatisticsForExcel(statistics: any): any[][] {
    return [
      ['Estatísticas de Saúde'],
      [],
      ['Métrica', 'Valor', 'Mínimo', 'Máximo', 'Média'],
      ['Peso (kg)', '', statistics.weight.min, statistics.weight.max, statistics.weight.average],
      ['Água (ml/dia)', '', statistics.water.min, statistics.water.max, statistics.water.average],
      ['Passos/dia', '', statistics.activity.minSteps, statistics.activity.maxSteps, statistics.activity.averageSteps],
      ['Exercício (min/dia)', '', statistics.activity.minMinutes, statistics.activity.maxMinutes, statistics.activity.averageMinutes],
      ['Sono (horas/dia)', '', statistics.sleep.min, statistics.sleep.max, statistics.sleep.average],
      [],
      ['Total de Registros', statistics.totalRecords],
      ['Dias com Dados', statistics.daysWithData],
      ['Taxa de Completude', `${((statistics.daysWithData / statistics.totalDays) * 100).toFixed(1)}%`]
    ]
  }

  private prepareChartsDataForExcel(charts: any): any {
    const result: any = {}

    if (charts.weight) {
      result.weight = charts.weight.map((point: any) => ({
        'Data': point.date,
        'Peso (kg)': point.value
      }))
    }

    if (charts.activity) {
      result.activity = charts.activity.map((point: any) => ({
        'Data': point.date,
        'Passos': point.steps,
        'Minutos de Exercício': point.minutes
      }))
    }

    return result
  }

  private prepareInsightsForExcel(insights: string[]): any[][] {
    const data = [['Recomendações e Insights'], []]
    
    insights.forEach((insight, index) => {
      data.push([`${index + 1}. ${insight}`])
    })

    return data
  }

  // Métodos utilitários

  private calculateAge(birthDate: Date | string): string {
    const birth = new Date(birthDate)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()
    
    if (years === 0) {
      return `${months} meses`
    } else if (years === 1) {
      return '1 ano'
    } else {
      return `${years} anos`
    }
  }

  private analyzeWeightTrend(weightData: any[]): string {
    if (!weightData || weightData.length < 2) {
      return 'Dados insuficientes para análise de tendência.'
    }

    const firstWeight = weightData[0].value
    const lastWeight = weightData[weightData.length - 1].value
    const change = lastWeight - firstWeight
    const percentChange = (change / firstWeight) * 100

    if (Math.abs(percentChange) < 2) {
      return `O peso permaneceu estável durante o período, com variação menor que 2%.`
    } else if (change > 0) {
      return `Houve um aumento de ${change.toFixed(1)}kg (${percentChange.toFixed(1)}%) no peso durante o período analisado.`
    } else {
      return `Houve uma redução de ${Math.abs(change).toFixed(1)}kg (${Math.abs(percentChange).toFixed(1)}%) no peso durante o período analisado.`
    }
  }

  private analyzeActivityPattern(activityData: any[]): string {
    if (!activityData || activityData.length === 0) {
      return 'Dados de atividade insuficientes para análise.'
    }

    const avgSteps = activityData.reduce((sum, d) => sum + (d.steps || 0), 0) / activityData.length
    const avgMinutes = activityData.reduce((sum, d) => sum + (d.minutes || 0), 0) / activityData.length

    return `Média de ${Math.round(avgSteps)} passos e ${Math.round(avgMinutes)} minutos de exercício por dia durante o período.`
  }
}

export const exportService = new ExportService()