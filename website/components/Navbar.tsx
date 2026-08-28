"use client";

import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react";
import { usePreorder } from "@/context/PreorderContext";
import { useCartStore } from "@/store/useCartStore";

const LINKS = [
  { label: "Our Story", href: "/#story" },
  { label: "Microgreens", href: "/#microgreens" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Journal", href: "/blog" },
];

export function Navbar() {
  const { subscription } = usePreorder();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const activeCount = cartCount + (subscription ? 1 : 0);
  const bagHref = cartCount > 0 ? "/cart" : subscription ? "/subscribe" : "/shop";

  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
      <Link href="/" className="font-display text-2xl leading-none">
        mini greens
        <br />
        <span className="text-(--color-sage)">company.</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-(--color-muted) lg:flex">
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
          Shop Now
        </Link>
        <Link
          href={bagHref}
          aria-label="View your cart"
          className="relative flex size-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-cream) transition-colors hover:border-(--color-sage)"
        >
          <ShoppingBag size={18} />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-(--color-sage) text-[10px] font-semibold text-(--color-ink)">
            {activeCount}
          </span>
        </Link>
      </div>
    </header>
  );
}
