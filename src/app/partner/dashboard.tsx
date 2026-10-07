import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/layout/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

// App accent green, aliased locally for the tinted rgba() helpers below.
const GREEN = colors.accent;

const verifiedBadge = require('../../assets/tick.jpeg');

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual Partner',
  women: 'Women Partner',
  cafe: 'Café',
  restaurant: 'Restaurant',
  shop: 'Shop',
  fitness_wellness: 'Fitness/Wellness Partner',
  community: 'Community Partner',
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  approved: GREEN,
  rejected: colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Application under review',
  approved: 'Approved Partner',
  rejected: 'Application rejected',
};

// ── small building blocks ────────────────────────────────────────────────────

function IconChip({
  name,
  size = 18,
  color = GREEN,
  style,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: object;
}) {
  return (
    <View style={[styles.chip, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <IconChip name={icon} size={15} style={styles.statChip} />
      <Typography
        variant="h4"
        color={GREEN}
        weight="bold"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.statValue}
      >
        {value}
      </Typography>
      <Typography variant="bodySmall" color={colors.text} weight="semibold">
        {label}
      </Typography>
    </View>
  );
}

// ── screen ───────────────────────────────────────────────────────────────────

export default function PartnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);

  const [partner, setPartner] = useState<PartnerRow | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data: partnerData } = await supabase
      .from('partners')
      .select('*')
      .eq('profile_id', session.user.id)
      .maybeSingle();
    setPartner(partnerData ?? null);

    if (partnerData?.status === 'approved') {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('order_type', 'business')
        .order('created_at', { ascending: false });
      setOrders(orderData ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (!session) {
    return (
      <Screen title="Partner Dashboard" scroll={false}>
        <EmptyState
          icon="briefcase-outline"
          title="Log in to see your partner dashboard"
          message="Your business orders and status show up here."
          actionLabel="Log In"
          onAction={() => router.push('/auth/login')}
        />
      </Screen>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!partner) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Typography variant="h3" color={colors.text} style={styles.emptyTitle}>
          Not a partner yet
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.emptySubtitle}>
          Apply to become an MGC Partner to sell products and take orders.
        </Typography>
        <Button title="Apply Now" onPress={() => router.push('/partner/apply')} size="lg" />
      </View>
    );
  }

  const totalOrdered = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31).mass(1).stiffness(100)} style={styles.header}>
          <View style={styles.headerText}>
            <Typography variant="h2" color={colors.textInverse} style={styles.title}>
              {partner.business_name}
            </Typography>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[partner.status] }]} />
              <Typography variant="bodySmall" color={colors.text} weight="semibold">
                {STATUS_LABELS[partner.status]}
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textTertiary}>
              {BUSINESS_TYPE_LABELS[partner.business_type]}
            </Typography>
          </View>
          <Image source={verifiedBadge} style={styles.shield} resizeMode="cover" />
        </Animated.View>

        {partner.status === 'approved' && (
          <>
            <Animated.View entering={FadeInUp.delay(120).springify().damping(31).mass(1).stiffness(100)} style={styles.statsRow}>
              <StatCard icon="trending-up-outline" value={`₹${totalOrdered.toFixed(0)}`} label="Total Ordered" />
              <StatCard icon="bag-handle-outline" value={`${orders.length}`} label="Orders" />
            </Animated.View>

            {/* Bulk/business ordering disabled for now — re-enable by restoring the
                "Place Business Order" CTA (router.push('/partner/business-order')). */}

            <Animated.View entering={FadeInUp.delay(240).springify().damping(31).mass(1).stiffness(100)}>
              <Typography variant="h4" color={colors.textInverse} style={styles.sectionTitle}>
                Order History
              </Typography>
              {orders.length === 0 ? (
                <Typography variant="bodySmall" color={colors.textSecondary}>
                  No business orders yet.
                </Typography>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} variant="outlined" padding="md" style={styles.orderCard}>
                    <View style={styles.orderRow}>
                      <Typography variant="bodySmall" weight="semibold" color={colors.textInverse}>
                        {order.order_number}
                      </Typography>
                      <Typography variant="bodySmall" color={GREEN} weight="bold">
                        ₹{Number(order.total).toFixed(2)}
                      </Typography>
                    </View>
                    <Typography variant="caption" color={colors.textSecondary}>
                      {order.status} · {order.delivery_date ?? 'No date set'}
                    </Typography>
                  </Card>
                ))
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scrollContent: {
    padding: spacing['2xl'],
    paddingBottom: spacing['6xl'],
  },
  // ── header ──
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  shield: {
    width: 82,
    height: 64,
    marginTop: 2,
    marginRight: -spacing.xs,
    borderRadius: borderRadius.md,
  },
  // ── stat cards ──
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statChip: {
    marginBottom: spacing.sm,
  },
  statValue: {
    marginBottom: 2,
  },
  // ── shared chip ──
  chip: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(150,255,31,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── primary CTA ──
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  ctaIconRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(6,19,13,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaLabel: {
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  // ── order history ──
  sectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  orderCard: {
    marginBottom: spacing.sm,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
});
