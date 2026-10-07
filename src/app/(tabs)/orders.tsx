import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { PressableScale } from '../../components/ui/PressableScale';
import { StatusPill } from '../../components/ui/StatusPill';
import { Screen } from '../../components/layout/Screen';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { resolveImageSource, getProductPlaceholder } from '../../utils/placeholders';
import type { Database, PaymentStatus } from '../../types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

const MAX_ITEMS_SHOWN = 3;

const paymentLabel: Record<PaymentStatus, string> = {
  pending: 'Pay on delivery',
  paid: 'Paid',
  failed: 'Payment failed',
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order, index }: { order: OrderWithItems; index: number }) {
  const shown = order.order_items.slice(0, MAX_ITEMS_SHOWN);
  const hidden = order.order_items.length - shown.length;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify().damping(31).mass(1).stiffness(100)}
      style={styles.cardWrap}
    >
      <PressableScale onPress={() => router.push(`/order/${order.id}`)} accessibilityLabel={`Order ${order.order_number}`}>
        <Card padding="lg">
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Typography variant="bodySmall" weight="semibold" color={colors.text}>
                {order.order_number}
              </Typography>
              {order.order_type === 'preorder' && (
                <View style={styles.preorderPill}>
                  <Typography variant="caption" weight="bold" color={colors.primaryDark} style={{ fontSize: 9, letterSpacing: 0.5 }}>
                    PRE-ORDER
                  </Typography>
                </View>
              )}
            </View>
            <StatusPill label={order.status} status={order.status} />
          </View>

          <View style={styles.orderItems}>
            {shown.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Image
                  source={resolveImageSource(item.image || getProductPlaceholder(item.product_name))}
                  style={styles.orderItemImage}
                  resizeMode="cover"
                />
                <View style={styles.orderItemInfo}>
                  <Typography variant="bodySmall" weight="semibold" numberOfLines={1}>
                    {item.product_name}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Qty {item.quantity} × ₹{item.price.toFixed(2)}
                  </Typography>
                </View>
              </View>
            ))}
            {hidden > 0 ? (
              <Typography variant="caption" color={colors.textTertiary} style={styles.more}>
                +{hidden} more {hidden === 1 ? 'item' : 'items'}
              </Typography>
            ) : null}
          </View>

          <View style={styles.orderFooter}>
            <View>
              <Typography variant="bodySmall" color={colors.textTertiary}>
                {formatDate(order.created_at)}
              </Typography>
              <Typography variant="caption" color={colors.textTertiary}>
                {paymentLabel[order.payment_status]}
              </Typography>
              {order.expected_availability_date && (
                <Typography variant="caption" color={colors.primaryDark} weight="semibold">
                  Expected {formatDate(order.expected_availability_date)}
                </Typography>
              )}
            </View>
            <Typography variant="body" weight="bold" color={colors.accent}>
              ₹{order.total.toFixed(2)}
            </Typography>
          </View>
        </Card>
      </PressableScale>
    </Animated.View>
  );
}

function OrderCardSkeleton({ index }: { index: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify().damping(31).mass(1).stiffness(100)}
      style={styles.cardWrap}
    >
      <Card padding="lg">
        <View style={styles.orderHeader}>
          <Skeleton width={110} height={14} />
          <Skeleton width={72} height={22} borderRadiusVal={borderRadius.pill} />
        </View>
        <View style={styles.orderItem}>
          <Skeleton width={44} height={44} borderRadiusVal={borderRadius.md} />
          <View style={[styles.orderItemInfo, { marginLeft: spacing.md }]}>
            <Skeleton width="65%" height={13} />
            <Skeleton width="40%" height={11} style={{ marginTop: spacing.xs }} />
          </View>
        </View>
        <View style={styles.orderFooter}>
          <Skeleton width={90} height={13} />
          <Skeleton width={60} height={16} />
        </View>
      </Card>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      setLoading(true);
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('profile_id', profile.id)
        // Business orders placed via the partner flow are fulfilled through
        // Admin and have no self-serve payment, so keep them out of the
        // customer Orders tab (BUG-05).
        .neq('order_type', 'business')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (!cancelled) {
            setOrders((data as OrderWithItems[] | null) ?? []);
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [profile])
  );

  // Signed out: there is nothing to load, so don't leave the spinner running.
  if (!session && !profile) {
    return (
      <Screen title="Orders" subtitle="Track everything you have ordered." largeTitle showBack={false} scroll={false} hasTabBar>
        <EmptyState
          icon="receipt-outline"
          title="Log in to see your orders"
          message="Your order history and delivery status show up here."
          actionLabel="Log In"
          onAction={() => router.push('/auth/login')}
        />
      </Screen>
    );
  }

  const isEmpty = !loading && orders.length === 0;

  return (
    <Screen
      title="Orders"
      subtitle="Track everything you have ordered."
      largeTitle
      showBack={false}
      scroll={!isEmpty}
      hasTabBar
    >
      {loading ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <OrderCardSkeleton key={i} index={i} />
          ))}
        </View>
      ) : isEmpty ? (
        <EmptyState
          icon="receipt-outline"
          title="No Orders Yet"
          message="Your order history will appear here."
          actionLabel="Start Shopping"
          onAction={() => router.push('/(tabs)/explore')}
        />
      ) : (
        <View style={styles.list}>
          {orders.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.sm,
  },
  cardWrap: {
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  preorderPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryBg,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderItemImage: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    marginRight: spacing.md,
  },
  orderItemInfo: {
    flex: 1,
  },
  more: {
    marginBottom: spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
});
