"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";

export function AddToCartPanel({
  slug,
  price,
}: {
  slug: string;
  price: number;
}) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  async function handleAdd() {
    setStatus("adding");
    const ok = await addItemBySlug(slug, qty);
    setStatus(ok ? "added" : "idle");
    if (ok) setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <div className="mt-8 border-t border-(--color-border) pt-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border border-(--color-border) p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex size-9 items-center justify-center rounded-full text-(--color-cream) transition-colors hover:bg-(--color-olive)/20"
          >
            <Minus size={14} weight="bold" />
          </button>
          <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex size-9 items-center justify-center rounded-full text-(--color-cream) transition-colors hover:bg-(--color-olive)/20"
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={status === "adding"}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-(--color-olive) px-7 py-3.5 font-medium text-white transition-colors hover:bg-(--color-olive-dark) disabled:opacity-60"
        >
          {status === "added" ? (
            <>
              <Check size={16} weight="bold" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={16} weight="bold" />
              Add to cart — ₹{price * qty}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
