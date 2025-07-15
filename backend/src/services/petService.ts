/**
 * Serviço de gerenciamento de pets
 */

import { Pet, IPet } from '@/models/Pet';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface CreatePetData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: Date;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  isNeutered?: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export interface UpdatePetData {
  name?: string;
  species?: 'dog' | 'cat' | 'other';
  breed?: string;
  birthDate?: Date;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  isNeutered?: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export interface PaginatedPets {
  pets: IPet[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PetStats {
  totalPets: number;
  dogCount: number;
  catCount: number;
  otherCount: number;
  averageAge: number;
  averageWeight: number;
  neuteredCount: number;
  maleCount: number;
  femaleCount: number;
}

class PetService {
  /**
   * Criar novo pet
   */
  async createPet(userId: string, petData: CreatePetData): Promise<IPet> {
    try {
      const pet = new Pet({
        ...petData,
        userId,
        age: this.calculateAge(petData.birthDate)
      });

      await pet.save();
      
      logger.info(`Pet created: ${pet._id} for user: ${userId}`);
      return pet;
    } catch (error) {
      logger.error('Error creating pet:', error);
      throw error;
    }
  }

  /**
   * Obter pets do usuário
   */
  async getUserPets(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<PaginatedPets> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = { userId };
      
      if (search) {
        filters.name = { $regex: search, $options: 'i' };
      }

      // Buscar pets
      const pets = await Pet.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Atualizar idades
      const petsWithUpdatedAge = pets.map(pet => {
        pet.age = this.calculateAge(pet.birthDate);
        return pet;
      });

      // Contar total
      const total = await Pet.countDocuments(filters);
      const totalPages = Math.ceil(total / limit);

      return {
        pets: petsWithUpdatedAge,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      logger.error('Error getting user pets:', error);
      throw error;
    }
  }

  /**
   * Obter pet por ID
   */
  async getPetById(petId: string, userId: string): Promise<IPet> {
    try {
      const pet = await Pet.findOne({ _id: petId, userId });
      
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      // Atualizar idade
      pet.age = this.calculateAge(pet.birthDate);
      
      return pet;
    } catch (error) {
      logger.error('Error getting pet by ID:', error);
      throw error;
    }
  }

  /**
   * Atualizar pet
   */
  async updatePet(petId: string, userId: string, updateData: UpdatePetData): Promise<IPet> {
    try {
      const pet = await Pet.findOne({ _id: petId, userId });
      
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      // Atualizar campos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          pet[key] = updateData[key];
        }
      });

      // Recalcular idade se data de nascimento foi alterada
      if (updateData.birthDate) {
        pet.age = this.calculateAge(updateData.birthDate);
      }

      pet.updatedAt = new Date();
      await pet.save();

      logger.info(`Pet updated: ${petId} by user: ${userId}`);
      return pet;
    } catch (error) {
      logger.error('Error updating pet:', error);
      throw error;
    }
  }

  /**
   * Deletar pet
   */
  async deletePet(petId: string, userId: string): Promise<void> {
    try {
      const pet = await Pet.findOne({ _id: petId, userId });
      
      if (!pet) {
        throw createError('Pet não encontrado', 404);
      }

      await Pet.findByIdAndDelete(petId);

      logger.info(`Pet deleted: ${petId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting pet:', error);
      throw error;
    }
  }

  /**
   * Calcular idade do pet
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }

  /**
   * Calcular IMC do pet (para cães)
   */
  calculatePetIMC(weight: number, height: number): { imc: number; classification: string } {
    const imc = weight / Math.pow(height / 100, 2);
    
    let classification = '';
    if (imc < 18.5) {
      classification = 'Abaixo do peso';
    } else if (imc < 25) {
      classification = 'Peso normal';
    } else if (imc < 30) {
      classification = 'Sobrepeso';
    } else {
      classification = 'Obesidade';
    }
    
    return { imc: Math.round(imc * 10) / 10, classification };
  }

  /**
   * Obter estatísticas de pets (Admin)
   */
  async getPetStats(): Promise<PetStats> {
    try {
      const [
        totalPets,
        dogCount,
        catCount,
        otherCount,
        neuteredCount,
        maleCount,
        femaleCount,
        avgWeightResult,
        pets
      ] = await Promise.all([
        Pet.countDocuments(),
        Pet.countDocuments({ species: 'dog' }),
        Pet.countDocuments({ species: 'cat' }),
        Pet.countDocuments({ species: 'other' }),
        Pet.countDocuments({ isNeutered: true }),
        Pet.countDocuments({ gender: 'male' }),
        Pet.countDocuments({ gender: 'female' }),
        Pet.aggregate([
          { $group: { _id: null, avgWeight: { $avg: '$weight' } } }
        ]),
        Pet.find({}, 'birthDate')
      ]);

      // Calcular idade média
      const currentYear = new Date().getFullYear();
      const ages = pets.map(pet => currentYear - new Date(pet.birthDate).getFullYear());
      const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b) / ages.length) : 0;

      const averageWeight = avgWeightResult[0]?.avgWeight || 0;

      return {
        totalPets,
        dogCount,
        catCount,
        otherCount,
        averageAge,
        averageWeight: Math.round(averageWeight * 10) / 10,
        neuteredCount,
        maleCount,
        femaleCount
      };
    } catch (error) {
      logger.error('Error getting pet stats:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os pets (Admin)
   */
  async getAllPets(
    page: number = 1,
    limit: number = 20,
    search?: string,
    species?: string
  ): Promise<PaginatedPets> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = {};
      
      if (search) {
        filters.name = { $regex: search, $options: 'i' };
      }
      
      if (species) {
        filters.species = species;
      }

      // Buscar pets com dados do usuário
      const pets = await Pet.find(filters)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Atualizar idades
      const petsWithUpdatedAge = pets.map(pet => {
        pet.age = this.calculateAge(pet.birthDate);
        return pet;
      });

      // Contar total
      const total = await Pet.countDocuments(filters);
      const totalPages = Math.ceil(total / limit);

      return {
        pets: petsWithUpdatedAge,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      logger.error('Error getting all pets:', error);
      throw error;
    }
  }

  /**
   * Buscar pets por raça
   */
  async getPetsByBreed(breed: string, limit: number = 10): Promise<IPet[]> {
    try {
      const pets = await Pet.find({ breed: { $regex: breed, $options: 'i' } })
        .populate('userId', 'name')
        .limit(limit)
        .sort({ createdAt: -1 });

      return pets.map(pet => {
        pet.age = this.calculateAge(pet.birthDate);
        return pet;
      });
    } catch (error) {
      logger.error('Error getting pets by breed:', error);
      throw error;
    }
  }

  /**
   * Buscar pets por faixa etária
   */
  async getPetsByAgeRange(minAge: number, maxAge: number): Promise<IPet[]> {
    try {
      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - maxAge;
      const maxBirthYear = currentYear - minAge;
      
      const pets = await Pet.find({
        $expr: {
          $and: [
            { $gte: [{ $year: '$birthDate' }, minBirthYear] },
            { $lte: [{ $year: '$birthDate' }, maxBirthYear] }
          ]
        }
      }).populate('userId', 'name');

      return pets.map(pet => {
        pet.age = this.calculateAge(pet.birthDate);
        return pet;
      });
    } catch (error) {
      logger.error('Error getting pets by age range:', error);
      throw error;
    }
  }
}

export const petService = new PetService();
export default petService;