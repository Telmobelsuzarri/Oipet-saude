/**
 * Modelo de Registro de Saúde - MongoDB com Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthRecord extends Document {
  _id: string;
  petId: mongoose.Types.ObjectId;
  date: Date;
  weight?: number;
  height?: number;
  activity?: {
    type: string;
    duration: number; // em minutos
    intensity: 'low' | 'medium' | 'high';
    calories?: number;
  };
  feeding?: {
    food: string;
    amount: number; // em gramas
    calories: number;
    time: Date;
  };
  water?: {
    amount: number; // em ml
    times: number; // quantas vezes bebeu
  };
  sleep?: {
    duration: number; // em horas
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  mood?: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  symptoms?: string[];
  medications?: {
    name: string;
    dosage: string;
    time: Date;
    givenBy: string;
  }[];
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
  notes?: string;
  photos?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const healthRecordSchema = new Schema<IHealthRecord>(
  {
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'ID do pet é obrigatório'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Data do registro é obrigatória'],
      default: Date.now,
      index: true,
    },
    weight: {
      type: Number,
      min: [0.1, 'Peso deve ser maior que 0'],
      max: [200, 'Peso deve ser menor que 200kg'],
    },
    height: {
      type: Number,
      min: [1, 'Altura deve ser maior que 0'],
      max: [300, 'Altura deve ser menor que 300cm'],
    },
    activity: {
      type: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Tipo de atividade não pode ter mais de 100 caracteres'],
      },
      duration: {
        type: Number,
        required: true,
        min: [1, 'Duração deve ser maior que 0'],
        max: [1440, 'Duração deve ser menor que 1440 minutos (24h)'],
      },
      intensity: {
        type: String,
        required: true,
        enum: {
          values: ['low', 'medium', 'high'],
          message: 'Intensidade deve ser: low, medium ou high',
        },
      },
      calories: {
        type: Number,
        min: [0, 'Calorias não podem ser negativas'],
        max: [10000, 'Calorias devem ser menores que 10000'],
      },
    },
    feeding: {
      food: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Nome da comida não pode ter mais de 200 caracteres'],
      },
      amount: {
        type: Number,
        required: true,
        min: [1, 'Quantidade deve ser maior que 0'],
        max: [5000, 'Quantidade deve ser menor que 5000g'],
      },
      calories: {
        type: Number,
        required: true,
        min: [0, 'Calorias não podem ser negativas'],
        max: [10000, 'Calorias devem ser menores que 10000'],
      },
      time: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
    water: {
      amount: {
        type: Number,
        required: true,
        min: [1, 'Quantidade de água deve ser maior que 0'],
        max: [5000, 'Quantidade de água deve ser menor que 5000ml'],
      },
      times: {
        type: Number,
        required: true,
        min: [1, 'Número de vezes deve ser maior que 0'],
        max: [50, 'Número de vezes deve ser menor que 50'],
      },
    },
    sleep: {
      duration: {
        type: Number,
        required: true,
        min: [0.5, 'Duração do sono deve ser maior que 0.5h'],
        max: [24, 'Duração do sono deve ser menor que 24h'],
      },
      quality: {
        type: String,
        required: true,
        enum: {
          values: ['poor', 'fair', 'good', 'excellent'],
          message: 'Qualidade do sono deve ser: poor, fair, good ou excellent',
        },
      },
    },
    mood: {
      type: String,
      enum: {
        values: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
        message: 'Humor deve ser: very_sad, sad, neutral, happy ou very_happy',
      },
    },
    symptoms: [{
      type: String,
      trim: true,
      maxlength: [100, 'Sintoma não pode ter mais de 100 caracteres'],
    }],
    medications: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Nome do medicamento não pode ter mais de 200 caracteres'],
      },
      dosage: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Dosagem não pode ter mais de 100 caracteres'],
      },
      time: {
        type: Date,
        required: true,
        default: Date.now,
      },
      givenBy: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Nome de quem administrou não pode ter mais de 100 caracteres'],
      },
    }],
    vitals: {
      temperature: {
        type: Number,
        min: [30, 'Temperatura deve ser maior que 30°C'],
        max: [45, 'Temperatura deve ser menor que 45°C'],
      },
      heartRate: {
        type: Number,
        min: [50, 'Frequência cardíaca deve ser maior que 50 bpm'],
        max: [300, 'Frequência cardíaca deve ser menor que 300 bpm'],
      },
      respiratoryRate: {
        type: Number,
        min: [10, 'Frequência respiratória deve ser maior que 10 rpm'],
        max: [100, 'Frequência respiratória deve ser menor que 100 rpm'],
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observações não podem ter mais de 1000 caracteres'],
    },
    photos: [{
      type: String,
      validate: {
        validator: function (url: string) {
          return /^https?:\/\/.+/.test(url);
        },
        message: 'URL da foto deve ser válida',
      },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID do usuário criador é obrigatório'],
      index: true,
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
healthRecordSchema.index({ petId: 1, date: -1 });
healthRecordSchema.index({ createdBy: 1, date: -1 });
healthRecordSchema.index({ petId: 1, 'activity.type': 1 });

// Validação customizada para data não futura
healthRecordSchema.pre('save', function (next) {
  if (this.date > new Date()) {
    return next(new Error('Data do registro não pode ser no futuro'));
  }
  next();
});

// Método estático para buscar registros por pet
healthRecordSchema.statics.findByPet = function (petId: string, limit = 50) {
  return this.find({ petId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('createdBy', 'name');
};

// Método estático para buscar registros por período
healthRecordSchema.statics.findByDateRange = function (
  petId: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    petId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: -1 })
    .populate('createdBy', 'name');
};

// Método para calcular estatísticas de saúde
healthRecordSchema.statics.getHealthStats = function (petId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        petId: new mongoose.Types.ObjectId(petId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        avgWeight: { $avg: '$weight' },
        totalActivities: { $sum: { $cond: [{ $ifNull: ['$activity', false] }, 1, 0] } },
        totalActivityDuration: { $sum: '$activity.duration' },
        avgSleepDuration: { $avg: '$sleep.duration' },
        avgWaterIntake: { $avg: '$water.amount' },
      },
    },
  ]);
};

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', healthRecordSchema);
export default HealthRecord;