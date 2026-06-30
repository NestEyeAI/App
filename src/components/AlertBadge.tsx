import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { AlertSeverity } from '@/types';

interface AlertBadgeProps {
  icon: keyof typeof Feather.glyphMap;
  severity: AlertSeverity;
  size?: number;
}

export function AlertBadge({ icon, severity, size = 40 }: AlertBadgeProps) {
  const { colors } = useTheme();
  const severityColor: Record<AlertSeverity, { fg: string; bg: string }> = {
    danger: { fg: colors.danger, bg: colors.dangerBg },
    warning: { fg: colors.warning, bg: colors.warningBg },
    info: { fg: colors.info, bg: colors.infoBg },
  };
  const c = severityColor[severity];
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 3, backgroundColor: c.bg },
      ]}
    >
      <Feather name={icon} size={size * 0.45} color={c.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
