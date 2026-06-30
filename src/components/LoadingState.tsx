import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.forest} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 1.5 },
    text: { ...t.typography.bodySecondary, marginTop: spacing.sm },
  });
