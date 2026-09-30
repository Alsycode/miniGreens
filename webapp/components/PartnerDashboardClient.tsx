"use client";

import { useCallback, useEffect, useState } from "react";
import { Bag, CheckCircle, ClockCountdown, TrendUp } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  individual: "Individual Partner",
  women: "Women Partner",
  cafe: "Café",
  restaurant: "Restaurant",
  shop: "Shop",
  fitness_wellness: "Fitness/Wellness Partner",
  community: "Community Partner",
};

export function PartnerDashboardClient({ partner }: { partner: PartnerRow }) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("profile_id", partner.profile_id)
      .eq("order_type", "business")
      .order("created_at", { ascending: false });
    setOrders(orderData ?? []);
    setLoading(false);
  }, [partner.profile_id]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
        <div>
          <h2 className="font-serif-display text-2xl text-(--color-forest)">{partner.business_name}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-(--color-leaf)">
            <span className="size-2 rounded-full bg-(--color-leaf)" />
            Approved Partner
          </p>
          <p className="mt-1 text-xs text-(--color-forest)/60">
            {BUSINESS_TYPE_LABELS[partner.business_type] ?? partner.business_type}
          </p>
        </div>
        {/* Bulk/business ordering disabled for now — re-enable by restoring the
            "Place Business Order" link to /partner/business-order. */}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center text-sm text-(--color-forest)/60 shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
          Loading your dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: TrendUp, value: `₹${totalSales.toFixed(0)}`, label: "Total Ordered" },
              { Icon: Bag, value: `${orders.length}`, label: "Orders" },
            ].map(({ Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-black/[0.07] bg-white p-4 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)] sm:text-left"
              >
                <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-(--color-cream) text-(--color-forest) sm:mx-0">
                  <Icon size={18} weight="light" />
                </span>
                <p className="font-display mt-3 text-xl font-semibold text-(--color-forest)">{value}</p>
                <p className="text-xs text-(--color-forest)/60">{label}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-serif-display mb-3 text-xl text-(--color-forest)">Order History</h3>
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-black/[0.07] bg-white p-8 text-center text-sm text-(--color-forest)/60 shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
                No business orders yet.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_2px_14px_rgba(31,58,36,0.06)]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-(--color-forest)">{order.order_number}</p>
                      <p className="text-sm font-semibold text-(--color-leaf)">₹{Number(order.total).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-(--color-forest)/60">
                      {order.status === "delivered" ? (
                        <CheckCircle size={13} weight="fill" className="text-(--color-leaf)" />
                      ) : (
                        <ClockCountdown size={13} />
                      )}
                      {order.status} · {order.delivery_date ?? "No date set"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
