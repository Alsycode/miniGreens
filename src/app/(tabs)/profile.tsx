import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { profile as mockProfile } from '../../mock';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

function getMenuSections(role: string | undefined): { title: string; items: MenuItem[] }[] {
  const partnerItem: MenuItem =
    role === 'partner'
      ? { icon: 'briefcase-outline', label: 'Partner Dashboard', route: '/partner/dashboard' }
      : { icon: 'briefcase-outline', label: 'Become an MGC Partner', route: '/partner/apply' };

  return [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', route: '/profile/edit' },
        { icon: 'location-outline', label: 'Saved Addresses', route: '/profile/addresses' },
        { icon: 'pricetag-outline', label: 'My Offers', route: '/offers' },
        { icon: 'calendar-outline', label: 'My Subscription', route: '/subscription/manage' },
        partnerItem,
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: 'settings-outline', label: 'Settings', route: '/profile/settings' },
        { icon: 'information-circle-outline', label: 'About', route: '/profile/about' },
        { icon: 'call-outline', label: 'Contact Us', route: '/profile/contact' },
        { icon: 'help-circle-outline', label: 'FAQ', route: '/profile/faq' },
      ],
    },
  ];
}

// ─── Pressable Menu Row ───────────────────────────────────────────────────────

function MenuRow({
  item,
  isLast,
  delay,
}: {
  item: MenuItem;
  isLast: boolean;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(31)}
      style={animStyle}
    >
      <Pressable
        style={[styles.menuItem, !isLast && styles.menuItemBorder]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(item.route as any);
        }}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 31, stiffness: 220 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 31, stiffness: 220 }); }}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIconBg}>
            <Ionicons name={item.icon} size={20} color={colors.primary} />
          </View>
          <Typography variant="body" color={colors.text} style={styles.menuItemLabel}>
            {item.label}
          </Typography>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const authProfile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  let itemDelay = 280;

  const displayName = authProfile?.full_name || mockProfile.fullName;
  const displayEmail = authProfile?.email || session?.user.email || mockProfile.email;
  const displayAvatar = authProfile?.avatar || mockProfile.avatar;
  const menuSections = getMenuSections(authProfile?.role);

  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [addressCount, setAddressCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const uid = authProfile?.id ?? session?.user.id;
      if (!uid) return;
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', uid)
        .then(({ count }) => setOrderCount(count ?? 0));
      supabase
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', uid)
        .then(({ count }) => setAddressCount(count ?? 0));
    }, [authProfile?.id, session?.user.id])
  );

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animated.View
          entering={FadeInUp.delay(40).springify().damping(31)}
          style={styles.profileHeader}
        >
          <Animated.View entering={ZoomIn.delay(80).springify().damping(15)}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            </View>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(180).springify().damping(31)} style={styles.profileInfo}>
            <Typography variant="h3" color={colors.text} style={styles.profileName}>
              {displayName}
            </Typography>
            <Typography variant="body" color={colors.textSecondary}>
              {displayEmail}
            </Typography>
          </Animated.View>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInUp.delay(220).springify().damping(31)}
          style={styles.statsRow}
        >
          {[
            { label: 'Orders', value: orderCount === null ? '–' : String(orderCount) },
            { label: 'Addresses', value: addressCount === null ? '–' : String(addressCount) },
            { label: 'Reviews', value: '0' },
          ].map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Typography variant="h4" color={colors.primaryDark} weight="bold">
                {stat.value}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {stat.label}
              </Typography>
            </View>
          ))}
        </Animated.View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => {
          return (
            <View key={sectionIndex} style={styles.menuSection}>
              <Animated.View
                entering={FadeInUp.delay(itemDelay).springify().damping(31)}
              >
                <Typography
                  variant="bodySmall"
                  color={colors.textTertiary}
                  uppercase
                  weight="medium"
                  style={styles.menuTitle}
                >
                  {section.title}
                </Typography>
              </Animated.View>
              <Card padding="none" style={styles.menuCard}>
                {section.items.map((item, itemIndex) => {
                  const d = itemDelay + (itemIndex + 1) * 60;
                  return (
                    <MenuRow
                      key={itemIndex}
                      item={item}
                      isLast={itemIndex === section.items.length - 1}
                      delay={d}
                    />
                  );
                })}
              </Card>
              {(() => { itemDelay += (section.items.length + 1) * 60; return null; })()}
            </View>
          );
        })}

        {/* Logout */}
        <Animated.View entering={FadeInUp.delay(640).springify().damping(31)}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Typography variant="body" color={colors.error} weight="semibold">
              Sign Out
            </Typography>
          </Pressable>
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
  scrollContent: {
    paddingBottom: spacing['8xl'],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primaryBg,
    padding: 3,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    backgroundColor: colors.border,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
  menuTitle: {
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    marginLeft: spacing.md,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginTop: spacing.lg,
  },
});
