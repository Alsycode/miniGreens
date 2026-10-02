import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from './ScreenHeader';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Large display title (hub / tab-style screens). */
  largeTitle?: boolean;
  /** Show the circular back button. Default true; pass false for tab roots. */
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  /** Scrollable body (default). Pass false when the screen owns its own list. */
  scroll?: boolean;
  /** Sticky footer, usually a <BottomActionBar>. */
  footer?: React.ReactNode;
  /** Extra bottom room so content clears the floating tab bar. */
  hasTabBar?: boolean;
  /** Lift content above the keyboard (forms). */
  keyboardAvoiding?: boolean;
  /** Remove the 16px side gutters (full-bleed lists). */
  bleed?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<any>;
}

/**
 * Standard screen shell, matching Home: pale-green canvas, safe-area top, 16px gutters,
 * a ScreenHeader, a scrollable body and an optional sticky footer.
 */
export function Screen({
  children,
  title,
  subtitle,
  largeTitle = false,
  showBack = true,
  onBack,
  headerRight,
  scroll = true,
  footer,
  hasTabBar = false,
  keyboardAvoiding = false,
  bleed = false,
  contentContainerStyle,
  refreshControl,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const hasHeader = !!title || showBack || !!headerRight;

  const bottomPad = footer ? spacing.xl : hasTabBar ? 120 : spacing['4xl'];

  const body = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={[
        { paddingHorizontal: bleed ? 0 : spacing.lg, paddingBottom: bottomPad },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, { paddingHorizontal: bleed ? 0 : spacing.lg }, contentContainerStyle]}>{children}</View>
  );

  const content = (
    <>
      {hasHeader ? (
        <ScreenHeader
          title={title}
          subtitle={subtitle}
          large={largeTitle}
          showBack={showBack}
          onBack={onBack}
          right={headerRight}
        />
      ) : null}
      {body}
      {footer}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
});
