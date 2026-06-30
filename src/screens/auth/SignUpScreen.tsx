import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '@/theme';
import { PrimaryButton, Screen } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch {
      // surfaced via store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.sub}>Start monitoring your flock in minutes.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Jordan Miller"
              placeholderTextColor={colors.textMuted}
            />
          </View>
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
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Create a password"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            title="Create Account"
            onPress={onSubmit}
            loading={loading}
            style={styles.cta}
          />

          <Text style={styles.link} onPress={() => navigation.goBack()}>
            Already have an account? Sign in
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xxl },
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
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
  cta: { marginTop: spacing.sm },
  link: { ...typography.label, color: colors.accent, textAlign: 'center', marginTop: spacing.xl },
});
