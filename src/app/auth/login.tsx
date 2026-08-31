import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/Logo';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing['3xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31)}>
          <Logo width={128} style={styles.logo} />
          <Typography variant="h2" color={colors.text} style={styles.title}>
            Welcome back
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Log in to continue to MiniGreens
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).springify().damping(31)} style={styles.form}>
          <TextField
            label="Email"
            leftIcon="mail-outline"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            leftIcon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          {error && (
            <Typography variant="bodySmall" color={colors.error} style={styles.error}>
              {error}
            </Typography>
          )}
          <Button title="Log In" onPress={handleLogin} loading={loading} fullWidth size="lg" style={styles.submit} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify().damping(31)} style={styles.footer}>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            Don't have an account?
          </Typography>
          <Button
            title="Sign Up"
            variant="ghost"
            onPress={() => router.push('/auth/register')}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing['2xl'],
  },
  form: {
    marginTop: spacing.md,
  },
  error: {
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
});
