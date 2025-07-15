/**
 * HealthService - Serviço de saúde
 */

import { apiService } from './api';

interface CreateHealthRecordData {
  date?: string;
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
    time?: string;
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
    time?: string;
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

export class HealthService {
  /**
   * Obter registros de saúde do pet
   */
  static async getPetHealthRecords(
    petId: string, 
    page = 1, 
    limit = 20, 
    startDate?: string, 
    endDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    
    return await apiService.get(`/health/pets/${petId}?${params}`);
  }

  /**
   * Obter registro de saúde por ID
   */
  static async getHealthRecordById(recordId: string) {
    return await apiService.get(`/health/${recordId}`);
  }

  /**
   * Criar registro de saúde
   */
  static async createHealthRecord(petId: string, recordData: CreateHealthRecordData) {
    return await apiService.post(`/health/pets/${petId}`, recordData);
  }

  /**
   * Atualizar registro de saúde
   */
  static async updateHealthRecord(recordId: string, recordData: Partial<CreateHealthRecordData>) {
    return await apiService.put(`/health/${recordId}`, recordData);
  }

  /**
   * Deletar registro de saúde
   */
  static async deleteHealthRecord(recordId: string) {
    return await apiService.delete(`/health/${recordId}`);
  }

  /**
   * Obter estatísticas de saúde do pet
   */
  static async getPetHealthStats(petId: string, days = 30) {
    return await apiService.get(`/health/pets/${petId}/stats?days=${days}`);
  }

  /**
   * Obter histórico de peso
   */
  static async getWeightHistory(petId: string, days = 90) {
    return await apiService.get(`/health/pets/${petId}/weight-history?days=${days}`);
  }

  /**
   * Obter resumo de atividades
   */
  static async getActivitySummary(petId: string, days = 30) {
    return await apiService.get(`/health/pets/${petId}/activity-summary?days=${days}`);
  }

  /**
   * Obter próximas medicações
   */
  static async getUpcomingMedications(petId: string) {
    return await apiService.get(`/health/pets/${petId}/medications`);
  }

  /**
   * Obter alertas de saúde
   */
  static async getHealthAlerts(petId: string) {
    return await apiService.get(`/health/pets/${petId}/alerts`);
  }
}