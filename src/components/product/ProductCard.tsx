import React, { useState } from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
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
  variant?: 'default' | 'horizontal' | 'compact';
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

  if (qty === 0) {
    return (
      <Pressable style={[styles.addBtn, compact && styles.addBtnCompact]} onPress={inc} hitSlop={8}>
        <Ionicons name="add" size={compact ? 16 : 18} color="#06130D" />
      </Pressable>
    );
  }

  return (
    <View style={[styles.stepper, compact && styles.stepperCompact]}>
      <Pressable style={styles.stepperBtn} onPress={dec} hitSlop={6}>
        <Ionicons name="remove" size={14} color={colors.primary} />
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
          <Image source={resolveImageSource(product.images[0])} style={styles.horizontalImage} />
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
              <Typography variant="h4" color={colors.primaryLight} weight="bold">
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
              <Typography variant="bodySmall" color={colors.primaryLight} weight="bold">
                ₹{product.price.toFixed(0)}
              </Typography>
              <CartStepper slug={product.slug} compact />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // ─── Default variant — dark card, image on top, content below ─────────────

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).springify().damping(31)}
      style={[styles.card, animStyle, style]}
    >
      <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.cardInner}>
        <View style={styles.imageWrap}>
          <Image
            source={resolveImageSource(product.images[0])}
            style={styles.image}
            resizeMode="cover"
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

          <View style={styles.unitBadge}>
            <Typography style={styles.unitBadgeText} color="#06130D">
              {product.unit}
            </Typography>
          </View>
        </View>

        <View style={styles.body}>
          <Typography variant="body" weight="bold" color={colors.text} numberOfLines={1}>
            {product.name}
          </Typography>
          <Typography
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={2}
            style={styles.description}
          >
            {product.description}
          </Typography>

          <View style={styles.bottomRow}>
            <Typography variant="h4" weight="bold" color={colors.primaryLight}>
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
    width: 200,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  horizontalImage: {
    width: 110,
    height: 110,
    backgroundColor: colors.surfaceVariant,
  },
  horizontalContent: {
    flex: 1,
    padding: spacing.md,
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
