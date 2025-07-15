/**
 * App Slice - Estado global da aplicação
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOnline: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'pt' | 'en' | 'es';
  notifications: {
    enabled: boolean;
    medication: boolean;
    feeding: boolean;
    activity: boolean;
    health: boolean;
  };
  onboarding: {
    completed: boolean;
    currentStep: number;
  };
  lastSyncAt: string | null;
  appVersion: string;
  buildVersion: string;
}

const initialState: AppState = {
  isOnline: true,
  theme: 'auto',
  language: 'pt',
  notifications: {
    enabled: true,
    medication: true,
    feeding: true,
    activity: true,
    health: true,
  },
  onboarding: {
    completed: false,
    currentStep: 0,
  },
  lastSyncAt: null,
  appVersion: '1.0.0',
  buildVersion: '1',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<'pt' | 'en' | 'es'>) => {
      state.language = action.payload;
    },
    
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    setOnboardingCompleted: (state) => {
      state.onboarding.completed = true;
    },
    
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.onboarding.currentStep = action.payload;
    },
    
    resetOnboarding: (state) => {
      state.onboarding = {
        completed: false,
        currentStep: 0,
      };
    },
    
    setLastSyncAt: (state, action: PayloadAction<string>) => {
      state.lastSyncAt = action.payload;
    },
    
    updateAppVersion: (state, action: PayloadAction<{ appVersion: string; buildVersion: string }>) => {
      state.appVersion = action.payload.appVersion;
      state.buildVersion = action.payload.buildVersion;
    },
    
    resetApp: () => initialState,
  },
});

export const {
  setOnlineStatus,
  setTheme,
  setLanguage,
  updateNotificationSettings,
  setOnboardingCompleted,
  setOnboardingStep,
  resetOnboarding,
  setLastSyncAt,
  updateAppVersion,
  resetApp,
} = appSlice.actions;

export default appSlice.reducer;