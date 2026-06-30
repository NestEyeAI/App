import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.forest} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 1.5 },
  text: { ...typography.bodySecondary, marginTop: spacing.sm },
});
