import { create } from "zustand";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveProductImage } from "@/lib/productImages";

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
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItemBySlug: (slug: string, quantity?: number) => Promise<boolean>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItemBySlug: async (slug, quantity = 1) => {
    const supabase = createSupabaseBrowserClient();
    const { data: product } = await supabase
      .from("products")
      .select("id, slug, name, price, images")
      .eq("slug", slug)
      .maybeSingle();
    if (!product) {
      return false;
    }

    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          isOpen: true,
          items: state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      return {
        isOpen: true,
        items: [
          ...state.items,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.price),
            image: resolveProductImage(product.slug, product.images),
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
}));

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
