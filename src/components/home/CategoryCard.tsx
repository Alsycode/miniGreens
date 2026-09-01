import React from 'react';
import { View, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
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
      entering={FadeInUp.delay(index * 70).springify().damping(31).mass(1).stiffness(100)}
      style={[styles.wrap, animStyle]}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 31, stiffness: 220, mass: 1 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 31, stiffness: 220, mass: 1 }); }}
        style={[styles.card, active && styles.cardActive]}
      >
        <Image source={resolveImageSource(category.image)} style={styles.image} resizeMode="cover" />
        {/* Fade the image's left edge into the card surface so there's no hard
            seam. Stop colours track the active/idle surface tokens. */}
        <LinearGradient
          colors={
            active
              ? ['rgba(22,40,27,1)', 'rgba(22,40,27,0.94)', 'rgba(22,40,27,0)']
              : ['rgba(20,26,21,1)', 'rgba(20,26,21,0.92)', 'rgba(20,26,21,0)']
          }
          locations={[0, 0.46, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.iconChip}>
          <Ionicons
            name={(category.icon || 'leaf') as any}
            size={13}
            color={active ? colors.primary : colors.textTertiary}
          />
        </View>
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
      {active && <View style={styles.underlineActive} />}
    </Animated.View>
  );
}

// Size the tiles so ALL FOUR categories (incl. the local "Bowls" tile) fit fully
// within the row at once — page padding on the left, one gap per tile.
const ROW_W = Dimensions.get('window').width;
const GAP = spacing.xs + 2; // 6
const CARD_W = Math.floor((ROW_W - spacing.lg - GAP * 4) / 4);
const CARD_H = Math.round(CARD_W * 0.9);

const styles = StyleSheet.create({
  wrap: {
    marginRight: GAP,
    alignItems: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 3,
  },
  iconChip: {
    position: 'absolute',
    top: spacing.xs + 2,
    left: spacing.xs + 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: CARD_H,
    width: CARD_W * 0.62,
  },
  label: {
    position: 'absolute',
    left: spacing.xs + 2,
    bottom: spacing.xs + 2,
    right: spacing.xs,
    zIndex: 2,
    fontSize: 11,
    lineHeight: 14,
  },
  underlineActive: {
    marginTop: 6,
    height: 3,
    width: 22,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
