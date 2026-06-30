import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '@/theme';
import { PrimaryButton, Screen } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
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

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  heading: { ...typography.h2 },
  sub: { ...typography.bodySecondary, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 52,
    ...typography.body,
  },
  success: { backgroundColor: colors.successBg, borderRadius: 12, padding: spacing.lg },
  successText: { ...typography.body, color: colors.success },
  link: { ...typography.label, color: colors.accent, textAlign: 'center', marginTop: spacing.xl },
});
