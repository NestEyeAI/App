import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  overline?: string;
}

export function SectionHeader({ title, actionLabel, onAction, overline }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        {overline ? <Text style={styles.overline}>{overline}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  overline: { ...typography.overline, marginBottom: 2 },
  title: { ...typography.h2 },
  action: { ...typography.label, color: colors.accent },
});
