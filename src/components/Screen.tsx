import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  /** Set false when the screen owns its own ScrollView padding. */
  padded?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
}

/** Standard screen container with safe-area + themed background. */
export function Screen({ children, padded = false, edges = ['top'], style }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={edges}>
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
});
