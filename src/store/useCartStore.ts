import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { supabase } from '../lib/supabase';

const storage = createMMKV({ id: 'cart-store' });

const mmkvJSONStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => {
    storage.remove(key);
  },
}));

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItemBySlug: (slug: string, quantity?: number) => Promise<boolean>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItemBySlug: async (slug, quantity = 1) => {
        // Already in cart — increment locally, no network round-trip needed.
        // This also removes the only window where rapid repeat taps could race:
        // each increment now applies synchronously against the latest state.
        if (get().items.some((i) => i.slug === slug)) {
          set((state) => ({
            items: state.items.map((i) =>
              i.slug === slug ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          }));
          return true;
        }

        const { data: product } = await supabase
          .from('products')
          .select('id, slug, name, price, images, is_available, is_preorder, stock')
          .eq('slug', slug)
          .maybeSingle();
        if (!product || !product.is_available) {
          return false;
        }
        if (!product.is_preorder && product.stock <= 0) {
          return false;
        }

        set((state) => {
          // Re-check inside the updater: another concurrent add for the same new
          // item may have already landed while this fetch was in flight.
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                image: product.images[0] ?? null,
                quantity,
              },
            ],
          };
        });
        return true;
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      // BUG-16: persist the cart so it survives an app restart.
      name: 'minigreens-cart-store',
      storage: mmkvJSONStorage,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
