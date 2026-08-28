import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';
import { Typography } from './Typography';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export function Loading({ message, fullScreen = false, size = 'large', style }: LoadingProps) {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Typography variant="body" color={colors.textSecondary} style={styles.message}>
          {message}
        </Typography>
      )}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: spacing.lg,
  },
});
