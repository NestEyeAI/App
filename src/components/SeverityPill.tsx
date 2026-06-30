import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';
import { AlertSeverity } from '@/types';

export function SeverityPill({ severity, label }: { severity: AlertSeverity; label?: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const styleMap: Record<AlertSeverity, { bg: string; fg: string; label: string }> = {
    danger: { bg: colors.dangerBg, fg: colors.danger, label: 'Critical' },
    warning: { bg: colors.warningBg, fg: colors.warning, label: 'Warning' },
    info: { bg: colors.infoBg, fg: colors.info, label: 'Info' },
  };
  const s = styleMap[severity];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{label ?? s.label}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    text: { ...t.typography.overline, letterSpacing: 0.6 },
  });
