import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
      </View>
      <Typography variant="body" color={colors.textSecondary} align="center" style={styles.message}>
        {message}
      </Typography>
      {onRetry && (
        <Button title="Try Again" variant="outline" size="sm" onPress={onRetry} />
      )}
    </View>
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
    marginBottom: spacing.lg,
  },
  message: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
