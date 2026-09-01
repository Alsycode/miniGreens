import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme';
import { Typography } from './Typography';

interface BadgeProps {
  count: number;
  variant?: 'primary' | 'error' | 'success';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ count, variant = 'primary', size = 'sm', style }: BadgeProps) {
  if (count <= 0) return null;

  const bgColor =
    variant === 'primary' ? colors.primary : variant === 'error' ? colors.error : colors.success;
  const dimension = size === 'sm' ? 20 : 24;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(24).stiffness(160).mass(1)}
      style={[styles.base, { width: dimension, height: dimension, backgroundColor: bgColor }, style]}
    >
      <Typography variant="caption" color={colors.textInverse} style={styles.text}>
        {count > 99 ? '99+' : count}
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    lineHeight: 12,
  },
});
