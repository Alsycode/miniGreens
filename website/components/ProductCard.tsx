"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Leaf, ShoppingCart, Check } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";

export interface ProductCardData {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const router = useRouter();
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

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
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-black">
        {product.image ? (
          <Image
            src={product.image}
            alt={`${product.name} microgreens`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 22vw, 45vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-(--color-olive)/20">
            <Leaf size={32} className="text-(--color-sage)" />
          </div>
        )}
      </div>
      <h3 className="font-display text-lg">{product.name}</h3>
      {product.description && (
        <p className="mt-1 line-clamp-1 text-sm text-(--color-muted)">{product.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-medium">₹{product.price}</span>
        <button
          onClick={handleAddToCart}
          disabled={status === "adding"}
          aria-label={`Add ${product.name} to cart`}
          className="flex size-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-sage) transition-colors hover:bg-(--color-olive) hover:text-white disabled:opacity-60"
        >
          {status === "added" ? <Check size={16} /> : <ShoppingCart size={16} />}
        </button>
      </div>
      {status === "added" && (
        <button
          onClick={() => router.push("/cart")}
          className="mt-2 w-full text-center text-xs font-medium text-(--color-sage) underline"
        >
          View cart
        </button>
      )}
    </div>
  );
}
