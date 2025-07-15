/**
 * OiPet Official Colors & Style Guide
 * Cores oficiais da marca OiPet para uso em todas as plataformas
 */

export const OiPetColors = {
  // Cores Primárias Oficiais
  primary: {
    coral: '#E85A5A',        // Coral principal
    teal: '#5AA3A3',         // Teal principal
    coralLight: '#F2807F',   // Coral claro
    coralDark: '#D63F3F',    // Coral escuro
    tealLight: '#7AB8B8',    // Teal claro
    tealDark: '#458E8E',     // Teal escuro
  },

  // Cores Secundárias
  secondary: {
    orange: '#FF8C42',       // Laranja complementar
    green: '#4CAF50',        // Verde saúde
    yellow: '#FFC107',       // Amarelo alerta
    purple: '#9C27B0',       // Roxo premium
  },

  // Cores Neutras
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },

  // Cores de Estado
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Cores para Glass Effects
  glass: {
    // Cores base com transparência
    coralGlass: 'rgba(232, 90, 90, 0.8)',
    coralGlassLight: 'rgba(232, 90, 90, 0.5)',
    coralGlassDark: 'rgba(232, 90, 90, 0.9)',
    
    tealGlass: 'rgba(90, 163, 163, 0.8)',
    tealGlassLight: 'rgba(90, 163, 163, 0.5)',
    tealGlassDark: 'rgba(90, 163, 163, 0.9)',
    
    // Glass containers
    widget: 'rgba(255, 255, 255, 0.1)',
    sidebar: 'rgba(255, 255, 255, 0.05)',
    dock: 'rgba(255, 255, 255, 0.08)',
    notification: 'rgba(255, 255, 255, 0.12)',
    modal: 'rgba(255, 255, 255, 0.15)',
    
    // Glass borders
    border: 'rgba(255, 255, 255, 0.18)',
    borderLight: 'rgba(255, 255, 255, 0.12)',
    borderDark: 'rgba(255, 255, 255, 0.25)',
  },

  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #E85A5A 0%, #5AA3A3 100%)',
    coral: 'linear-gradient(135deg, #F2807F 0%, #E85A5A 50%, #D63F3F 100%)',
    teal: 'linear-gradient(135deg, #7AB8B8 0%, #5AA3A3 50%, #458E8E 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // Cores por contexto
  context: {
    // Backgrounds
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#EEEEEE',
    },
    
    // Textos
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    
    // Componentes
    component: {
      card: '#FFFFFF',
      cardBorder: '#E0E0E0',
      button: '#E85A5A',
      buttonText: '#FFFFFF',
      input: '#F5F5F5',
      inputBorder: '#E0E0E0',
    }
  }
};

// Configurações de Glass Effects
export const GlassConfig = {
  blur: '21.8px',
  translucency: '50%',
  darkOverlay: '42%',
  shadowOpacity: '50%',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  
  // Variações de intensidade
  intensity: {
    light: {
      background: 'rgba(255, 255, 255, 0.05)',
      blur: '15px',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.1)',
      blur: '20px',
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.15)',
      blur: '25px',
    }
  }
};

// Utilitários para cores
export const colorUtils = {
  // Converter hex para rgba
  hexToRgba: (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Aplicar transparência a uma cor
  withAlpha: (color, alpha) => {
    if (color.startsWith('#')) {
      return colorUtils.hexToRgba(color, alpha);
    }
    return color.replace(/rgba?\([^)]*\)/, match => {
      const values = match.match(/\d+/g);
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
    });
  },

  // Obter cor de glass baseada na cor principal
  getGlassColor: (baseColor, alpha = 0.8) => {
    return colorUtils.withAlpha(baseColor, alpha);
  }
};

// Temas pré-definidos
export const themes = {
  light: {
    primary: OiPetColors.primary.coral,
    secondary: OiPetColors.primary.teal,
    background: OiPetColors.context.background.primary,
    surface: OiPetColors.neutral.white,
    text: OiPetColors.context.text.primary,
    glass: OiPetColors.glass.widget,
  },
  
  dark: {
    primary: OiPetColors.primary.coralLight,
    secondary: OiPetColors.primary.tealLight,
    background: OiPetColors.neutral.gray900,
    surface: OiPetColors.neutral.gray800,
    text: OiPetColors.neutral.white,
    glass: 'rgba(0, 0, 0, 0.3)',
  }
};

export default OiPetColors;