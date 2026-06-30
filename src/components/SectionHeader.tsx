import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '@/theme';
import { Theme, useThemedStyles } from '@/theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  overline?: string;
}

export function SectionHeader({ title, actionLabel, onAction, overline }: SectionHeaderProps) {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: spacing.md,
    },
    overline: { ...t.typography.overline, marginBottom: 2 },
    title: { ...t.typography.h2 },
    action: { ...t.typography.label, color: t.colors.accent },
  });
