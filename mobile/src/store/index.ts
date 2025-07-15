/**
 * Redux Store Configuration
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import petReducer from './slices/petSlice';
import healthReducer from './slices/healthSlice';
import notificationReducer from './slices/notificationSlice';
import appReducer from './slices/appSlice';

// Configuração do Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'app'], // Apenas estes slices serão persistidos
  blacklist: ['pet', 'health', 'notification'], // Estes serão recarregados da API
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  pet: petReducer,
  health: healthReducer,
  notification: notificationReducer,
  app: appReducer,
});

// Reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;