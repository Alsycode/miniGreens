import React, { useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { ProductCard } from '../../components/product/ProductCard';
import { Loading } from '../../components/ui/Loading';
import { useProduct, useProducts } from '../../services/catalog';
import { resolveImageSource } from '../../utils/placeholders';
import { useCartStore } from '../../store/useCartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const cartCount = useCartStore((s) => s.items.length);

  const quantityScale = useSharedValue(1);
  const quantityAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: quantityScale.value }],
  }));

  const { data: product, isLoading } = useProduct(id);
  const { products: allProducts } = useProducts();
  const relatedProducts = allProducts.filter(
    (p) => p.categoryId === product?.categoryId && p.id !== product?.id
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Loading fullScreen message="Loading product..." />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Typography variant="h4" color={colors.text}>Product not found</Typography>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">Details</Typography>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/cart');
          }}
        >
          <View>
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Typography style={styles.cartBadgeText} color={colors.textInverse}>
                  {cartCount}
                </Typography>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Animated.View entering={FadeInUp.springify().damping(34).stiffness(180)}>
          <View style={styles.imageContainer}>
            <Image
              source={resolveImageSource(product.images[selectedImage])}
              style={styles.mainImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(10,36,22,0.28)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
            />
            {discountPct && (
              <Animated.View
                entering={ZoomIn.delay(200).springify().damping(17)}
                style={styles.discountBadge}
              >
                <Typography variant="caption" color={colors.textInverse} weight="bold">
                  -{discountPct}%
                </Typography>
              </Animated.View>
            )}
            <View style={styles.imageDots}>
              {product.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.imageDot,
                    index === selectedImage && styles.imageDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={styles.content}>
          {/* Title & Price */}
          <Animated.View entering={FadeInUp.delay(80).springify().damping(31)} style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={colors.primary} weight="medium" uppercase>
                {product.unit}
              </Typography>
              <Typography variant="h3" color={colors.text} style={styles.productName}>
                {product.name}
              </Typography>
            </View>
          </Animated.View>

          <Animated.View
            entering={ZoomIn.delay(200).springify().damping(17)}
            style={styles.priceRow}
          >
            <View style={styles.pricePill}>
              <Typography variant="h2" color={colors.accent}>
                ₹{product.price.toFixed(2)}
              </Typography>
            </View>
            {product.originalPrice && (
              <Typography variant="body" color={colors.textTertiary} style={styles.originalPrice}>
                ₹{product.originalPrice.toFixed(2)}
              </Typography>
            )}
          </Animated.View>

          {product.isPreorder && (
            <Animated.View entering={FadeInUp.delay(230).springify().damping(31)} style={styles.preorderNote}>
              <Ionicons name="time-outline" size={15} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} weight="semibold" style={{ marginLeft: spacing.xs }}>
                Available for pre-order — reserve yours now
              </Typography>
            </Animated.View>
          )}

          {/* Rating */}
          <Animated.View entering={FadeInUp.delay(260).springify().damping(31)} style={styles.ratingRow}>
            <View style={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.round(product.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color={colors.secondary}
                />
              ))}
            </View>
            <Typography variant="bodySmall" color={colors.textSecondary}>
              {product.rating} ({product.reviewCount} reviews)
            </Typography>
          </Animated.View>

          {/* Quantity Selector */}
          <Animated.View
            entering={FadeInUp.delay(320).springify().damping(31)}
            style={styles.quantitySection}
          >
            <Typography variant="bodySmall" weight="semibold">Quantity</Typography>
            <View style={styles.quantitySelector}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity(Math.max(1, quantity - 1));
                  quantityScale.value = withSequence(
                    withSpring(0.85, { damping: 17 }),
                    withSpring(1, { damping: 20 })
                  );
                }}
              >
                <Ionicons name="remove" size={20} color={colors.primaryDark} />
              </Pressable>
              <Animated.View style={quantityAnimStyle}>
                <Typography variant="h4" weight="bold" style={styles.quantityValue} color={colors.accent}>
                  {quantity}
                </Typography>
              </Animated.View>
              <Pressable
                style={styles.quantityButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity(quantity + 1);
                  quantityScale.value = withSequence(
                    withSpring(1.25, { damping: 14 }),
                    withSpring(1, { damping: 20 })
                  );
                }}
              >
                <Ionicons name="add" size={20} color={colors.primaryDark} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(380).springify().damping(31)}>
            <Typography variant="body" color={colors.textSecondary} style={styles.description}>
              {product.description}
            </Typography>
          </Animated.View>

          {/* Nutrition */}
          <Animated.View entering={FadeInUp.delay(420).springify().damping(31)} style={styles.section}>
            <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
              Nutrition Information
            </Typography>
            <View style={styles.nutritionGrid}>
              {[
                { label: 'Calories', value: `${product.nutrition.calories}` },
                { label: 'Protein', value: product.nutrition.protein },
                { label: 'Carbs', value: product.nutrition.carbs },
                { label: 'Fat', value: product.nutrition.fat },
                { label: 'Fiber', value: product.nutrition.fiber },
              ].map((item, index) => (
                <View key={index} style={styles.nutritionItem}>
                  <Typography variant="h4" color={colors.accent} weight="bold">
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {item.label}
                  </Typography>
                </View>
              ))}
            </View>
            <View style={styles.vitamins}>
              <Typography variant="bodySmall" weight="semibold">Vitamins & Minerals: </Typography>
              <Typography variant="bodySmall" color={colors.textSecondary}>
                {product.nutrition.vitamins.join(', ')}
              </Typography>
            </View>
          </Animated.View>

          {/* Benefits */}
          <Animated.View entering={FadeInUp.delay(460).springify().damping(31)} style={styles.section}>
            <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
              Benefits
            </Typography>
            {product.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Typography variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: spacing.sm }}>
                  {benefit}
                </Typography>
              </View>
            ))}
          </Animated.View>

          {/* Storage */}
          <Animated.View entering={FadeInUp.delay(500).springify().damping(31)} style={styles.section}>
            <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
              Storage Instructions
            </Typography>
            <View style={styles.storageCard}>
              <Ionicons name="snow-outline" size={20} color={colors.primary} />
              <Typography variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: spacing.sm, flex: 1 }}>
                {product.storage}
              </Typography>
            </View>
          </Animated.View>

          {/* Consumption Tips */}
          <Animated.View entering={FadeInUp.delay(540).springify().damping(31)} style={styles.section}>
            <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
              How to Enjoy
            </Typography>
            {product.consumptionTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Typography variant="caption" color={colors.primary} weight="bold">
                    {String(index + 1).padStart(2, '0')}
                  </Typography>
                </View>
                <Typography variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: spacing.md }}>
                  {tip}
                </Typography>
              </View>
            ))}
          </Animated.View>

          {/* Tags */}
          <Animated.View entering={FadeInUp.delay(580).springify().damping(31)} style={styles.tagsSection}>
            {product.tags.map((tag, index) => (
              <Chip key={index} label={tag} variant="outlined" color={colors.primary} />
            ))}
          </Animated.View>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <Animated.View entering={FadeInUp.delay(620).springify().damping(31)} style={styles.section}>
              <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
                You May Also Like
              </Typography>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant="compact"
                    index={i}
                    onPress={() => router.push(`/product/${p.slug}`)}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInUp.delay(140).springify().damping(34)}
        style={[styles.bottomCTA, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <View style={styles.totalPrice}>
          <Typography variant="caption" color={colors.textTertiary}>Total</Typography>
          <Typography variant="h3" color={colors.accent}>
            ₹{(product.price * quantity).toFixed(2)}
          </Typography>
        </View>
        {product.isPreorder ? (
          <Button
            title="Pre-order"
            variant="primary"
            size="lg"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/preorder/${product.slug}?qty=${quantity}`);
            }}
          />
        ) : (
          <Button
            title="Add to Cart"
            variant="primary"
            size="lg"
            disabled={adding}
            onPress={async () => {
              setAdding(true);
              const ok = await useCartStore.getState().addItemBySlug(product.slug, quantity);
              setAdding(false);
              if (ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.push('/cart');
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            }}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    backgroundColor: colors.surfaceVariant,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  imageDots: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  imageDotActive: {
    width: 24,
    backgroundColor: colors.textInverse,
  },
  content: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  pricePill: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  preorderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    marginHorizontal: spacing.lg,
    minWidth: 24,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.xl,
    lineHeight: 24,
  },
  section: {
    marginTop: spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  nutritionItem: {
    width: '18%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.md,
  },
  vitamins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
  },
  relatedScroll: {
    paddingRight: spacing.lg,
  },
  bottomCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.lg,
  },
  totalPrice: {},
});
