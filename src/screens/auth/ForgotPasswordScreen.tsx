import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';
import { PrimaryButton, Screen } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const requestReset = useAuthStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await requestReset(email.trim());
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded edges={['top', 'bottom']}>
      <View style={styles.wrap}>
        <Text style={styles.heading}>Reset password</Text>
        <Text style={styles.sub}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={styles.success}>
            <Text style={styles.successText}>
              If an account exists for {email}, a reset link is on its way.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@farm.com"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <PrimaryButton title="Send Reset Link" onPress={onSubmit} loading={loading} />
          </>
        )}

        <Text style={styles.link} onPress={() => navigation.goBack()}>
          Back to sign in
        </Text>
      </View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { flex: 1, justifyContent: 'center' },
    heading: { ...t.typography.h2 },
    sub: { ...t.typography.bodySecondary, marginBottom: spacing.xl },
    field: { marginBottom: spacing.lg },
    label: { ...t.typography.label, marginBottom: spacing.sm },
    input: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      height: 52,
      ...t.typography.body,
    },
    success: { backgroundColor: t.colors.successBg, borderRadius: 12, padding: spacing.lg },
    successText: { ...t.typography.body, color: t.colors.success },
    link: { ...t.typography.label, color: t.colors.accent, textAlign: 'center', marginTop: spacing.xl },
  });
