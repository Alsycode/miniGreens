import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontFamily } from '../../theme';
import { Typography } from '../../components/ui/Typography';

const verifiedBadge = require('../../assets/tick.jpeg');

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  {
    icon: 'document-text-outline',
    title: 'Application Review',
    desc: "We'll review your details and verify your information.",
  },
  {
    icon: 'mail-outline',
    title: 'Email Confirmation',
    desc: "You'll receive an email once your application is approved.",
  },
  {
    icon: 'storefront-outline',
    title: 'Get Started',
    desc: 'Once approved, you can start listing products and receive orders.',
  },
];

export default function PartnerSubmittedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 96 },
        ]}
      >
        <Image source={verifiedBadge} style={styles.badge} resizeMode="cover" />

        <Typography
          variant="h1"
          align="center"
          color={colors.textInverse}
          style={styles.headline}
        >
          Application
        </Typography>
        <Typography variant="h1" align="center" color={colors.accent} style={styles.headlineAccent}>
          Submitted!
        </Typography>

        <Typography variant="body" align="center" color={colors.textSecondary} style={styles.lede}>
          Thank you for your interest in partnering with MGC. We&rsquo;ve received your application and
          our team is reviewing it.
        </Typography>

        <View style={styles.card}>
          <Typography variant="h4" color={colors.textInverse} style={styles.cardTitle}>
            What happens next?
          </Typography>

          {STEPS.map((step, i) => (
            <View key={step.title} style={[styles.step, i > 0 && styles.stepDivider]}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={20} color={colors.accent} />
              </View>
              <View style={styles.stepBody}>
                <Typography
                  variant="body"
                  weight="bold"
                  color={colors.textInverse}
                  style={styles.stepTitle}
                >
                  {step.title}
                </Typography>
                <Typography variant="bodySmall" color={colors.textSecondary}>
                  {step.desc}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.help}>
          <View style={styles.helpIcon}>
            <Ionicons name="headset-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.helpBody}>
            <Typography variant="bodySmall" weight="bold" color={colors.textInverse}>
              Need help?
            </Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              Our support team is here for you.
            </Typography>
          </View>
          <Pressable
            style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
            onPress={() => router.push('/profile/contact')}
            hitSlop={8}
          >
            <Typography variant="caption" weight="bold" color={colors.accent}>
              Contact Support
            </Typography>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Typography variant="body" weight="bold" color={colors.textInverse}>
            Back to Home
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
  },
  // ── check badge (asset art sits on pure black, matching the screen) ──
  badge: {
    width: 184,
    height: 124,
    marginBottom: spacing.sm,
  },
  // ── headline ──
  headline: {
    fontFamily: fontFamily.display,
  },
  headlineAccent: {
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  lede: {
    lineHeight: 23,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  // ── what happens next ──
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  stepDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(150,255,31,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  stepBody: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepTitle: {
    marginBottom: 3,
  },
  // ── need help ──
  help: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150,255,31,0.05)',
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150,255,31,0.22)',
    padding: spacing.lg,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(150,255,31,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  helpBody: {
    flex: 1,
  },
  helpButton: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  // ── footer ──
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    backgroundColor: '#000000',
  },
  homeButton: {
    minHeight: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.green[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
