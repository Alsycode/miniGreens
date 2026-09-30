"use client";

import { useState } from "react";
import { ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/store/useCartStore";

export function AddToCartButton({ slug }: { slug: string }) {
  const addItemBySlug = useCartStore((s) => s.addItemBySlug);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function add() {
    setPending(true);
    setFailed(false);
    const ok = await addItemBySlug(slug, 1);
    setPending(false);
    if (!ok) setFailed(true);
  }

  return (
    <div>
      <button
        type="button"
        onClick={add}
        disabled={pending}
        className="flex w-full max-w-60 items-center justify-center gap-2 rounded-full bg-(--color-sun) px-6 py-3 text-sm font-semibold text-(--color-forest) shadow-sm transition-colors hover:bg-(--color-sun-dark) disabled:opacity-70"
      >
        <ShoppingCart size={16} weight="bold" />
        {pending ? "Adding..." : "Add to cart"}
      </button>
      {failed && <p className="mt-2 text-xs text-(--color-sale)">Couldn&apos;t add this right now. Please try again.</p>}
    </div>
  );
}
