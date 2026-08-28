import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { onboardingSlides } from '../mock';

const { width, height } = Dimensions.get('window');

// ─── Animated Dot ─────────────────────────────────────────────────────────────

function SliderDot({ isActive }: { isActive: boolean }) {
  const scaleX = useSharedValue(isActive ? 1 : 0.5);
  const opacity = useSharedValue(isActive ? 1 : 0.4);

  useEffect(() => {
    scaleX.value = withSpring(isActive ? 1 : 0.5, { damping: 15, stiffness: 160 });
    opacity.value = withSpring(isActive ? 1 : 0.4, { damping: 31, stiffness: 200 });
  }, [isActive]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, isActive && styles.dotActive, dotStyle]} />;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOnboardingComplete();
    router.replace('/auth/login');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(10,36,22,0.92)']}
              style={styles.gradient}
            />
            <View style={styles.content}>
              <Animated.View entering={FadeInUp.delay(80).springify().damping(31)}>
                <Typography variant="h1" color={colors.textInverse} style={styles.title}>
                  {item.title}
                </Typography>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(160).springify().damping(31)}>
                <Typography variant="body" color="rgba(255,255,255,0.78)" style={styles.subtitle}>
                  {item.subtitle}
                </Typography>
              </Animated.View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.pagination}>
          {onboardingSlides.map((_, index) => (
            <SliderDot key={index} isActive={index === currentIndex} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify().damping(31)} style={styles.buttons}>
          <Button
            title={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
            size="lg"
            fullWidth
          />
          {!isLastSlide && (
            <Button
              title="Skip"
              variant="ghost"
              onPress={handleGetStarted}
              style={styles.skipButton}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  slide: {
    width,
    height,
  },
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
  },
  content: {
    position: 'absolute',
    bottom: height * 0.21,
    left: spacing['2xl'],
    right: spacing['2xl'],
  },
  title: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    lineHeight: 26,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['6xl'],
    paddingTop: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.secondary,
    width: 24,
  },
  buttons: {
    alignItems: 'center',
  },
  skipButton: {
    marginTop: spacing.md,
  },
});
