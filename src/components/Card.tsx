import React from 'react';
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { radius, spacing } from '@/theme';
import { Theme, useThemedStyles } from '@/theme/ThemeContext';

interface CardProps extends ViewProps {
  onPress?: () => void;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ children, onPress, padded = true, style, ...rest }: CardProps) {
  const styles = useThemedStyles(makeStyles);
  const content = (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      ...t.shadow.card,
    },
    padded: {
      padding: spacing.lg,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    },
  });
