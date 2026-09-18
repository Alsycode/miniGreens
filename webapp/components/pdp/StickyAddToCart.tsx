"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";

export function StickyAddToCart({
  slug,
  name,
  price,
  image,
}: {
  slug: string;
  name: string;
  price: number;
  image: string | null;
}) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-white/95 backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-(--color-bg-muted)">
          {image && <Image src={image} alt={name} fill className="object-cover" sizes="44px" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-(--color-ink)">{name}</p>
          <p className="text-xs text-(--color-muted)">₹{price}</p>
        </div>
        <button
          onClick={() => addItemBySlug(slug, 1)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
        >
          <ShoppingCart size={15} weight="bold" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
