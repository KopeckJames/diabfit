import { DefaultTheme } from 'react-native-paper';

// Define the app's color palette
export const colors = {
  primary: '#4CAF50', // Green - represents health and vitality
  secondary: '#2196F3', // Blue - represents trust and reliability
  accent: '#FF9800', // Orange - represents energy and enthusiasm
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#B00020',
  text: '#212121',
  disabled: '#9E9E9E',
  placeholder: '#757575',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF9800',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
};

// Define the app's typography
export const typography = {
  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 20,
    xxxlarge: 24,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

// Define the app's spacing
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Define the app's border radius
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 9999,
};

// Define the app's shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Create a theme for react-native-paper
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.backdrop,
    notification: colors.notification,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  theme,
};
