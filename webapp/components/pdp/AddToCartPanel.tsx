"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";

export function AddToCartPanel({ slug, price }: { slug: string; price: number }) {
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
    <div className="mt-8 border-t border-dashed border-[#2c4a26]/30 pt-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border border-[#1d3a1b]/25 bg-[#faf8f0] p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex size-9 items-center justify-center rounded-full text-[#1d3a1b] transition-colors hover:bg-[#efeadb]"
          >
            <Minus size={14} weight="bold" />
          </button>
          <span className="min-w-8 text-center text-sm font-semibold text-[#1d3a1b]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex size-9 items-center justify-center rounded-full text-[#1d3a1b] transition-colors hover:bg-[#efeadb]"
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={status === "adding"}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1d3a1b] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2c4a26] disabled:opacity-60"
        >
          {status === "added" ? (
            <>
              <Check size={16} weight="bold" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={16} weight="bold" />
              Add to cart · ₹{price * qty}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
