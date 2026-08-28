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
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

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
