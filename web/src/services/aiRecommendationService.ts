// AI Recommendation Service - Sistema inteligente de recomendações
import { usePetStore } from '@/stores/petStore'
import { healthTrackingService, type DailyHealthRecord } from './healthTrackingService'
import { aiService, type FoodRecognitionResult } from './aiService'

export interface RecommendationContext {
  petId: string
  petData: {
    name: string
    species: 'dog' | 'cat' | 'other'
    breed: string
    weight: number
    age: number // em meses
    activityLevel: 'low' | 'moderate' | 'high'
  }
  healthHistory: DailyHealthRecord[]
  recentScans: FoodRecognitionResult[]
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter'
}

export interface NutritionRecommendation {
  id: string
  type: 'food' | 'supplement' | 'treats' | 'hydration'
  title: string
  description: string
  reasoning: string
  priority: 'high' | 'medium' | 'low'
  confidence: number // 0-100%
  oipetProduct?: {
    id: string
    name: string
    category: string
    url: string
    price?: number
    image?: string
  }
  nutritionalBenefits: string[]
  implementationTips: string[]
  expectedResults: string[]
  timeframe: string // "2-3 semanas", "1 mês"
}

export interface ActivityRecommendation {
  id: string
  title: string
  description: string
  duration: number // minutos
  intensity: 'low' | 'moderate' | 'high'
  frequency: string // "3x por semana"
  equipment?: string[]
  weatherDependent: boolean
  ageAppropriate: boolean
  breedSpecific: boolean
  reasoning: string
  benefits: string[]
}

export interface HealthRecommendation {
  id: string
  type: 'preventive' | 'corrective' | 'monitoring'
  title: string
  description: string
  urgency: 'immediate' | 'soon' | 'routine'
  reasoning: string
  symptoms?: string[]
  recommendations: string[]
  veterinaryConsult: boolean
  monitoring: {
    metrics: string[]
    frequency: string
    alerts: string[]
  }
}

export interface RecommendationPackage {
  petId: string
  petName: string
  generatedAt: Date
  nutrition: NutritionRecommendation[]
  activity: ActivityRecommendation[]
  health: HealthRecommendation[]
  summary: {
    totalRecommendations: number
    highPriorityCount: number
    estimatedImplementationTime: string
    expectedOutcome: string
  }
  insights: {
    healthTrends: string[]
    nutritionalGaps: string[]
    behaviorPatterns: string[]
    improvementAreas: string[]
  }
}

class AIRecommendationService {
  private readonly OIPET_PRODUCTS = [
    {
      id: 'natural-adult',
      name: 'Ração Natural Adult',
      category: 'food',
      url: '/para-cachorros/racao-natural-adult',
      description: 'Ração natural premium para cães adultos',
      benefits: ['Rico em proteínas', 'Ingredientes naturais', 'Sem conservantes artificiais']
    },
    {
      id: 'petiscos-naturais',
      name: 'Petiscos Naturais',
      category: 'treats',
      url: '/petiscos.html',
      description: 'Petiscos saudáveis e naturais',
      benefits: ['Baixo teor de gordura', '100% natural', 'Rico em fibras']
    },
    {
      id: 'suplemento-omega',
      name: 'Suplemento Ômega 3',
      category: 'supplement',
      url: '/suplementos/omega-3',
      description: 'Suplementação para pelagem e articulações',
      benefits: ['Melhora a pelagem', 'Fortalece articulações', 'Anti-inflamatório natural']
    }
  ]

  async generateRecommendations(petId: string): Promise<RecommendationPackage> {
    try {
      const context = await this.buildRecommendationContext(petId)
      
      const nutritionRecommendations = await this.generateNutritionRecommendations(context)
      const activityRecommendations = await this.generateActivityRecommendations(context)
      const healthRecommendations = await this.generateHealthRecommendations(context)
      
      const summary = this.generateSummary(nutritionRecommendations, activityRecommendations, healthRecommendations)
      const insights = await this.generateInsights(context)

      return {
        petId,
        petName: context.petData.name,
        generatedAt: new Date(),
        nutrition: nutritionRecommendations,
        activity: activityRecommendations,
        health: healthRecommendations,
        summary,
        insights
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error)
      throw new Error('Falha na geração de recomendações inteligentes')
    }
  }

