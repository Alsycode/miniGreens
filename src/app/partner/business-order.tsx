import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Loading } from '../../components/ui/Loading';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];

export default function BusinessOrderScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<PartnerRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!session) return;
      const [{ data: partnerData }, { data: productData }] = await Promise.all([
        supabase.from('partners').select('*').eq('profile_id', session.user.id).maybeSingle(),
        supabase.from('products').select('*').eq('is_available', true).order('name'),
      ]);
      if (partnerData) {
        setPartner(partnerData);
        setBusinessName(partnerData.business_name);
        setContactPerson(partnerData.contact_person);
        setPhone(partnerData.phone);
        setAddress(partnerData.address ?? '');
      }
      setProducts(productData ?? []);
      setLoading(false);
    })();
  }, [session]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;
  const qty = Math.max(1, parseInt(quantity, 10) || 0);
  const subtotal = selectedProduct ? Number(selectedProduct.price) * qty : 0;

  const handleSubmit = async () => {
    if (!session || !partner) return;
    if (!businessName.trim() || !contactPerson.trim() || !phone.trim() || !selectedProduct || !deliveryDate.trim()) {
      setError('Fill in all required fields and pick a product.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const orderNumber = `BIZ-${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        profile_id: session.user.id,
        status: 'pending',
        subtotal,
        delivery_fee: 0,
        total: subtotal,
        delivery_address_id: null,
        delivery_date: deliveryDate.trim(),
        delivery_time: null,
        notes: notes.trim() || null,
        order_type: 'business',
        business_name: businessName.trim(),
        contact_person: contactPerson.trim(),
      })
      .select()
      .single();

    if (orderError || !order) {
      setSubmitting(false);
      setError(orderError?.message ?? 'Could not place order.');
      return;
    }

    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: qty,
      price: Number(selectedProduct.price),
      image: null,
    });

    setSubmitting(false);
    if (itemError) {
      setError(itemError.message);
      return;
    }
    router.replace('/partner/dashboard');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(40).springify().damping(31)}>
          <Typography variant="h2" color={colors.text} style={styles.title}>
            Place Business Order
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Bulk order for {partner?.business_name}. This goes straight to MGC Admin.
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(31)}>
          <TextField label="Café/Shop Name" value={businessName} onChangeText={setBusinessName} leftIcon="storefront-outline" />
          <TextField label="Contact Person" value={contactPerson} onChangeText={setContactPerson} leftIcon="person-outline" />
          <TextField label="Phone" value={phone} onChangeText={setPhone} leftIcon="call-outline" keyboardType="phone-pad" />
          <TextField label="Address" value={address} onChangeText={setAddress} leftIcon="location-outline" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(160).springify().damping(31)}>
          <Typography variant="bodySmall" color={colors.textSecondary} weight="medium" style={styles.sectionLabel}>
            Product
          </Typography>
          <View style={styles.chipRow}>
            {products.map((product) => (
              <Chip
                key={product.id}
                label={`${product.name} · ₹${Number(product.price).toFixed(0)}`}
                selected={selectedProductId === product.id}
                onPress={() => setSelectedProductId(product.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(220).springify().damping(31)}>
          <TextField
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            leftIcon="cube-outline"
          />
          <TextField
            label="Required Delivery Date"
            placeholder="e.g., 2026-09-01"
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            leftIcon="calendar-outline"
          />
          <TextField
            label="Additional Instructions (optional)"
            value={notes}
            onChangeText={setNotes}
            leftIcon="chatbubble-outline"
            multiline
          />
          {selectedProduct && (
            <Typography variant="body" weight="semibold" color={colors.primaryDark} style={styles.subtotal}>
              Subtotal: ₹{subtotal.toFixed(2)}
            </Typography>
          )}
          {error && (
            <Typography variant="bodySmall" color={colors.error} style={styles.error}>
              {error}
            </Typography>
          )}
          <Button title="Submit Order" onPress={handleSubmit} loading={submitting} fullWidth size="lg" style={styles.submit} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  subtotal: {
    marginBottom: spacing.lg,
  },
  error: {
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
