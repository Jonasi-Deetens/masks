export const colors = {
  // Primary palette - Deep mystical tones
  primary: '#8B5CF6',      // Violet
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  
  // Secondary palette - Warm accents
  secondary: '#F59E0B',    // Amber
  secondaryDark: '#D97706',
  secondaryLight: '#FBBF24',
  
  // Background colors
  background: '#0F0F1A',   // Deep navy/black
  backgroundLight: '#1A1A2E',
  backgroundCard: '#16213E',
  
  // Surface colors
  surface: '#1E1E30',
  surfaceLight: '#2A2A44',
  
  // Text colors
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Mask colors (for UI elements)
  maskJoy: '#FFD6E8',
  maskFear: '#CBB9FF',
  maskTrick: '#FFE9A8',
  maskAnger: '#FFB0B0',
  maskSad: '#B0D2FF',
  maskWisdom: '#E6FFD1',
  maskLove: '#FFC6DD',
  maskHatred: '#3E3E3E',
  maskEmpty: '#FFFFFF',
  
  // UI elements
  border: '#334155',
  borderLight: '#475569',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  title: 40,
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSizes,
  fonts,
  shadows,
};

