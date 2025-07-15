/**
 * Auth Slice - Gerenciamento de autenticação
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '@/services/AuthService';

interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(email, password);
      
      // Salvar tokens no secure store
      await SecureStore.setItemAsync('accessToken', response.accessToken);
      await SecureStore.setItemAsync('refreshToken', response.refreshToken);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro no login');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { email: string; password: string; name: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      
      // Salvar tokens no secure store
      await SecureStore.setItemAsync('accessToken', response.accessToken);
      await SecureStore.setItemAsync('refreshToken', response.refreshToken);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro no cadastro');
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { refreshToken } = state.auth;
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }
      
      const response = await AuthService.refreshToken(refreshToken);
      
      // Salvar novos tokens
      await SecureStore.setItemAsync('accessToken', response.accessToken);
      await SecureStore.setItemAsync('refreshToken', response.refreshToken);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao renovar token');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Remover tokens do secure store
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      // Chamar logout na API se necessário
      // await AuthService.logout();
      
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro no logout');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetAuth: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Refresh Token
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Mesmo com erro, limpar dados locais
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setTokens, setUser, clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;