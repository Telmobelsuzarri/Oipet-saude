/**
 * OiPetLogo - Componente do logo OiPet com diferentes variações
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

interface OiPetLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'horizontal' | 'vertical' | 'icon-only' | 'text-only';
  color?: 'primary' | 'white' | 'dark' | 'coral' | 'teal';
  style?: ViewStyle;
  showTagline?: boolean;
  animated?: boolean;
  testID?: string;
}

/**
 * Componente do logo OiPet com cores e tamanhos variados
 */
export const OiPetLogo: React.FC<OiPetLogoProps> = ({
  size = 'medium',
  variant = 'horizontal',
  color = 'primary',
  style,
  showTagline = false,
  animated = false,
  testID,
}) => {
  // Configurações de tamanho
  const sizeConfig = {
    small: {
      iconSize: 24,
      fontSize: TYPOGRAPHY.fontSize.lg,
      taglineSize: TYPOGRAPHY.fontSize.xs,
      spacing: SPACING.xs,
    },
    medium: {
      iconSize: 32,
      fontSize: TYPOGRAPHY.fontSize['2xl'],
      taglineSize: TYPOGRAPHY.fontSize.sm,
      spacing: SPACING.sm,
    },
    large: {
      iconSize: 48,
      fontSize: TYPOGRAPHY.fontSize['3xl'],
      taglineSize: TYPOGRAPHY.fontSize.base,
      spacing: SPACING.md,
    },
    xlarge: {
      iconSize: 64,
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      taglineSize: TYPOGRAPHY.fontSize.lg,
      spacing: SPACING.lg,
    },
  };

  // Configurações de cor
  const colorConfig = {
    primary: {
      icon: COLORS.primary.coral,
      text: COLORS.primary.coral,
      tagline: COLORS.system.text.secondary,
    },
    white: {
      icon: COLORS.system.text.inverse,
      text: COLORS.system.text.inverse,
      tagline: 'rgba(255, 255, 255, 0.8)',
    },
    dark: {
      icon: COLORS.system.text.primary,
      text: COLORS.system.text.primary,
      tagline: COLORS.system.text.secondary,
    },
    coral: {
      icon: COLORS.primary.coral,
      text: COLORS.primary.coral,
      tagline: COLORS.primary.coral,
    },
    teal: {
      icon: COLORS.primary.teal,
      text: COLORS.primary.teal,
      tagline: COLORS.primary.teal,
    },
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[color];

  // Estilos dinâmicos
  const iconStyle: TextStyle = {
    fontSize: currentSize.iconSize,
    color: currentColor.icon,
  };

  const textStyle: TextStyle = {
    fontSize: currentSize.fontSize,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: currentColor.text,
  };

  const taglineStyle: TextStyle = {
    fontSize: currentSize.taglineSize,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: currentColor.tagline,
    marginTop: SPACING.xs,
  };

  // Renderizar diferentes variantes
  const renderContent = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <Ionicons 
            name="paw" 
            style={iconStyle}
            testID={`${testID}-icon`}
          />
        );

      case 'text-only':
        return (
          <View style={styles.textOnlyContainer}>
            <Text style={textStyle} testID={`${testID}-text`}>
              OiPet
            </Text>
            {showTagline && (
              <Text style={taglineStyle} testID={`${testID}-tagline`}>
                Saúde & Bem-estar
              </Text>
            )}
          </View>
        );

      case 'vertical':
        return (
          <View style={styles.verticalContainer}>
            <Ionicons 
              name="paw" 
              style={iconStyle}
              testID={`${testID}-icon`}
            />
            <Text style={[textStyle, { marginTop: currentSize.spacing }]} testID={`${testID}-text`}>
              OiPet
            </Text>
            {showTagline && (
              <Text style={taglineStyle} testID={`${testID}-tagline`}>
                Saúde & Bem-estar
              </Text>
            )}
          </View>
        );

      default: // horizontal
        return (
          <View style={styles.horizontalContainer}>
            <Ionicons 
              name="paw" 
              style={iconStyle}
              testID={`${testID}-icon`}
            />
            <View style={[styles.textContainer, { marginLeft: currentSize.spacing }]}>
              <Text style={textStyle} testID={`${testID}-text`}>
                OiPet
              </Text>
              {showTagline && (
                <Text style={taglineStyle} testID={`${testID}-tagline`}>
                  Saúde & Bem-estar
                </Text>
              )}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  textOnlyContainer: {
    alignItems: 'center',
  },
  
  textContainer: {
    alignItems: 'flex-start',
  },
});

// Variações específicas para uso comum
export const OiPetLogoHorizontal: React.FC<Omit<OiPetLogoProps, 'variant'>> = (props) => (
  <OiPetLogo {...props} variant="horizontal" />
);

export const OiPetLogoVertical: React.FC<Omit<OiPetLogoProps, 'variant'>> = (props) => (
  <OiPetLogo {...props} variant="vertical" />
);

export const OiPetLogoIcon: React.FC<Omit<OiPetLogoProps, 'variant'>> = (props) => (
  <OiPetLogo {...props} variant="icon-only" />
);

export const OiPetLogoText: React.FC<Omit<OiPetLogoProps, 'variant'>> = (props) => (
  <OiPetLogo {...props} variant="text-only" />
);