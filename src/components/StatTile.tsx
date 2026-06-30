import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { radius, spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatTile({ label, value, unit, icon, tone = 'default' }: StatTileProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toneColor: Record<string, string> = {
    default: colors.forest,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };
  const accent = toneColor[tone];
  return (
    <View style={styles.tile}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: `${accent}1A` }]}>
          <Feather name={icon} size={16} color={accent} />
        </View>
      )}
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    tile: {
      flex: 1,
      backgroundColor: t.colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: spacing.md,
      minHeight: 96,
      justifyContent: 'space-between',
    },
    iconWrap: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    value: { ...t.typography.statMd, fontSize: 22 },
    unit: { ...t.typography.caption, fontWeight: '600' },
    label: { ...t.typography.caption, marginTop: 2 },
  });
