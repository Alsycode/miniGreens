import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme';
import { Typography } from '../components/ui/Typography';
import { lifestyleArticles } from '../mock';
import { resolveImageSource } from '../utils/placeholders';

export default function ArticlesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        <Typography variant="body" weight="semibold">Healthy Living</Typography>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Typography variant="caption" color={colors.textTertiary} style={styles.intro}>
          Stories on nutrition, sustainability and feeling good.
        </Typography>

        {lifestyleArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => {
              Haptics.selectionAsync();
              router.push(`/article/${article.id}`);
            }}
          >
            <Image source={resolveImageSource(article.image)} style={styles.image} resizeMode="cover" />
            <View style={styles.cardBody}>
              <View style={styles.pill}>
                <Typography variant="caption" color={colors.secondary} weight="bold" style={styles.pillText}>
                  {article.category.toUpperCase()}
                </Typography>
              </View>
              <Typography variant="body" weight="bold" color={colors.text} numberOfLines={2} style={styles.cardTitle}>
                {article.title}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary} numberOfLines={2} style={styles.excerpt}>
                {article.excerpt}
              </Typography>
              <View style={styles.meta}>
                <Typography variant="caption" color={colors.textTertiary}>
                  {article.readTime} read
                </Typography>
                <Ionicons name="arrow-forward" size={13} color={colors.primary} style={{ marginLeft: 6 }} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  intro: {
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceVariant,
  },
  cardBody: {
    padding: spacing.lg,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6,19,13,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(202,239,97,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  pillText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  cardTitle: {
    lineHeight: 22,
  },
  excerpt: {
    marginTop: spacing.xs,
    lineHeight: 17,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
