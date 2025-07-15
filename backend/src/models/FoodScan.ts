/**
 * Modelo de Escaneamento de Alimentos - MongoDB com Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodScan extends Document {
  _id: string;
  petId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  imageHash?: string;
  recognizedFood?: string;
  barcode?: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
    vitamins?: {
      vitaminA?: number;
      vitaminC?: number;
      vitaminD?: number;
      vitaminE?: number;
    };
    minerals?: {
      calcium?: number;
      iron?: number;
      potassium?: number;
      zinc?: number;
    };
  };
  confidence: number;
  scanType: 'image' | 'barcode' | 'manual';
  isApproved: boolean;
  isHealthy: boolean;
  recommendations?: string[];
  allergenWarnings?: string[];
  processedBy?: 'ai' | 'manual' | 'database';
  verifiedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const foodScanSchema = new Schema<IFoodScan>(
  {
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'ID do pet é obrigatório'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID do usuário é obrigatório'],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'URL da imagem é obrigatória'],
      validate: {
        validator: function (url: string) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        },
        message: 'URL da imagem deve ser válida e ter extensão de imagem',
      },
    },
    imageHash: {
      type: String,
      index: true,
      sparse: true,
    },
    recognizedFood: {
      type: String,
      trim: true,
      maxlength: [200, 'Nome do alimento não pode ter mais de 200 caracteres'],
    },
    barcode: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
      match: [/^\d{8,14}$/, 'Código de barras deve ter entre 8 e 14 dígitos'],
    },
    nutritionalInfo: {
      calories: {
        type: Number,
        required: true,
        min: [0, 'Calorias não podem ser negativas'],
        max: [10000, 'Calorias devem ser menores que 10000 por 100g'],
      },
      protein: {
        type: Number,
        required: true,
        min: [0, 'Proteína não pode ser negativa'],
        max: [100, 'Proteína deve ser menor que 100g por 100g'],
      },
      carbs: {
        type: Number,
        required: true,
        min: [0, 'Carboidratos não podem ser negativos'],
        max: [100, 'Carboidratos devem ser menores que 100g por 100g'],
      },
      fat: {
        type: Number,
        required: true,
        min: [0, 'Gordura não pode ser negativa'],
        max: [100, 'Gordura deve ser menor que 100g por 100g'],
      },
      fiber: {
        type: Number,
        min: [0, 'Fibra não pode ser negativa'],
        max: [50, 'Fibra deve ser menor que 50g por 100g'],
      },
      sodium: {
        type: Number,
        min: [0, 'Sódio não pode ser negativo'],
        max: [10000, 'Sódio deve ser menor que 10000mg por 100g'],
      },
      sugar: {
        type: Number,
        min: [0, 'Açúcar não pode ser negativo'],
        max: [100, 'Açúcar deve ser menor que 100g por 100g'],
      },
      vitamins: {
        vitaminA: { type: Number, min: 0 },
        vitaminC: { type: Number, min: 0 },
        vitaminD: { type: Number, min: 0 },
        vitaminE: { type: Number, min: 0 },
      },
      minerals: {
        calcium: { type: Number, min: 0 },
        iron: { type: Number, min: 0 },
        potassium: { type: Number, min: 0 },
        zinc: { type: Number, min: 0 },
      },
    },
    confidence: {
      type: Number,
      required: [true, 'Confiança do reconhecimento é obrigatória'],
      min: [0, 'Confiança deve ser entre 0 e 1'],
      max: [1, 'Confiança deve ser entre 0 e 1'],
      default: 0,
    },
    scanType: {
      type: String,
      required: [true, 'Tipo de escaneamento é obrigatório'],
      enum: {
        values: ['image', 'barcode', 'manual'],
        message: 'Tipo deve ser: image, barcode ou manual',
      },
      default: 'image',
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isHealthy: {
      type: Boolean,
      default: true,
      index: true,
    },
    recommendations: [{
      type: String,
      trim: true,
      maxlength: [500, 'Recomendação não pode ter mais de 500 caracteres'],
    }],
    allergenWarnings: [{
      type: String,
      trim: true,
      maxlength: [200, 'Aviso de alérgeno não pode ter mais de 200 caracteres'],
    }],
    processedBy: {
      type: String,
      enum: {
        values: ['ai', 'manual', 'database'],
        message: 'Processado por deve ser: ai, manual ou database',
      },
      default: 'ai',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observações não podem ter mais de 1000 caracteres'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Índices compostos
foodScanSchema.index({ userId: 1, createdAt: -1 });
foodScanSchema.index({ petId: 1, createdAt: -1 });
foodScanSchema.index({ recognizedFood: 1, isApproved: 1 });
foodScanSchema.index({ confidence: -1, isApproved: 1 });

// Middleware para calcular isHealthy baseado nos valores nutricionais
foodScanSchema.pre('save', function (next) {
  if (this.nutritionalInfo) {
    const { calories, protein, fat, sodium, sugar } = this.nutritionalInfo;
    
    // Critérios básicos de saúde para pets
    const highCalories = calories > 400; // por 100g
    const lowProtein = protein < 18; // por 100g
    const highFat = fat > 15; // por 100g
    const highSodium = sodium && sodium > 300; // por 100g
    const highSugar = sugar && sugar > 10; // por 100g
    
    // Determinar se é saudável
    this.isHealthy = !highCalories && !lowProtein && !highFat && !highSodium && !highSugar;
    
    // Gerar recomendações automáticas
    const recommendations: string[] = [];
    
    if (highCalories) {
      recommendations.push('Alto em calorias - dar com moderação');
    }
    if (lowProtein) {
      recommendations.push('Baixo em proteína - não adequado como alimento principal');
    }
    if (highFat) {
      recommendations.push('Alto em gordura - pode causar problemas digestivos');
    }
    if (highSodium) {
      recommendations.push('Alto em sódio - evitar para pets com problemas cardíacos');
    }
    if (highSugar) {
      recommendations.push('Alto em açúcar - não recomendado para pets diabéticos');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Alimento adequado para consumo moderado');
    }
    
    this.recommendations = recommendations;
  }
  
  next();
});

// Método estático para buscar por usuário
foodScanSchema.statics.findByUser = function (userId: string, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('petId', 'name species')
    .populate('verifiedBy', 'name');
};

// Método estático para buscar por pet
foodScanSchema.statics.findByPet = function (petId: string, limit = 50) {
  return this.find({ petId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name')
    .populate('verifiedBy', 'name');
};

// Método estático para buscar alimentos similares
foodScanSchema.statics.findSimilarFood = function (foodName: string, confidence = 0.7) {
  return this.find({
    recognizedFood: new RegExp(foodName, 'i'),
    confidence: { $gte: confidence },
    isApproved: true,
  })
    .sort({ confidence: -1 })
    .limit(10);
};

// Método para aprovar escaneamento
foodScanSchema.methods.approve = function (verifiedBy: string) {
  this.isApproved = true;
  this.verifiedBy = verifiedBy;
  return this.save();
};

// Método para calcular score de saúde
foodScanSchema.methods.getHealthScore = function (): number {
  if (!this.nutritionalInfo) return 0;
  
  const { calories, protein, fat, fiber, sodium, sugar } = this.nutritionalInfo;
  let score = 100;
  
  // Penalizar calorias altas
  if (calories > 400) score -= 20;
  else if (calories > 300) score -= 10;
  
  // Bonificar proteína adequada
  if (protein >= 20) score += 10;
  else if (protein < 15) score -= 15;
  
  // Penalizar gordura alta
  if (fat > 20) score -= 20;
  else if (fat > 15) score -= 10;
  
  // Bonificar fibra
  if (fiber && fiber >= 3) score += 5;
  
  // Penalizar sódio alto
  if (sodium && sodium > 500) score -= 15;
  else if (sodium && sodium > 300) score -= 10;
  
  // Penalizar açúcar alto
  if (sugar && sugar > 15) score -= 20;
  else if (sugar && sugar > 10) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

export const FoodScan = mongoose.model<IFoodScan>('FoodScan', foodScanSchema);
export default FoodScan;