  private async buildRecommendationContext(petId: string): Promise<RecommendationContext> {
    const pets = usePetStore.getState().pets
    const pet = pets.find(p => p._id === petId)
    
    if (!pet) {
      throw new Error('Pet não encontrado')
    }

    // Buscar histórico de saúde dos últimos 30 dias
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000))
    const healthHistory = await healthTrackingService.getHealthRecords(petId, startDate, endDate)

    // Buscar escaneamentos recentes (mock por enquanto)
    const recentScans: FoodRecognitionResult[] = []

    // Calcular idade em meses
    const age = Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    
    // Determinar nível de atividade baseado nos dados
    const activityLevel = this.calculateActivityLevel(healthHistory)
    
    // Determinar estação atual
    const currentSeason = this.getCurrentSeason()

    return {
      petId,
      petData: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        weight: pet.weight || 0,
        age,
        activityLevel
      },
      healthHistory,
      recentScans,
      currentSeason
    }
  }

  private async generateNutritionRecommendations(context: RecommendationContext): Promise<NutritionRecommendation[]> {
    const recommendations: NutritionRecommendation[] = []

    // Recomendação baseada na idade
    if (context.petData.age < 12) {
      recommendations.push({
        id: 'puppy-nutrition',
        type: 'food',
        title: 'Nutrição para Filhotes',
        description: 'Ração especial rica em proteínas e cálcio para o crescimento saudável',
        reasoning: `${context.petData.name} ainda está em fase de crescimento e precisa de nutrição específica`,
        priority: 'high',
        confidence: 95,
        oipetProduct: this.OIPET_PRODUCTS.find(p => p.category === 'food'),
        nutritionalBenefits: [
          'Alto teor proteico para desenvolvimento muscular',
          'Cálcio e fósforo para ossos fortes',
          'DHA para desenvolvimento cerebral'
        ],
        implementationTips: [
          'Dividir em 3-4 refeições diárias',
          'Transição gradual da ração anterior',
          'Sempre água fresca disponível'
        ],
        expectedResults: [
          'Crescimento adequado',
          'Pelagem brilhante',
          'Energia equilibrada'
        ],
        timeframe: '2-3 meses'
      })
    }

    // Recomendação baseada no peso
    const idealWeight = this.calculateIdealWeight(context.petData.species, context.petData.breed)
    if (context.petData.weight > idealWeight * 1.15) {
      recommendations.push({
        id: 'weight-management',
        type: 'food',
        title: 'Controle de Peso',
        description: 'Ração light com baixo teor calórico para perda de peso saudável',
        reasoning: `${context.petData.name} está acima do peso ideal (${idealWeight}kg)`,
        priority: 'high',
        confidence: 85,
        nutritionalBenefits: [
          'Menos calorias por porção',
          'Rico em fibras para saciedade',
          'Mantém nutrientes essenciais'
        ],
        implementationTips: [
          'Reduzir porções gradualmente',
          'Eliminar petiscos extras',
          'Aumentar atividade física'
        ],
        expectedResults: [
          'Perda de 1-2% do peso por semana',
          'Maior disposição',
          'Melhora na mobilidade'
        ],
        timeframe: '2-4 meses'
      })
    }

    // Recomendação baseada na atividade
    if (context.petData.activityLevel === 'high') {
      recommendations.push({
        id: 'high-energy-nutrition',
        type: 'food',
        title: 'Nutrição para Alta Performance',
        description: 'Ração enriquecida com energia para pets muito ativos',
        reasoning: `${context.petData.name} demonstra alta atividade física e precisa de mais energia`,
        priority: 'medium',
        confidence: 80,
        nutritionalBenefits: [
          'Alto valor energético',
          'Proteínas de qualidade',
          'Carboidratos complexos'
        ],
        implementationTips: [
          'Alimentar 1h antes de atividades intensas',
          'Porções menores e mais frequentes',
          'Hidratação reforçada'
        ],
        expectedResults: [
          'Resistência melhorada',
          'Recuperação mais rápida',
          'Manutenção do peso ideal'
        ],
        timeframe: '3-4 semanas'
      })
    }

    // Recomendação sazonal
    if (context.currentSeason === 'summer') {
      recommendations.push({
        id: 'summer-hydration',
        type: 'hydration',
        title: 'Hidratação no Verão',
        description: 'Cuidados especiais com hidratação durante o calor',
        reasoning: 'Temperaturas altas exigem maior atenção à hidratação',
        priority: 'medium',
        confidence: 90,
        nutritionalBenefits: [
          'Prevenção da desidratação',
          'Regulação da temperatura corporal',
          'Melhora da digestão'
        ],
        implementationTips: [
          'Água sempre fresca e abundante',
          'Ração úmida nas refeições principais',
          'Petiscos gelados naturais (frutas)'
        ],
        expectedResults: [
          'Pet mais disposto no calor',
          'Redução do ofego excessivo',
          'Melhor digestão'
        ],
        timeframe: 'Durante todo o verão'
      })
    }

    return recommendations
  }

  private async generateActivityRecommendations(context: RecommendationContext): Promise<ActivityRecommendation[]> {
    const recommendations: ActivityRecommendation[] = []

    // Recomendação baseada na idade
    if (context.petData.age > 84) { // +7 anos
      recommendations.push({
        id: 'senior-exercise',
        title: 'Exercícios para Pets Seniores',
        description: 'Atividades de baixo impacto adequadas para pets mais velhos',
        duration: 20,
        intensity: 'low',
        frequency: 'Diariamente',
        equipment: ['Coleira confortável', 'Água'],
        weatherDependent: true,
        ageAppropriate: true,
        breedSpecific: false,
        reasoning: `${context.petData.name} está na terceira idade e precisa de exercícios mais suaves`,
        benefits: [
          'Manutenção da mobilidade',
          'Fortalecimento muscular',
          'Estimulação mental',
          'Controle do peso'
        ]
      })
    } else {
      // Pet adulto ou jovem
      const duration = context.petData.species === 'dog' ? 45 : 20
      const intensity = context.petData.activityLevel === 'low' ? 'moderate' : 'high'
      
      recommendations.push({
        id: 'regular-exercise',
        title: `Exercícios ${context.petData.species === 'dog' ? 'para Cães' : 'para Gatos'}`,
        description: `Atividades físicas adequadas para o nível de energia de ${context.petData.name}`,
        duration,
        intensity,
        frequency: context.petData.species === 'dog' ? '2x por dia' : '3x por semana',
        equipment: context.petData.species === 'dog' ? ['Coleira', 'Bolinha', 'Água'] : ['Brinquedos interativos', 'Arranhador'],
        weatherDependent: context.petData.species === 'dog',
        ageAppropriate: true,
        breedSpecific: true,
        reasoning: `Baseado na raça ${context.petData.breed} e nível de atividade atual`,
        benefits: [
          'Queima de energia',
          'Fortalecimento cardiovascular',
          'Socialização',
          'Redução da ansiedade'
        ]
      })
    }

    // Recomendação baseada no comportamento
    if (context.petData.activityLevel === 'low') {
      recommendations.push({
        id: 'increase-activity',
        title: 'Estímulo à Atividade Física',
        description: 'Estratégias para motivar pets menos ativos a se exercitarem mais',
        duration: 15,
        intensity: 'low',
        frequency: '3x por semana, aumentando gradualmente',
        equipment: ['Petiscos saudáveis', 'Brinquedos motivadores'],
        weatherDependent: false,
        ageAppropriate: true,
        breedSpecific: false,
        reasoning: `${context.petData.name} demonstra baixo nível de atividade física`,
        benefits: [
          'Aumento gradual da disposição',
          'Melhora do condicionamento',
          'Prevenção da obesidade',
          'Maior interação social'
        ]
      })
    }

    return recommendations
  }

  private async generateHealthRecommendations(context: RecommendationContext): Promise<HealthRecommendation[]> {
    const recommendations: HealthRecommendation[] = []

    // Análise dos dados de saúde recentes
    const recentRecords = context.healthHistory.slice(-7) // Últimos 7 dias
    
    // Verificar tendência de peso
    const weightTrend = this.analyzeWeightTrend(recentRecords)
    if (weightTrend.direction === 'increasing' && weightTrend.rate > 0.1) {
      recommendations.push({
        id: 'weight-monitoring',
        type: 'monitoring',
        title: 'Monitoramento de Peso',
        description: 'Acompanhamento próximo devido ao ganho de peso recente',
        urgency: 'soon',
        reasoning: `Detectado ganho de peso de ${weightTrend.rate}kg na última semana`,
        recommendations: [
          'Pesar diariamente no mesmo horário',
          'Registrar todas as refeições',
          'Monitorar atividade física',
          'Avaliar porções oferecidas'
        ],
        veterinaryConsult: false,
        monitoring: {
          metrics: ['Peso diário', 'Consumo alimentar', 'Tempo de atividade'],
          frequency: 'Diariamente',
          alerts: ['Ganho >200g em 24h', 'Mudança no apetite', 'Redução de atividade']
        }
      })
    }

    // Verificar consistência dos registros
    const recordConsistency = this.analyzeRecordConsistency(context.healthHistory)
    if (recordConsistency < 0.7) {
      recommendations.push({
        id: 'consistent-monitoring',
        type: 'preventive',
        title: 'Melhoria no Acompanhamento',
        description: 'Estabelecer rotina mais consistente de monitoramento de saúde',
        urgency: 'routine',
        reasoning: 'Registros de saúde estão inconsistentes, dificultando análises precisas',
        recommendations: [
          'Estabelecer horários fixos para pesagem',
          'Usar lembretes no aplicativo',
          'Envolver toda a família no cuidado',
          'Criar checklist diário'
        ],
        veterinaryConsult: false,
        monitoring: {
          metrics: ['Frequência de registros', 'Completude dos dados'],
          frequency: 'Semanal',
          alerts: ['Menos de 5 registros por semana', 'Dados incompletos']
        }
      })
    }

    // Recomendação preventiva baseada na idade
    if (context.petData.age > 72) { // +6 anos
      recommendations.push({
        id: 'senior-health-check',
        type: 'preventive',
        title: 'Check-up Preventivo para Seniores',
        description: 'Exames preventivos recomendados para pets na terceira idade',
        urgency: 'soon',
        reasoning: `${context.petData.name} está na faixa etária que requer cuidados preventivos especiais`,
        recommendations: [
          'Exames de sangue semestrais',
          'Avaliação cardíaca anual',
          'Controle de peso rigoroso',
          'Suplementação articular se necessário'
        ],
        veterinaryConsult: true,
        monitoring: {
          metrics: ['Exames laboratoriais', 'Peso', 'Mobilidade', 'Apetite'],
          frequency: 'Mensal',
          alerts: ['Perda de peso súbita', 'Redução de mobilidade', 'Mudanças no apetite']
        }
      })
    }

    return recommendations
  }

  private generateSummary(
    nutrition: NutritionRecommendation[], 
    activity: ActivityRecommendation[], 
    health: HealthRecommendation[]
  ) {
    const total = nutrition.length + activity.length + health.length
    const highPriority = [...nutrition, ...health].filter(r => 
      ('priority' in r && r.priority === 'high') || 
      ('urgency' in r && r.urgency === 'immediate')
    ).length

    return {
      totalRecommendations: total,
      highPriorityCount: highPriority,
      estimatedImplementationTime: total > 5 ? '2-3 semanas' : '1-2 semanas',
      expectedOutcome: 'Melhoria geral na saúde, nutrição e bem-estar do pet'
    }
  }

  private async generateInsights(context: RecommendationContext) {
    const insights = {
      healthTrends: [] as string[],
      nutritionalGaps: [] as string[],
      behaviorPatterns: [] as string[],
      improvementAreas: [] as string[]
    }

    // Análise de tendências de saúde
    if (context.healthHistory.length > 0) {
      const avgWeight = context.healthHistory
        .filter(r => r.weight)
        .reduce((sum, r) => sum + r.weight!, 0) / context.healthHistory.length
      
      if (avgWeight > context.petData.weight * 1.1) {
        insights.healthTrends.push('Tendência de ganho de peso observada no último mês')
      } else if (avgWeight < context.petData.weight * 0.9) {
        insights.healthTrends.push('Possível perda de peso detectada')
      } else {
        insights.healthTrends.push('Peso mantido estável no período analisado')
      }
    }

    // Análise nutricional
    if (context.petData.activityLevel === 'high' && context.petData.weight < this.calculateIdealWeight(context.petData.species, context.petData.breed)) {
      insights.nutritionalGaps.push('Pode necessitar de maior aporte calórico devido à alta atividade')
    }

    // Padrões comportamentais
    const activityRecords = context.healthHistory.filter(r => r.activity)
    if (activityRecords.length > 0) {
      const avgSteps = activityRecords.reduce((sum, r) => sum + (r.activity?.steps || 0), 0) / activityRecords.length
      if (avgSteps < 5000) {
        insights.behaviorPatterns.push('Nível de atividade física abaixo do recomendado')
        insights.improvementAreas.push('Aumentar estímulos para atividade física')
      } else if (avgSteps > 12000) {
        insights.behaviorPatterns.push('Pet demonstra alta energia e necessidade de exercício')
      }
    }

    // Áreas de melhoria
    if (context.healthHistory.length < 20) { // Menos de 20 registros em 30 dias
      insights.improvementAreas.push('Melhorar consistência no monitoramento de saúde')
    }

    return insights
  }

  // Métodos auxiliares
  private calculateActivityLevel(healthHistory: DailyHealthRecord[]): 'low' | 'moderate' | 'high' {
    const activityRecords = healthHistory.filter(r => r.activity)
    if (activityRecords.length === 0) return 'low'

    const avgSteps = activityRecords.reduce((sum, r) => sum + (r.activity?.steps || 0), 0) / activityRecords.length
    
    if (avgSteps < 5000) return 'low'
    if (avgSteps < 10000) return 'moderate'
    return 'high'
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'autumn'
    if (month >= 5 && month <= 7) return 'winter'
    if (month >= 8 && month <= 10) return 'spring'
    return 'summer'
  }

  private calculateIdealWeight(species: string, breed: string): number {
    // Simplificado - em um sistema real, usaríamos uma base de dados de raças
    if (species === 'dog') {
      // Valores médios por tamanho de raça
      if (breed.toLowerCase().includes('poodle') || breed.toLowerCase().includes('pequeno')) return 8
      if (breed.toLowerCase().includes('golden') || breed.toLowerCase().includes('grande')) return 30
      return 15 // Médio porte
    }
    return 4.5 // Gatos
  }

  private analyzeWeightTrend(records: DailyHealthRecord[]): { direction: 'increasing' | 'decreasing' | 'stable', rate: number } {
    const weightRecords = records.filter(r => r.weight).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (weightRecords.length < 2) return { direction: 'stable', rate: 0 }
    
    const first = weightRecords[0].weight!
    const last = weightRecords[weightRecords.length - 1].weight!
    const rate = Math.abs(last - first)
    
    if (rate < 0.1) return { direction: 'stable', rate: 0 }
    return { direction: last > first ? 'increasing' : 'decreasing', rate }
  }

  private analyzeRecordConsistency(records: DailyHealthRecord[]): number {
    // Últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentRecords = records.filter(r => new Date(r.date) >= thirtyDaysAgo)
    return Math.min(recentRecords.length / 30, 1) // Máximo 1 (100%)
  }

  // Método para buscar recomendações por pet
  async getRecommendationsForPet(petId: string): Promise<RecommendationPackage> {
    return this.generateRecommendations(petId)
  }

  // Método para buscar produtos OiPet relacionados
  getOiPetProductRecommendations(type?: string) {
    return type 
      ? this.OIPET_PRODUCTS.filter(p => p.category === type)
      : this.OIPET_PRODUCTS
  }
}

export const aiRecommendationService = new AIRecommendationService()
export default aiRecommendationService