"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { productImageFit } from "@/lib/productImages";
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
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-[#1d3a1b]/10 bg-[#f1eee4]/95 backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#faf8f0]">
          {image && <Image src={image} alt={name} fill className={productImageFit(image)} sizes="44px" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#1d3a1b]">{name}</p>
          <p className="text-xs text-[#3a4135]">₹{price}</p>
        </div>
        <button
          onClick={() => addItemBySlug(slug, 1)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#1d3a1b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2c4a26]"
        >
          <ShoppingCart size={15} weight="bold" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
