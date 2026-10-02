import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { Typography } from '../ui/Typography';
import { PressableScale } from '../ui/PressableScale';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** "View all"-style link on the right. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Home's section header: title (+ caption) on the left, accent link with arrow on the right. */
export function SectionHeader({ title, subtitle, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.text}>
        <Typography variant="h3" color={colors.textPrimary}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color={colors.textTertiary} style={styles.sub}>
            {subtitle}
          </Typography>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} scaleTo={0.96} style={styles.action}>
          <Typography variant="bodySmall" color={colors.accent} weight="semibold">
            {actionLabel}
          </Typography>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.headingGap,
  },
  text: { flex: 1, paddingRight: spacing.md },
  sub: { marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 6, flexShrink: 0 },
});
