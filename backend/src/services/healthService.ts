/**
 * Serviço de gerenciamento de saúde de pets
 */

import { HealthRecord, IHealthRecord } from '@/models/HealthRecord';
import { Pet } from '@/models/Pet';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface CreateHealthRecordData {
  petId: string;
  date?: Date;
  weight?: number;
  height?: number;
  activity?: {
    type: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    calories?: number;
  };
  feeding?: {
    food: string;
    amount: number;
    calories: number;
    time?: Date;
  };
  water?: {
    amount: number;
    times: number;
  };
  sleep?: {
    duration: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  mood?: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  symptoms?: string[];
  medications?: {
    name: string;
    dosage: string;
    time?: Date;
    givenBy: string;
  }[];
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
  notes?: string;
  photos?: string[];
}

export interface UpdateHealthRecordData {
  weight?: number;
  height?: number;
  activity?: {
    type: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    calories?: number;
  };
  feeding?: {
    food: string;
    amount: number;
    calories: number;
    time?: Date;
  };
  water?: {
    amount: number;
    times: number;
  };
  sleep?: {
    duration: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  mood?: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  symptoms?: string[];
  medications?: {
    name: string;
    dosage: string;
    time?: Date;
    givenBy: string;
  }[];
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
  notes?: string;
  photos?: string[];
}

export interface PaginatedHealthRecords {
  records: IHealthRecord[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface HealthStats {
  totalRecords: number;
  averageWeight: number;
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  totalActivities: number;
  totalActivityDuration: number;
  averageSleepDuration: number;
  averageWaterIntake: number;
  moodDistribution: {
    very_sad: number;
    sad: number;
    neutral: number;
    happy: number;
    very_happy: number;
  };
  commonSymptoms: string[];
  recentVitals: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
}

export interface WeightHistory {
  date: Date;
  weight: number;
}

export interface ActivitySummary {
  date: Date;
  totalDuration: number;
  activities: {
    type: string;
    duration: number;
    intensity: string;
    calories?: number;
  }[];
}

class HealthService {
  /**
   * Criar novo registro de saúde
   */
  async createHealthRecord(userId: string, recordData: CreateHealthRecordData): Promise<IHealthRecord> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: recordData.petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      // Preparar dados do registro
      const healthRecordData = {
        ...recordData,
        petId: new mongoose.Types.ObjectId(recordData.petId),
        date: recordData.date || new Date(),
        createdBy: new mongoose.Types.ObjectId(userId)
      };

      // Ajustar horário de alimentação se não fornecido
      if (healthRecordData.feeding && !healthRecordData.feeding.time) {
        healthRecordData.feeding.time = new Date();
      }

      // Ajustar horário de medicação se não fornecido
      if (healthRecordData.medications) {
        healthRecordData.medications = healthRecordData.medications.map(med => ({
          ...med,
          time: med.time || new Date()
        }));
      }

      const healthRecord = new HealthRecord(healthRecordData);
      await healthRecord.save();

      logger.info(`Health record created: ${healthRecord._id} for pet: ${recordData.petId}`);
      return healthRecord;
    } catch (error) {
      logger.error('Error creating health record:', error);
      throw error;
    }
  }

  /**
   * Obter registros de saúde do pet
   */
  async getPetHealthRecords(
    petId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaginatedHealthRecords> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = { petId: new mongoose.Types.ObjectId(petId) };
      
      if (startDate && endDate) {
        filters.date = {
          $gte: startDate,
          $lte: endDate
        };
      }

      // Buscar registros
      const records = await HealthRecord.find(filters)
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      // Contar total
      const total = await HealthRecord.countDocuments(filters);
      const totalPages = Math.ceil(total / limit);

      return {
        records,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      logger.error('Error getting pet health records:', error);
      throw error;
    }
  }

  /**
   * Obter registro de saúde por ID
   */
  async getHealthRecordById(recordId: string, userId: string): Promise<IHealthRecord> {
    try {
      const record = await HealthRecord.findById(recordId)
        .populate('petId', 'name userId')
        .populate('createdBy', 'name');
      
      if (!record) {
        throw createError('Registro de saúde não encontrado', 404);
      }

      // Verificar se o pet pertence ao usuário
      if (record.petId.userId.toString() !== userId) {
        throw createError('Acesso negado', 403);
      }

      return record;
    } catch (error) {
      logger.error('Error getting health record by ID:', error);
      throw error;
    }
  }

  /**
   * Atualizar registro de saúde
   */
  async updateHealthRecord(
    recordId: string,
    userId: string,
    updateData: UpdateHealthRecordData
  ): Promise<IHealthRecord> {
    try {
      const record = await HealthRecord.findById(recordId).populate('petId', 'userId');
      
      if (!record) {
        throw createError('Registro de saúde não encontrado', 404);
      }

      // Verificar se o pet pertence ao usuário
      if (record.petId.userId.toString() !== userId) {
        throw createError('Acesso negado', 403);
      }

      // Atualizar campos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          record[key] = updateData[key];
        }
      });

      record.updatedAt = new Date();
      await record.save();

      logger.info(`Health record updated: ${recordId} by user: ${userId}`);
      return record;
    } catch (error) {
      logger.error('Error updating health record:', error);
      throw error;
    }
  }

  /**
   * Deletar registro de saúde
   */
  async deleteHealthRecord(recordId: string, userId: string): Promise<void> {
    try {
      const record = await HealthRecord.findById(recordId).populate('petId', 'userId');
      
      if (!record) {
        throw createError('Registro de saúde não encontrado', 404);
      }

      // Verificar se o pet pertence ao usuário
      if (record.petId.userId.toString() !== userId) {
        throw createError('Acesso negado', 403);
      }

      await HealthRecord.findByIdAndDelete(recordId);

      logger.info(`Health record deleted: ${recordId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting health record:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de saúde do pet
   */
  async getPetHealthStats(petId: string, userId: string, days: number = 30): Promise<HealthStats> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar registros do período
      const records = await HealthRecord.find({
        petId: new mongoose.Types.ObjectId(petId),
        date: { $gte: startDate }
      }).sort({ date: -1 });

      // Calcular estatísticas
      const totalRecords = records.length;
      
      // Peso médio e tendência
      const weightsWithDates = records
        .filter(r => r.weight)
        .map(r => ({ date: r.date, weight: r.weight }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const averageWeight = weightsWithDates.length > 0 
        ? weightsWithDates.reduce((acc, curr) => acc + curr.weight, 0) / weightsWithDates.length 
        : 0;

      let weightTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (weightsWithDates.length > 1) {
        const firstWeight = weightsWithDates[0].weight;
        const lastWeight = weightsWithDates[weightsWithDates.length - 1].weight;
        const difference = lastWeight - firstWeight;
        
        if (difference > 0.5) {
          weightTrend = 'increasing';
        } else if (difference < -0.5) {
          weightTrend = 'decreasing';
        }
      }

      // Atividades
      const activities = records.filter(r => r.activity);
      const totalActivities = activities.length;
      const totalActivityDuration = activities.reduce((acc, curr) => acc + curr.activity.duration, 0);

      // Sono
      const sleepRecords = records.filter(r => r.sleep);
      const averageSleepDuration = sleepRecords.length > 0 
        ? sleepRecords.reduce((acc, curr) => acc + curr.sleep.duration, 0) / sleepRecords.length 
        : 0;

      // Água
      const waterRecords = records.filter(r => r.water);
      const averageWaterIntake = waterRecords.length > 0 
        ? waterRecords.reduce((acc, curr) => acc + curr.water.amount, 0) / waterRecords.length 
        : 0;

      // Distribuição de humor
      const moodDistribution = {
        very_sad: 0,
        sad: 0,
        neutral: 0,
        happy: 0,
        very_happy: 0
      };

      records.forEach(record => {
        if (record.mood) {
          moodDistribution[record.mood]++;
        }
      });

      // Sintomas comuns
      const symptomsCount = {};
      records.forEach(record => {
        if (record.symptoms) {
          record.symptoms.forEach(symptom => {
            symptomsCount[symptom] = (symptomsCount[symptom] || 0) + 1;
          });
        }
      });

      const commonSymptoms = Object.entries(symptomsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom]) => symptom);

      // Vitais mais recentes
      const recentVitalsRecord = records.find(r => r.vitals);
      const recentVitals = recentVitalsRecord ? recentVitalsRecord.vitals : {};

      return {
        totalRecords,
        averageWeight: Math.round(averageWeight * 10) / 10,
        weightTrend,
        totalActivities,
        totalActivityDuration,
        averageSleepDuration: Math.round(averageSleepDuration * 10) / 10,
        averageWaterIntake: Math.round(averageWaterIntake),
        moodDistribution,
        commonSymptoms,
        recentVitals
      };
    } catch (error) {
      logger.error('Error getting pet health stats:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de peso
   */
  async getWeightHistory(petId: string, userId: string, days: number = 90): Promise<WeightHistory[]> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const records = await HealthRecord.find({
        petId: new mongoose.Types.ObjectId(petId),
        date: { $gte: startDate },
        weight: { $exists: true }
      })
      .select('date weight')
      .sort({ date: 1 });

      return records.map(record => ({
        date: record.date,
        weight: record.weight
      }));
    } catch (error) {
      logger.error('Error getting weight history:', error);
      throw error;
    }
  }

  /**
   * Obter resumo de atividades
   */
  async getActivitySummary(petId: string, userId: string, days: number = 30): Promise<ActivitySummary[]> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const records = await HealthRecord.find({
        petId: new mongoose.Types.ObjectId(petId),
        date: { $gte: startDate },
        activity: { $exists: true }
      })
      .select('date activity')
      .sort({ date: -1 });

      // Agrupar por dia
      const groupedByDate = records.reduce((acc, record) => {
        const dateKey = record.date.toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: record.date,
            totalDuration: 0,
            activities: []
          };
        }
        
        acc[dateKey].totalDuration += record.activity.duration;
        acc[dateKey].activities.push({
          type: record.activity.type,
          duration: record.activity.duration,
          intensity: record.activity.intensity,
          calories: record.activity.calories
        });
        
        return acc;
      }, {});

      return Object.values(groupedByDate);
    } catch (error) {
      logger.error('Error getting activity summary:', error);
      throw error;
    }
  }

  /**
   * Obter próximas medicações
   */
  async getUpcomingMedications(petId: string, userId: string): Promise<any[]> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const records = await HealthRecord.find({
        petId: new mongoose.Types.ObjectId(petId),
        medications: { $exists: true, $ne: [] },
        date: { $gte: today, $lte: nextWeek }
      })
      .select('date medications')
      .sort({ date: 1 });

      const upcomingMedications = [];
      
      records.forEach(record => {
        record.medications.forEach(medication => {
          upcomingMedications.push({
            date: record.date,
            name: medication.name,
            dosage: medication.dosage,
            time: medication.time,
            givenBy: medication.givenBy
          });
        });
      });

      return upcomingMedications.sort((a, b) => a.time.getTime() - b.time.getTime());
    } catch (error) {
      logger.error('Error getting upcoming medications:', error);
      throw error;
    }
  }

  /**
   * Verificar alertas de saúde
   */
  async getHealthAlerts(petId: string, userId: string): Promise<any[]> {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      const alerts = [];
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const recentRecords = await HealthRecord.find({
        petId: new mongoose.Types.ObjectId(petId),
        date: { $gte: last7Days }
      }).sort({ date: -1 });

      // Verificar se há registros recentes
      if (recentRecords.length === 0) {
        alerts.push({
          type: 'warning',
          message: 'Nenhum registro de saúde nos últimos 7 dias',
          priority: 'medium'
        });
      }

      // Verificar sintomas recorrentes
      const symptoms = recentRecords
        .flatMap(r => r.symptoms || [])
        .filter(s => s);
      
      const symptomCounts = symptoms.reduce((acc, symptom) => {
        acc[symptom] = (acc[symptom] || 0) + 1;
        return acc;
      }, {});

      Object.entries(symptomCounts).forEach(([symptom, count]) => {
        if (count >= 3) {
          alerts.push({
            type: 'danger',
            message: `Sintoma recorrente: ${symptom} (${count} vezes)`,
            priority: 'high'
          });
        }
      });

      // Verificar variações de peso
      const weightRecords = recentRecords
        .filter(r => r.weight)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (weightRecords.length >= 2) {
        const firstWeight = weightRecords[0].weight;
        const lastWeight = weightRecords[weightRecords.length - 1].weight;
        const weightChange = ((lastWeight - firstWeight) / firstWeight) * 100;

        if (Math.abs(weightChange) > 10) {
          alerts.push({
            type: 'warning',
            message: `Variação significativa de peso: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}%`,
            priority: 'medium'
          });
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting health alerts:', error);
      throw error;
    }
  }
}

export const healthService = new HealthService();
export default healthService;