import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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

type Stage = 'email' | 'code' | 'details';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const sendCode = useAuthStore((s) => s.sendCode);
  const verifyCode = useAuthStore((s) => s.verifyCode);
  const completeProfile = useAuthStore((s) => s.completeProfile);

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: sendError } = await sendCode(email.trim());
    setLoading(false);
    if (sendError) {
      setError(sendError);
      return;
    }
    setCode('');
    setStage('code');
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Enter the code from your email.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: verifyError, needsProfile } = await verifyCode(email.trim(), code.trim());
    setLoading(false);
    if (verifyError) {
      setError(verifyError);
      return;
    }
    if (needsProfile) {
      setStage('details');
      return;
    }
    router.replace('/(tabs)');
  };

  const handleDetails = async () => {
    if (!fullName.trim()) {
      setError('Enter your name.');
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
    const { error: profileError } = await completeProfile(fullName.trim(), dobIso);
    setLoading(false);
    if (profileError) {
      setError(profileError);
      return;
    }
    router.replace('/(tabs)');
  };

  const heading =
    stage === 'email' ? 'Log in or sign up' : stage === 'code' ? 'Enter your code' : 'Almost there';
  const subheading =
    stage === 'email'
      ? "We'll email you an 8-digit code. No password needed."
      : stage === 'code'
        ? `We sent an 8-digit code to ${email.trim()}.`
        : 'Tell us a bit about you to finish setting up.';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing['3xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31).mass(1).stiffness(100)}>
          <Logo width={128} style={styles.logo} />
          <Typography variant="h2" color={colors.text} style={styles.title}>
            {heading}
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            {subheading}
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).springify().damping(31).mass(1).stiffness(100)} style={styles.form}>
          {stage === 'email' && (
            <TextField
              label="Email"
              leftIcon="mail-outline"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          )}
          {stage === 'code' && (
            <TextField
              label="Code"
              leftIcon="keypad-outline"
              placeholder="12345678"
              keyboardType="number-pad"
              maxLength={10}
              value={code}
              onChangeText={setCode}
            />
          )}
          {stage === 'details' && (
            <>
              <TextField
                label="Full Name"
                leftIcon="person-outline"
                placeholder="Jane Doe"
                value={fullName}
                onChangeText={setFullName}
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
            </>
          )}
          {error && (
            <Typography variant="bodySmall" color={colors.error} style={styles.error}>
              {error}
            </Typography>
          )}
          <Button
            title={stage === 'email' ? 'Send Code' : stage === 'code' ? 'Verify & Continue' : 'Continue'}
            onPress={stage === 'email' ? handleSendCode : stage === 'code' ? handleVerify : handleDetails}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.submit}
          />
        </Animated.View>

        {stage === 'code' && (
          <Animated.View entering={FadeInUp.delay(200).springify().damping(31).mass(1).stiffness(100)} style={styles.footer}>
            <Button
              title="Use a different email"
              variant="ghost"
              onPress={() => {
                setError(null);
                setStage('email');
              }}
            />
          </Animated.View>
        )}
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
