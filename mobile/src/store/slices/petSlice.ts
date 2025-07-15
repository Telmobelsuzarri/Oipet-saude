/**
 * Pet Slice - Gerenciamento de pets
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PetService } from '@/services/PetService';

interface Pet {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  isNeutered: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PetState {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: PetState = {
  pets: [],
  selectedPet: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async Thunks
export const fetchUserPets = createAsyncThunk(
  'pet/fetchUserPets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await PetService.getUserPets();
      return response.data.pets;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar pets');
    }
  }
);

export const createPet = createAsyncThunk(
  'pet/createPet',
  async (petData: Omit<Pet, '_id' | 'age' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await PetService.createPet(petData);
      return response.data.pet;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao criar pet');
    }
  }
);

export const updatePet = createAsyncThunk(
  'pet/updatePet',
  async ({ id, data }: { id: string; data: Partial<Pet> }, { rejectWithValue }) => {
    try {
      const response = await PetService.updatePet(id, data);
      return response.data.pet;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao atualizar pet');
    }
  }
);

export const deletePet = createAsyncThunk(
  'pet/deletePet',
  async (petId: string, { rejectWithValue }) => {
    try {
      await PetService.deletePet(petId);
      return petId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao deletar pet');
    }
  }
);

export const fetchPetById = createAsyncThunk(
  'pet/fetchPetById',
  async (petId: string, { rejectWithValue }) => {
    try {
      const response = await PetService.getPetById(petId);
      return response.data.pet;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar pet');
    }
  }
);

// Slice
const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    setSelectedPet: (state, action: PayloadAction<Pet | null>) => {
      state.selectedPet = action.payload;
    },
    
    addPet: (state, action: PayloadAction<Pet>) => {
      state.pets.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    updatePetLocal: (state, action: PayloadAction<Pet>) => {
      const index = state.pets.findIndex(pet => pet._id === action.payload._id);
      if (index !== -1) {
        state.pets[index] = action.payload;
        if (state.selectedPet && state.selectedPet._id === action.payload._id) {
          state.selectedPet = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    removePetLocal: (state, action: PayloadAction<string>) => {
      state.pets = state.pets.filter(pet => pet._id !== action.payload);
      if (state.selectedPet && state.selectedPet._id === action.payload) {
        state.selectedPet = null;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    clearPetError: (state) => {
      state.error = null;
    },
    
    resetPets: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch User Pets
    builder
      .addCase(fetchUserPets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserPets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Pet
    builder
      .addCase(createPet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets.push(action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(createPet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Pet
    builder
      .addCase(updatePet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pets.findIndex(pet => pet._id === action.payload._id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.selectedPet && state.selectedPet._id === action.payload._id) {
          state.selectedPet = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Pet
    builder
      .addCase(deletePet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = state.pets.filter(pet => pet._id !== action.payload);
        if (state.selectedPet && state.selectedPet._id === action.payload) {
          state.selectedPet = null;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Pet By ID
    builder
      .addCase(fetchPetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPet = action.payload;
        
        // Atualizar na lista também se existir
        const index = state.pets.findIndex(pet => pet._id === action.payload._id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchPetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedPet,
  addPet,
  updatePetLocal,
  removePetLocal,
  clearPetError,
  resetPets,
} = petSlice.actions;

export default petSlice.reducer;