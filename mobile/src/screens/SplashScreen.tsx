/**
 * SplashScreen - Tela inicial do aplicativo
 */

import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

/**
 * Tela de splash com lógica de redirecionamento
 */
export const SplashScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { onboarding } = useAppSelector(state => state.app);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Determinar para onde redirecionar
      if (!onboarding.completed) {
        navigation.navigate('Onboarding' as never);
      } else if (isAuthenticated) {
        navigation.navigate('Main' as never);
      } else {
        navigation.navigate('Login' as never);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated, onboarding.completed]);

  return (
    <LoadingScreen
      message="Bem-vindo ao OiPet Saúde"
      showLogo
    />
  );
};