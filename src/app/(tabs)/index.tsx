import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import { ProductCard } from '../../components/product/ProductCard';
import { CategoryCard } from '../../components/home/CategoryCard';
import {
  banners,
  lifestyleArticles,
  testimonials,
  whyChooseUs,
} from '../../mock';
import { useQuery } from '@tanstack/react-query';
import { useProducts, useCategories } from '../../services/catalog';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../lib/supabase';
import { resolveImageSource } from '../../utils/placeholders';
import { isBirthdayToday } from '../../utils/date';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function useStaggeredEntry(delay: number) {
  const y = useSharedValue(24);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withSpring(0, { damping: 37, stiffness: 160 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));
}

function BirthdayBanner() {
  const profile = useAuthStore((s) => s.profile);
  const [dismissed, setDismissed] = useState(false);
  const isBirthday = isBirthdayToday(profile?.date_of_birth);

  const { data: offer } = useQuery({
    queryKey: ['birthday-discount'],
    enabled: isBirthday,
    queryFn: async () => {
      const { data } = await supabase
        .from('discounts')
        .select('code, description')
        .eq('is_birthday_offer', true)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (!isBirthday || dismissed) return null;

  return (
    <View style={styles.birthdayBanner}>
      <View style={styles.birthdayIcon}>
        <Ionicons name="gift" size={20} color={colors.primaryDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Typography variant="bodySmall" weight="bold" color={colors.textInverse}>
          Happy Birthday! 🎉
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.75)">
          {offer?.code
            ? `Use code ${offer.code} for your birthday treat.`
            : offer?.description || 'Enjoy a little something from us today.'}
        </Typography>
      </View>
      <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={10}>
        <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchFocused, setSearchFocused] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const firstName = (profile?.full_name || 'there').split(' ')[0];
  const { products } = useProducts();
  const { categories } = useCategories();
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', profile?.id],
    enabled: !!profile?.id,
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profile!.id)
        .is('read_at', null);
      return count ?? 0;
    },
  });
  const featuredProducts = products.filter((p) => p.isFeatured);
  const seasonalProducts = products.filter((p) => p.isSeasonal);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const [activeCat, setActiveCat] = useState<string | undefined>(undefined);

  const headerStyle   = useStaggeredEntry(0);
  const searchStyle   = useStaggeredEntry(80);
  const section1Style = useStaggeredEntry(160);
  const section2Style = useStaggeredEntry(250);
  const section3Style = useStaggeredEntry(300);

  const searchScale = useSharedValue(1);
  const searchAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  const handleSearchFocus = useCallback(() => {
    searchScale.value = withSpring(1.02, { damping: 31, stiffness: 220 });
    setSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    searchScale.value = withSpring(1, { damping: 31, stiffness: 220 });
    setSearchFocused(false);
  }, []);

  const handleSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/search');
  }, []);

  const handleProductPress = useCallback((slug: string) => router.push(`/product/${slug}`), []);
  const handleCategoryPress = useCallback((slug: string) => router.push(`/category/${slug}`), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={{ flex: 1 }}>
            <Typography variant="bodySmall" color={colors.textSecondary}>
              {greeting()},
            </Typography>
            <Typography variant="h3" color={colors.text} numberOfLines={1}>
              {firstName} <Typography variant="h3" color={colors.primary}>🌿</Typography>
            </Typography>
            <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: 2 }}>
              Fuel your body. Refresh your mind. 🌿
            </Typography>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/notifications');
              }}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              {unreadCount > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/cart');
              }}
            >
              <Ionicons name="bag-outline" size={20} color={colors.text} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Typography variant="caption" color="#06130D" style={{ fontSize: 10, fontWeight: '700' }}>
                    {cartCount}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        <BirthdayBanner />

        {/* Search */}
        <Animated.View style={[styles.searchContainer, searchStyle, searchAnimStyle]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleSearchPress}
            onPressIn={handleSearchFocus}
            onPressOut={handleSearchBlur}
          >
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="Search smoothies, juices, bowls..."
              onPress={handleSearchPress}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Featured Categories — chips directly under search, no header */}
        <Animated.View style={[styles.categoriesRow, section1Style]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                index={i}
                active={cat.id === activeCat}
                onPress={() => { setActiveCat(cat.id); handleCategoryPress(cat.slug); }}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Best Sellers */}
        <Animated.View style={[styles.section, section2Style]}>
          <View style={styles.sectionHeader}>
            <View>
              <Typography variant="h4" color={colors.text}>Best Sellers</Typography>
              <Typography variant="caption" color={colors.textTertiary} style={styles.sectionSub}>
                Our most loved picks 💚
              </Typography>
            </View>
            <TouchableOpacity style={styles.viewAll} onPress={() => router.push('/(tabs)/explore')}>
              <Typography variant="bodySmall" color={colors.primary} weight="semibold">View all</Typography>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {bestSellers.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onPress={() => handleProductPress(product.slug)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Spring Fresh Collection — promo card */}
        <Animated.View style={[section3Style, styles.section]}>
          <View style={styles.promoCard}>
            <Image
              source={resolveImageSource(banners[0].image)}
              style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(8,19,13,0.96)', 'rgba(8,19,13,0.7)', 'rgba(8,19,13,0)']}
              locations={[0, 0.45, 0.9]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.95, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.promoText}>
              <Typography variant="caption" color={colors.primary} weight="bold" style={styles.promoKicker}>
                LIMITED TIME ONLY
              </Typography>
              <Typography variant="h3" color={colors.textInverse} style={styles.promoTitle}>
                Spring Fresh{'\n'}Collection
              </Typography>
              <Typography variant="bodySmall" color="rgba(255,255,255,0.7)" style={styles.promoDesc}>
                Harvest the best of the season in every sip.
              </Typography>
              <TouchableOpacity
                style={styles.promoBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/explore');
                }}
              >
                <Typography variant="bodySmall" color="#06130D" weight="bold">Explore Collection</Typography>
                <Ionicons name="arrow-forward" size={14} color="#06130D" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Seasonal Products */}
        {seasonalProducts.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(360).springify().damping(31)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Typography variant="h4" color={colors.text}>Seasonal Picks</Typography>
              <TouchableOpacity style={styles.viewAll} onPress={() => router.push('/(tabs)/explore')}>
                <Typography variant="bodySmall" color={colors.primary} weight="semibold">View all</Typography>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.seasonalGrid}>
              {seasonalProducts.slice(0, 2).map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="seasonal"
                  index={i}
                  onPress={() => handleProductPress(product.slug)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Featured Products */}
        <Animated.View
          entering={FadeInUp.delay(420).springify().damping(31)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Typography variant="h4" color={colors.text}>Featured Products</Typography>
          </View>
          {featuredProducts.slice(0, 4).map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="horizontal"
              index={i}
              onPress={() => handleProductPress(product.slug)}
            />
          ))}
          <Button
            title="View All Products"
            variant="outline"
            fullWidth
            onPress={() => router.push('/(tabs)/explore')}
            style={styles.viewAllButton}
          />
        </Animated.View>

        {/* Subscription — full-bleed editorial */}
        <Animated.View
          entering={FadeInUp.delay(480).springify().damping(31)}
          style={styles.subscriptionBlock}
        >
          <LinearGradient
            colors={['#0A2416', '#1A4028']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Typography variant="h1" color="rgba(150,255,31,0.12)" style={styles.subscriptionBigNum}>
            15%
          </Typography>
          <View style={styles.subscriptionContent}>
            <View style={styles.subscriptionTag}>
              <Typography variant="caption" color={colors.secondary} weight="bold" style={{ letterSpacing: 2, fontSize: 9 }}>
                · SUBSCRIBE & SAVE ·
              </Typography>
            </View>
            <Typography variant="h3" color={colors.textInverse} style={styles.subscriptionTitle}>
              Never Run Out{'\n'}of Freshness
            </Typography>
            <Typography variant="bodySmall" color="rgba(255,255,255,0.55)" style={styles.subscriptionDesc}>
              Weekly deliveries tailored to your lifestyle. Save up to 15% on every order.
            </Typography>
            <View style={styles.subscriptionCTA}>
              <TouchableOpacity
                style={styles.subscriptionPillBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/subscriptions');
                }}
              >
                <Typography variant="bodySmall" color={colors.primaryDark} weight="bold">
                  View Plans
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/subscriptions')}
                style={styles.subscriptionGhostBtn}
              >
                <Typography variant="bodySmall" color="rgba(255,255,255,0.6)" weight="semibold">
                  Learn More
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Lifestyle Articles */}
        <Animated.View
          entering={FadeInUp.delay(520).springify().damping(31)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Typography variant="h4" color={colors.text}>Healthy Living</Typography>
            <TouchableOpacity style={styles.viewAll} onPress={() => router.push('/articles')}>
              <Typography variant="bodySmall" color={colors.primary} weight="semibold">View all</Typography>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.articleGrid}>
            {lifestyleArticles.slice(0, 2).map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/article/${article.id}`);
                }}
              >
                <View style={styles.articleImageContainer}>
                  <Image
                    source={resolveImageSource(article.image)}
                    style={styles.articleImage}
                    resizeMode="cover"
                  />
                  <View style={styles.articleCategoryPill}>
                    <Typography variant="caption" color={colors.secondary} weight="bold" style={{ fontSize: 9, letterSpacing: 1 }}>
                      {article.category.toUpperCase()}
                    </Typography>
                  </View>
                </View>
                <Typography variant="bodySmall" weight="bold" numberOfLines={2} style={styles.articleTitle}>
                  {article.title}
                </Typography>
                <View style={styles.articleMeta}>
                  <Typography variant="caption" color={colors.textTertiary}>
                    {article.readTime} read
                  </Typography>
                  <Ionicons name="arrow-forward" size={13} color={colors.primary} style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Testimonials */}
        <Animated.View
          entering={FadeInUp.delay(560).springify().damping(31)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Typography variant="h4" color={colors.text}>What Customers Say</Typography>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {testimonials.map((testimonial) => (
              <View key={testimonial.id} style={styles.testimonialCard}>
                <Typography variant="h1" color={colors.primary} style={styles.quoteChar}>
                  "
                </Typography>
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < testimonial.rating ? 'star' : 'star-outline'}
                      size={13}
                      color={colors.secondary}
                    />
                  ))}
                </View>
                <Typography variant="bodySmall" color="rgba(255,255,255,0.75)" style={styles.testimonialText}>
                  {testimonial.content}
                </Typography>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.authorAvatar}>
                    <Typography variant="caption" color={colors.primaryDark} weight="bold" style={{ fontSize: 13 }}>
                      {testimonial.name.charAt(0)}
                    </Typography>
                  </View>
                  <View>
                    <Typography variant="bodySmall" weight="bold" color={colors.textInverse}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.4)">
                      {testimonial.role}
                    </Typography>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Why Choose MiniGreens */}
        <Animated.View
          entering={FadeInUp.delay(600).springify().damping(31)}
          style={styles.section}
        >
          <Typography variant="h4" color={colors.text} style={{ marginBottom: spacing.lg }}>
            Why Choose MiniGreens
          </Typography>
          <View style={styles.whyGrid}>
            {whyChooseUs.map((item, i) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(600 + i * 70).springify().damping(31)}
                style={styles.whyCard}
              >
                <View style={styles.whyIconContainer}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                </View>
                <Typography variant="bodySmall" weight="bold" style={{ marginBottom: spacing.xs }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  {item.description}
                </Typography>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typography variant="bodySmall" color={colors.textTertiary} align="center">
            MiniGreens · Fresh, Organic, Delivered.
          </Typography>
          <Typography variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: spacing.xs }}>
            © 2026 MiniGreens. All rights reserved.
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  sectionSub: {
    marginTop: 2,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoCard: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 190,
    justifyContent: 'center',
  },
  promoText: {
    width: '72%',
    padding: spacing.xl,
    zIndex: 2,
  },
  promoKicker: {
    letterSpacing: 1.5,
    fontSize: 10,
    marginBottom: spacing.sm,
  },
  promoTitle: {
    marginBottom: spacing.sm,
  },
  promoDesc: {
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  promoImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '55%',
  },
  promoImageMask: {
    position: 'absolute',
    right: '45%',
    left: 0,
    top: 0,
    bottom: 0,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  categoriesRow: {
    marginTop: spacing.xl,
    paddingLeft: spacing.lg,
  },
  seasonalGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
  // Seasonal dark block
  seasonalBlock: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    padding: spacing['2xl'],
    minHeight: 200,
  },
  seasonalTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(150,255,31,0.12)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.md,
  },
  seasonalTitle: {
    marginBottom: spacing.sm,
  },
  seasonalDesc: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  seasonalCta: {
    flexDirection: 'row',
  },
  seasonalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  viewAllButton: {
    marginTop: spacing.lg,
    borderColor: colors.border,
  },
  // Subscription editorial block
  subscriptionBlock: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    minHeight: 260,
    position: 'relative',
  },
  subscriptionBigNum: {
    position: 'absolute',
    top: -16,
    right: spacing.lg,
    fontSize: 96,
    lineHeight: 96,
    letterSpacing: -4,
  },
  subscriptionContent: {
    padding: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  subscriptionTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(150,255,31,0.12)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.md,
  },
  subscriptionTitle: {
    marginBottom: spacing.sm,
  },
  subscriptionDesc: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  subscriptionCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  subscriptionPillBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  subscriptionGhostBtn: {
    paddingVertical: spacing.md,
  },
  // Articles
  articleGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  articleCard: {
    flex: 1,
  },
  articleImageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  articleImage: {
    width: '100%',
    height: 140,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
  },
  articleCategoryPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(6,19,13,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(150,255,31,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  articleTitle: {
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  // Testimonials
  testimonialCard: {
    width: 280,
    marginRight: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteChar: {
    position: 'absolute',
    top: -8,
    left: spacing.md,
    fontSize: 72,
    lineHeight: 72,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  testimonialText: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  // Why grid
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  whyCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  whyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  footer: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  birthdayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  birthdayIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
