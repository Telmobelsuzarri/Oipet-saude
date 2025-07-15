import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * Componente oficial do logo OiPet
 * Reutilizável em todas as plataformas (Mobile, Web, Admin)
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.size - Tamanho do logo ('small', 'medium', 'large', 'xlarge')
 * @param {boolean} props.showText - Se deve mostrar o texto "OiPet"
 * @param {string} props.variant - Variante do logo ('default', 'white', 'glass')
 * @param {Object} props.style - Estilos customizados
 * @param {boolean} props.withGlass - Se deve aplicar glass effect
 */
const OiPetLogo = ({ 
  size = 'medium', 
  showText = true, 
  variant = 'default',
  style,
  withGlass = false,
  ...props 
}) => {
  const logoSizes = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 80, height: 80 },
    xlarge: { width: 120, height: 120 }
  };

  const textSizes = {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32
  };

  const containerStyle = [
    styles.container,
    withGlass && styles.glassContainer,
    style
  ];

  const logoStyle = [
    styles.logo,
    logoSizes[size],
    variant === 'white' && styles.whiteFilter
  ];

  const textStyle = [
    styles.text,
    { fontSize: textSizes[size] },
    variant === 'white' && styles.whiteText
  ];

  return (
    <View style={containerStyle} {...props}>
      <Image
        source={require('../assets/oipet-logo.jpg')}
        style={logoStyle}
        resizeMode="contain"
      />
      {showText && (
        <Text style={textStyle}>OiPet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  logo: {
    marginRight: 8,
  },
  whiteFilter: {
    tintColor: '#FFFFFF',
  },
  text: {
    fontWeight: 'bold',
    color: '#E85A5A', // Coral oficial
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  whiteText: {
    color: '#FFFFFF',
  }
});

export default OiPetLogo;