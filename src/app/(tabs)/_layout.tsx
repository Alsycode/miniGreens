import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';

const TABS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'index',         label: 'Home',    icon: 'home' },
  { name: 'explore',       label: 'Search',  icon: 'search' },
  { name: 'orders',        label: 'Orders',   icon: 'receipt' },
  { name: 'subscriptions', label: 'Rewards',  icon: 'gift' },
  { name: 'profile',       label: 'Profile',  icon: 'person' },
];

function BottomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.barWrap}>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab, index) => {
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
        };
        const tint = focused ? colors.primary : colors.textTertiary;

        return (
          <Pressable key={tab.name} onPress={onPress} style={styles.item}>
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? tab.icon : (`${tab.icon}-outline` as any)}
                size={22}
                color={tint}
              />
            </View>
            <Typography variant="caption" color={tint} weight={focused ? 'semibold' : 'regular'} style={styles.label}>
              {tab.label}
            </Typography>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"         options={{ title: 'Home' }} />
      <Tabs.Screen name="explore"       options={{ title: 'Explore' }} />
      <Tabs.Screen name="orders"        options={{ title: 'Orders' }} />
      <Tabs.Screen name="subscriptions" options={{ title: 'Rewards' }} />
      <Tabs.Screen name="profile"       options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'relative',
  },
  bar: {
    flexDirection: 'row',
    // A defined dark layer that sits above the content — depth comes from the
    // top hairline + soft upward shadow, not from being see-through.
    backgroundColor: 'rgba(12,16,13,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 46,
    height: 30,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(150,255,31,0.14)',
  },
  label: {
    fontSize: 10,
  },
});
