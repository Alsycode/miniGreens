import React, { useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from './Typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

function SpinnerRing({ color, track }: { color: string; track: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(1, { duration: 800 }), -1, false);
    return () => {
      cancelAnimation(rotation);
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  return (
    <Animated.View
      style={[
        { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: track, borderTopColor: color },
        spinStyle,
      ]}
    />
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  // Filled buttons use the bright green fill → dark label for max contrast (matches design ref).
  const ON_FILL = '#06130D';
  const textColor = isOutline || isGhost ? colors.primary : ON_FILL;
  const textVariant = size === 'lg' ? 'body' : 'bodySmall';
  const spinnerColor = isOutline || isGhost ? colors.primary : ON_FILL;
  const spinnerTrack = isOutline || isGhost ? colors.primaryBg : 'rgba(0,0,0,0.18)';

  const pressableStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`] as ViewStyle,
    variant !== 'ghost' ? (styles[variant] as ViewStyle) : null,
    isOutline ? styles.outlineBorder : null,
    isOutline || isGhost ? styles.noShadow : null,
    fullWidth ? styles.fullWidth : null,
    disabled ? styles.disabled : null,
  ].filter(Boolean) as ViewStyle[];

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, wrapStyle, style]}>
      <Pressable
        style={pressableStyles}
        onPress={() => {
          if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }
        }}
        onPressIn={() => {
          if (!disabled && !loading) {
            scale.value = withSpring(0.96, { damping: 31, stiffness: 220 });
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 31, stiffness: 220 });
        }}
        disabled={disabled || loading}
      >
        {loading ? (
          <SpinnerRing color={spinnerColor} track={spinnerTrack} />
        ) : (
          <>
            {icon}
            <Typography
              variant={textVariant}
              color={textColor}
              weight="semibold"
              style={icon ? { marginLeft: spacing.sm } : undefined}
            >
              {title}
            </Typography>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryDark,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  noShadow: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    minHeight: 56,
  },
});
