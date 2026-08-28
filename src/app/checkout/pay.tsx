import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { supabase } from '../../lib/supabase';

type PayState = 'loading' | 'ready' | 'verifying' | 'failed' | 'error';

function buildCheckoutHtml(opts: {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  name: string;
  email: string | null;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="margin:0;background:#fff;">
  <script>
    function post(msg) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
    var options = {
      key: ${JSON.stringify(opts.keyId)},
      amount: ${JSON.stringify(opts.amount)},
      currency: ${JSON.stringify(opts.currency)},
      order_id: ${JSON.stringify(opts.razorpayOrderId)},
      name: 'MiniGreens',
      prefill: { name: ${JSON.stringify(opts.name)}, email: ${JSON.stringify(opts.email ?? '')} },
      theme: { color: '#2E7D32' },
      handler: function (response) {
        post({
          status: 'success',
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          post({ status: 'cancelled' });
        },
      },
    };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function () {
      post({ status: 'failed' });
    });
    rzp.open();
  </script>
</body>
</html>`;
}

export default function CheckoutPayScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<PayState>('loading');
  const [html, setHtml] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function startPayment() {
    if (!orderId) return;
    setState('loading');
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { order_id: orderId },
    });
    if (error || !data) {
      setErrorMsg(error?.message ?? 'Could not start payment.');
      setState('error');
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', authData.user?.id ?? '')
      .maybeSingle();

    setHtml(
      buildCheckoutHtml({
        keyId: data.key_id,
        amount: data.amount,
        currency: data.currency,
        razorpayOrderId: data.razorpay_order_id,
        name: profile?.full_name ?? 'Customer',
        email: profile?.email ?? null,
      })
    );
    setState('ready');
  }

  useEffect(() => {
    startPayment();
  }, [orderId]);

  async function handleMessage(event: WebViewMessageEvent) {
    let payload: any;
    try {
      payload = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (payload.status === 'success') {
      setState('verifying');
      const { data: verified, error } = await supabase.rpc('verify_razorpay_payment', {
        p_order_id: orderId,
        p_razorpay_payment_id: payload.razorpay_payment_id,
        p_razorpay_signature: payload.razorpay_signature,
      });
      if (error || !verified) {
        setState('failed');
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/checkout/success?orderId=${orderId}`);
    } else if (payload.status === 'failed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setState('failed');
    } else if (payload.status === 'cancelled') {
      router.back();
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="body" weight="semibold">Payment</Typography>
        <View style={styles.headerButton} />
      </View>

      {(state === 'loading' || state === 'verifying') && (
        <Loading fullScreen message={state === 'verifying' ? 'Verifying payment...' : 'Preparing payment...'} />
      )}

      {state === 'ready' && html && (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
        />
      )}

      {(state === 'failed' || state === 'error') && (
        <View style={styles.errorState}>
          <Ionicons name="close-circle-outline" size={56} color={colors.error} />
          <Typography variant="h4" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Payment {state === 'failed' ? 'Failed' : 'Error'}
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.xl }}>
            {state === 'error' ? errorMsg : "Your payment could not be verified. You can retry from your order details."}
          </Typography>
          <Button title="Try Again" variant="primary" onPress={startPayment} />
          <Button
            title="View Order"
            variant="ghost"
            onPress={() => router.replace(`/order/${orderId}`)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
});
