import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Scale while pressed. Home uses 0.98 for rows and 0.96 for buttons. */
  scaleTo?: number;
  /** Light haptic tap on press. */
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Style for the animated wrapper (use for flex: 1 inside rows). */
  wrapperStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  hitSlop?: number;
}

const SPRING = { damping: 31, stiffness: 220, mass: 1 };

/** Home's press feedback in one place: spring scale + optional haptic. */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled = false,
  scaleTo = 0.98,
  haptic = true,
  style,
  wrapperStyle,
  accessibilityLabel,
  hitSlop,
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[wrapperStyle, animStyle]}>
      <Pressable
        style={style}
        disabled={disabled}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.();
        }}
        onLongPress={onLongPress}
        onPressIn={() => {
          scale.value = withSpring(scaleTo, SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
