"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Leaf, ShoppingCart, Star } from "@phosphor-icons/react";
import { productImageFit } from "@/lib/productImages";
import { useCartStore } from "@/store/useCartStore";
import { displayName } from "@/lib/productCopy";
import { SHOW_RATINGS } from "@/lib/reviews";
import { FOREST, condensed, roughMaskStyle, serif } from "@/components/story/primitives";

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

// Stable per-product seed so each card keeps the same torn edge and tilt between renders.
function hashSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

const TILTS = [-0.7, 0.5, -0.3, 0.6, -0.5, 0.4];

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const name = displayName(product.name);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(100 - (product.price / product.originalPrice!) * 100)
    : null;
  const seed = hashSlug(product.slug);

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
    <div
      className="group relative h-full drop-shadow-[0_10px_16px_rgba(34,44,24,0.14)] transition-[filter] hover:drop-shadow-[0_16px_24px_rgba(34,44,24,0.22)]"
      style={{ transform: `rotate(${TILTS[seed % TILTS.length]}deg)` }}
    >
      <div className="flex h-full flex-col bg-[#faf8f0] p-3 sm:p-4" style={roughMaskStyle(seed % 997)}>
        <Link href={`/shop/${product.slug}`} className="block">
          <div
            className="relative mb-4 aspect-square overflow-hidden bg-[#efeadb]"
            style={roughMaskStyle((seed >> 3) % 997)}
          >
            {hasDiscount && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1d3a1b] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                −{discountPct}%
              </span>
            )}
            {product.image ? (
              <Image
                src={product.image}
                alt={name}
                fill
                className={`${productImageFit(product.image)} transition-transform duration-500 group-hover:scale-105`}
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Leaf size={32} className="text-[#1d3a1b]/30" />
              </div>
            )}
          </div>
          <h3
            className={`${serif.className} line-clamp-2 px-1 text-[1.35rem] font-semibold leading-tight`}
            style={{ ...condensed, color: FOREST }}
          >
            {name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 px-1 text-xs leading-relaxed text-[#3a4135]/80">{product.description}</p>
        )}

        <div className="mt-auto px-1 pt-3">
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className={`${serif.className} text-2xl font-semibold leading-none`} style={{ ...condensed, color: FOREST }}>
                ₹{product.price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#3a4135]/60 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            {SHOW_RATINGS && product.rating != null && product.rating > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[#3a4135]/80">
                <Star size={11} weight="fill" className="text-[#3f6b36]" />
                <span className="font-semibold text-[#2b3327]">{Number(product.rating).toFixed(1)}</span>
                {product.reviewCount != null && product.reviewCount > 0 && <span>({product.reviewCount})</span>}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={status === "adding"}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#1d3a1b] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2c4a26] disabled:opacity-60"
          >
            {status === "added" ? (
              <>
                <Check size={14} weight="bold" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} weight="bold" /> Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
