/**
 * LoadingScreen - Tela de carregamento com design glass
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { OiPetLogo } from './OiPetLogo';

interface LoadingScreenProps {
  message?: string;
  error?: string;
  showLogo?: boolean;
}

/**
 * Tela de carregamento com logo OiPet e gradiente
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Carregando...',
  error,
  showLogo = true,
}) => {
  return (
    <LinearGradient
      colors={[COLORS.primary.coral, COLORS.primary.teal]}
      style={styles.container}
    >
      <View style={styles.content}>
        {showLogo && (
          <OiPetLogo
            size="xlarge"
            variant="vertical"
            color="white"
            showTagline
            style={styles.logo}
          />
        )}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.system.text.inverse}
              style={styles.spinner}
            />
            <Text style={styles.loadingText}>
              {message}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  
  logo: {
    marginBottom: SPACING['4xl'],
  },
  
  loadingContainer: {
    alignItems: 'center',
  },
  
  spinner: {
    marginBottom: SPACING.lg,
  },
  
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.inverse,
    textAlign: 'center',
  },
  
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.xl,
    borderRadius: 16,
  },
  
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.inverse,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
  },
});