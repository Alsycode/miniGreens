import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { EmptyState } from '../../components/ui/EmptyState';
import { lifestyleArticles } from '../../mock';
import { resolveImageSource } from '../../utils/placeholders';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ArticleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const article = lifestyleArticles.find((a) => a.id === id || a.slug === id);

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Typography variant="body" weight="semibold">Article</Typography>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.notFound}>
          <EmptyState
            icon="reader-outline"
            title="Article not found"
            message="This story may have been moved or removed."
          />
        </View>
      </View>
    );
  }

  const more = lifestyleArticles.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold" numberOfLines={1} style={styles.headerTitle}>
          {article.category}
        </Typography>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image source={resolveImageSource(article.image)} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.85)']}
            locations={[0.35, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.heroText}>
            <View style={styles.categoryPill}>
              <Typography variant="caption" color={colors.secondary} weight="bold" style={styles.categoryPillText}>
                {article.category.toUpperCase()}
              </Typography>
            </View>
            <Typography variant="h3" color={colors.textInverse} style={styles.title}>
              {article.title}
            </Typography>
          </View>
        </View>

        {/* Byline */}
        <View style={styles.byline}>
          <View style={styles.avatar}>
            <Typography variant="bodySmall" weight="bold" color={colors.primaryDark}>
              {article.author.charAt(0)}
            </Typography>
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="bodySmall" weight="semibold" color={colors.text}>
              {article.author}
            </Typography>
            <Typography variant="caption" color={colors.textTertiary}>
              {formatDate(article.publishedAt)} · {article.readTime} read
            </Typography>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Body */}
        <View style={styles.body}>
          {article.content.map((block, i) => (
            <View key={i}>
              {!!block.heading && (
                <Typography variant="body" weight="bold" color={colors.text} style={styles.blockHeading}>
                  {block.heading}
                </Typography>
              )}
              <Typography variant="body" color={colors.textSecondary} style={styles.paragraph}>
                {block.body}
              </Typography>
            </View>
          ))}
        </View>

        {/* More reads */}
        {more.length > 0 && (
          <View style={styles.moreSection}>
            <Typography variant="h4" color={colors.text} style={styles.moreTitle}>
              More reads
            </Typography>
            {more.map((a) => (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                style={styles.moreRow}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push(`/article/${a.id}`);
                }}
              >
                <Image source={resolveImageSource(a.image)} style={styles.moreThumb} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={colors.primary} weight="semibold" uppercase>
                    {a.category}
                  </Typography>
                  <Typography variant="bodySmall" weight="semibold" color={colors.text} numberOfLines={2}>
                    {a.title}
                  </Typography>
                  <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: 2 }}>
                    {a.readTime} read
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: {
    marginHorizontal: spacing.lg,
    height: 240,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroText: {
    padding: spacing.lg,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6,19,13,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(202,239,97,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  categoryPillText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    lineHeight: 30,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  blockHeading: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  paragraph: {
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  moreSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  moreTitle: {
    marginBottom: spacing.md,
  },
  moreRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  moreThumb: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
  },
});
