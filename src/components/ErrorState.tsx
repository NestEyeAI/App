import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';
import { PrimaryButton } from './PrimaryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this data. Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Feather name="alert-triangle" size={26} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <PrimaryButton title="Retry" variant="secondary" onPress={onRetry} style={styles.btn} />
      ) : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.dangerBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: { ...t.typography.h3 },
    message: {
      ...t.typography.bodySecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      maxWidth: 280,
    },
    btn: { marginTop: spacing.lg, minWidth: 160 },
  });
