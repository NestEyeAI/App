import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Set false when the screen owns its own ScrollView padding. */
  padded?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
}

/** Standard screen container with safe-area + background. */
export function Screen({ children, padded = false, edges = ['top'], style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
});
