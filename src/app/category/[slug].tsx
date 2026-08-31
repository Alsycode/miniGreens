import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { resolveImageSource } from '../../utils/placeholders';
import { Typography } from '../../components/ui/Typography';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { useCategory, useProducts } from '../../services/catalog';

export default function CategoryScreen() {
  const params = useLocalSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const insets = useSafeAreaInsets();

  const { category, isLoading: categoryLoading } = useCategory(slug);
  const { products, isLoading: productsLoading } = useProducts();
  const categoryProducts = products.filter((p) => p.categoryId === category?.id);

  if (categoryLoading || productsLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Loading fullScreen message="Loading category..." />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon="folder-open-outline"
          title="Category Not Found"
          message="The category you're looking for doesn't exist."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">{category.name}</Typography>
        <View style={styles.backButton} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Hero */}
        <Animated.View entering={FadeInUp.delay(60).springify().damping(34)}>
          <View style={styles.hero}>
            <Image source={resolveImageSource(category.image)} style={styles.heroImage} />
            <LinearGradient
              colors={['transparent', 'rgba(10,36,22,0.82)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0.3 }}
              end={{ x: 0, y: 1 }}
            />
            <Animated.View
              entering={FadeInUp.delay(160).springify().damping(31)}
              style={styles.heroContent}
            >
              <Typography variant="h3" color={colors.textInverse}>
                {category.name}
              </Typography>
              <Typography variant="body" color="rgba(255,255,255,0.82)" style={styles.heroDesc}>
                {category.description}
              </Typography>
              <View style={styles.countPill}>
                <Ionicons name="leaf" size={12} color={colors.secondary} />
                <Typography variant="caption" color={colors.secondary} weight="semibold" style={{ marginLeft: 4 }}>
                  {categoryProducts.length} products
                </Typography>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Products */}
        <View style={styles.productGrid}>
          {categoryProducts.map((product, i) => (
            <Animated.View
              key={product.id}
              entering={FadeInUp.delay(200 + i * 60).springify().damping(31)}
              style={styles.productWrapper}
            >
              <ProductCard
                product={product}
                index={i}
                onPress={() => router.push(`/product/${product.slug}`)}
                style={styles.gridCard}
              />
            </Animated.View>
          ))}
        </View>

        {categoryProducts.length === 0 && (
          <EmptyState
            icon="basket-outline"
            title="No Products Yet"
            message="This category will have products soon."
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroDesc: {
    marginVertical: spacing.sm,
    opacity: 0.85,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(150,255,31,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  gridCard: {
    width: '100%',
    height: 280,
    marginRight: 0,
  },
});
