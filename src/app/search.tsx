import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme';
import { Typography } from '../components/ui/Typography';
import { SearchBar } from '../components/ui/SearchBar';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { PressableScale } from '../components/ui/PressableScale';
import { Screen } from '../components/layout/Screen';
import { HeaderIconButton } from '../components/layout/ScreenHeader';
import { useProducts, useCategories } from '../services/catalog';
import { useAppStore } from '../store/useAppStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const recentSearches = useAppStore((s) => s.searchHistory);
  const addSearchHistory = useAppStore((s) => s.addSearchHistory);
  const clearSearchHistory = useAppStore((s) => s.clearSearchHistory);
  const { products, isLoading } = useProducts();
  const { categories } = useCategories();

  // Suggestions come from the live catalogue: category names, then best-seller names.
  const suggestions = React.useMemo(() => {
    const names = [
      ...categories.map((c) => c.name),
      ...products.filter((p) => p.isBestSeller).map((p) => p.name.replace(/\s*\(.*\)\s*$/, '')),
    ];
    return Array.from(new Set(names)).slice(0, 6);
  }, [categories, products]);

  const recordSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (q) addSearchHistory(q);
    },
    [addSearchHistory]
  );

  const searchResults = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleProductPress = useCallback((slug: string) => {
    router.push(`/product/${slug}`);
  }, []);

  return (
    <Screen showBack={false} scroll={false} bleed>
      {/* Back button + Home-style search pill */}
      <Animated.View entering={FadeInUp.delay(40).springify().damping(31).mass(1).stiffness(100)} style={styles.searchRow}>
        <HeaderIconButton icon="arrow-back" onPress={() => router.back()} label="Go back" />
        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={() => recordSearch(query)}
            onClear={() => setQuery('')}
            placeholder="Search products..."
            autoFocus
          />
        </View>
      </Animated.View>

      {query.length === 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Animated.View entering={FadeInUp.delay(80).springify().damping(31).mass(1).stiffness(100)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Typography variant="bodySmall" color={colors.textTertiary} uppercase weight="medium">
                  Recent
                </Typography>
                <PressableScale
                  onPress={clearSearchHistory}
                  scaleTo={0.96}
                  haptic={false}
                  accessibilityLabel="Clear recent searches"
                >
                  <Typography variant="caption" color={colors.primary} weight="semibold">
                    Clear
                  </Typography>
                </PressableScale>
              </View>
              {recentSearches.map((search, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(100 + index * 60).springify().damping(31).mass(1).stiffness(100)}
                >
                  <PressableScale
                    style={styles.recentItem}
                    haptic={false}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQuery(search);
                      recordSearch(search);
                    }}
                  >
                    <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
                    <Typography variant="body" color={colors.textSecondary} style={{ marginLeft: spacing.md }}>
                      {search}
                    </Typography>
                  </PressableScale>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Suggestions */}
          <Animated.View entering={FadeInUp.delay(280).springify().damping(31).mass(1).stiffness(100)} style={styles.section}>
            <Typography variant="bodySmall" color={colors.textTertiary} uppercase weight="medium" style={styles.suggestionsTitle}>
              Suggestions
            </Typography>
            <View style={styles.suggestionsGrid}>
              {suggestions.map((suggestion, i) => (
                <Animated.View
                  key={suggestion}
                  entering={ZoomIn.delay(300 + i * 40).springify().damping(24).mass(1).stiffness(100)}
                >
                  <PressableScale
                    style={styles.suggestionChip}
                    scaleTo={0.96}
                    haptic={false}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQuery(suggestion);
                      recordSearch(suggestion);
                    }}
                  >
                    <Typography variant="bodySmall" color={colors.primary} weight="medium">
                      {suggestion}
                    </Typography>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      ) : isLoading ? (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.productWrapper}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : searchResults.length > 0 ? (
        <ScrollView contentContainerStyle={styles.resultsContainer} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInUp.springify().damping(31).mass(1).stiffness(100)}>
            <Typography variant="bodySmall" color={colors.textTertiary} style={styles.resultsCount}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </Typography>
          </Animated.View>
          <View style={styles.resultsGrid}>
            {searchResults.map((product, i) => (
              <Animated.View
                key={product.id}
                entering={FadeInUp.delay(i * 60).springify().damping(31).mass(1).stiffness(100)}
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
        </ScrollView>
      ) : (
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={`Nothing matched "${query}". Try a different search.`}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  searchWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  suggestionsTitle: {
    marginBottom: spacing.md,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultsContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['8xl'],
  },
  resultsCount: {
    marginBottom: spacing.lg,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  gridCard: {
    width: '100%',
    marginRight: 0,
  },
});
