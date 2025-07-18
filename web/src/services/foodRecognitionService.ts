interface NutritionalInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  calcium: number
  phosphorus: number
  vitamins: {
    A: number
    C: number
    E: number
  }
}

interface FoodItem {
  id: string
  name: string
  category: 'meat' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'other'
  petSafe: boolean
  toxicityLevel: 'safe' | 'caution' | 'toxic' | 'dangerous'
  nutritionalInfo: NutritionalInfo
  description: string
  recommendations: string[]
  warnings?: string[]
  imageUrl?: string
}

interface RecognitionResult {
  food: FoodItem
  confidence: number
  detectedPortionSize: number // in grams
  alternatives: Array<{
    food: FoodItem
    confidence: number
  }>
}

// Mock food database
const foodDatabase: FoodItem[] = [
  {
    id: 'chicken-breast',
    name: 'Peito de Frango',
    category: 'meat',
    petSafe: true,
    toxicityLevel: 'safe',
    nutritionalInfo: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      calcium: 15,
      phosphorus: 228,
      vitamins: { A: 21, C: 0, E: 0.3 }
    },
    description: 'Proteína magra excelente para cães e gatos',
    recommendations: [
      'Cozinhe sem temperos',
      'Retire a pele antes de servir',
      'Corte em pedaços pequenos',
      'Sirva com moderação'
    ]
  },
  {
    id: 'carrot',
    name: 'Cenoura',
    category: 'vegetable',
    petSafe: true,
    toxicityLevel: 'safe',
    nutritionalInfo: {
      calories: 41,
      protein: 0.9,
      carbs: 9.6,
      fat: 0.2,
      fiber: 2.8,
      calcium: 33,
      phosphorus: 35,
      vitamins: { A: 835, C: 5.9, E: 0.7 }
    },
    description: 'Rica em betacaroteno, boa para a visão',
    recommendations: [
      'Cozinhe ou rale para melhor digestão',
      'Sirva em pequenas quantidades',
      'Excelente para petiscos saudáveis'
    ]
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    category: 'other',
    petSafe: false,
    toxicityLevel: 'dangerous',
    nutritionalInfo: {
      calories: 546,
      protein: 7.8,
      carbs: 45.9,
      fat: 31.3,
      fiber: 7,
      calcium: 73,
      phosphorus: 208,
      vitamins: { A: 39, C: 0, E: 0.6 }
    },
    description: 'ALTAMENTE TÓXICO para cães e gatos',
    recommendations: [],
    warnings: [
      'NUNCA dê chocolate para pets',
      'Contém teobromina que é tóxica',
      'Procure veterinário imediatamente se ingerido',
      'Pode causar vômitos, diarreia e problemas cardíacos'
    ]
  },
  {
    id: 'apple',
    name: 'Maçã',
    category: 'fruit',
    petSafe: true,
    toxicityLevel: 'caution',
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      fiber: 2.4,
      calcium: 6,
      phosphorus: 11,
      vitamins: { A: 54, C: 4.6, E: 0.2 }
    },
    description: 'Fruta saudável, mas retire as sementes',
    recommendations: [
      'Retire sementes e caroço',
      'Descasque se possível',
      'Sirva em pequenos pedaços',
      'Com moderação devido ao açúcar'
    ],
    warnings: [
      'Sementes contêm cianeto',
      'Não dê em grandes quantidades'
    ]
  },
  {
    id: 'rice',
    name: 'Arroz',
    category: 'grain',
    petSafe: true,
    toxicityLevel: 'safe',
    nutritionalInfo: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      calcium: 10,
      phosphorus: 68,
      vitamins: { A: 0, C: 0, E: 0.1 }
    },
    description: 'Carboidrato facilmente digestível',
    recommendations: [
      'Cozinhe bem sem temperos',
      'Ideal para problemas digestivos',
      'Misture com proteínas',
      'Sirva em quantidade moderada'
    ]
  },
  {
    id: 'salmon',
    name: 'Salmão',
    category: 'meat',
    petSafe: true,
    toxicityLevel: 'safe',
    nutritionalInfo: {
      calories: 208,
      protein: 25.4,
      carbs: 0,
      fat: 12.4,
      fiber: 0,
      calcium: 59,
      phosphorus: 371,
      vitamins: { A: 59, C: 0, E: 3.6 }
    },
    description: 'Rico em ômega-3, excelente para pelo e pele',
    recommendations: [
      'Cozinhe completamente',
      'Retire todas as espinhas',
      'Rico em ômega-3',
      'Sirva com moderação'
    ]
  }
]

