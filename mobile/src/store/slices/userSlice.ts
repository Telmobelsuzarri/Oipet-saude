/**
 * User Slice - Gerenciamento de dados do usuário
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserService } from '@/services/UserService';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async Thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getProfile();
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar perfil');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updateData: { name?: string; phone?: string; avatar?: string }, { rejectWithValue }) => {
    try {
      const response = await UserService.updateProfile(updateData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await UserService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao alterar senha');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateUserField: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    clearUserError: (state) => {
      state.error = null;
    },
    
    resetUser: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUserProfile, updateUserField, clearUserError, resetUser } = userSlice.actions;
export default userSlice.reducer;