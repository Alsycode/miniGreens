import React, { useState } from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../ui/Typography';
import { Product } from '../../types';
import { resolveImageSource } from '../../utils/placeholders';
import { useCartStore } from '../../store/useCartStore';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  variant?: 'default' | 'horizontal' | 'compact' | 'seasonal';
  index?: number;
  style?: object;
}

function useSpringPress(to = 0.96) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withSpring(to, { damping: 31, stiffness: 220 }); };
  const onPressOut = () => { scale.value = withSpring(1, { damping: 31, stiffness: 220 }); };
  return { animStyle, onPressIn, onPressOut };
}

// Per-product accent (size badge + price), keyed off the slug so it's stable.
const ACCENTS = ['#F472B6', '#FB923C', '#A78BFA', '#34D399', '#22D3EE', '#FBBF24'];
function accentFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

// ─── Inline cart stepper ─────────────────────────────────────────────────────

function CartStepper({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const cartItem = useCartStore((s) => s.items.find((i) => i.slug === slug));
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const qty = cartItem?.quantity ?? 0;

  const inc = () => {
    Haptics.selectionAsync();
    useCartStore.getState().addItemBySlug(slug, 1);
  };
  const dec = () => {
    if (!cartItem) return;
    Haptics.selectionAsync();
    updateQuantity(cartItem.productId, qty - 1);
  };

  return (
    <View style={[styles.stepper, compact && styles.stepperCompact]}>
      <Pressable style={styles.stepperBtn} onPress={dec} hitSlop={6} disabled={qty === 0}>
        <Ionicons name="remove" size={14} color={qty === 0 ? colors.textTertiary : colors.primary} />
      </Pressable>
      <Typography variant="bodySmall" weight="bold" color={colors.text} style={styles.stepperQty}>
        {qty}
      </Typography>
      <Pressable style={styles.stepperBtn} onPress={inc} hitSlop={6}>
        <Ionicons name="add" size={14} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export function ProductCard({ product, onPress, variant = 'default', index = 0, style }: ProductCardProps) {
  const { animStyle, onPressIn, onPressOut } = useSpringPress();
  const [favorited, setFavorited] = useState(false);
  const accent = accentFor(product.slug);

  const toggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavorited((v) => !v);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // ─── Horizontal variant ───────────────────────────────────────────────────

  if (variant === 'horizontal') {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 70).springify().damping(31)}
        style={[animStyle, style]}
      >
        <Pressable
          style={styles.horizontalCard}
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Image source={resolveImageSource(product.images[0])} style={styles.horizontalImage} resizeMode="cover" />
          <View style={styles.horizontalContent}>
            <Typography variant="caption" color={colors.primary} weight="medium" uppercase>
              {product.unit}
            </Typography>
            <Typography variant="body" weight="bold" numberOfLines={1}>
              {product.name}
            </Typography>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={colors.secondary} />
              <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                {product.rating} ({product.reviewCount})
              </Typography>
            </View>
            <View style={styles.priceRow}>
              <Typography variant="h4" color={accent} weight="bold">
                ₹{product.price.toFixed(0)}
              </Typography>
              {product.originalPrice && (
                <Typography variant="caption" color={colors.textTertiary} style={styles.originalPrice}>
                  ₹{product.originalPrice.toFixed(0)}
                </Typography>
              )}
              <View style={{ flex: 1 }} />
              <CartStepper slug={product.slug} compact />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // ─── Seasonal variant — default card + "Add to cart" button ───────────────

  if (variant === 'seasonal') {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 70).springify().damping(31)}
        style={[styles.seasonalCard, animStyle, style]}
      >
        <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.seasonalInner}>
          {/* Full-bleed image that fades out from ~50% down into the card */}
          <Image
            source={resolveImageSource(product.images[0])}
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(20,20,20,0)', 'rgba(20,20,20,0.6)', 'rgba(20,20,20,1)']}
            locations={[0.35, 0.58, 0.88]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {product.isBestSeller && (
            <View style={styles.bestsellerBadge}>
              <Ionicons name="star" size={9} color="#06130D" />
              <Typography style={styles.badgeText} color="#06130D">BESTSELLER</Typography>
            </View>
          )}

          <Pressable style={styles.favouriteBtn} onPress={toggleFavorite} hitSlop={8}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={15}
              color={favorited ? colors.error : colors.textInverse}
            />
          </Pressable>

          <View style={styles.unitBadgeStandalone}>
            <Typography style={styles.unitBadgeText} color="#06130D">{product.unit}</Typography>
          </View>

          <View style={styles.seasonalOverlayBody}>
            <Typography variant="body" weight="bold" color={colors.textInverse} numberOfLines={1}>
              {product.name}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.75)" numberOfLines={2} style={styles.description}>
              {product.description}
            </Typography>

            <View style={styles.seasonalBottom}>
              <View>
                <Typography variant="caption" color="rgba(255,255,255,0.55)">Price</Typography>
                <Typography variant="h4" weight="bold" color={colors.textInverse}>
                  ₹{product.price.toFixed(0)}
                </Typography>
              </View>
              <Pressable
                style={styles.addToCartBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  useCartStore.getState().addItemBySlug(product.slug, 1);
                }}
              >
                <Typography weight="bold" color={colors.primary} style={styles.addToCartText}>Add To Cart</Typography>
                <Ionicons name="cart-outline" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // ─── Compact variant ──────────────────────────────────────────────────────

  if (variant === 'compact') {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 60).springify().damping(31)}
        style={[styles.compactCard, animStyle, style]}
      >
        <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1 }}>
          <Image source={resolveImageSource(product.images[0])} style={styles.compactImage} />
          <View style={styles.compactContent}>
            <Typography variant="bodySmall" weight="semibold" numberOfLines={1}>
              {product.name}
            </Typography>
            <View style={styles.compactPriceRow}>
              <Typography variant="bodySmall" color={accent} weight="bold">
                ₹{product.price.toFixed(0)}
              </Typography>
              <CartStepper slug={product.slug} compact />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // ─── Default variant — full-bleed image that fades from ~50% down ─────────

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).springify().damping(31)}
      style={[styles.card, animStyle, style]}
    >
      <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.cardInner}>
        <Image
          source={resolveImageSource(product.images[0])}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(20,20,20,0)', 'rgba(20,20,20,0.6)', 'rgba(20,20,20,1)']}
          locations={[0.32, 0.56, 0.86]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {product.isBestSeller && (
          <View style={styles.bestsellerBadge}>
            <Ionicons name="star" size={9} color="#06130D" />
            <Typography style={styles.badgeText} color="#06130D">BESTSELLER</Typography>
          </View>
        )}

        <Pressable style={styles.favouriteBtn} onPress={toggleFavorite} hitSlop={8}>
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={15}
            color={favorited ? colors.error : colors.textInverse}
          />
        </Pressable>

        <View style={[styles.unitBadgeStandalone, { backgroundColor: accent }]}>
          <Typography style={styles.unitBadgeText} color="#06130D">
            {product.unit}
          </Typography>
        </View>

        <View style={styles.defaultOverlayBody}>
          <Typography variant="body" weight="bold" color={colors.textInverse} numberOfLines={1}>
            {product.name}
          </Typography>
          <Typography
            variant="caption"
            color="rgba(255,255,255,0.75)"
            numberOfLines={2}
            style={styles.description}
          >
            {product.description}
          </Typography>

          <View style={styles.bottomRow}>
            <Typography variant="h4" weight="bold" color={accent}>
              ₹{product.price.toFixed(0)}
            </Typography>
            <CartStepper slug={product.slug} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── Default card ──────────────────────────────────────────────────────────
  card: {
    width: 230,
    height: 300,
    borderRadius: borderRadius['2xl'],
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
  },
  defaultOverlayBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
  },
  imageWrap: {
    height: 150,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favouriteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  unitBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  unitBadgeGreen: {
    backgroundColor: colors.primary,
  },
  // ── Seasonal variant ─────────────────────────────────────────────────────
  seasonalCard: {
    flex: 1,
    height: 320,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  seasonalInner: {
    flex: 1,
  },
  unitBadgeStandalone: {
    position: 'absolute',
    top: 150,
    left: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  seasonalOverlayBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
  },
  seasonalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addToCartText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  unitBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    padding: spacing.md,
  },
  description: {
    marginTop: 3,
    lineHeight: 15,
    minHeight: 30,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  // ── Inline stepper ───────────────────────────────────────────────────────
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnCompact: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: 4,
  },
  stepperCompact: {
    paddingHorizontal: 2,
  },
  stepperBtn: {
    width: 26,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    minWidth: 18,
    textAlign: 'center',
  },

  // ── Rating / price helpers ────────────────────────────────────────────────
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  originalPrice: {
    marginLeft: spacing.sm,
    textDecorationLine: 'line-through',
  },

  // ── Horizontal variant ────────────────────────────────────────────────────
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 116,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  horizontalImage: {
    width: 100,
    height: '100%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
  },
  horizontalContent: {
    flex: 1,
    paddingLeft: spacing.md,
    justifyContent: 'center',
  },

  // ── Compact variant ───────────────────────────────────────────────────────
  compactCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  compactImage: {
    width: '100%',
    height: 110,
    backgroundColor: colors.surfaceVariant,
  },
  compactContent: {
    padding: spacing.sm,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
