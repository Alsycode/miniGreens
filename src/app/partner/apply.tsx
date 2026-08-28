import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { PartnerBusinessType } from '../../types/database';

const BUSINESS_TYPES: { value: PartnerBusinessType; label: string }[] = [
  { value: 'individual', label: 'Individual Partner' },
  { value: 'women', label: 'Women Partner' },
  { value: 'cafe', label: 'Café' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'shop', label: 'Shop' },
  { value: 'fitness_wellness', label: 'Fitness/Wellness Partner' },
  { value: 'community', label: 'Community Partner' },
];

export default function PartnerApplyScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);

  const [businessType, setBusinessType] = useState<PartnerBusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session) {
      setError('Log in first to apply as a partner.');
      return;
    }
    if (!businessType || !businessName.trim() || !contactPerson.trim() || !phone.trim()) {
      setError('Fill in all required fields.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: insertError } = await supabase.from('partners').insert({
      profile_id: session.user.id,
      business_type: businessType,
      business_name: businessName.trim(),
      contact_person: contactPerson.trim(),
      phone: phone.trim(),
      address: address.trim() || null,
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.replace('/partner/dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31)}>
          <Typography variant="h2" color={colors.text} style={styles.title}>
            Become an MGC Partner
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Sell MGC products, take orders, and grow your own business through the app.
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).springify().damping(31)}>
          <Typography variant="bodySmall" color={colors.textSecondary} weight="medium" style={styles.sectionLabel}>
            Business Type
          </Typography>
          <View style={styles.chipRow}>
            {BUSINESS_TYPES.map((type) => (
              <Chip
                key={type.value}
                label={type.label}
                selected={businessType === type.value}
                onPress={() => setBusinessType(type.value)}
              />
            ))}
          </View>
          {businessType === 'women' && (
            <Typography variant="caption" color={colors.primary} style={styles.womenNote}>
              Women Partners get 0% platform fee.
            </Typography>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(180).springify().damping(31)} style={styles.form}>
          <TextField
            label="Business / Café / Shop Name"
            leftIcon="storefront-outline"
            placeholder="e.g. Green Leaf Café"
            value={businessName}
            onChangeText={setBusinessName}
          />
          <TextField
            label="Contact Person"
            leftIcon="person-outline"
            placeholder="Your name"
            value={contactPerson}
            onChangeText={setContactPerson}
          />
          <TextField
            label="Phone"
            leftIcon="call-outline"
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextField
            label="Address (optional)"
            leftIcon="location-outline"
            placeholder="Business address"
            value={address}
            onChangeText={setAddress}
          />
          {error && (
            <Typography variant="bodySmall" color={colors.error} style={styles.error}>
              {error}
            </Typography>
          )}
          <Button title="Submit Application" onPress={handleSubmit} loading={loading} fullWidth size="lg" style={styles.submit} />
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
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  womenNote: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  form: {
    marginTop: spacing.lg,
  },
  error: {
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
