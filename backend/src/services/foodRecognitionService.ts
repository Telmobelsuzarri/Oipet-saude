import { logger } from '../utils/logger';
import FoodScan from '../models/FoodScan';
import Pet from '../models/Pet';
import { RedisService } from '../config/redis';

// Pet Food Database (MVP - expandir com banco real depois)
const PET_FOOD_DATABASE = {
  dog: {
    safe: [
      'chicken', 'rice', 'carrot', 'apple', 'banana', 'sweet potato',
      'pumpkin', 'green beans', 'blueberries', 'watermelon', 'salmon',
      'turkey', 'eggs', 'oatmeal', 'peanut butter', 'yogurt', 'cheese',
      'broccoli', 'spinach', 'cucumber', 'zucchini'
    ],
    toxic: [
      'chocolate', 'grapes', 'raisins', 'onion', 'garlic', 'xylitol',
      'avocado', 'macadamia nuts', 'alcohol', 'coffee', 'caffeine',
      'salt', 'yeast dough', 'moldy foods', 'corn on the cob'
    ],
    caution: [
      'milk', 'ice cream', 'almonds', 'cinnamon', 'coconut', 'tomatoes',
      'mushrooms', 'cherries', 'shrimp', 'popcorn'
    ]
  },
  cat: {
    safe: [
      'chicken', 'turkey', 'salmon', 'tuna', 'eggs', 'rice', 'oatmeal',
      'pumpkin', 'carrots', 'green beans', 'peas', 'spinach', 'melon',
      'blueberries', 'bananas'
    ],
    toxic: [
      'chocolate', 'onion', 'garlic', 'grapes', 'raisins', 'alcohol',
      'xylitol', 'caffeine', 'raw fish', 'raw eggs', 'milk', 'cheese',
      'dog food', 'liver in large amounts', 'tuna in large amounts'
    ],
    caution: [
      'yogurt', 'small amounts of cheese', 'corn', 'bread', 'potatoes'
    ]
  }
};

