import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';
import { PrimaryButton, Screen } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const signIn = useAuthStore((s) => s.signIn);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState('farmer@willowcreek.ag');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      // error surfaced via store
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
          <View style={styles.brand}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>AI + Hardware for Smarter Poultry Health</Text>
          </View>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to monitor your barns.</Text>

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
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Sign In" onPress={onSubmit} loading={loading} style={styles.cta} />

          <View style={styles.links}>
            <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
              Forgot password?
            </Text>
            <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
              Create account
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xxl },
    brand: { alignItems: 'center', marginBottom: spacing.xxl },
    logoImg: { width: 200, height: 64 },
    tagline: { ...t.typography.caption, marginTop: spacing.xs },
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
    error: { ...t.typography.caption, color: t.colors.danger, marginBottom: spacing.md },
    cta: { marginTop: spacing.sm },
    links: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
    },
    link: { ...t.typography.label, color: t.colors.accent },
  });
