/**
 * PetService - Serviço de pets
 */

import { apiService } from './api';

interface CreatePetData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  isNeutered?: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export class PetService {
  /**
   * Obter pets do usuário
   */
  static async getUserPets(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return await apiService.get(`/pets?${params}`);
  }

  /**
   * Obter pet por ID
   */
  static async getPetById(petId: string) {
    return await apiService.get(`/pets/${petId}`);
  }

  /**
   * Criar novo pet
   */
  static async createPet(petData: CreatePetData) {
    return await apiService.post('/pets', petData);
  }

  /**
   * Atualizar pet
   */
  static async updatePet(petId: string, petData: Partial<CreatePetData>) {
    return await apiService.put(`/pets/${petId}`, petData);
  }

  /**
   * Deletar pet
   */
  static async deletePet(petId: string) {
    return await apiService.delete(`/pets/${petId}`);
  }

  /**
   * Calcular IMC do pet
   */
  static async calculatePetIMC(petId: string) {
    return await apiService.get(`/pets/${petId}/imc`);
  }

  /**
   * Upload de foto do pet
   */
  static async uploadPetPhoto(petId: string, file: any, onProgress?: (progress: number) => void) {
    return await apiService.uploadFile(`/pets/${petId}/photo`, file, onProgress);
  }
}