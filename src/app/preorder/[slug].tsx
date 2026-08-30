import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable, Image } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { Loading } from '../../components/ui/Loading';
import { ErrorNotice } from '../../components/ui/ErrorNotice';
import { useProduct } from '../../services/catalog';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { resolveImageSource, getProductPlaceholder } from '../../utils/placeholders';
import type { Database } from '../../types/database';

type Address = Database['public']['Tables']['addresses']['Row'];

export default function PreorderScreen() {
  const params = useLocalSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const initialQty = Math.max(1, parseInt(Array.isArray(params.qty) ? params.qty[0] : params.qty ?? '1', 10) || 1);
  const insets = useSafeAreaInsets();

  const profile = useAuthStore((s) => s.profile);
  const { data: product, isLoading } = useProduct(slug);

  const [quantity, setQuantity] = useState(initialQty);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setSelectedAddressId((cur) => cur || (data && data.length > 0 ? data[0].id : ''));
        });
    }, [profile])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Loading fullScreen message="Loading..." />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Typography variant="h4" color={colors.text}>Product not found</Typography>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  const lineTotal = product.price * quantity;

  async function handlePlacePreorder() {
    if (!profile || !product) return;
    setError(null);
    if (!selectedAddressId) {
      setError('Please select a delivery address.');
      return;
    }
    setPlacing(true);

    const orderNumber = `PRE${Date.now().toString().slice(-8)}`;
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        profile_id: profile.id,
        status: 'pending',
        subtotal: lineTotal,
        delivery_fee: 0,
        total: lineTotal,
        delivery_address_id: selectedAddressId,
        delivery_date: null,
        delivery_time: null,
        notes: notes || null,
        order_type: 'preorder',
        business_name: null,
        contact_person: null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      setPlacing(false);
      setError(orderErr?.message ?? 'Could not place the pre-order. Please try again.');
      return;
    }

    const { error: itemErr } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      quantity,
      price: product.price,
      image: typeof product.images[0] === 'string' ? (product.images[0] as string) : null,
    });

    setPlacing(false);
    if (itemErr) {
      setError(itemErr.message);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/order/${order.id}`);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">Pre-order</Typography>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ErrorNotice message={error} title="Pre-order failed" onDismiss={() => setError(null)} />

        {/* Product + quantity */}
        <Card variant="outlined" padding="lg" style={styles.productCard}>
          <View style={styles.productRow}>
            <Image
              source={resolveImageSource(product.images[0] ?? getProductPlaceholder(product.name))}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Typography variant="body" weight="semibold">{product.name}</Typography>
              <Typography variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
                ₹{product.price.toFixed(2)} {product.unit ? `· ${product.unit}` : ''}
              </Typography>
            </View>
          </View>
          <View style={styles.qtyRow}>
            <Typography variant="bodySmall" weight="semibold">Quantity</Typography>
            <View style={styles.qtySelector}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => { Haptics.selectionAsync(); setQuantity((q) => Math.max(1, q - 1)); }}
              >
                <Ionicons name="remove" size={18} color={colors.primaryDark} />
              </Pressable>
              <Typography variant="body" weight="bold" color={colors.primaryDark} style={styles.qtyValue}>
                {quantity}
              </Typography>
              <Pressable
                style={styles.qtyButton}
                onPress={() => { Haptics.selectionAsync(); setQuantity((q) => q + 1); }}
              >
                <Ionicons name="add" size={18} color={colors.primaryDark} />
              </Pressable>
            </View>
          </View>
        </Card>

        {/* No-charge notice */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Typography variant="caption" color={colors.textSecondary} style={styles.infoBannerText}>
            You won't be charged now. We'll notify you when this item is back in stock and confirm delivery then.
          </Typography>
        </View>

        {/* Address */}
        <Typography variant="bodySmall" weight="semibold" color={colors.text} style={styles.sectionLabel}>
          Delivery Address
        </Typography>
        {addresses.length === 0 && (
          <Card variant="outlined" padding="lg" style={{ marginBottom: spacing.md }}>
            <Typography variant="bodySmall" color={colors.textSecondary}>No saved addresses yet.</Typography>
          </Card>
        )}
        {addresses.map((address) => {
          const selected = selectedAddressId === address.id;
          return (
            <Pressable
              key={address.id}
              onPress={() => { Haptics.selectionAsync(); setSelectedAddressId(address.id); }}
              style={[styles.addressCard, selected && styles.addressCardSelected]}
            >
              <View style={styles.addressHeaderRow}>
                <View style={selected ? styles.radioActive : styles.radioInactive}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Typography variant="bodySmall" weight="semibold" style={{ marginLeft: spacing.sm }}>
                  {address.label}
                </Typography>
                {address.is_default && (
                  <View style={styles.defaultBadge}>
                    <Typography variant="caption" color={colors.primary} weight="bold">DEFAULT</Typography>
                  </View>
                )}
              </View>
              <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                {address.full_name} · {address.phone}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {address.street}, {address.city}, {address.state} {address.zip_code}
              </Typography>
            </Pressable>
          );
        })}
        <Button
          title="Add New Address"
          variant="outline"
          fullWidth
          onPress={() => router.push('/profile/addresses')}
          style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}
        />

        <TextField
          label="Notes (optional)"
          placeholder="Anything we should know..."
          value={notes}
          onChangeText={setNotes}
          leftIcon="chatbubble-outline"
          multiline
        />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View>
          <Typography variant="caption" color={colors.textTertiary}>Reserved total</Typography>
          <Typography variant="h4" color={colors.primaryDark}>₹{lineTotal.toFixed(2)}</Typography>
        </View>
        <Button
          title={placing ? 'Placing...' : 'Place Pre-order'}
          variant="primary"
          size="lg"
          loading={placing}
          disabled={placing || !selectedAddressId}
          onPress={handlePlacePreorder}
        />
      </View>
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
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['8xl'] },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  productCard: { marginBottom: spacing.lg },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  productInfo: { flex: 1 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  qtySelector: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { marginHorizontal: spacing.lg, minWidth: 20, textAlign: 'center' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoBannerText: { flex: 1, lineHeight: 17 },
  sectionLabel: { marginBottom: spacing.md },
  addressCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  addressCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  addressHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  radioInactive: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  defaultBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.lg,
  },
});
