import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export default function IndexScreen() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isAuthLoading) return;
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else if (!session) {
        router.replace('/auth/login');
      } else {
        router.replace('/(tabs)');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, session, isAuthLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
  },
});
