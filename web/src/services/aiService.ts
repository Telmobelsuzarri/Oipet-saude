import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

// Interface para resultado do reconhecimento
export interface FoodRecognitionResult {
  foodName: string
  confidence: number
  nutritionalInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    calcium: number
    phosphorus: number
  }
  isHealthyForPets: boolean
  recommendations: string[]
  warnings: string[]
}

// Interface para análise nutricional
export interface NutritionalAnalysis {
  isPetSafe: boolean
  healthScore: number // 0-100
  benefits: string[]
  risks: string[]
  recommendedAmount: string
  frequency: 'daily' | 'weekly' | 'occasional' | 'avoid'
}

// Base de dados de alimentos para pets
interface FoodDatabase {
  [key: string]: {
    name: string
    category: 'safe' | 'toxic' | 'moderate'
    nutritionalInfo: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber: number
      calcium: number
      phosphorus: number
    }
    benefits: string[]
    risks: string[]
    recommendedAmount: string
    frequency: 'daily' | 'weekly' | 'occasional' | 'avoid'
  }
}

// Base de dados simplificada de alimentos
const FOOD_DATABASE: FoodDatabase = {
  'chicken': {
    name: 'Frango',
    category: 'safe',
    nutritionalInfo: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      calcium: 15,
      phosphorus: 228
    },
    benefits: ['Rica em proteína', 'Baixo em gordura', 'Boa digestibilidade'],
    risks: ['Deve ser cozido', 'Sem temperos'],
    recommendedAmount: '50-100g por dia',
    frequency: 'daily'
  },
  'carrot': {
    name: 'Cenoura',
    category: 'safe',
    nutritionalInfo: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fat: 0.2,
      fiber: 2.8,
      calcium: 33,
      phosphorus: 35
    },
    benefits: ['Rica em vitamina A', 'Fibras para digestão', 'Baixa caloria'],
    risks: ['Em excesso pode causar diarreia'],
    recommendedAmount: '1-2 fatias por dia',
    frequency: 'daily'
  },
  'apple': {
    name: 'Maçã',
    category: 'safe',
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      calcium: 6,
      phosphorus: 11
    },
    benefits: ['Vitaminas A e C', 'Fibras', 'Antioxidantes'],
    risks: ['Remover sementes (tóxicas)', 'Açúcar natural'],
    recommendedAmount: '1-2 fatias sem sementes',
    frequency: 'weekly'
  },
  'chocolate': {
    name: 'Chocolate',
    category: 'toxic',
    nutritionalInfo: {
      calories: 546,
      protein: 4.9,
      carbs: 61,
      fat: 31,
      fiber: 7,
      calcium: 73,
      phosphorus: 208
    },
    benefits: [],
    risks: ['TÓXICO PARA PETS', 'Pode causar morte', 'Teobromina venenosa'],
    recommendedAmount: 'NUNCA',
    frequency: 'avoid'
  },
  'onion': {
    name: 'Cebola',
    category: 'toxic',
    nutritionalInfo: {
      calories: 40,
      protein: 1.1,
      carbs: 9,
      fat: 0.1,
      fiber: 1.7,
      calcium: 23,
      phosphorus: 29
    },
    benefits: [],
    risks: ['TÓXICO PARA PETS', 'Destrói glóbulos vermelhos', 'Pode causar anemia'],
    recommendedAmount: 'NUNCA',
    frequency: 'avoid'
  },
  'rice': {
    name: 'Arroz',
    category: 'safe',
    nutritionalInfo: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      calcium: 10,
      phosphorus: 68
    },
    benefits: ['Fácil digestão', 'Energia rápida', 'Bom para diarreia'],
    risks: ['Alto em carboidratos', 'Pode causar ganho de peso'],
    recommendedAmount: '1-2 colheres por dia',
    frequency: 'weekly'
  },
  'sweet_potato': {
    name: 'Batata Doce',
    category: 'safe',
    nutritionalInfo: {
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fat: 0.1,
      fiber: 3,
      calcium: 30,
      phosphorus: 47
    },
    benefits: ['Rica em vitamina A', 'Fibras', 'Antioxidantes'],
    risks: ['Alta em açúcar', 'Cozinhar sem açúcar'],
    recommendedAmount: '1-2 pedaços pequenos',
    frequency: 'weekly'
  }
}

class AIService {
  private model: tf.LayersModel | null = null
  private isModelLoaded = false
  private modelUrl = '/models/food-recognition-model.json' // Placeholder

  async initializeModel(): Promise<void> {
    try {
      console.log('🤖 Inicializando modelo de AI...')
      
      // Por enquanto, simular carregamento do modelo
      // Em produção, carregaria um modelo real do TensorFlow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      this.isModelLoaded = true
      console.log('✅ Modelo de AI carregado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao carregar modelo de AI:', error)
      throw new Error('Falha ao inicializar serviço de AI')
    }
  }

