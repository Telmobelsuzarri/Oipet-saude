/**
 * OiPet Saúde - Liquid Glass Design System
 * Tema e constantes de design inspiradas no ecosystem Apple
 */

export const GLASS_CONFIG = {
  // Configurações glass precisas baseadas no design system
  blur: 21.8,
  translucency: 0.5,
  darkOverlay: 0.42,
  shadowOpacity: 0.5,
  borderRadius: 16,
  border: 'rgba(255, 255, 255, 0.18)',
} as const;

export const COLORS = {
  // Cores principais OiPet
  primary: {
    coral: '#E85A5A',
    teal: '#5AA3A3',
  },
  
  // Cores glass para diferentes contextos
  glass: {
    // Cores primárias com efeito glass
    coralPrimary: 'rgba(232, 90, 90, 0.8)',
    coralSecondary: 'rgba(232, 90, 90, 0.5)',
    tealPrimary: 'rgba(90, 163, 163, 0.8)',
    tealSecondary: 'rgba(90, 163, 163, 0.5)',
    
    // Variações de contexto
    widget: 'rgba(255, 255, 255, 0.1)',
    sidebar: 'rgba(255, 255, 255, 0.05)',
    dock: 'rgba(255, 255, 255, 0.08)',
    notification: 'rgba(255, 255, 255, 0.12)',
    modal: 'rgba(255, 255, 255, 0.15)',
    
    // Glass escuro
    darkWidget: 'rgba(0, 0, 0, 0.1)',
    darkSidebar: 'rgba(0, 0, 0, 0.05)',
    darkDock: 'rgba(0, 0, 0, 0.08)',
  },
  
  // Sistema de cores
  system: {
    background: '#FFFFFF',
    backgroundDark: '#000000',
    surface: '#F8F9FA',
    surfaceDark: '#1C1C1E',
    
    // Estados
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    // Textos
    text: {
      primary: '#000000',
      secondary: '#6C6C70',
      tertiary: '#AEAEB2',
      inverse: '#FFFFFF',
    },
    
    // Bordas
    border: {
      light: 'rgba(255, 255, 255, 0.18)',
      medium: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(0, 0, 0, 0.2)',
    },
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const SHADOWS = {
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const GLASS_STYLES = {
  // Widget glass (como widgets de clima)
  widget: {
    backgroundColor: COLORS.glass.widget,
    borderRadius: GLASS_CONFIG.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
    ...SHADOWS.glass,
  },
  
  // Dock navigation (como dock do macOS)
  dock: {
    backgroundColor: COLORS.glass.dock,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
    ...SHADOWS.glass,
  },
  
  // Sidebar (como painéis laterais)
  sidebar: {
    backgroundColor: COLORS.glass.sidebar,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  
  // Notifications
  notification: {
    backgroundColor: COLORS.glass.notification,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
    ...SHADOWS.card,
  },
  
  // Modal/Overlay
  modal: {
    backgroundColor: COLORS.glass.modal,
    borderRadius: GLASS_CONFIG.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
    ...SHADOWS.glass,
  },
} as const;

export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Breakpoints para responsividade
export const BREAKPOINTS = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Configuração de status dos pets
export const PET_STATUS = {
  health: {
    excellent: { color: COLORS.system.success, label: 'Excelente' },
    good: { color: COLORS.primary.teal, label: 'Bom' },
    fair: { color: COLORS.system.warning, label: 'Regular' },
    poor: { color: COLORS.system.error, label: 'Preocupante' },
  },
  
  activity: {
    high: { color: COLORS.system.success, label: 'Alto' },
    medium: { color: COLORS.system.warning, label: 'Médio' },
    low: { color: COLORS.system.error, label: 'Baixo' },
  },
} as const;