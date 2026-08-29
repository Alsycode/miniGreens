import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { Typography } from '../components/ui/Typography';
import { Loading } from '../components/ui/Loading';
import { ErrorNotice } from '../components/ui/ErrorNotice';
import { EmptyState } from '../components/ui/EmptyState';
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
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">My Offers</Typography>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <Loading fullScreen message="Loading offers" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <ErrorNotice
            message={isError ? 'Could not load offers. Pull to retry.' : null}
            title="Offers unavailable"
            onDismiss={() => refetch()}
          />

          <Typography variant="caption" color={colors.textTertiary} style={styles.intro}>
            Tap a code to copy it, then paste it at checkout.
          </Typography>

          {!isError && visible.length === 0 && (
            <EmptyState
              icon="pricetags-outline"
              title="No offers right now"
              message="Check back soon — new coupons and seasonal deals show up here."
            />
          )}

          {visible.map((d) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.valuePill}>
                  <Typography variant="caption" weight="bold" color={colors.primary}>
                    {valueLabel(d)}
                  </Typography>
                </View>
                {d.is_birthday_offer && (
                  <View style={styles.birthdayPill}>
                    <Ionicons name="gift-outline" size={12} color={colors.secondary} />
                    <Typography variant="caption" weight="bold" color={colors.secondary} style={{ marginLeft: 4 }}>
                      BIRTHDAY
                    </Typography>
                  </View>
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

              <Pressable style={styles.codeRow} onPress={() => copyCode(d.code as string)}>
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
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  intro: { marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valuePill: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  birthdayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,19,13,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(202,239,97,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
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
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  codeText: { letterSpacing: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
});
