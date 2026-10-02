import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../ui/Typography';
import { PressableScale } from '../ui/PressableScale';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Large display title (DM Serif italic) under the button row, for hub screens. */
  large?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  /** Right-hand slot: an icon button, a link, etc. Keep it 40px high. */
  right?: React.ReactNode;
}

/** Circular icon button, the same 40px hairline-bordered control as Home's bell and bag. */
export function HeaderIconButton({
  icon,
  onPress,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
}) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={styles.iconButton}>
      <Ionicons name={icon} size={20} color={colors.text} />
    </PressableScale>
  );
}

export function ScreenHeader({ title, subtitle, large = false, showBack = true, onBack, right }: ScreenHeaderProps) {
  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack ? <HeaderIconButton icon="arrow-back" onPress={goBack} label="Go back" /> : null}
        </View>
        {!large && title ? (
          <View style={styles.center}>
            <Typography variant="h4" color={colors.text} align="center" numberOfLines={1}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color={colors.textTertiary} align="center" numberOfLines={1}>
                {subtitle}
              </Typography>
            ) : null}
          </View>
        ) : (
          <View style={styles.center} />
        )}
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
      {large && title ? (
        <View style={styles.large}>
          <Typography variant="h2" color={colors.text}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body" color={colors.textSecondary} style={styles.largeSub}>
              {subtitle}
            </Typography>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: { width: 44, alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { marginTop: spacing.lg },
  largeSub: { marginTop: spacing.xs },
});
