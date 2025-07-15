/**
 * Health Slice - Gerenciamento de registros de saúde
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HealthService } from '@/services/HealthService';

interface HealthRecord {
  _id: string;
  petId: string;
  date: string;
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
    time: string;
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
    time: string;
    givenBy: string;
  }[];
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
  notes?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

interface HealthStats {
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

interface HealthState {
  records: HealthRecord[];
  selectedRecord: HealthRecord | null;
  stats: HealthStats | null;
  weightHistory: Array<{ date: string; weight: number }>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: HealthState = {
  records: [],
  selectedRecord: null,
  stats: null,
  weightHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async Thunks
export const fetchHealthRecords = createAsyncThunk(
  'health/fetchRecords',
  async ({ petId, page = 1, limit = 20 }: { petId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await HealthService.getPetHealthRecords(petId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar registros');
    }
  }
);

export const createHealthRecord = createAsyncThunk(
  'health/createRecord',
  async ({ petId, data }: { petId: string; data: Partial<HealthRecord> }, { rejectWithValue }) => {
    try {
      const response = await HealthService.createHealthRecord(petId, data);
      return response.data.healthRecord;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao criar registro');
    }
  }
);

export const updateHealthRecord = createAsyncThunk(
  'health/updateRecord',
  async ({ id, data }: { id: string; data: Partial<HealthRecord> }, { rejectWithValue }) => {
    try {
      const response = await HealthService.updateHealthRecord(id, data);
      return response.data.healthRecord;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao atualizar registro');
    }
  }
);

export const deleteHealthRecord = createAsyncThunk(
  'health/deleteRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      await HealthService.deleteHealthRecord(recordId);
      return recordId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao deletar registro');
    }
  }
);

export const fetchHealthStats = createAsyncThunk(
  'health/fetchStats',
  async ({ petId, days = 30 }: { petId: string; days?: number }, { rejectWithValue }) => {
    try {
      const response = await HealthService.getPetHealthStats(petId, days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar estatísticas');
    }
  }
);

export const fetchWeightHistory = createAsyncThunk(
  'health/fetchWeightHistory',
  async ({ petId, days = 90 }: { petId: string; days?: number }, { rejectWithValue }) => {
    try {
      const response = await HealthService.getWeightHistory(petId, days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar histórico de peso');
    }
  }
);

// Slice
const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    setSelectedRecord: (state, action: PayloadAction<HealthRecord | null>) => {
      state.selectedRecord = action.payload;
    },
    
    addRecord: (state, action: PayloadAction<HealthRecord>) => {
      state.records.unshift(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    updateRecordLocal: (state, action: PayloadAction<HealthRecord>) => {
      const index = state.records.findIndex(record => record._id === action.payload._id);
      if (index !== -1) {
        state.records[index] = action.payload;
        if (state.selectedRecord && state.selectedRecord._id === action.payload._id) {
          state.selectedRecord = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    removeRecordLocal: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record._id !== action.payload);
      if (state.selectedRecord && state.selectedRecord._id === action.payload) {
        state.selectedRecord = null;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    clearHealthError: (state) => {
      state.error = null;
    },
    
    resetHealth: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch Health Records
    builder
      .addCase(fetchHealthRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.records;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Health Record
    builder
      .addCase(createHealthRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createHealthRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records.unshift(action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(createHealthRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Health Record
    builder
      .addCase(updateHealthRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateHealthRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.records.findIndex(record => record._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.selectedRecord && state.selectedRecord._id === action.payload._id) {
          state.selectedRecord = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateHealthRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Health Record
    builder
      .addCase(deleteHealthRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteHealthRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = state.records.filter(record => record._id !== action.payload);
        if (state.selectedRecord && state.selectedRecord._id === action.payload) {
          state.selectedRecord = null;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deleteHealthRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Health Stats
    builder
      .addCase(fetchHealthStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchHealthStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Weight History
    builder
      .addCase(fetchWeightHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeightHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weightHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchWeightHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedRecord,
  addRecord,
  updateRecordLocal,
  removeRecordLocal,
  clearHealthError,
  resetHealth,
} = healthSlice.actions;

export default healthSlice.reducer;