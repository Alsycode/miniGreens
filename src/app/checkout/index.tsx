import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInRight,
  FadeInUp,
  ZoomIn,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { useCartStore, cartSubtotal } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { resolveImageSource, getProductPlaceholder } from '../../utils/placeholders';
import type { Database } from '../../types/database';

type Address = Database['public']['Tables']['addresses']['Row'];

type CheckoutStep = 'review' | 'delivery' | 'address';

const STEPS: CheckoutStep[] = ['review', 'delivery', 'address'];
const STEP_INDEX: Record<CheckoutStep, number> = { review: 0, delivery: 1, address: 2 };
const CONNECTOR_WIDTH = 60;
const DELIVERY_FEE = 35.49;

const TIME_SLOTS = ['Morning 8–12', 'Afternoon 12–4', 'Evening 4–8'];

/** Next `count` days as { iso: 'YYYY-MM-DD', label } — iso is what Postgres `date` expects. */
function nextDays(count: number) {
  const out: { iso: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label =
      i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    out.push({ iso, label });
  }
  return out;
}

// ─── Step Dot ────────────────────────────────────────────────────────────────

function StepDot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const isActive = activeIndex >= index;
  const isCompleted = activeIndex > index;

  return (
    <Animated.View style={[styles.stepDot, isActive && styles.stepDotActive]}>
      {isCompleted ? (
        <Ionicons name="checkmark" size={14} color={colors.textInverse} />
      ) : (
        <Typography variant="caption" color={isActive ? colors.textInverse : colors.textTertiary} weight="bold">
          {index + 1}
        </Typography>
      )}
    </Animated.View>
  );
}

