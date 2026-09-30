"use client";

import { useState } from "react";
import { Gift, Copy, Check } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";

type Discount = Database["public"]["Tables"]["discounts"]["Row"];

function valueLabel(d: Discount) {
  const v = Number(d.value);
  return d.discount_type === "percentage" ? `${v % 1 === 0 ? v : v.toFixed(1)}% OFF` : `₹${v.toFixed(0)} OFF`;
}

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function OfferCard({ discount }: { discount: Discount }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!discount.code) return;
    await navigator.clipboard.writeText(discount.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-(--color-leaf)/15 px-3 py-1 text-xs font-bold text-(--color-leaf)">
          {valueLabel(discount)}
        </span>
        {discount.is_birthday_offer && (
          <span className="flex items-center gap-1 rounded-full bg-(--color-forest) px-3 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
            <Gift size={12} weight="fill" />
            Birthday
          </span>
        )}
      </div>

      {discount.description && (
        <p className="mt-4 text-sm leading-relaxed text-(--color-forest)/80">{discount.description}</p>
      )}

      {(discount.min_order_value != null || discount.expires_at) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-forest)/60">
          {discount.min_order_value != null && <span>Min. order ₹{Number(discount.min_order_value).toFixed(0)}</span>}
          {discount.expires_at && <span>Expires {formatExpiry(discount.expires_at)}</span>}
        </div>
      )}

      <button
        type="button"
        onClick={copyCode}
        className="mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-(--color-forest)/25 bg-(--color-cream) px-4 py-3 text-left transition-colors hover:border-(--color-forest)/50"
      >
        <span className="flex-1 font-mono text-sm font-bold tracking-wider text-(--color-forest)">{discount.code}</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-(--color-forest)">
          {copied ? <Check size={15} weight="bold" /> : <Copy size={15} />}
          {copied ? "Copied" : "Tap to copy"}
        </span>
      </button>
    </article>
  );
}
