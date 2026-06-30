import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '@/theme';
import { AlertSeverity } from '@/types';

const STYLE_MAP: Record<AlertSeverity, { bg: string; fg: string; label: string }> = {
  danger: { bg: colors.dangerBg, fg: colors.danger, label: 'Critical' },
  warning: { bg: colors.warningBg, fg: colors.warning, label: 'Warning' },
  info: { bg: colors.infoBg, fg: colors.info, label: 'Info' },
};

export function SeverityPill({ severity, label }: { severity: AlertSeverity; label?: string }) {
  const s = STYLE_MAP[severity];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{label ?? s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.overline, letterSpacing: 0.6 },
});
