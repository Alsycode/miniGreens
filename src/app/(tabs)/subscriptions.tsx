import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type SubscriptionPlanRow = Database['public']['Tables']['subscription_plans']['Row'];
type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);

  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

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
    setSubscribingId(plan.id);
    await supabase.from('subscriptions').insert({
      profile_id: session.user.id,
      plan_id: plan.id,
      status: 'active',
      address_id: null,
      next_delivery_date: null,
      paused_at: null,
      cancelled_at: null,
    });
    setSubscribingId(null);
    router.push('/subscription/manage');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInUp.springify().damping(31).mass(1).stiffness(100)}
        style={styles.header}
      >
        <Typography variant="h3" color={colors.accent}>
          Subscriptions
        </Typography>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <Animated.View entering={FadeInUp.delay(80).springify().damping(31).mass(1).stiffness(100)} style={styles.hero}>
          <Animated.View
            entering={ZoomIn.delay(160).springify().damping(19).mass(1).stiffness(100)}
            style={styles.heroIconContainer}
          >
            <LinearGradient
              colors={[colors.primaryBg, colors.green[100]]}
              style={styles.heroIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="calendar" size={32} color={colors.primary} />
            </LinearGradient>
          </Animated.View>
          <Typography variant="h4" color={colors.text} style={styles.heroTitle}>
            Never Miss Freshness
          </Typography>
          <Typography variant="body" color={colors.textSecondary} align="center">
            Subscribe to regular deliveries and save up to 15%. Skip or cancel anytime.
          </Typography>
          {activeSubscription && (
            <Button
              title="Manage My Subscription"
              variant="outline"
              onPress={() => router.push('/subscription/manage')}
              style={styles.manageButton}
            />
          )}
        </Animated.View>

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
    paddingBottom: spacing['8xl'],
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  heroIconContainer: {
    marginBottom: spacing.lg,
  },
  heroIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  manageButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
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
  inquiryCard: {
    marginTop: spacing.lg,
  },
  inquiryText: {
    marginVertical: spacing.lg,
  },
});
