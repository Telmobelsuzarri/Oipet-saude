/**
 * PetsScreen - Tela de listagem e gerenciamento de pets
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { GlassContainer } from '@/components/ui/GlassContainer';

// Constants
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

/**
 * Tela de pets - placeholder para implementação futura
 */
export const PetsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meus Pets</Text>
        
        <GlassContainer style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Tela de pets em desenvolvimento...
          </Text>
          <Text style={styles.placeholderSubtext}>
            Aqui você poderá gerenciar todos os seus pets
          </Text>
        </GlassContainer>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.system.background,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.xl,
  },
  
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  
  placeholderSubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    textAlign: 'center',
  },
});