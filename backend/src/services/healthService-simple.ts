/**
 * Health Service - Versão simplificada
 * Serviços relacionados aos registros de saúde dos pets
 */

import { logger } from '@/utils/logger';
import { HealthRecord } from '@/models/HealthRecord';
import { Pet } from '@/models/Pet';

export class HealthService {
  /**
   * Criar novo registro de saúde
   */
  async createHealthRecord(petId: string, userId: string, data: any) {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findById(petId);
      if (!pet) {
        throw new Error('Pet não encontrado');
      }
      
      if (pet.userId.toString() !== userId) {
        throw new Error('Acesso negado');
      }

      const record = new HealthRecord({
        petId,
        userId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await record.save();
      return record;
    } catch (error) {
      logger.error('Error creating health record:', error);
      throw error;
    }
  }

  /**
   * Obter registros de saúde do pet
   */
  async getPetHealthRecords(petId: string, userId: string) {
    try {
      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findById(petId);
      if (!pet) {
        throw new Error('Pet não encontrado');
      }
      
      if (pet.userId.toString() !== userId) {
        throw new Error('Acesso negado');
      }

      const records = await HealthRecord.find({ petId })
        .sort({ createdAt: -1 })
        .limit(50);

      return records;
    } catch (error) {
      logger.error('Error getting pet health records:', error);
      throw error;
    }
  }

  /**
   * Obter registro de saúde por ID
   */
  async getHealthRecordById(recordId: string, userId: string) {
    try {
      const record = await HealthRecord.findById(recordId);
      
      if (!record) {
        throw new Error('Registro de saúde não encontrado');
      }

      // Verificar se o pet pertence ao usuário
      const pet = await Pet.findById(record.petId);
      if (!pet || pet.userId.toString() !== userId) {
        throw new Error('Acesso negado');
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
  async updateHealthRecord(recordId: string, userId: string, updateData: any) {
    try {
      const record = await this.getHealthRecordById(recordId, userId);
      
      // Atualizar campos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          (record as any)[key] = updateData[key];
        }
      });

      (record as any).updatedAt = new Date();
      await record.save();

      return record;
    } catch (error) {
      logger.error('Error updating health record:', error);
      throw error;
    }
  }

  /**
   * Deletar registro de saúde
   */
  async deleteHealthRecord(recordId: string, userId: string) {
    try {
      const record = await this.getHealthRecordById(recordId, userId);
      await HealthRecord.findByIdAndDelete(recordId);
      
      return { success: true, message: 'Registro de saúde deletado com sucesso' };
    } catch (error) {
      logger.error('Error deleting health record:', error);
      throw error;
    }
  }
}

export const healthService = new HealthService();