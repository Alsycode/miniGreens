import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { useProducts, useCategories } from '../../services/catalog';

// ─── Animated Filter Chip ─────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  index: number;
}

function FilterChip({ label, selected, onPress, index }: FilterChipProps) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    bgOpacity.value = withTiming(selected ? 1 : 0, { duration: 220 });
    if (selected) {
      scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
      scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    }
  }, [selected]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(index * 40).springify().damping(24)}
      style={[chipStyle, styles.chipOuter]}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          scale.value = withSpring(0.94, { damping: 31, stiffness: 300 });
          setTimeout(() => {
            scale.value = withSpring(1, { damping: 20, stiffness: 220 });
          }, 80);
          onPress();
        }}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.chipFill, fillStyle]} />
        <Typography
          variant="bodySmall"
          color={selected ? colors.textInverse : colors.textSecondary}
          weight={selected ? 'semibold' : 'regular'}
        >
          {label}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

// ─── Sort Chip ────────────────────────────────────────────────────────────────

function SortChip({ label, selected, onPress, index }: FilterChipProps) {
  const scale = useSharedValue(1);

  return (
    <Animated.View
      entering={ZoomIn.delay(index * 40).springify().damping(24)}
      style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          scale.value = withSpring(0.94, { damping: 31, stiffness: 300 });
          setTimeout(() => { scale.value = withSpring(1, { damping: 20, stiffness: 220 }); }, 80);
          onPress();
        }}
        style={[styles.sortChip, selected && styles.sortChipSelected]}
      >
        <Typography
          variant="bodySmall"
          color={selected ? colors.primary : colors.textSecondary}
          weight={selected ? 'semibold' : 'regular'}
        >
          {label}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');

  const { products, isLoading, isError, error, refetch } = useProducts();
  const { categories } = useCategories();

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.reviewCount - a.reviewCount;
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      default: return 0;
    }
  });

  const handleProductPress = useCallback((slug: string) => {
    router.push(`/product/${slug}`);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInUp.springify().damping(31)}
        style={styles.header}
      >
        <Typography variant="h3" color={colors.accent}>
          Explore
        </Typography>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/search');
          }}
        >
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <FilterChip
            label="All"
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            index={0}
          />
          {categories.map((cat, i) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              index={i + 1}
            />
          ))}
        </ScrollView>

        {/* Sort Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          {([
            { key: 'popular', label: 'Most Popular' },
            { key: 'newest', label: 'Newest' },
            { key: 'price-low', label: 'Price: Low' },
            { key: 'price-high', label: 'Price: High' },
          ] as const).map((option, i) => (
            <SortChip
              key={option.key}
              label={option.label}
              selected={sortBy === option.key}
              onPress={() => setSortBy(option.key)}
              index={i}
            />
          ))}
        </ScrollView>

        {isError && (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <ErrorNotice
              message={(error as Error)?.message ?? 'Could not load products.'}
              onDismiss={() => refetch()}
            />
          </View>
        )}

        {isLoading && <Loading message="Loading products..." />}

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {sortedProducts.map((product, i) => (
            <Animated.View
              key={product.id}
              entering={FadeInUp.delay(i * 60).springify().damping(31)}
              style={styles.productWrapper}
            >
              <ProductCard
                product={product}
                index={i}
                onPress={() => handleProductPress(product.slug)}
                style={styles.gridCard}
              />
            </Animated.View>
          ))}
        </View>

        {!isLoading && !isError && sortedProducts.length === 0 && (
          <View style={styles.emptyState}>
            <EmptyState
              icon="search-outline"
              title="No Products Found"
              message="Try a different category or filter."
            />
          </View>
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
    paddingVertical: spacing.lg,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sortScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
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
  emptyState: {
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Chips
  chipOuter: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  chipSelected: {
    borderColor: colors.primary,
  },
  chipFill: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sortChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
});
