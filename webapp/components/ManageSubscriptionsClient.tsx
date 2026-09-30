"use client";

import { useState } from "react";
import Link from "next/link";
import { PauseCircle, PlayCircle, XCircle } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@mobile/database";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  subscription_plans: { name: string; price: number; delivery_frequency: string | null } | null;
};

const STATUS_STYLES: Record<Subscription["status"], string> = {
  active: "bg-(--color-leaf)/15 text-(--color-leaf)",
  paused: "bg-(--color-sun)/25 text-(--color-forest)",
  cancelled: "bg-(--color-cream-dark) text-(--color-forest)/60 line-through",
};

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function ManageSubscriptionsClient({ subscriptions }: { subscriptions: Subscription[] }) {
  const [rows, setRows] = useState(subscriptions);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: "active" | "paused" | "cancelled") {
    setPendingId(id);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const now = new Date().toISOString();

    const patch =
      status === "paused"
        ? { status, paused_at: now }
        : status === "cancelled"
          ? { status, cancelled_at: now }
          : { status, paused_at: null };

    const { error: updateError } = await supabase.from("subscriptions").update(patch).eq("id", id);

    setPendingId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
        <p className="text-(--color-forest)/70">You don&apos;t have any subscriptions yet.</p>
        <Link
          href="/subscriptions"
          className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
        >
          View plans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-(--color-sale)">{error}</p>}
      {rows.map((sub) => (
        <article key={sub.id} className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif-display text-xl text-(--color-forest)">
                  {sub.subscription_plans?.name ?? "Subscription"}
                </h2>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide uppercase ${STATUS_STYLES[sub.status]}`}>
                  {sub.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-(--color-forest)/60">
                {sub.subscription_plans?.delivery_frequency ?? "Weekly"} · ₹{Number(sub.subscription_plans?.price ?? 0)}
              </p>
              <p className="mt-1 text-sm text-(--color-forest)/80">
                Next delivery: {formatDate(sub.next_delivery_date)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {sub.status === "active" && (
                <button
                  type="button"
                  disabled={pendingId === sub.id}
                  onClick={() => updateStatus(sub.id, "paused")}
                  className="flex items-center gap-2 rounded-full border border-(--color-forest)/20 px-4 py-2 text-xs font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest) disabled:opacity-60"
                >
                  <PauseCircle size={16} /> Pause
                </button>
              )}
              {sub.status === "paused" && (
                <button
                  type="button"
                  disabled={pendingId === sub.id}
                  onClick={() => updateStatus(sub.id, "active")}
                  className="flex items-center gap-2 rounded-full border border-(--color-forest)/20 px-4 py-2 text-xs font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest) disabled:opacity-60"
                >
                  <PlayCircle size={16} /> Resume
                </button>
              )}
              {sub.status !== "cancelled" && (
                <button
                  type="button"
                  disabled={pendingId === sub.id}
                  onClick={() => {
                    if (confirm("Cancel this subscription? This can't be undone.")) {
                      updateStatus(sub.id, "cancelled");
                    }
                  }}
                  className="flex items-center gap-2 rounded-full border border-(--color-forest)/20 px-4 py-2 text-xs font-semibold text-(--color-sale) transition-colors hover:border-(--color-sale) disabled:opacity-60"
                >
                  <XCircle size={16} /> Cancel
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
