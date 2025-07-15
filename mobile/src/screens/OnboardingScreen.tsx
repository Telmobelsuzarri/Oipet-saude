/**
 * OnboardingScreen - Tela de apresentação do app
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Redux
import { useAppDispatch } from '@/store';
import { setOnboardingCompleted } from '@/store/slices/appSlice';

// Components
import { OiPetLogo } from '@/components/ui/OiPetLogo';
import { GlassContainer } from '@/components/ui/GlassContainer';

// Constants
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Cuide da Saúde do seu Pet',
    description: 'Monitore peso, atividades, alimentação e muito mais em um só lugar.',
    icon: 'heart',
  },
  {
    id: 2,
    title: 'Registros Inteligentes',
    description: 'Acompanhe o histórico de saúde com gráficos e estatísticas detalhadas.',
    icon: 'analytics',
  },
  {
    id: 3,
    title: 'Lembretes Personalizados',
    description: 'Nunca esqueça medicações, alimentação ou consultas veterinárias.',
    icon: 'notifications',
  },
  {
    id: 4,
    title: 'Scanner de Alimentos',
    description: 'Identifique alimentos seguros para seu pet com nossa tecnologia.',
    icon: 'camera',
  },
];

/**
 * Tela de onboarding com apresentação das funcionalidades
 */
export const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    dispatch(setOnboardingCompleted());
    navigation.navigate('Login' as never);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <LinearGradient
      colors={[COLORS.primary.coral, COLORS.primary.teal]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <OiPetLogo
            size="medium"
            variant="horizontal"
            color="white"
            style={styles.logo}
          />
          
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <GlassContainer
            variant="modal"
            style={styles.stepContainer}
            contentStyle={styles.stepContent}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={currentStepData.icon as any}
                size={80}
                color={COLORS.primary.coral}
              />
            </View>
            
            <Text style={styles.stepTitle}>
              {currentStepData.title}
            </Text>
            
            <Text style={styles.stepDescription}>
              {currentStepData.description}
            </Text>
          </GlassContainer>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
            <Ionicons
              name={currentStep === onboardingSteps.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20}
              color={COLORS.primary.coral}
              style={styles.nextButtonIcon}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  
  logo: {
    flex: 1,
  },
  
  skipButton: {
    padding: SPACING.sm,
  },
  
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.inverse,
    opacity: 0.8,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  stepContainer: {
    width: width - SPACING['4xl'],
    maxWidth: 320,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  stepContent: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
  },
  
  footer: {
    paddingBottom: SPACING['3xl'],
    alignItems: 'center',
  },
  
  progressContainer: {
    flexDirection: 'row',
    marginBottom: SPACING['2xl'],
  },
  
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  
  progressDotActive: {
    backgroundColor: COLORS.system.text.inverse,
    width: 24,
  },
  
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.system.text.inverse,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    minWidth: 140,
    justifyContent: 'center',
  },
  
  nextButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.primary.coral,
  },
  
  nextButtonIcon: {
    marginLeft: SPACING.sm,
  },
});