import React from 'react';
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
import { Category } from '../../types';
import { resolveImageSource } from '../../utils/placeholders';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  index?: number;
  active?: boolean;
}

export function CategoryCard({ category, onPress, index = 0, active = false }: CategoryCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 70).springify().damping(31)}
      style={[styles.wrap, animStyle]}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 31, stiffness: 220 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 31, stiffness: 220 }); }}
        style={[styles.card, active && styles.cardActive]}
      >
        <View style={styles.iconChip}>
          <Ionicons
            name={(category.icon || 'leaf') as any}
            size={13}
            color={active ? colors.primary : colors.textTertiary}
          />
        </View>
        <Image source={resolveImageSource(category.image)} style={styles.image} />
        <Typography
          variant="caption"
          weight="semibold"
          color={colors.textInverse}
          style={styles.label}
          numberOfLines={1}
        >
          {category.name}
        </Typography>
      </Pressable>
      <View style={[styles.underline, active && styles.underlineActive]} />
    </Animated.View>
  );
}

const CARD_W = 150;
const CARD_H = 92;

const styles = StyleSheet.create({
  wrap: {
    marginRight: spacing.md,
    alignItems: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  iconChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: CARD_W * 0.62,
  },
  label: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    zIndex: 2,
  },
  underline: {
    marginTop: 6,
    height: 3,
    width: 22,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: colors.primary,
  },
});
