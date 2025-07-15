/**
 * GlassContainer - Componente base do Liquid Glass Design System
 * Inspirado nos elementos glass do ecosystem Apple
 */

import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS_STYLES, COLORS, SPACING } from '@/constants/theme';

interface GlassContainerProps {
  children: ReactNode;
  variant?: 'widget' | 'dock' | 'sidebar' | 'notification' | 'modal' | 'custom';
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  blurStyle?: ViewStyle;
  testID?: string;
}

/**
 * Container com efeito glass Apple-style
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  variant = 'widget',
  intensity = 50,
  tint = 'light',
  style,
  contentStyle,
  blurStyle,
  testID,
}) => {
  // Obter estilo base do variant
  const baseStyle = GLASS_STYLES[variant] || GLASS_STYLES.widget;
  
  // Estilos combinados
  const containerStyle = [
    styles.container,
    baseStyle,
    style,
  ];

  const blurContainerStyle = [
    styles.blurContainer,
    blurStyle,
  ];

  const contentContainerStyle = [
    styles.content,
    contentStyle,
  ];

  return (
    <View style={containerStyle} testID={testID}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={blurContainerStyle}
      />
      <View style={contentContainerStyle}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  content: {
    position: 'relative',
    zIndex: 1,
    padding: SPACING.md,
  },
});

// Variações específicas para uso comum
export const GlassWidget: React.FC<Omit<GlassContainerProps, 'variant'>> = (props) => (
  <GlassContainer {...props} variant="widget" />
);

export const GlassDock: React.FC<Omit<GlassContainerProps, 'variant'>> = (props) => (
  <GlassContainer {...props} variant="dock" />
);

export const GlassSidebar: React.FC<Omit<GlassContainerProps, 'variant'>> = (props) => (
  <GlassContainer {...props} variant="sidebar" />
);

export const GlassNotification: React.FC<Omit<GlassContainerProps, 'variant'>> = (props) => (
  <GlassContainer {...props} variant="notification" />
);

export const GlassModal: React.FC<Omit<GlassContainerProps, 'variant'>> = (props) => (
  <GlassContainer {...props} variant="modal" />
);