import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from './Typography';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral';

const TONES: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: colors.successLight, fg: colors.primaryDark },
  warning: { bg: colors.warningLight, fg: '#9A5E0C' },
  danger: { bg: colors.errorLight, fg: colors.error },
  info: { bg: colors.infoLight, fg: '#2A62A6' },
  brand: { bg: colors.accentSurface, fg: colors.primaryDark },
  neutral: { bg: colors.surfaceVariant, fg: colors.textSecondary },
};

/** Maps order / subscription / partner statuses to one consistent colour language. */
export function statusTone(status: string | null | undefined): StatusTone {
  switch ((status ?? '').toLowerCase()) {
    case 'delivered':
    case 'approved':
    case 'active':
    case 'paid':
    case 'confirmed':
      return 'success';
    case 'pending':
    case 'processing':
    case 'paused':
      return 'warning';
    case 'shipped':
    case 'out_for_delivery':
      return 'info';
    case 'cancelled':
    case 'rejected':
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
}

interface StatusPillProps {
  /** Text shown in the pill. */
  label: string;
  /** Pass a status string and the tone is derived, or set `tone` explicitly. */
  status?: string | null;
  tone?: StatusTone;
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ label, status, tone, style }: StatusPillProps) {
  const t = TONES[tone ?? statusTone(status)];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: t.fg }]} />
      <Typography variant="caption" weight="semibold" color={t.fg} style={styles.text}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { textTransform: 'capitalize' },
});
