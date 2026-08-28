"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Minus, Plus, Trash } from "@phosphor-icons/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
import { useCartStore, cartSubtotal } from "@/store/useCartStore";

const DELIVERY_FEE = 35.49;

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;

  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">Your Cart</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--color-muted)">
          Nothing sits in a warehouse — we harvest to order.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
            <p className="text-(--color-muted)">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-(--color-olive) px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
            >
              Browse microgreens
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_minmax(0,1fr)]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-black">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-(--color-olive)/20">
                        <Leaf size={20} className="text-(--color-sage)" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-(--color-muted)">₹{item.price} each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex size-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-cream) transition-colors hover:border-(--color-sage)"
                    >
                      <Minus size={12} weight="bold" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex size-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-cream) transition-colors hover:border-(--color-sage)"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>

                  <p className="w-16 shrink-0 text-right font-medium">
                    ₹{item.price * item.quantity}
                  </p>

                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-(--color-border) text-(--color-muted) transition-colors hover:border-(--color-sage) hover:text-(--color-cream)"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
              <h2 className="font-display text-2xl">Order Summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-(--color-muted)">
                  <dt>Subtotal</dt>
                  <dd>₹{subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-(--color-muted)">
                  <dt>Delivery</dt>
                  <dd>₹{DELIVERY_FEE.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-(--color-border) pt-3 text-base font-medium text-(--color-cream)">
                  <dt>Total</dt>
                  <dd>₹{total.toFixed(2)}</dd>
                </div>
              </dl>
              <button
                onClick={() => router.push("/checkout")}
                className="mt-6 w-full rounded-full bg-(--color-olive) px-7 py-4 font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
              >
                Proceed to checkout
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
