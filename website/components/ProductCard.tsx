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
  image: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const name = displayName(product.name);

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
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-sage)">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-black">
          {product.image ? (
            <Image
              src={product.image}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(min-width: 1024px) 22vw, 45vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-(--color-olive)/20">
              <Leaf size={32} className="text-(--color-sage)" />
            </div>
          )}
        </div>
        <h3 className="font-display text-lg transition-colors hover:text-(--color-sage)">
          {name}
        </h3>
      </Link>
      {product.description && (
        <p className="mt-1 line-clamp-1 text-sm text-(--color-muted)">{product.description}</p>
      )}
      {product.rating != null && product.rating > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-(--color-muted)">
          <Star size={12} weight="fill" className="text-(--color-sage)" />
          <span className="font-medium text-(--color-cream)">
            {Number(product.rating).toFixed(1)}
          </span>
          {product.reviewCount != null && product.reviewCount > 0 && (
            <span>({product.reviewCount})</span>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-medium">₹{product.price}</span>
        <button
          onClick={handleAddToCart}
          disabled={status === "adding"}
          aria-label={`Add ${name} to cart`}
          className="flex size-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-sage) transition-colors hover:bg-(--color-olive) hover:text-white disabled:opacity-60"
        >
          {status === "added" ? <Check size={16} /> : <ShoppingCart size={16} />}
        </button>
      </div>
    </div>
  );
}
