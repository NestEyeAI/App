import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, typography } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.forest : colors.textInverse} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>
          {title}
        </Text>
      )}
      {/* keep layout height stable */}
      {loading && <View style={{ width: 0 }} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  label: { ...typography.h3, color: colors.textInverse },
  labelSecondary: { color: colors.forest },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88 },
});

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  danger: { backgroundColor: colors.danger },
};
