import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable, ActivityIndicator, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type PayoutRow = Database['public']['Tables']['payouts']['Row'];
type EarningsSummary = Database['public']['Functions']['partner_earnings_summary']['Returns'];

// App accent green, aliased locally for the tinted rgba() helpers below.
const GREEN = colors.accent;
const GREEN_RGB = '150,255,31';

const verifiedBadge = require('../../assets/tick.jpeg');

const PAYOUT_STATUS_COLORS: Record<PayoutRow['status'], string> = {
  pending: colors.warning,
  processing: colors.info,
  paid: colors.success,
  rejected: colors.error,
};

const PAYOUT_STATUS_LABELS: Record<PayoutRow['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Completed',
  rejected: 'Rejected',
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
      <Typography variant="caption" color={colors.textTertiary}>
        This Month
      </Typography>
    </View>
  );
}

function EarningsRow({
  icon,
  label,
  amount,
  amountColor = colors.text,
  chipChar,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: string;
  amountColor?: string;
  chipChar?: string;
}) {
  return (
    <View style={styles.earningsRow}>
      <View style={styles.chip}>
        {chipChar ? (
          <Typography variant="bodySmall" weight="bold" color={GREEN}>
            {chipChar}
          </Typography>
        ) : (
          <Ionicons name={icon ?? 'ellipse-outline'} size={16} color={GREEN} />
        )}
      </View>
      <Typography variant="bodySmall" color={colors.textSecondary} style={styles.earningsLabel}>
        {label}
      </Typography>
      <Typography variant="bodySmall" weight="bold" color={amountColor}>
        {amount}
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
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    const { data: partnerData } = await supabase
      .from('partners')
      .select('*')
      .eq('profile_id', session.user.id)
      .maybeSingle();
    setPartner(partnerData ?? null);

    if (partnerData?.status === 'approved') {
      const [{ data: orderData }, { data: earningsData }, { data: payoutData }] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('profile_id', session.user.id)
          .eq('order_type', 'business')
          .order('created_at', { ascending: false }),
        supabase.rpc('partner_earnings_summary', { p_partner_id: partnerData.id }),
        supabase
          .from('payouts')
          .select('*')
          .eq('partner_id', partnerData.id)
          .order('requested_at', { ascending: false }),
      ]);
      setOrders(orderData ?? []);
      setEarnings((earningsData as EarningsSummary | null) ?? null);
      setPayouts(payoutData ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [session]);

  const handleRequestPayout = useCallback(async () => {
    if (!partner) return;
    setRequesting(true);
    setRequestError(null);
    const { data, error } = await supabase.rpc('request_payout', { p_partner_id: partner.id });
    setRequesting(false);
    if (error) {
      setRequestError(error.message);
      return;
    }
    if (data?.error) {
      setRequestError(data.error);
      return;
    }
    load();
  }, [partner, load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

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

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const netEarnings = totalSales * (1 - Number(partner.platform_fee_percent) / 100);
  const available = Number(earnings?.available ?? 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31)} style={styles.header}>
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
              {BUSINESS_TYPE_LABELS[partner.business_type]} · {Number(partner.platform_fee_percent)}% platform fee
            </Typography>
          </View>
          <Image source={verifiedBadge} style={styles.shield} resizeMode="cover" />
        </Animated.View>

        {partner.status === 'approved' && (
          <>
            <Animated.View entering={FadeInUp.delay(120).springify().damping(31)} style={styles.statsRow}>
              <StatCard icon="trending-up-outline" value={`₹${totalSales.toFixed(0)}`} label="Total Sales" />
              <StatCard icon="wallet-outline" value={`₹${netEarnings.toFixed(0)}`} label="Net Earnings" />
              <StatCard icon="bag-handle-outline" value={`${orders.length}`} label="Orders" />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(180).springify().damping(31)}>
              <Pressable
                onPress={() => router.push('/partner/business-order')}
                style={({ pressed }) => [styles.primaryCta, pressed && styles.pressed]}
              >
                <View style={styles.ctaIconRing}>
                  <Ionicons name="add" size={18} color="#06130D" />
                </View>
                <Typography variant="body" weight="bold" color="#06130D" style={styles.primaryCtaLabel}>
                  Place Business Order
                </Typography>
                <Ionicons name="chevron-forward" size={18} color="#06130D" />
              </Pressable>
            </Animated.View>

            {earnings && !earnings.error && (
              <Animated.View entering={FadeInUp.delay(210).springify().damping(31)}>
                <Card variant="outlined" padding="lg" style={styles.earningsCard}>
                  <View style={styles.earningsHeader}>
                    <View style={styles.earningsHeaderLeft}>
                      <View style={styles.accentBar} />
                      <Typography variant="h4" color={colors.textInverse}>
                        Earnings
                      </Typography>
                    </View>
                    <View style={styles.periodPill}>
                      <Typography variant="caption" color={colors.textSecondary}>
                        This Month
                      </Typography>
                      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                    </View>
                  </View>

                  <EarningsRow
                    icon="cart-outline"
                    label="Gross sales"
                    amount={`₹${Number(earnings.gross ?? 0).toFixed(2)}`}
                    amountColor={colors.textInverse}
                  />
                  <EarningsRow
                    chipChar="%"
                    label={`Platform fee (${Number(earnings.fee_percent ?? 0)}%)`}
                    amount={`−₹${Number(earnings.fee ?? 0).toFixed(2)}`}
                    amountColor={colors.error}
                  />
                  <EarningsRow
                    icon="wallet-outline"
                    label="Net earned"
                    amount={`₹${Number(earnings.net ?? 0).toFixed(2)}`}
                    amountColor={GREEN}
                  />
                  <EarningsRow
                    icon="arrow-redo-outline"
                    label="Paid out"
                    amount={`₹${Number(earnings.paid_out ?? 0).toFixed(2)}`}
                    amountColor={colors.textInverse}
                  />
                  <EarningsRow
                    icon="time-outline"
                    label="Pending requests"
                    amount={`₹${Number(earnings.pending ?? 0).toFixed(2)}`}
                    amountColor={colors.textInverse}
                  />

                  <View style={styles.divider} />

                  <View style={styles.availableRow}>
                    <View style={styles.chip}>
                      <Ionicons name="wallet-outline" size={16} color={GREEN} />
                    </View>
                    <View style={styles.availableBody}>
                      <Typography variant="body" weight="bold" color={colors.textInverse}>
                        Available to withdraw
                      </Typography>
                      <Typography variant="caption" color={colors.textTertiary}>
                        Ready to transfer to your bank
                      </Typography>
                    </View>
                    <Typography variant="body" weight="bold" color={GREEN}>
                      ₹{available.toFixed(2)}
                    </Typography>
                  </View>

                  <ErrorNotice
                    message={requestError}
                    onDismiss={() => setRequestError(null)}
                    style={styles.requestError}
                  />

                  <Pressable
                    onPress={handleRequestPayout}
                    disabled={requesting || available < 1}
                    style={({ pressed }) => [
                      styles.payoutCta,
                      (requesting || available < 1) && styles.payoutCtaDisabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    {requesting ? (
                      <ActivityIndicator size="small" color={GREEN} />
                    ) : (
                      <>
                        <View style={styles.payoutCtaChip}>
                          <Ionicons name="business-outline" size={16} color={GREEN} />
                        </View>
                        <Typography variant="body" weight="bold" color={GREEN} style={styles.payoutCtaLabel}>
                          Request Payout
                        </Typography>
                        <Ionicons name="chevron-forward" size={18} color={GREEN} />
                      </>
                    )}
                  </Pressable>
                </Card>
              </Animated.View>
            )}

            {payouts.length > 0 && (
              <Animated.View entering={FadeInUp.delay(230).springify().damping(31)}>
                <View style={styles.sectionHeader}>
                  <Typography variant="h4" color={colors.textInverse}>
                    Payout History
                  </Typography>
                  <View style={styles.viewAll}>
                    <Typography variant="caption" color={GREEN} weight="bold">
                      View all
                    </Typography>
                    <Ionicons name="chevron-forward" size={14} color={GREEN} />
                  </View>
                </View>

                {payouts.map((payout) => (
                  <Card key={payout.id} variant="outlined" padding="md" style={styles.payoutCard}>
                    <View style={styles.chip}>
                      <Ionicons name="download-outline" size={16} color={GREEN} />
                    </View>
                    <View style={styles.payoutBody}>
                      <Typography variant="bodySmall" weight="bold" color={colors.textInverse}>
                        Payout to Bank Account
                      </Typography>
                      <Typography variant="caption" color={colors.textTertiary}>
                        {formatDateTime(payout.requested_at)}
                      </Typography>
                    </View>
                    <View style={styles.payoutRight}>
                      <Typography variant="bodySmall" weight="bold" color={colors.textInverse}>
                        ₹{Number(payout.amount).toFixed(2)}
                      </Typography>
                      <View
                        style={[
                          styles.statusPill,
                          { borderColor: PAYOUT_STATUS_COLORS[payout.status] },
                        ]}
                      >
                        <Typography variant="caption" weight="bold" color={PAYOUT_STATUS_COLORS[payout.status]}>
                          {PAYOUT_STATUS_LABELS[payout.status]}
                        </Typography>
                      </View>
                    </View>
                  </Card>
                ))}
              </Animated.View>
            )}

            <Animated.View entering={FadeInUp.delay(240).springify().damping(31)}>
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
    backgroundColor: `rgba(${GREEN_RGB},0.14)`,
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
  // ── earnings ──
  earningsCard: {
    marginBottom: spacing['2xl'],
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  earningsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accentBar: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  earningsLabel: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestError: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  payoutCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `rgba(${GREEN_RGB},0.55)`,
    backgroundColor: `rgba(${GREEN_RGB},0.08)`,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  payoutCtaDisabled: {
    opacity: 0.6,
  },
  payoutCtaChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `rgba(${GREEN_RGB},0.16)`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutCtaLabel: {
    flex: 1,
    textAlign: 'center',
  },
  // ── payout history ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  payoutBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  payoutRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
