/**
 * Hook para inicialização do aplicativo
 */

import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Font from 'expo-font';
import { useAppDispatch } from '@/store';
import { setTokens } from '@/store/slices/authSlice';

interface AppInitializationResult {
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar a inicialização do aplicativo
 */
export const useAppInitialization = (): AppInitializationResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Carregar fontes
        await loadFonts();

        // 2. Restaurar tokens de autenticação
        await restoreAuthTokens();

        // 3. Inicializar serviços
        await initializeServices();

        // 4. Outras inicializações necessárias
        await performOtherInitializations();

      } catch (err) {
        console.error('Erro na inicialização do app:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido na inicialização');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
        'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
      });
    } catch (error) {
      console.warn('Erro ao carregar fontes, usando fontes padrão:', error);
      // Não bloquear a inicialização por causa das fontes
    }
  };

  const restoreAuthTokens = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (accessToken && refreshToken) {
        dispatch(setTokens({ accessToken, refreshToken }));
      }
    } catch (error) {
      console.warn('Erro ao restaurar tokens:', error);
      // Não bloquear a inicialização, usuário pode fazer login novamente
    }
  };

  const initializeServices = async () => {
    try {
      // Aqui você pode inicializar outros serviços necessários
      // Como notificações push, analytics, etc.
      
      // Exemplo: inicializar notificações
      // await NotificationService.initialize();
      
      // Exemplo: inicializar analytics
      // await AnalyticsService.initialize();
      
    } catch (error) {
      console.warn('Erro ao inicializar serviços:', error);
      // Decidir se deve bloquear ou não baseado na criticidade do serviço
    }
  };

  const performOtherInitializations = async () => {
    try {
      // Outras inicializações que podem ser necessárias
      // Como verificar conectividade, sincronizar dados offline, etc.
      
      // Simular pequeno delay para UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.warn('Erro em outras inicializações:', error);
    }
  };

  return {
    isLoading,
    error,
  };
};