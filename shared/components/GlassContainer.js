import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Componente GlassContainer - Base para todos os glass effects
 * Inspirado no design system Apple com liquid glass
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo interno
 * @param {string} props.intensity - Intensidade do glass ('light', 'medium', 'strong')
 * @param {Object} props.style - Estilos customizados
 * @param {string} props.type - Tipo de glass ('widget', 'sidebar', 'dock', 'notification', 'modal')
 * @param {boolean} props.animated - Se deve ter animações
 */
const GlassContainer = ({ 
  children, 
  intensity = 'medium',
  style,
  type = 'widget',
  animated = false,
  ...props 
}) => {
  const getGlassStyle = () => {
    const baseStyle = styles.base;
    const intensityStyle = styles[intensity] || styles.medium;
    const typeStyle = styles[type] || styles.widget;
    const animatedStyle = animated ? styles.animated : {};

    return [baseStyle, intensityStyle, typeStyle, animatedStyle, style];
  };

  return (
    <View style={getGlassStyle()} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  
  // Intensidades
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(15px)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(25px)',
  },
  
  // Tipos específicos
  widget: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
  },
  sidebar: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.18)',
  },
  dock: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  notification: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  modal: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    margin: 16,
  },
  
  // Animações
  animated: {
    // Será aplicado via animações customizadas
  }
});

export default GlassContainer;