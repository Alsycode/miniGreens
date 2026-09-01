import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';

interface ToggleSetting {
  type: 'toggle';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  key: string;
}

interface NavSetting {
  type: 'nav';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  route?: string;
}

type SettingItem = ToggleSetting | NavSetting;

const settingSections: { title: string; items: SettingItem[] }[] = [
  {
    title: 'Notifications',
    items: [
      { type: 'toggle', icon: 'notifications-outline', label: 'Push Notifications', key: 'push' },
      { type: 'toggle', icon: 'mail-outline', label: 'Email Updates', subtitle: 'Promos, tips & freshness alerts', key: 'email' },
      { type: 'toggle', icon: 'bicycle-outline', label: 'Order Updates', subtitle: 'Delivery status changes', key: 'orderUpdates' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { type: 'nav', icon: 'language-outline', label: 'Language', value: 'English' },
      { type: 'nav', icon: 'location-outline', label: 'Default Address', value: 'Home' },
      { type: 'toggle', icon: 'moon-outline', label: 'Dark Mode', key: 'darkMode' },
    ],
  },
  {
    title: 'Privacy',
    items: [
      { type: 'nav', icon: 'shield-outline', label: 'Privacy Policy', route: '/profile/privacy' },
      { type: 'nav', icon: 'document-text-outline', label: 'Terms of Service', route: '/profile/terms' },
      { type: 'toggle', icon: 'analytics-outline', label: 'Analytics', subtitle: 'Help us improve the app', key: 'analytics' },
    ],
  },
];

function SettingRow({
  item,
  isLast,
  delay,
  toggleValue,
  onToggle,
}: {
  item: SettingItem;
  isLast: boolean;
  delay: number;
  toggleValue?: boolean;
  onToggle?: (key: string, val: boolean) => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (item.type === 'nav') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (item.route) router.push(item.route as any);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(31).mass(1).stiffness(100)}
      style={animStyle}
    >
      <Pressable
        style={[styles.row, !isLast && styles.rowBorder]}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 31, stiffness: 220, mass: 1 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 31, stiffness: 220, mass: 1 }); }}
        onPress={handlePress}
      >
        <View style={styles.rowIcon}>
          <Ionicons name={item.icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.rowContent}>
          <Typography variant="body" color={colors.text}>{item.label}</Typography>
          {item.type === 'toggle' && item.subtitle && (
            <Typography variant="caption" color={colors.textTertiary}>{item.subtitle}</Typography>
          )}
        </View>
        {item.type === 'toggle' ? (
          <Switch
            value={toggleValue}
            onValueChange={(val) => {
              Haptics.selectionAsync();
              onToggle?.(item.key, val);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        ) : (
          <View style={styles.navRight}>
            {item.value && (
              <Typography variant="caption" color={colors.textTertiary} style={{ marginRight: spacing.sm }}>
                {item.value}
              </Typography>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: false,
    orderUpdates: true,
    darkMode: false,
    analytics: true,
  });

  let rowDelay = 80;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">Settings</Typography>
        <View style={styles.headerButton} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {settingSections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Animated.View entering={FadeInUp.delay(rowDelay).springify().damping(31).mass(1).stiffness(100)}>
              <Typography
                variant="caption"
                weight="semibold"
                color={colors.textTertiary}
                uppercase
                style={styles.sectionTitle}
              >
                {section.title}
              </Typography>
            </Animated.View>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => {
                rowDelay += 60;
                return (
                  <SettingRow
                    key={ii}
                    item={item}
                    isLast={ii === section.items.length - 1}
                    delay={rowDelay}
                    toggleValue={item.type === 'toggle' ? toggles[item.key] : undefined}
                    onToggle={(key, val) => setToggles((prev) => ({ ...prev, [key]: val }))}
                  />
                );
              })}
            </View>
          </View>
        ))}

        <Animated.View
          entering={FadeInUp.delay(rowDelay + 60).springify().damping(31).mass(1).stiffness(100)}
          style={styles.versionRow}
        >
          <Typography variant="caption" color={colors.textTertiary} style={{ textAlign: 'center' }}>
            MiniGreens v1.0.0
          </Typography>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['8xl'],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionRow: {
    marginTop: spacing.xl,
  },
});
