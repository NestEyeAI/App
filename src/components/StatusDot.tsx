import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { BarnStatus, CameraStatus } from '@/types';

type DotState = BarnStatus | CameraStatus | 'success' | 'warning' | 'danger';

const COLOR_MAP: Record<DotState, string> = {
  healthy: colors.success,
  watch: colors.warning,
  alert: colors.danger,
  online: colors.success,
  offline: colors.danger,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export function StatusDot({ state, size = 10 }: { state: DotState; size?: number }) {
  const color = COLOR_MAP[state] ?? colors.textMuted;
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <View
        style={[
          styles.halo,
          { width: size * 2, height: size * 2, borderRadius: size, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', opacity: 0.18 },
});
