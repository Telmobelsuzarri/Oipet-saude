/**
 * Modelo de Pet - MongoDB com Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPet extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: Date;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  isNeutered: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
  currentWeight: number;
  currentHeight: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos virtuais
  age: number;
  bmi: number;
}

const petSchema = new Schema<IPet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID do usuário é obrigatório'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nome do pet é obrigatório'],
      trim: true,
      maxlength: [50, 'Nome não pode ter mais de 50 caracteres'],
    },
    species: {
      type: String,
      required: [true, 'Espécie é obrigatória'],
      enum: {
        values: ['dog', 'cat', 'other'],
        message: 'Espécie deve ser: dog, cat ou other',
      },
      default: 'dog',
    },
    breed: {
      type: String,
      required: [true, 'Raça é obrigatória'],
      trim: true,
      maxlength: [100, 'Raça não pode ter mais de 100 caracteres'],
    },
    birthDate: {
      type: Date,
      required: [true, 'Data de nascimento é obrigatória'],
      validate: {
        validator: function (value: Date) {
          return value <= new Date();
        },
        message: 'Data de nascimento não pode ser no futuro',
      },
    },
    weight: {
      type: Number,
      required: [true, 'Peso é obrigatório'],
      min: [0.1, 'Peso deve ser maior que 0'],
      max: [200, 'Peso deve ser menor que 200kg'],
    },
    height: {
      type: Number,
      required: [true, 'Altura é obrigatória'],
      min: [1, 'Altura deve ser maior que 0'],
      max: [300, 'Altura deve ser menor que 300cm'],
    },
    gender: {
      type: String,
      required: [true, 'Gênero é obrigatório'],
      enum: {
        values: ['male', 'female'],
        message: 'Gênero deve ser: male ou female',
      },
    },
    isNeutered: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    microchipId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permite múltiplos documentos com valor null
    },
    medicalConditions: [{
      type: String,
      trim: true,
    }],
    allergies: [{
      type: String,
      trim: true,
    }],
    currentWeight: {
      type: Number,
      default: function() {
        return this.weight;
      },
    },
    currentHeight: {
      type: Number,
      default: function() {
        return this.height;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
petSchema.index({ userId: 1, name: 1 });
petSchema.index({ species: 1 });
petSchema.index({ breed: 1 });
petSchema.index({ createdAt: -1 });

// Virtual para calcular idade
petSchema.virtual('age').get(function () {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual para calcular BMI básico (peso/altura²)
petSchema.virtual('bmi').get(function () {
  if (!this.currentWeight || !this.currentHeight) return 0;
  const heightInMeters = this.currentHeight / 100;
  return Math.round((this.currentWeight / (heightInMeters * heightInMeters)) * 100) / 100;
});

// Middleware para atualizar currentWeight e currentHeight
petSchema.pre('save', function (next) {
  if (this.isModified('weight')) {
    this.currentWeight = this.weight;
  }
  if (this.isModified('height')) {
    this.currentHeight = this.height;
  }
  next();
});

// Validação customizada para peso baseado na espécie
petSchema.pre('save', function (next) {
  const weightLimits = {
    dog: { min: 0.5, max: 100 },
    cat: { min: 0.3, max: 15 },
    other: { min: 0.1, max: 200 },
  };
  
  const limits = weightLimits[this.species];
  if (this.weight < limits.min || this.weight > limits.max) {
    const error = new Error(
      `Peso para ${this.species} deve estar entre ${limits.min}kg e ${limits.max}kg`
    );
    return next(error);
  }
  
  next();
});

// Método estático para buscar pets por usuário
petSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Método para atualizar peso atual
petSchema.methods.updateCurrentWeight = function (newWeight: number) {
  this.currentWeight = newWeight;
  return this.save();
};

export const Pet = mongoose.model<IPet>('Pet', petSchema);
export default Pet;