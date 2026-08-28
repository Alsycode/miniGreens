import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof paddingMap;
  pressable?: boolean;
}

const paddingMap = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
};

export function Card({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'lg',
  pressable = false,
}: CardProps) {
  const scale = useSharedValue(1);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    { padding: paddingMap[padding] },
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const isInteractive = !!onPress || pressable;

  if (isInteractive) {
    return (
      <Animated.View style={wrapStyle}>
        <Pressable
          style={cardStyles}
          onPress={onPress}
          onPressIn={() => {
            scale.value = withSpring(0.97, { damping: 31, stiffness: 220 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 31, stiffness: 220 });
          }}
        >
          <View style={styles.glassEdge} pointerEvents="none" />
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyles}>
      <View style={styles.glassEdge} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
  },
  glassEdge: {
    ...StyleSheet.absoluteFill,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    pointerEvents: 'none',
  },
});
