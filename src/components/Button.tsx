import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.disabled : colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.disabled : colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.disabled : colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: disabled ? colors.disabled : colors.primary,
          borderWidth: 0,
        };
    }
  };

  // Determine text styles based on variant
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          color: colors.background,
        };
      case 'outline':
      case 'text':
        return {
          color: disabled ? colors.disabled : colors.primary,
        };
      default:
        return {
          color: colors.background,
        };
    }
  };

  // Determine button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.m,
        };
      case 'medium':
        return {
          paddingVertical: spacing.s,
          paddingHorizontal: spacing.l,
        };
      case 'large':
        return {
          paddingVertical: spacing.m,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          paddingVertical: spacing.s,
          paddingHorizontal: spacing.l,
        };
    }
  };

  // Determine text size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: typography.fontSizes.small,
        };
      case 'medium':
        return {
          fontSize: typography.fontSizes.medium,
        };
      case 'large':
        return {
          fontSize: typography.fontSizes.large,
        };
      default:
        return {
          fontSize: typography.fontSizes.medium,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyles(),
        getButtonSize(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.background} 
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'small' ? 16 : size === 'medium' ? 18 : 20}
              color={getTextStyles().color}
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.text, 
            getTextStyles(), 
            getTextSize(),
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.medium,
  },
  text: {
    fontWeight: typography.fontWeights.medium as any,
    textAlign: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Button;
