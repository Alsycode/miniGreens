import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { PressableScale } from '../../components/ui/PressableScale';
import { Screen } from '../../components/layout/Screen';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type SubscriptionPlanRow = Database['public']['Tables']['subscription_plans']['Row'];
type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

export default function SubscriptionsScreen() {
  const session = useAuthStore((s) => s.session);

  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    setPlans(planData ?? []);

    if (session) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();
      setActiveSubscription(subData ?? null);
    } else {
      setActiveSubscription(null);
    }
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSubscribe = async (plan: SubscriptionPlanRow) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (activeSubscription) {
      router.push('/subscription/manage');
      return;
    }
    router.push({ pathname: '/subscription/plan', params: { planId: plan.id } });
  };

  if (loading) {
    return (
      <Screen title="Subscriptions" subtitle="Fresh on a schedule. Skip or cancel anytime." largeTitle showBack={false} hasTabBar>
        {[0, 1].map((i) => (
          <Card key={i} style={styles.planCard} padding="xl">
            <Skeleton width="45%" height={18} />
            <Skeleton width="80%" height={12} style={{ marginTop: spacing.sm }} />
            <Skeleton width="60%" height={12} style={{ marginTop: spacing.xl }} />
            <Skeleton width="100%" height={48} borderRadiusVal={borderRadius.control} style={{ marginTop: spacing.xl }} />
          </Card>
        ))}
      </Screen>
    );
  }

  return (
    <Screen title="Subscriptions" subtitle="Fresh on a schedule. Skip or cancel anytime." largeTitle showBack={false} hasTabBar>
      <ErrorNotice message={subscribeError} onDismiss={() => setSubscribeError(null)} />

      {activeSubscription && (
        <Animated.View entering={FadeInUp.delay(80).springify().damping(31).mass(1).stiffness(100)}>
          <PressableScale onPress={() => router.push('/subscription/manage')} accessibilityLabel="Manage my subscription">
            <View style={styles.activeBanner}>
              <View style={styles.activeIcon}>
                <Ionicons name="calendar" size={20} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="body" weight="bold" color={colors.text}>
                  You have an active subscription
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  Skip a delivery, change items or cancel.
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </PressableScale>
        </Animated.View>
      )}

        {/* Plans */}
        {plans.map((plan, i) => (
          <Animated.View
            key={plan.id}
            entering={FadeInUp.delay(180 + i * 100).springify().damping(31).mass(1).stiffness(100)}
          >
            <Card
              style={[styles.planCard, plan.is_popular && styles.popularCard].filter(Boolean) as any}
              padding="xl"
              pressable
            >
              {plan.is_popular && (
                <Animated.View
                  entering={ZoomIn.delay(280 + i * 100).springify().damping(19).mass(1).stiffness(100)}
                  style={styles.popularBadge}
                >
                  <Typography variant="caption" color={colors.textInverse} weight="bold">
                    MOST POPULAR
                  </Typography>
                </Animated.View>
              )}
              <View style={[styles.planHeader, plan.is_popular && styles.planHeaderPopular]}>
                <View style={styles.planHeaderInfo}>
                  <Typography variant="h4" color={colors.text}>
                    {plan.name}
                  </Typography>
                  <Typography variant="bodySmall" color={colors.textSecondary}>
                    {plan.description}
                  </Typography>
                </View>
                <View style={styles.planPrice}>
                  <Typography variant="h3" color={colors.accent} weight="bold">
                    ₹{plan.price}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    /{plan.unit}
                  </Typography>
                </View>
              </View>

              <View style={styles.planDivider} />

              <Typography variant="bodySmall" weight="semibold" color={colors.text} style={styles.includesLabel}>
                Includes:
              </Typography>
              {plan.items.map((item, index) => (
                <View key={index} style={styles.planItem}>
                  <Ionicons name="leaf" size={14} color={colors.primary} />
                  <Typography variant="bodySmall" color={colors.textSecondary} style={styles.planItemText}>
                    {item}
                  </Typography>
                </View>
              ))}

              <View style={styles.planBenefits}>
                {plan.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefit}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Typography variant="bodySmall" color={colors.textSecondary} style={styles.benefitText}>
                      {benefit}
                    </Typography>
                  </View>
                ))}
              </View>

              <Button
                title={activeSubscription ? 'Manage Subscription' : 'Get Started'}
                variant={plan.is_popular ? 'primary' : 'outline'}
                fullWidth
                loading={subscribingId === plan.id}
                onPress={() => handleSubscribe(plan)}
                style={styles.planButton}
              />
            </Card>
          </Animated.View>
        ))}

        {/* Build your own */}
        <Animated.View
          entering={FadeInUp.delay(400).springify().damping(31).mass(1).stiffness(100)}
        >
          <Card style={styles.buildOwnCard} variant="outlined" padding="xl">
            <Typography variant="body" weight="semibold" color={colors.text}>
              Don&apos;t see a fit?
            </Typography>
            <Typography variant="bodySmall" color={colors.textSecondary} style={styles.inquiryText}>
              Build your own subscription — pick your products, quantities, and weekly or monthly delivery.
            </Typography>
            <Button
              title="Build Your Own"
              variant="outline"
              fullWidth
              onPress={() => {
                if (!session) {
                  router.push('/auth/login');
                  return;
                }
                router.push('/subscription/custom');
              }}
            />
          </Card>
        </Animated.View>

        {/* Inquiry */}
        <Animated.View
          entering={FadeInUp.delay(480).springify().damping(31).mass(1).stiffness(100)}
        >
          <Card style={styles.inquiryCard} variant="outlined" padding="xl">
            <Typography variant="body" weight="semibold" color={colors.text} align="center">
              Have Questions?
            </Typography>
            <Typography variant="bodySmall" color={colors.textSecondary} align="center" style={styles.inquiryText}>
              We will help you find the perfect plan for your lifestyle.
            </Typography>
            <Button
              title="Contact Us"
              variant="primary"
              fullWidth
              onPress={() => router.push('/profile/contact')}
            />
          </Card>
        </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    backgroundColor: colors.accentSurface,
  },
  activeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  planCard: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planHeaderPopular: {
    marginTop: spacing.xl,
  },
  planHeaderInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 0,
  },
  planDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  includesLabel: {
    marginBottom: spacing.sm,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planItemText: {
    marginLeft: spacing.sm,
  },
  planBenefits: {
    marginTop: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    marginLeft: spacing.sm,
  },
  planButton: {
    marginTop: spacing.xl,
  },
  buildOwnCard: {
    marginTop: spacing.lg,
  },
  inquiryCard: {
    marginTop: spacing.lg,
  },
  inquiryText: {
    marginVertical: spacing.lg,
  },
});
