"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Leaf, ShoppingCart, Check, Star } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";
import { displayName } from "@/lib/productCopy";

export interface ProductCardData {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const name = displayName(product.name);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(100 - (product.price / product.originalPrice!) * 100)
    : null;

  async function handleAddToCart() {
    setStatus("adding");
    const ok = await addItemBySlug(product.slug, 1);
    if (ok) {
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1200);
    } else {
      setStatus("idle");
    }
  }

  return (
    <div className="group relative rounded-2xl border border-(--color-border) bg-white p-3 transition-shadow hover:shadow-lg hover:shadow-black/5">
      {hasDiscount && (
        <span className="absolute left-5 top-5 z-10 rounded-md bg-(--color-sale) px-2 py-0.5 text-[11px] font-bold text-white">
          -{discountPct}%
        </span>
      )}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-(--color-bg-muted)">
          {product.image ? (
            <Image
              src={product.image}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 22vw, 45vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Leaf size={32} className="text-(--color-navy)/30" />
            </div>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-(--color-ink) transition-colors group-hover:text-(--color-navy)">
          {name}
        </h3>
      </Link>
      {product.description && (
        <p className="mt-1 line-clamp-1 text-xs text-(--color-muted)">{product.description}</p>
      )}
      {product.rating != null && product.rating > 0 && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-(--color-muted)">
          <Star size={12} weight="fill" className="text-(--color-accent-dark)" />
          <span className="font-medium text-(--color-ink)">{Number(product.rating).toFixed(1)}</span>
          {product.reviewCount != null && product.reviewCount > 0 && <span>({product.reviewCount})</span>}
        </div>
      )}
      <div className="mt-2 flex items-baseline gap-2">
        {hasDiscount && (
          <span className="text-xs text-(--color-muted) line-through">₹{product.originalPrice}</span>
        )}
        <span className="text-base font-bold text-(--color-ink)">₹{product.price}</span>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={status === "adding"}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark) disabled:opacity-60"
      >
        {status === "added" ? (
          <>
            <Check size={15} weight="bold" /> Added
          </>
        ) : (
          <>
            <ShoppingCart size={15} weight="bold" /> Add to cart
          </>
        )}
      </button>
    </div>
  );
}
