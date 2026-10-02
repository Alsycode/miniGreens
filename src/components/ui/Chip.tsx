import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Typography } from './Typography';
import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  variant?: 'filled' | 'outlined';
  color?: string;
  style?: ViewStyle;
}

export function Chip({
  label,
  onPress,
  selected = false,
  variant = 'filled',
  color = colors.primary,
  style,
}: ChipProps) {
  const isSelected = selected;
  const bgColor = variant === 'filled' ? color : 'transparent';
  const textColor = variant === 'filled' ? colors.textInverse : color;
  const borderColor = variant === 'outlined' ? color : 'transparent';

  return (
    <PressableScale
      scaleTo={0.96}
      style={[
        styles.base,
        {
          backgroundColor: isSelected ? bgColor : colors.surfaceVariant,
          borderColor: isSelected ? borderColor : colors.border,
        },
        style,
      ]}
      onPress={onPress}
    >
      <Typography
        variant="bodySmall"
        weight="medium"
        color={isSelected ? textColor : colors.textSecondary}
      >
        {label}
      </Typography>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
});
