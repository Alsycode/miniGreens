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
import { maskDobInput, parseDobInput } from '../../utils/date';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const signUp = useAuthStore((s) => s.signUp);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    let dobIso: string | null = null;
    if (dob.trim()) {
      dobIso = parseDobInput(dob);
      if (!dobIso) {
        setError('Enter your date of birth as DD/MM/YYYY.');
        return;
      }
    }
    setError(null);
    setLoading(true);
    const { error: signUpError, needsConfirmation } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      dobIso,
    );
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsConfirmation) {
      setConfirmationSent(true);
      return;
    }
    router.replace('/(tabs)');
  };

  if (confirmationSent) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Typography variant="h3" color={colors.text} style={styles.title}>
          Check your email
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.confirmText}>
          We sent a confirmation link to {email.trim()}. Confirm your email, then log in.
        </Typography>
        <Button title="Back to Log In" onPress={() => router.replace('/auth/login')} fullWidth size="lg" style={styles.submit} />
      </View>
    );
  }

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
            Create your account
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Join MiniGreens for fresh, healthy deliveries
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).springify().damping(31)} style={styles.form}>
          <TextField
            label="Full Name"
            leftIcon="person-outline"
            placeholder="Jane Doe"
            value={fullName}
            onChangeText={setFullName}
          />
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
            label="Date of Birth (optional)"
            leftIcon="calendar-outline"
            placeholder="DD/MM/YYYY"
            keyboardType="number-pad"
            maxLength={10}
            value={dob}
            onChangeText={(t) => setDob(maskDobInput(t))}
          />
          <TextField
            label="Password"
            leftIcon="lock-closed-outline"
            placeholder="At least 6 characters"
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            label="Confirm Password"
            leftIcon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {error && (
            <Typography variant="bodySmall" color={colors.error} style={styles.error}>
              {error}
            </Typography>
          )}
          <Button title="Create Account" onPress={handleRegister} loading={loading} fullWidth size="lg" style={styles.submit} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify().damping(31)} style={styles.footer}>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            Already have an account?
          </Typography>
          <Button
            title="Log In"
            variant="ghost"
            onPress={() => router.push('/auth/login')}
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing['2xl'],
  },
  confirmText: {
    textAlign: 'center',
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