// Nutritional Database (valores por 100g)
const NUTRITIONAL_DATABASE: Record<string, any> = {
  chicken: { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
  rice: { calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  carrot: { calories: 41, protein: 0.9, fat: 0.2, carbs: 10 },
  apple: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
  banana: { calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
  beef: { calories: 250, protein: 26, fat: 15, carbs: 0 },
  salmon: { calories: 208, protein: 20, fat: 13, carbs: 0 },
  'sweet potato': { calories: 86, protein: 1.6, fat: 0.1, carbs: 20 },
  broccoli: { calories: 34, protein: 2.8, fat: 0.4, carbs: 7 },
  eggs: { calories: 155, protein: 13, fat: 11, carbs: 1.1 },
  'peanut butter': { calories: 588, protein: 25, fat: 50, carbs: 20 },
  cheese: { calories: 402, protein: 25, fat: 33, carbs: 1.3 },
  tuna: { calories: 144, protein: 23, fat: 5, carbs: 0 },
  turkey: { calories: 189, protein: 29, fat: 7, carbs: 0 },
  yogurt: { calories: 59, protein: 10, fat: 0.4, carbs: 3.6 },
  chocolate: { calories: 546, protein: 4.9, fat: 31, carbs: 61 },
  bread: { calories: 265, protein: 9, fat: 3.2, carbs: 49 },
  potato: { calories: 77, protein: 2, fat: 0.1, carbs: 17 }
};

export class FoodRecognitionService {
  // Simulate AI food recognition (MVP - replace with real TensorFlow later)
  static async recognizeFood(imageUrl: string): Promise<{
    food: string;
    confidence: number;
    alternatives: string[];
  }> {
    try {
      logger.info(`🔍 Analyzing food image: ${imageUrl}`);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // MVP: Random food selection for demo
      const allFoods = Object.keys(NUTRITIONAL_DATABASE);
      const randomIndex = Math.floor(Math.random() * allFoods.length);
      const recognizedFood = allFoods[randomIndex];
      
      // Generate alternatives
      const alternatives = allFoods
        .filter(f => f !== recognizedFood)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const result = {
        food: recognizedFood,
        confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
        alternatives
      };

      // Cache result
      await RedisService.set(`food-recognition:${imageUrl}`, result, 3600);

      logger.info(`✅ Food recognized: ${recognizedFood} (${Math.round(result.confidence * 100)}%)`);
      return result;

    } catch (error) {
      logger.error('Food recognition failed:', error);
      throw new Error('Falha no reconhecimento do alimento');
    }
  }

  // Check if food is safe for pet
  static checkFoodSafety(food: string, species: 'dog' | 'cat'): {
    status: 'safe' | 'toxic' | 'caution' | 'unknown';
    message: string;
    recommendations: string[];
  } {
    const foodLower = food.toLowerCase();
    const database = PET_FOOD_DATABASE[species];

    if (database.toxic.some(toxic => foodLower.includes(toxic))) {
      return {
        status: 'toxic',
        message: `⚠️ PERIGO: ${food} é TÓXICO para ${species === 'dog' ? 'cães' : 'gatos'}!`,
        recommendations: [
          'NÃO dê este alimento ao seu pet',
          'Se ingerido, procure um veterinário imediatamente',
          'Sintomas podem incluir vômito, diarreia, letargia'
        ]
      };
    }

    if (database.safe.some(safe => foodLower.includes(safe))) {
      return {
        status: 'safe',
        message: `✅ ${food} é seguro para ${species === 'dog' ? 'cães' : 'gatos'}`,
        recommendations: [
          'Pode ser oferecido com moderação',
          'Introduza gradualmente na dieta',
          'Observe possíveis reações alérgicas'
        ]
      };
    }

    if (database.caution.some(caution => foodLower.includes(caution))) {
      return {
        status: 'caution',
        message: `⚠️ ${food} deve ser oferecido com CAUTELA`,
        recommendations: [
          'Ofereça em pequenas quantidades',
          'Observe reações do pet',
          'Consulte seu veterinário'
        ]
      };
    }

    return {
      status: 'unknown',
      message: `❓ Informação sobre ${food} não disponível`,
      recommendations: [
        'Consulte seu veterinário antes de oferecer',
        'Pesquise mais sobre este alimento',
        'Prefira alimentos conhecidamente seguros'
      ]
    };
  }

  // Get nutritional info
  static getNutritionalInfo(food: string, quantity: number = 100): {
    food: string;
    quantity: number;
    nutrition: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    dailyValues: {
      calories: string;
      protein: string;
      fat: string;
      carbs: string;
    };
  } | null {
    const foodLower = food.toLowerCase();
    const baseNutrition = NUTRITIONAL_DATABASE[foodLower];

    if (!baseNutrition) {
      // Try to find partial match
      const partialMatch = Object.keys(NUTRITIONAL_DATABASE).find(key => 
        key.includes(foodLower) || foodLower.includes(key)
      );

      if (!partialMatch) return null;
      
      const nutrition = NUTRITIONAL_DATABASE[partialMatch];
      const multiplier = quantity / 100;

      return {
        food: partialMatch,
        quantity,
        nutrition: {
          calories: Math.round(nutrition.calories * multiplier),
          protein: Math.round(nutrition.protein * multiplier * 10) / 10,
          fat: Math.round(nutrition.fat * multiplier * 10) / 10,
          carbs: Math.round(nutrition.carbs * multiplier * 10) / 10
        },
        dailyValues: {
          calories: `${Math.round((nutrition.calories * multiplier / 2000) * 100)}%`,
          protein: `${Math.round((nutrition.protein * multiplier / 50) * 100)}%`,
          fat: `${Math.round((nutrition.fat * multiplier / 65) * 100)}%`,
          carbs: `${Math.round((nutrition.carbs * multiplier / 300) * 100)}%`
        }
      };
    }

    const multiplier = quantity / 100;
    return {
      food,
      quantity,
      nutrition: {
        calories: Math.round(baseNutrition.calories * multiplier),
        protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
        fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
        carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10
      },
      dailyValues: {
        calories: `${Math.round((baseNutrition.calories * multiplier / 2000) * 100)}%`,
        protein: `${Math.round((baseNutrition.protein * multiplier / 50) * 100)}%`,
        fat: `${Math.round((baseNutrition.fat * multiplier / 65) * 100)}%`,
        carbs: `${Math.round((baseNutrition.carbs * multiplier / 300) * 100)}%`
      }
    };
  }

  // Process food scan
  static async processFoodScan(
    imageUrl: string,
    petId: string,
    userId: string
  ): Promise<any> {
    try {
      // Get pet info
      const pet = await Pet.findById(petId);
      if (!pet) throw new Error('Pet não encontrado');

      // Recognize food
      const recognition = await this.recognizeFood(imageUrl);
      
      // Check safety
      const safety = this.checkFoodSafety(
        recognition.food, 
        pet.species as 'dog' | 'cat'
      );

      // Get nutritional info
      const nutrition = this.getNutritionalInfo(recognition.food);

      // Save scan to database
      const foodScan = new FoodScan({
        petId,
        userId,
        imageUrl,
        recognizedFood: recognition.food,
        confidence: recognition.confidence,
        alternatives: recognition.alternatives,
        safetyStatus: safety.status,
        safetyMessage: safety.message,
        recommendations: safety.recommendations,
        nutritionalInfo: nutrition?.nutrition,
        createdAt: new Date()
      });

      await foodScan.save();

      logger.info(`✅ Food scan saved for pet ${petId}: ${recognition.food}`);

      return {
        scanId: foodScan._id,
        recognition,
        safety,
        nutrition,
        pet: {
          id: pet._id,
          name: pet.name,
          species: pet.species
        }
      };

    } catch (error) {
      logger.error('Food scan processing failed:', error);
      throw error;
    }
  }

  // Get scan history
  static async getScanHistory(userId: string, petId?: string, limit = 20) {
    try {
      const query: any = { userId };
      if (petId) query.petId = petId;

      const scans = await FoodScan.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('petId', 'name species avatar');

      return scans;
    } catch (error) {
      logger.error('Failed to get scan history:', error);
      throw error;
    }
  }

  // Get food recommendations for pet
  static async getRecommendations(petId: string) {
    try {
      const pet = await Pet.findById(petId);
      if (!pet) throw new Error('Pet não encontrado');

      const species = pet.species as 'dog' | 'cat';
      const safeFoods = PET_FOOD_DATABASE[species].safe;

      // Get recent scans
      const recentScans = await FoodScan.find({ petId })
        .sort({ createdAt: -1 })
        .limit(10);

      const scannedFoods = recentScans.map(s => s.recognizedFood?.toLowerCase());

      // Recommend foods not recently scanned
      const recommendations = safeFoods
        .filter(food => !scannedFoods.includes(food))
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(food => ({
          food,
          nutrition: this.getNutritionalInfo(food),
          reason: this.getRecommendationReason(food, species)
        }));

      return {
        petId,
        petName: pet.name,
        species,
        recommendations,
        basedOn: `Análise de ${recentScans.length} escaneamentos recentes`
      };

    } catch (error) {
      logger.error('Failed to get recommendations:', error);
      throw error;
    }
  }

  // Get recommendation reason
  private static getRecommendationReason(food: string, species: string): string {
    const reasons: Record<string, string> = {
      chicken: 'Excelente fonte de proteína magra',
      salmon: 'Rico em ômega-3 para pele e pelo saudáveis',
      carrot: 'Baixa caloria e rico em vitamina A',
      apple: 'Fonte de fibras e vitaminas',
      'sweet potato': 'Carboidrato saudável e rico em fibras',
      blueberries: 'Antioxidantes naturais',
      pumpkin: 'Ajuda na digestão',
      eggs: 'Proteína completa e biotina',
      'green beans': 'Baixa caloria e rico em fibras',
      banana: 'Potássio e energia natural'
    };

    return reasons[food] || `Alimento seguro e nutritivo para ${species === 'dog' ? 'cães' : 'gatos'}`;
  }

  // Generate feeding plan
  static async generateFeedingPlan(petId: string) {
    try {
      const pet = await Pet.findById(petId);
      if (!pet) throw new Error('Pet não encontrado');

      const weight = pet.weight || 10; // Default 10kg if not set
      const species = pet.species as 'dog' | 'cat';
      
      // Calculate daily calorie needs (simplified)
      const dailyCalories = species === 'dog' 
        ? Math.round(30 * weight + 70) 
        : Math.round(24 * weight + 70);

      const safeFoods = PET_FOOD_DATABASE[species].safe;
      
      // Create meal plan
      const breakfast = this.createMeal(safeFoods, dailyCalories * 0.4);
      const dinner = this.createMeal(safeFoods, dailyCalories * 0.4);
      const snacks = this.createMeal(safeFoods, dailyCalories * 0.2);

      return {
        pet: {
          id: pet._id,
          name: pet.name,
          weight,
          species
        },
        dailyCalories,
        meals: {
          breakfast,
          dinner,
          snacks
        },
        tips: [
          'Divida as refeições em 2-3 porções ao dia',
          'Sempre forneça água fresca',
          'Monitore o peso regularmente',
          'Ajuste as porções conforme necessário'
        ]
      };

    } catch (error) {
      logger.error('Failed to generate feeding plan:', error);
      throw error;
    }
  }

  // Create meal suggestion
  private static createMeal(foods: string[], targetCalories: number) {
    const meal = [];
    let totalCalories = 0;

    const shuffled = [...foods].sort(() => 0.5 - Math.random());

    for (const food of shuffled.slice(0, 3)) {
      const nutrition = this.getNutritionalInfo(food);
      if (nutrition && totalCalories < targetCalories) {
        const portion = Math.min(100, Math.round((targetCalories - totalCalories) / nutrition.nutrition.calories * 100));
        meal.push({
          food,
          portion,
          calories: Math.round(nutrition.nutrition.calories * portion / 100)
        });
        totalCalories += Math.round(nutrition.nutrition.calories * portion / 100);
      }
    }

    return {
      foods: meal,
      totalCalories,
      targetCalories: Math.round(targetCalories)
    };
  }
}