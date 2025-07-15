/**
 * OiPet Saúde Mobile App
 * Aplicativo principal React Native
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Configuração da store Redux
import { store, persistor } from './src/store';

// Navegação
import Navigation from './src/navigation';

// Componentes
import { LoadingScreen } from './src/components/ui/LoadingScreen';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';

// Hooks
import { useAppInitialization } from './src/hooks/useAppInitialization';

// Serviços
import { NotificationService } from './src/services/NotificationService';

// Manter a splash screen visível enquanto carrega
SplashScreen.preventAutoHideAsync();

/**
 * Componente principal do app
 */
export default function App() {
  const { isLoading, error } = useAppInitialization();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Carregar fontes customizadas
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });

        // Inicializar serviços
        await NotificationService.initialize();

        // Esconder splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Erro na inicialização do app:', error);
        await SplashScreen.hideAsync();
      }
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [isLoading]);

  // Mostrar loading enquanto inicializa
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Mostrar erro se houver problema na inicialização
  if (error) {
    return <LoadingScreen error={error} />;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <SafeAreaProvider>
            <Navigation />
            <StatusBar 
              style="auto" 
              backgroundColor="transparent"
              translucent={Platform.OS === 'android'}
            />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}