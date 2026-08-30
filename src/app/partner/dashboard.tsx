import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
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

const PAYOUT_STATUS_COLORS: Record<PayoutRow['status'], string> = {
  pending: colors.warning,
  processing: colors.info,
  paid: colors.success,
  rejected: colors.error,
};

const PAYOUT_STATUS_LABELS: Record<PayoutRow['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  rejected: 'Rejected',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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
  approved: colors.success,
  rejected: colors.error,
};

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31)}>
          <Typography variant="h2" color={colors.text} style={styles.title}>
            {partner.business_name}
          </Typography>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[partner.status] }]} />
            <Typography variant="bodySmall" color={colors.textSecondary} style={styles.statusText}>
              {partner.status === 'pending' && 'Application under review'}
              {partner.status === 'approved' && 'Approved partner'}
              {partner.status === 'rejected' && 'Application rejected'}
            </Typography>
          </View>
          <Typography variant="caption" color={colors.textTertiary}>
            {BUSINESS_TYPE_LABELS[partner.business_type]} · {Number(partner.platform_fee_percent)}% platform fee
          </Typography>
        </Animated.View>

        {partner.status === 'approved' && (
          <>
            <Animated.View entering={FadeInUp.delay(120).springify().damping(31)} style={styles.statsRow}>
              <Card style={styles.statCard} padding="lg">
                <Typography variant="h3" color={colors.primaryDark} weight="bold">
                  ₹{totalSales.toFixed(0)}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  Total Sales
                </Typography>
              </Card>
              <Card style={styles.statCard} padding="lg">
                <Typography variant="h3" color={colors.primaryDark} weight="bold">
                  ₹{netEarnings.toFixed(0)}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  Net Earnings
                </Typography>
              </Card>
              <Card style={styles.statCard} padding="lg">
                <Typography variant="h3" color={colors.primaryDark} weight="bold">
                  {orders.length}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  Orders
                </Typography>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(180).springify().damping(31)}>
              <Button
                title="Place Business Order"
                onPress={() => router.push('/partner/business-order')}
                fullWidth
                size="lg"
                icon={<Ionicons name="add" size={18} color={colors.textInverse} />}
                style={styles.placeOrderButton}
              />
            </Animated.View>

            {earnings && !earnings.error && (
              <Animated.View entering={FadeInUp.delay(210).springify().damping(31)}>
                <Card variant="outlined" padding="lg" style={styles.earningsCard}>
                  <Typography variant="body" weight="semibold" style={styles.earningsTitle}>
                    Earnings
                  </Typography>
                  <View style={styles.earningsRow}>
                    <Typography variant="bodySmall" color={colors.textSecondary}>Gross sales</Typography>
                    <Typography variant="bodySmall" weight="semibold">₹{Number(earnings.gross ?? 0).toFixed(2)}</Typography>
                  </View>
                  <View style={styles.earningsRow}>
                    <Typography variant="bodySmall" color={colors.textSecondary}>
                      Platform fee ({Number(earnings.fee_percent ?? 0)}%)
                    </Typography>
                    <Typography variant="bodySmall" weight="semibold">−₹{Number(earnings.fee ?? 0).toFixed(2)}</Typography>
                  </View>
                  <View style={styles.earningsRow}>
                    <Typography variant="bodySmall" color={colors.textSecondary}>Net earned</Typography>
                    <Typography variant="bodySmall" weight="semibold">₹{Number(earnings.net ?? 0).toFixed(2)}</Typography>
                  </View>
                  <View style={styles.earningsRow}>
                    <Typography variant="bodySmall" color={colors.textSecondary}>Paid out</Typography>
                    <Typography variant="bodySmall" weight="semibold">₹{Number(earnings.paid_out ?? 0).toFixed(2)}</Typography>
                  </View>
                  <View style={styles.earningsRow}>
                    <Typography variant="bodySmall" color={colors.textSecondary}>Pending requests</Typography>
                    <Typography variant="bodySmall" weight="semibold">₹{Number(earnings.pending ?? 0).toFixed(2)}</Typography>
                  </View>
                  <View style={[styles.earningsRow, styles.earningsAvailableRow]}>
                    <Typography variant="body" weight="bold">Available to withdraw</Typography>
                    <Typography variant="body" weight="bold" color={colors.primaryDark}>
                      ₹{Number(earnings.available ?? 0).toFixed(2)}
                    </Typography>
                  </View>

                  <ErrorNotice message={requestError} onDismiss={() => setRequestError(null)} style={styles.requestError} />

                  <Button
                    title="Request Payout"
                    onPress={handleRequestPayout}
                    fullWidth
                    loading={requesting}
                    disabled={requesting || Number(earnings.available ?? 0) < 1}
                    style={styles.requestButton}
                  />
                </Card>
              </Animated.View>
            )}

            {payouts.length > 0 && (
              <Animated.View entering={FadeInUp.delay(230).springify().damping(31)}>
                <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
                  Payout History
                </Typography>
                {payouts.map((payout) => (
                  <Card key={payout.id} variant="outlined" padding="md" style={styles.orderCard}>
                    <View style={styles.orderRow}>
                      <Typography variant="bodySmall" color={colors.primaryDark} weight="bold">
                        ₹{Number(payout.amount).toFixed(2)}
                      </Typography>
                      <View style={styles.payoutBadge}>
                        <View style={[styles.statusDot, { backgroundColor: PAYOUT_STATUS_COLORS[payout.status] }]} />
                        <Typography variant="caption" color={colors.textSecondary}>
                          {PAYOUT_STATUS_LABELS[payout.status]}
                        </Typography>
                      </View>
                    </View>
                    <Typography variant="caption" color={colors.textTertiary}>
                      Requested {formatDate(payout.requested_at)}
                      {payout.paid_at ? ` · Paid ${formatDate(payout.paid_at)}` : ''}
                    </Typography>
                  </Card>
                ))}
              </Animated.View>
            )}

            <Animated.View entering={FadeInUp.delay(240).springify().damping(31)}>
              <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
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
                      <Typography variant="bodySmall" weight="semibold">
                        {order.order_number}
                      </Typography>
                      <Typography variant="bodySmall" color={colors.primaryDark} weight="bold">
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
    backgroundColor: colors.background,
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
  title: {
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {},
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  placeOrderButton: {
    marginBottom: spacing['2xl'],
  },
  earningsCard: {
    marginBottom: spacing['2xl'],
  },
  earningsTitle: {
    marginBottom: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  earningsAvailableRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  requestError: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  requestButton: {
    marginTop: spacing.lg,
  },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
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
