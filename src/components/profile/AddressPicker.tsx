import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import type { Database } from '../../types/database';

type Address = Database['public']['Tables']['addresses']['Row'];

interface AddressPickerProps {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Where "Add New Address" goes. Defaults to the addresses screen. */
  addRoute?: string;
}

/** Radio-style saved-address list used by every ordering flow (pre-order, checkout, subscriptions). */
export function AddressPicker({ addresses, selectedId, onSelect, addRoute = '/profile/addresses' }: AddressPickerProps) {
  return (
    <View>
      {addresses.length === 0 && (
        <Card variant="outlined" padding="lg" style={styles.empty}>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            No saved addresses yet. Add one to continue.
          </Typography>
        </Card>
      )}
      {addresses.map((address) => {
        const selected = selectedId === address.id;
        return (
          <PressableScale
            key={address.id}
            haptic={false}
            scaleTo={0.98}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(address.id);
            }}
            style={[styles.card, selected && styles.cardSelected]}
            accessibilityLabel={`Deliver to ${address.label}`}
          >
            <View style={styles.headerRow}>
              <View style={selected ? styles.radioActive : styles.radioInactive}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <Typography variant="bodySmall" weight="semibold" style={{ marginLeft: spacing.sm }}>
                {address.label}
              </Typography>
              {address.is_default && (
                <View style={styles.defaultBadge}>
                  <Typography variant="caption" color={colors.primaryDark} weight="bold">
                    DEFAULT
                  </Typography>
                </View>
              )}
            </View>
            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
              {address.full_name} · {address.phone}
            </Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {address.street}, {address.city}, {address.state} {address.zip_code}
            </Typography>
          </PressableScale>
        );
      })}
      <Button
        title="Add New Address"
        variant="outline"
        fullWidth
        onPress={() => router.push(addRoute as any)}
        style={styles.addButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { marginBottom: spacing.md },
  card: {
    borderRadius: borderRadius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.accentSurface },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
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
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.badge,
  },
  addButton: { marginTop: spacing.xs },
});
