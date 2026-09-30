"use client";

import { useState } from "react";
import { Check, Plus, ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";

type Props = { slug: string; name: string; variant?: "icon" | "pill" };

/** Compact add-to-cart for homepage product rows and cards. */
export function QuickAdd({ slug, name, variant = "pill" }: Props) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "failed">("idle");

  async function add() {
    setStatus("adding");
    const ok = await addItemBySlug(slug, 1);
    setStatus(ok ? "added" : "failed");
    setTimeout(() => setStatus("idle"), ok ? 1200 : 2400);
  }

  const label =
    status === "added" ? "Added" : status === "failed" ? "Try again" : status === "adding" ? "Adding..." : "Add";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={add}
        disabled={status === "adding"}
        aria-label={`Add ${name} to cart`}
        title={status === "failed" ? "Couldn't add this right now" : undefined}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-sun) text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {status === "added" ? <Check size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={status === "adding"}
      aria-label={`Add ${name} to cart`}
      className="flex items-center gap-1.5 rounded-full bg-(--color-sun) px-4 py-2 text-[13px] font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
    >
      {status === "added" ? <Check size={14} weight="bold" /> : <ShoppingCart size={14} weight="bold" />}
      {label}
    </button>
  );
}
