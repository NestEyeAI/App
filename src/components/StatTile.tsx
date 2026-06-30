import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONE_COLOR: Record<string, string> = {
  default: colors.forest,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export function StatTile({ label, value, unit, icon, tone = 'default' }: StatTileProps) {
  const accent = TONE_COLOR[tone];
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

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  value: { ...typography.statMd, fontSize: 22 },
  unit: { ...typography.caption, fontWeight: '600' },
  label: { ...typography.caption, marginTop: 2 },
});
