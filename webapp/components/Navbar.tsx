"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Heart, List, MagnifyingGlass, ShoppingCart, User, X } from "@phosphor-icons/react";
import { usePreorder } from "@/context/PreorderContext";
import { useCartStore } from "@/store/useCartStore";
import { ShopMenu } from "@/components/ShopMenu";

const LINKS = [
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "New Arrivals", href: "/shop" },
  { label: "Our Story", href: "/about" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const { subscription } = usePreorder();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openCart = useCartStore((s) => s.openCart);
  const activeCount = cartCount + (subscription ? 1 : 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-(--color-border) bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-9 items-center justify-center rounded-full text-(--color-navy) transition-colors hover:bg-(--color-bg-muted) lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <List size={20} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-(--color-navy) text-sm font-bold text-white">
              MG
            </span>
            <span className="font-display text-lg font-bold tracking-wide text-(--color-navy)">
              MINI GREENS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-(--color-navy)">
          <button aria-label="Search" className="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-(--color-bg-muted) sm:flex">
            <MagnifyingGlass size={19} />
          </button>
          <Link
            href="/login"
            aria-label="Account"
            className="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-(--color-bg-muted) sm:flex"
          >
            <User size={19} />
          </Link>
          <Link
            href="/orders"
            aria-label="Wishlist / orders"
            className="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-(--color-bg-muted) sm:flex"
          >
            <Heart size={19} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="View your cart"
            className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-(--color-bg-muted)"
          >
            <ShoppingCart size={19} />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-(--color-accent) text-[10px] font-bold text-(--color-navy)">
              {activeCount}
            </span>
          </button>
        </div>
      </div>

      <nav className="hidden justify-center gap-8 border-t border-(--color-border) bg-(--color-bg-muted)/60 py-2.5 text-xs font-semibold uppercase tracking-wide text-(--color-navy)/80 lg:flex">
        <Suspense fallback={<span>Shop</span>}>
          <ShopMenu />
        </Suspense>
        {LINKS.map((link) => (
          <Link key={link.label} href={link.href} className="transition-colors hover:text-(--color-accent-dark)">
            {link.label}
          </Link>
        ))}
      </nav>

      {menuOpen && (
        <nav className="border-t border-(--color-border) bg-white px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-1 text-sm font-medium text-(--color-navy)">
            <li>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-(--color-bg-muted)"
              >
                Shop
              </Link>
            </li>
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-(--color-bg-muted)"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 border-t border-(--color-border) pt-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-(--color-border) px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
              >
                <User size={15} /> Account
              </Link>
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-(--color-border) px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
              >
                <Heart size={15} /> Orders
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
