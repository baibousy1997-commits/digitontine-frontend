// src/constants/theme.js
export const COLORS = {
  // Primary
  primary: '#667eea',
  primaryDark: '#5568d3',
  primaryLight: '#8b9aee',
  
  // Secondary
  secondary: '#764ba2',
  secondaryDark: '#5e3a82',
  secondaryLight: '#9b6bc7',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutrals
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  disabled: '#9ca3af',
  
  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body: 16,
  caption: 14,
  small: 12,
  
  // Border radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
  
  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ROLES = {
  ADMIN: 'Admin',
  TRESORIER: 'Tresorier',
  MEMBRE: 'Membre',
};

export const TRANSACTION_STATUS = {
  EN_ATTENTE: 'En attente',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée',
};

export const TONTINE_STATUS = {
  EN_ATTENTE: 'En attente',
  ACTIVE: 'Active',
  BLOQUEE: 'Bloquée',
  TERMINEE: 'Terminée',
};

export const PAYMENT_METHODS = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  CASH: 'Cash',
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  ROLES,
  TRANSACTION_STATUS,
  TONTINE_STATUS,
  PAYMENT_METHODS,
};