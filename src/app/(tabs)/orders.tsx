import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { Database, OrderStatus, PaymentStatus } from '../../types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

const statusColors: Record<OrderStatus, string> = {
  pending: colors.warning,
  confirmed: colors.info,
  processing: colors.info,
  shipped: colors.primary,
  delivered: colors.success,
  cancelled: colors.error,
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: colors.warning,
  paid: colors.success,
  failed: colors.error,
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Pressable Order Card ─────────────────────────────────────────────────────

function OrderCard({ order, index }: { order: OrderWithItems; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify().damping(31)}
      style={animStyle}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/order/${order.id}`);
        }}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 31, stiffness: 220 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 31, stiffness: 220 }); }}
      >
        <Card style={styles.orderCard} padding="lg">
          <View style={styles.orderHeader}>
            <View style={styles.orderNumberRow}>
              <Typography variant="bodySmall" weight="semibold" color={colors.text}>
                {order.order_number}
              </Typography>
              {order.order_type === 'preorder' && (
                <View style={styles.preorderPill}>
                  <Typography variant="caption" weight="bold" color={colors.primary} style={{ fontSize: 9, letterSpacing: 0.5 }}>
                    PRE-ORDER
                  </Typography>
                </View>
              )}
            </View>
            <View style={styles.badgeRow}>
              <Animated.View
                entering={ZoomIn.delay(index * 80 + 100).springify().damping(17)}
                style={[styles.statusBadge, { backgroundColor: paymentStatusColors[order.payment_status] + '20' }]}
              >
                <Typography
                  variant="caption"
                  weight="semibold"
                  color={paymentStatusColors[order.payment_status]}
                  style={{ textTransform: 'capitalize' }}
                >
                  {order.payment_status}
                </Typography>
              </Animated.View>
              <Animated.View
                entering={ZoomIn.delay(index * 80 + 120).springify().damping(17)}
                style={[styles.statusBadge, { backgroundColor: statusColors[order.status] + '20' }]}
              >
                <Typography
                  variant="caption"
                  weight="semibold"
                  color={statusColors[order.status]}
                  style={{ textTransform: 'capitalize' }}
                >
                  {order.status}
                </Typography>
              </Animated.View>
            </View>
          </View>

          <View style={styles.orderItems}>
            {order.order_items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemImage} />
                <View style={styles.orderItemInfo}>
                  <Typography variant="bodySmall" weight="semibold">
                    {item.product_name}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                  </Typography>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <Typography variant="bodySmall" color={colors.textTertiary}>
              {order.order_type === 'preorder' && order.expected_availability_date
                ? `Expected ${formatDate(order.expected_availability_date)}`
                : formatDate(order.created_at)}
            </Typography>
            <Typography variant="body" weight="bold" color={colors.primaryDark}>
              ₹{order.total.toFixed(2)}
            </Typography>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
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
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (!cancelled) {
            setOrders((data as OrderWithItems[] | null) ?? []);
            setLoading(false);
          }
        });
      return () => { cancelled = true; };
    }, [profile])
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Loading fullScreen />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Animated.View
          entering={FadeInUp.springify().damping(31)}
          style={styles.header}
        >
          <Typography variant="h3" color={colors.primaryDark}>
            Orders
          </Typography>
        </Animated.View>
        <EmptyState
          icon="receipt-outline"
          title="No Orders Yet"
          message="Your order history will appear here."
          actionLabel="Start Shopping"
          onAction={() => router.push('/(tabs)/explore')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInUp.springify().damping(31)}
        style={styles.header}
      >
        <Typography variant="h3" color={colors.primaryDark}>
          Orders
        </Typography>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {orders.map((order, i) => (
          <OrderCard key={order.id} order={order} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['8xl'],
  },
  orderCard: {
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  preorderPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
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
