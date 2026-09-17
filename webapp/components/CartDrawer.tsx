"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Minus, Plus, Trash, X, Truck } from "@phosphor-icons/react";
import { useCartStore, cartSubtotal } from "@/store/useCartStore";
import { displayName } from "@/lib/productCopy";

export const FREE_DELIVERY_THRESHOLD = 499;

export function CartDrawer() {
  const pathname = usePathname();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeCart]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-navy) px-5 py-4 text-white">
          <h2 className="font-display text-lg font-semibold">
            Your Cart{count > 0 ? ` (${count} items)` : ""}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-(--color-bg-muted) text-(--color-navy)">
              <Leaf size={22} />
            </span>
            <p className="text-sm text-(--color-muted)">Your cart is empty.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-(--color-border) bg-(--color-bg-muted) px-5 py-3">
              <p className="flex items-center gap-1.5 text-xs text-(--color-ink)">
                <Truck size={14} className="text-(--color-success)" />
                {remaining > 0 ? (
                  <>
                    Add <span className="font-semibold">₹{Math.ceil(remaining)}</span> more for free delivery
                  </>
                ) : (
                  <span className="font-semibold text-(--color-success)">
                    You&rsquo;ve unlocked free delivery!
                  </span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-(--color-success) transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => {
                const name = displayName(item.name);
                return (
                  <div key={item.productId} className="flex gap-3">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeCart}
                      className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-muted)"
                    >
                      {item.image ? (
                        <Image src={item.image} alt={name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Leaf size={18} className="text-(--color-navy)/30" />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeCart}
                        className="block truncate text-sm font-medium text-(--color-ink) transition-colors hover:text-(--color-navy)"
                      >
                        {name}
                      </Link>
                      <p className="mt-0.5 text-xs text-(--color-muted)">₹{item.price} each</p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full border border-(--color-border) p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex size-6 items-center justify-center rounded-full text-(--color-ink) transition-colors hover:bg-(--color-bg-muted)"
                          >
                            <Minus size={11} weight="bold" />
                          </button>
                          <span className="min-w-5 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex size-6 items-center justify-center rounded-full text-(--color-ink) transition-colors hover:bg-(--color-bg-muted)"
                          >
                            <Plus size={11} weight="bold" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${name}`}
                          className="flex size-6 items-center justify-center rounded-full text-(--color-muted) transition-colors hover:text-(--color-sale)"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-(--color-ink)">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-(--color-border) px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--color-muted)">Subtotal</span>
                <span className="font-semibold text-(--color-ink)">₹{subtotal.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-(--color-muted)">Delivery calculated at checkout.</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 block rounded-full bg-(--color-accent) px-7 py-3.5 text-center font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block text-center text-xs font-medium text-(--color-navy) underline"
              >
                View full cart
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
