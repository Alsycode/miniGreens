import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { Typography } from '../components/ui/Typography';
import { ErrorNotice } from '../components/ui/ErrorNotice';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { PressableScale } from '../components/ui/PressableScale';
import { StatusPill } from '../components/ui/StatusPill';
import { Screen } from '../components/layout/Screen';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Database } from '../types/database';

type Discount = Database['public']['Tables']['discounts']['Row'];

function valueLabel(d: Discount) {
  const v = Number(d.value);
  return d.discount_type === 'percentage' ? `${v % 1 === 0 ? v : v.toFixed(1)}% OFF` : `₹${v.toFixed(0)} OFF`;
}

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OffersScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: discounts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Discount[];
    },
  });

  const now = Date.now();
  const currentMonth = new Date().getMonth();
  const birthMonth = profile?.date_of_birth ? Number(profile.date_of_birth.slice(5, 7)) - 1 : null;

  const visible = discounts.filter((d) => {
    if (!d.code) return false;
    if (d.starts_at && new Date(d.starts_at).getTime() > now) return false;
    if (d.expires_at && new Date(d.expires_at).getTime() < now) return false;
    if (d.usage_limit != null && d.used_count >= d.usage_limit) return false;
    if (d.is_birthday_offer) return birthMonth !== null && birthMonth === currentMonth;
    return true;
  });

  async function copyCode(code: string) {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(code);
    setTimeout(() => setCopied((c) => (c === code ? null : c)), 1800);
  }

  return (
    <Screen title="My Offers">
      <Typography variant="bodySmall" color={colors.textSecondary} style={styles.intro}>
        Tap a code to copy it, then paste it at checkout.
      </Typography>

      <ErrorNotice
        message={isError ? 'Could not load offers. Tap to retry.' : null}
        title="Offers unavailable"
        onDismiss={() => refetch()}
      />

      {isLoading ? (
        <>
          {[0, 1].map((i) => (
            <View key={i} style={styles.card}>
              <Skeleton width={84} height={24} borderRadiusVal={borderRadius.pill} />
              <Skeleton width="70%" height={13} style={{ marginTop: spacing.md }} />
              <Skeleton width="100%" height={44} borderRadiusVal={borderRadius.md} style={{ marginTop: spacing.lg }} />
            </View>
          ))}
        </>
      ) : (
        <>
          {!isError && visible.length === 0 && (
            <EmptyState
              icon="pricetags-outline"
              title="No offers right now"
              message="Check back soon. New coupons and seasonal deals show up here."
            />
          )}

          {visible.map((d, i) => (
            <Animated.View
              key={d.id}
              entering={FadeInUp.delay(i * 70).springify().damping(31).mass(1).stiffness(100)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={styles.valuePill}>
                  <Typography variant="caption" weight="bold" color={colors.primaryDark}>
                    {valueLabel(d)}
                  </Typography>
                </View>
                {d.is_birthday_offer && (
                  <StatusPill label="Birthday" tone="brand" />
                )}
              </View>

              {d.description && (
                <Typography variant="bodySmall" color={colors.text} style={styles.cardDesc}>
                  {d.description}
                </Typography>
              )}

              <View style={styles.metaRow}>
                {d.min_order_value != null && (
                  <Typography variant="caption" color={colors.textSecondary}>
                    Min. order ₹{Number(d.min_order_value).toFixed(0)}
                  </Typography>
                )}
                {d.expires_at && (
                  <Typography variant="caption" color={colors.textTertiary}>
                    Expires {formatExpiry(d.expires_at)}
                  </Typography>
                )}
              </View>

              <PressableScale
                style={styles.codeRow}
                haptic={false}
                scaleTo={0.98}
                onPress={() => copyCode(d.code as string)}
                accessibilityLabel={`Copy code ${d.code}`}
              >
                <View style={styles.codeBox}>
                  <Typography variant="body" weight="bold" color={colors.text} style={styles.codeText}>
                    {d.code}
                  </Typography>
                </View>
                <View style={styles.copyBtn}>
                  <Ionicons
                    name={copied === d.code ? 'checkmark' : 'copy-outline'}
                    size={16}
                    color={colors.primary}
                  />
                  <Typography variant="caption" weight="semibold" color={colors.primary} style={{ marginLeft: 6 }}>
                    {copied === d.code ? 'Copied' : 'Tap to copy'}
                  </Typography>
                </View>
              </PressableScale>
            </Animated.View>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valuePill: {
    backgroundColor: colors.accentSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  cardDesc: { marginTop: spacing.md, lineHeight: 19 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  codeBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderAccent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  codeText: { letterSpacing: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
});