class FoodRecognitionService {
  private readonly API_DELAY = 2000 // Simula delay da API

  async recognizeFood(imageData: string): Promise<RecognitionResult> {
    // Simula processamento da imagem
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))

    // Mock recognition logic
    const mockResults = this.getMockRecognitionResults()
    
    // Simula diferentes resultados baseado em "análise" da imagem
    const randomIndex = Math.floor(Math.random() * mockResults.length)
    const selectedResult = mockResults[randomIndex]

    return {
      food: selectedResult.food,
      confidence: selectedResult.confidence,
      detectedPortionSize: Math.floor(Math.random() * 200) + 50, // 50-250g
      alternatives: mockResults
        .filter(r => r.food.id !== selectedResult.food.id)
        .slice(0, 3)
        .map(r => ({
          food: r.food,
          confidence: r.confidence * 0.7 // Alternatives have lower confidence
        }))
    }
  }

  private getMockRecognitionResults() {
    return foodDatabase.map(food => ({
      food,
      confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
    }))
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    return foodDatabase.find(food => food.id === id) || null
  }

  async searchFoods(query: string): Promise<FoodItem[]> {
    const lowerQuery = query.toLowerCase()
    return foodDatabase.filter(food => 
      food.name.toLowerCase().includes(lowerQuery) ||
      food.description.toLowerCase().includes(lowerQuery)
    )
  }

  calculateNutritionForPortion(food: FoodItem, portionGrams: number): NutritionalInfo {
    const factor = portionGrams / 100 // Nutrition info is per 100g
    
    return {
      calories: Math.round(food.nutritionalInfo.calories * factor),
      protein: Math.round(food.nutritionalInfo.protein * factor * 10) / 10,
      carbs: Math.round(food.nutritionalInfo.carbs * factor * 10) / 10,
      fat: Math.round(food.nutritionalInfo.fat * factor * 10) / 10,
      fiber: Math.round(food.nutritionalInfo.fiber * factor * 10) / 10,
      calcium: Math.round(food.nutritionalInfo.calcium * factor),
      phosphorus: Math.round(food.nutritionalInfo.phosphorus * factor),
      vitamins: {
        A: Math.round(food.nutritionalInfo.vitamins.A * factor),
        C: Math.round(food.nutritionalInfo.vitamins.C * factor * 10) / 10,
        E: Math.round(food.nutritionalInfo.vitamins.E * factor * 10) / 10
      }
    }
  }

  getSafetyRecommendations(food: FoodItem): {
    canGive: boolean
    safetyLevel: string
    recommendations: string[]
    warnings: string[]
  } {
    const canGive = food.petSafe && food.toxicityLevel !== 'dangerous'
    
    let safetyLevel = 'Seguro'
    if (food.toxicityLevel === 'caution') safetyLevel = 'Cuidado'
    if (food.toxicityLevel === 'toxic') safetyLevel = 'Tóxico'
    if (food.toxicityLevel === 'dangerous') safetyLevel = 'Perigoso'

    return {
      canGive,
      safetyLevel,
      recommendations: food.recommendations || [],
      warnings: food.warnings || []
    }
  }
}

export const foodRecognitionService = new FoodRecognitionService()
export type { FoodItem, NutritionalInfo, RecognitionResult }