function StepConnector({ filled }: { filled: boolean }) {
  const fillWidth = useSharedValue(filled ? CONNECTOR_WIDTH : 0);

  useEffect(() => {
    fillWidth.value = withTiming(filled ? CONNECTOR_WIDTH : 0, { duration: 480, easing: Easing.out(Easing.cubic) });
  }, [filled]);

  const fillStyle = useAnimatedStyle(() => ({ width: fillWidth.value }));

  return (
    <View style={styles.stepConnector}>
      <Animated.View style={[styles.stepConnectorFill, fillStyle]} />
    </View>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  isSelected,
  onSelect,
  index,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(80 + index * 100).springify().damping(31)} style={styles.addressCardOuter}>
      <Pressable onPress={onSelect}>
        <View style={[styles.addressCard, isSelected && styles.addressCardSelected]}>
          <View style={styles.addressHeader}>
            <View style={styles.addressLabelRow}>
              <View style={isSelected ? styles.radioActive : styles.radioInactive}>
                {isSelected && <Animated.View entering={ZoomIn.springify().damping(17)} style={styles.radioDot} />}
              </View>
              <Typography variant="bodySmall" weight="semibold" style={{ marginLeft: spacing.sm }}>
                {address.label}
              </Typography>
            </View>
            {address.is_default && (
              <View style={styles.defaultBadge}>
                <Typography variant="caption" color={colors.primary} weight="bold">DEFAULT</Typography>
              </View>
            )}
          </View>
          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.addressDetails}>
            {address.full_name} · {address.phone}
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>{address.street}</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {address.city}, {address.state} {address.zip_code}
          </Typography>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<CheckoutStep>('review');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const dateOptions = useMemo(() => nextDays(6), []);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const total = subtotal + DELIVERY_FEE;
  const activeIndex = STEP_INDEX[step];

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', profile.id)
        .order('is_default', { ascending: false })
        .then(({ data }) => {
          setAddresses(data ?? []);
          if (data && data.length > 0 && !selectedAddressId) {
            setSelectedAddressId(data[0].id);
          }
        });
    }, [profile])
  );

  function goTo(next: CheckoutStep) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(next);
  }

  async function handlePlaceOrder() {
    if (!profile || items.length === 0) return;
    setOrderError(null);
    if (!selectedAddressId) {
      setOrderError('Please select a delivery address.');
      return;
    }
    setPlacing(true);

    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        profile_id: profile.id,
        status: 'pending',
        subtotal,
        delivery_fee: DELIVERY_FEE,
        total,
        delivery_address_id: selectedAddressId,
        delivery_date: deliveryDate || null,
        delivery_time: deliveryTime || null,
        notes: notes || null,
        order_type: 'standard',
        business_name: null,
        contact_person: null,
      })
      .select()
      .single();

    if (error || !order) {
      setPlacing(false);
      setOrderError(error?.message ?? 'Please try again.');
      return;
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }))
    );

    setPlacing(false);
    if (itemsError) {
      setOrderError(itemsError.message);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearCart();
    router.replace(`/checkout/pay?orderId=${order.id}`);
  }

  const renderStep = () => {
    switch (step) {
      case 'review':
        return (
          <Animated.View key="review" entering={FadeInRight.springify().damping(34).stiffness(180)}>
            <Typography variant="h4" color={colors.text} style={styles.stepTitle}>
              Review Your Order
            </Typography>

            {items.map((item, i) => (
              <Animated.View key={item.productId} entering={FadeInUp.delay(80 + i * 60).springify().damping(31)}>
                <Card style={styles.productCard} variant="outlined" padding="lg">
                  <View style={styles.productRow}>
                    <Image
                      source={resolveImageSource(item.image ?? getProductPlaceholder(item.name))}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Typography variant="body" weight="semibold">{item.name}</Typography>
                      <Typography variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </Typography>
                      <View style={styles.priceTag}>
                        <Typography variant="body" weight="bold" color={colors.primary}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </View>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}

            <View style={styles.orderSummary}>
              <Typography variant="body" weight="semibold" style={styles.summaryTitle}>Order Summary</Typography>
              {[
                { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}` },
                { label: 'Delivery Fee', value: `₹${DELIVERY_FEE.toFixed(2)}` },
                { label: 'Total', value: `₹${total.toFixed(2)}`, bold: true },
              ].map((item, i) => (
                <View key={i} style={[styles.summaryRow, item.bold && styles.summaryRowTotal]}>
                  <Typography variant="bodySmall" color={item.bold ? colors.text : colors.textSecondary} weight={item.bold ? 'semibold' : 'regular'}>
                    {item.label}
                  </Typography>
                  <Typography variant="bodySmall" color={item.bold ? colors.primary : colors.textSecondary} weight={item.bold ? 'bold' : 'regular'}>
                    {item.value}
                  </Typography>
                </View>
              ))}
            </View>

            <Button title="Continue to Delivery" variant="primary" size="lg" fullWidth onPress={() => goTo('delivery')} />
          </Animated.View>
        );

      case 'delivery':
        return (
          <Animated.View key="delivery" entering={FadeInRight.springify().damping(34).stiffness(180)}>
            <Typography variant="h4" color={colors.text} style={styles.stepTitle}>Delivery Information</Typography>

            <Typography variant="bodySmall" weight="semibold" color={colors.text} style={styles.fieldLabel}>Delivery Date</Typography>
            <View style={styles.chipRow}>
              {dateOptions.map((opt) => {
                const selected = deliveryDate === opt.iso;
                return (
                  <Pressable
                    key={opt.iso}
                    onPress={() => { Haptics.selectionAsync(); setDeliveryDate(opt.iso); }}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Typography variant="bodySmall" weight={selected ? 'semibold' : 'regular'} color={selected ? '#06130D' : colors.text}>
                      {opt.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <Typography variant="bodySmall" weight="semibold" color={colors.text} style={styles.fieldLabel}>Preferred Time</Typography>
            <View style={styles.chipRow}>
              {TIME_SLOTS.map((slot) => {
                const selected = deliveryTime === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => { Haptics.selectionAsync(); setDeliveryTime(slot); }}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Typography variant="bodySmall" weight={selected ? 'semibold' : 'regular'} color={selected ? colors.textInverse : colors.text}>
                      {slot}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <TextField label="Notes (Optional)" placeholder="Special instructions..." value={notes} onChangeText={setNotes} leftIcon="chatbubble-outline" multiline />
            <Button
              title="Select Address"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!deliveryDate || !deliveryTime}
              onPress={() => goTo('address')}
            />
            <Button title="Back" variant="ghost" fullWidth onPress={() => goTo('review')} style={styles.backButton} />
          </Animated.View>
        );

      case 'address':
        return (
          <Animated.View key="address" entering={FadeInRight.springify().damping(34).stiffness(180)}>
            <Typography variant="h4" color={colors.text} style={styles.stepTitle}>Delivery Address</Typography>

            {addresses.length === 0 && (
              <Card variant="outlined" padding="lg" style={{ marginBottom: spacing.lg }}>
                <Typography variant="bodySmall" color={colors.textSecondary}>
                  No saved addresses yet.
                </Typography>
              </Card>
            )}

            {addresses.map((address, i) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddressId === address.id}
                onSelect={() => {
                  Haptics.selectionAsync();
                  setSelectedAddressId(address.id);
                }}
                index={i}
              />
            ))}

            <Button
              title="Add New Address"
              variant="outline"
              fullWidth
              onPress={() => router.push('/profile/addresses')}
              style={styles.backButton}
            />

            <Button
              title={placing ? 'Placing Order...' : 'Place Order'}
              variant="primary"
              size="lg"
              fullWidth
              disabled={placing || !selectedAddressId}
              loading={placing}
              onPress={handlePlaceOrder}
              style={{ marginTop: spacing.md }}
            />
            <Button title="Back" variant="ghost" fullWidth onPress={() => goTo('delivery')} style={styles.backButton} />
          </Animated.View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">Checkout</Typography>
        <View style={styles.headerButton} />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(80).duration(300)} style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <StepDot index={i} activeIndex={activeIndex} />
            {i < STEPS.length - 1 && <StepConnector filled={activeIndex > i} />}
          </View>
        ))}
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ErrorNotice message={orderError} title="Order failed" onDismiss={() => setOrderError(null)} />
        {renderStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepConnector: {
    width: CONNECTOR_WIDTH,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    borderRadius: 1,
    overflow: 'hidden',
  },
  stepConnectorFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['8xl'] },
  stepTitle: { marginBottom: spacing.xl, marginTop: spacing.sm },
  fieldLabel: { marginBottom: spacing.sm, marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  productCard: { marginBottom: spacing.md },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  productInfo: { flex: 1, justifyContent: 'center', gap: spacing.xs },
  priceTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  orderSummary: {
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryTitle: { marginBottom: spacing.md },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  summaryRowTotal: { borderTopWidth: 1.5, borderTopColor: colors.border },
  addressCardOuter: { marginBottom: spacing.md },
  addressCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  addressCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center' },
  radioInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  addressDetails: { marginBottom: spacing.xs },
  backButton: { marginTop: spacing.sm },
});
