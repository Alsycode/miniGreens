import React from 'react';
import { Image, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from '../ui/Typography';
import { Category } from '../../types';
import { resolveImageSource } from '../../utils/placeholders';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  index?: number;
}

export function CategoryCard({ category, onPress, index = 0 }: CategoryCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 70).springify().damping(31)}
      style={[styles.container, animStyle]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 31, stiffness: 220 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 31, stiffness: 220 });
        }}
        style={styles.pressable}
      >
        <Image source={resolveImageSource(category.image)} style={styles.image} />
        <LinearGradient
          colors={['transparent', category.color + 'DD']}
          style={styles.gradient}
        />
        <Typography
          variant="bodySmall"
          weight="semibold"
          color={colors.textInverse}
          style={styles.label}
        >
          {category.name}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 170,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginRight: spacing.md,
    ...shadows.md,
  },
  pressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
});
