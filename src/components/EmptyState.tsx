import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'inbox', title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 1.5 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h3, color: colors.textSecondary },
  message: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 260,
  },
});
