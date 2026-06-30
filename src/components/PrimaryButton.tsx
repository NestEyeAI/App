import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { radius } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';

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
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isDisabled = disabled || loading;

  const variantStyle: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.forest },
    secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
    danger: { backgroundColor: colors.danger },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle[variant],
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
      {loading && <View style={{ width: 0 }} />}
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 20,
    },
    label: { ...t.typography.h3, color: t.colors.textInverse },
    labelSecondary: { color: t.colors.forest },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.88 },
  });
