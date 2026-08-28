import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function FloatingIcon({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1300 }),
        withTiming(4, { duration: 1300 })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(translateY);
    };
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, floatStyle]}>
      <View style={styles.iconBg}>
        <Ionicons name={icon} size={52} color={colors.primary} />
      </View>
    </Animated.View>
  );
}

export function EmptyState({
  icon = 'search-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(80).springify().damping(31)}
      style={styles.container}
    >
      <FloatingIcon icon={icon} />
      <Animated.View entering={FadeInUp.delay(200).springify().damping(31)}>
        <Typography variant="h4" color={colors.text} align="center" style={styles.title}>
          {title}
        </Typography>
      </Animated.View>
      {message && (
        <Animated.View entering={FadeInUp.delay(280).springify().damping(31)}>
          <Typography
            variant="body"
            color={colors.textSecondary}
            align="center"
            style={styles.message}
          >
            {message}
          </Typography>
        </Animated.View>
      )}
      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.delay(360).springify().damping(31)}>
          <Button
            title={actionLabel}
            variant="primary"
            size="md"
            onPress={onAction}
            style={styles.button}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    minWidth: 160,
  },
});
