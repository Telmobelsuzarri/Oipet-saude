/**
 * Navigation Types - Tipos para navegação
 */

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  
  // Pet specific screens
  PetDetails: { petId: string };
  PetEdit: { petId: string };
  PetCreate: undefined;
  
  // Health specific screens
  HealthRecord: { recordId: string };
  HealthRecordEdit: { recordId: string };
  HealthRecordCreate: { petId: string };
  
  // Profile screens
  ProfileEdit: undefined;
  Settings: undefined;
  
  // Other screens
  Scanner: undefined;
  Camera: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pets: undefined;
  Health: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type PetStackParamList = {
  PetsList: undefined;
  PetDetails: { petId: string };
  PetEdit: { petId: string };
  PetCreate: undefined;
};

export type HealthStackParamList = {
  HealthDashboard: undefined;
  HealthRecords: { petId: string };
  HealthRecord: { recordId: string };
  HealthRecordEdit: { recordId: string };
  HealthRecordCreate: { petId: string };
  WeightHistory: { petId: string };
  ActivityHistory: { petId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  About: undefined;
  Help: undefined;
  Privacy: undefined;
  Terms: undefined;
};