"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react";
import { usePreorder } from "@/context/PreorderContext";
import { useCartStore } from "@/store/useCartStore";
import { ShopMenu } from "@/components/ShopMenu";

const LINKS = [
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Journal", href: "/blog" },
];

export function Navbar() {
  const { subscription } = usePreorder();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openCart = useCartStore((s) => s.openCart);
  const activeCount = cartCount + (subscription ? 1 : 0);

  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
      <Link href="/" className="font-display text-2xl leading-none">
        mini greens
        <br />
        <span className="text-(--color-sage)">company.</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-(--color-muted) lg:flex">
        <Link href="/#story" className="transition-colors hover:text-(--color-cream)">
          Our Story
        </Link>
        <Suspense fallback={<span>Shop</span>}>
          <ShopMenu />
        </Suspense>
        {LINKS.map((link) => (
          <Link key={link.label} href={link.href} className="transition-colors hover:text-(--color-cream)">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-(--color-olive) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
        >
          Shop Teas
        </Link>
        <button
          type="button"
          onClick={openCart}
          aria-label="View your cart"
          className="relative flex size-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-cream) transition-colors hover:border-(--color-sage)"
        >
          <ShoppingBag size={18} />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-(--color-sage) text-[10px] font-semibold text-(--color-ink)">
            {activeCount}
          </span>
        </button>
      </div>
    </header>
  );
}