  async recognizeFood(imageFile: File): Promise<FoodRecognitionResult> {
    if (!this.isModelLoaded) {
      await this.initializeModel()
    }

    try {
      console.log('🔍 Analisando imagem de alimento...')
      
      // Converter imagem para tensor
      const imageElement = await this.fileToImageElement(imageFile)
      const imageTensor = await this.preprocessImage(imageElement)
      
      // Simular predição do modelo (em produção seria model.predict)
      const prediction = await this.simulatePrediction(imageTensor)
      
      // Analisar resultado e buscar na base de dados
      const result = this.analyzePredictionResult(prediction)
      
      console.log('✅ Reconhecimento concluído:', result)
      return result
      
    } catch (error) {
      console.error('❌ Erro no reconhecimento de alimento:', error)
      throw new Error('Falha ao analisar imagem')
    }
  }

  private async fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private async preprocessImage(imageElement: HTMLImageElement): Promise<tf.Tensor> {
    // Redimensionar para 224x224 (padrão para modelos de visão)
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims(0)
    
    return tensor
  }

  private async simulatePrediction(imageTensor: tf.Tensor): Promise<string> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Lista de alimentos possíveis para simulação
    const possibleFoods = ['chicken', 'carrot', 'apple', 'rice', 'sweet_potato']
    
    // Escolher aleatoriamente para demonstração
    const randomIndex = Math.floor(Math.random() * possibleFoods.length)
    const predictedFood = possibleFoods[randomIndex]
    
    // Limpar tensor da memória
    imageTensor.dispose()
    
    return predictedFood
  }

  private analyzePredictionResult(prediction: string): FoodRecognitionResult {
    const foodData = FOOD_DATABASE[prediction]
    
    if (!foodData) {
      return {
        foodName: 'Alimento não identificado',
        confidence: 0.3,
        nutritionalInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          calcium: 0,
          phosphorus: 0
        },
        isHealthyForPets: false,
        recommendations: ['Consulte um veterinário antes de oferecer'],
        warnings: ['Alimento não reconhecido - cuidado!']
      }
    }

    const confidence = Math.random() * 0.3 + 0.7 // 70-100% para demonstração
    const isHealthy = foodData.category === 'safe'
    
    const recommendations: string[] = []
    const warnings: string[] = []

    if (foodData.category === 'safe') {
      recommendations.push(`Ofertar ${foodData.recommendedAmount}`)
      recommendations.push(`Frequência: ${this.getFrequencyText(foodData.frequency)}`)
      recommendations.push(...foodData.benefits)
    } else if (foodData.category === 'toxic') {
      warnings.push('⚠️ ALIMENTO TÓXICO - NÃO OFERECER!')
      warnings.push(...foodData.risks)
    } else {
      warnings.push('Oferecer com moderação')
      warnings.push(...foodData.risks)
      recommendations.push(...foodData.benefits)
    }

    return {
      foodName: foodData.name,
      confidence: Math.round(confidence * 100) / 100,
      nutritionalInfo: foodData.nutritionalInfo,
      isHealthyForPets: isHealthy,
      recommendations,
      warnings
    }
  }

  private getFrequencyText(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Diariamente'
      case 'weekly': return 'Semanalmente'
      case 'occasional': return 'Ocasionalmente'
      case 'avoid': return 'Evitar'
      default: return 'Consultar veterinário'
    }
  }

  async analyzeNutritionalValue(foodName: string): Promise<NutritionalAnalysis> {
    const foodData = FOOD_DATABASE[foodName.toLowerCase()]
    
    if (!foodData) {
      return {
        isPetSafe: false,
        healthScore: 0,
        benefits: [],
        risks: ['Alimento não reconhecido'],
        recommendedAmount: 'Consultar veterinário',
        frequency: 'avoid'
      }
    }

    let healthScore = 50 // Base score
    
    // Calcular score baseado na categoria
    if (foodData.category === 'safe') {
      healthScore += 40
    } else if (foodData.category === 'toxic') {
      healthScore = 0
    } else {
      healthScore += 20
    }

    // Ajustar baseado nos nutrientes
    if (foodData.nutritionalInfo.protein > 20) healthScore += 10
    if (foodData.nutritionalInfo.fiber > 2) healthScore += 5
    if (foodData.nutritionalInfo.calories < 100) healthScore += 5

    return {
      isPetSafe: foodData.category !== 'toxic',
      healthScore: Math.min(100, healthScore),
      benefits: foodData.benefits,
      risks: foodData.risks,
      recommendedAmount: foodData.recommendedAmount,
      frequency: foodData.frequency
    }
  }

  // Método para expandir a base de dados
  addFoodToDatabase(foodKey: string, foodData: FoodDatabase[string]): void {
    FOOD_DATABASE[foodKey] = foodData
  }

  // Método para obter lista de alimentos seguros
  getSafeFoods(): string[] {
    return Object.values(FOOD_DATABASE)
      .filter(food => food.category === 'safe')
      .map(food => food.name)
  }

  // Método para obter lista de alimentos tóxicos
  getToxicFoods(): string[] {
    return Object.values(FOOD_DATABASE)
      .filter(food => food.category === 'toxic')
      .map(food => food.name)
  }

  // Método para verificar se o modelo está carregado
  isReady(): boolean {
    return this.isModelLoaded
  }

  // Limpar recursos
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.isModelLoaded = false
  }
}

// Instância singleton do serviço
export const aiService = new AIService()
export default aiService