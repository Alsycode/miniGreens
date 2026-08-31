import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme';
import { Typography } from '../components/ui/Typography';
import { SearchBar } from '../components/ui/SearchBar';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { searchSuggestions } from '../mock';
import { useProducts } from '../services/catalog';
import { useAppStore } from '../store/useAppStore';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const recentSearches = useAppStore((s) => s.searchHistory);
  const addSearchHistory = useAppStore((s) => s.addSearchHistory);
  const clearSearchHistory = useAppStore((s) => s.clearSearchHistory);
  const { products, isLoading } = useProducts();

  const recordSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (q) addSearchHistory(q);
    },
    [addSearchHistory]
  );

  const headerScale = useSharedValue(1);
  const headerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, headerAnimStyle]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Animated.View
            entering={FadeInUp.delay(40).springify().damping(31)}
            style={styles.searchWrapper}
          >
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmit={() => recordSearch(query)}
              onClear={() => setQuery('')}
              placeholder="Search products..."
              autoFocus
            />
          </Animated.View>
        </View>
      </Animated.View>

      {query.length === 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Animated.View entering={FadeInUp.delay(80).springify().damping(31)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Typography variant="bodySmall" color={colors.textTertiary} uppercase weight="medium">
                  Recent
                </Typography>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    clearSearchHistory();
                  }}
                >
                  <Typography variant="caption" color={colors.primary}>
                    Clear
                  </Typography>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(100 + index * 60).springify().damping(31)}
                >
                  <Pressable
                    style={styles.recentItem}
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
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Suggestions */}
          <Animated.View entering={FadeInUp.delay(280).springify().damping(31)} style={styles.section}>
            <Typography
              variant="bodySmall"
              color={colors.textTertiary}
              uppercase
              weight="medium"
              style={styles.suggestionsTitle}
            >
              Suggestions
            </Typography>
            <View style={styles.suggestionsGrid}>
              {searchSuggestions.slice(0, 6).map((suggestion, i) => (
                <Animated.View
                  key={suggestion.id}
                  entering={ZoomIn.delay(300 + i * 40).springify().damping(24)}
                >
                  <Pressable
                    style={styles.suggestionChip}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQuery(suggestion.text);
                      recordSearch(suggestion.text);
                    }}
                  >
                    <Typography variant="bodySmall" color={colors.primary} weight="medium">
                      {suggestion.text}
                    </Typography>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      ) : isLoading ? (
        <Loading message="Searching..." />
      ) : searchResults.length > 0 ? (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <Animated.View entering={FadeInUp.springify().damping(31)}>
            <Typography variant="bodySmall" color={colors.textTertiary} style={styles.resultsCount}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
            </Typography>
          </Animated.View>
          <View style={styles.resultsGrid}>
            {searchResults.map((product, i) => (
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
        </ScrollView>
      ) : (
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={`Nothing matched "${query}". Try a different search.`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
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
    borderRadius: borderRadius.full,
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
    height: 280,
    marginRight: 0,
  },
});
