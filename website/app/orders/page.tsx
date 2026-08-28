import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Database } from "@mobile/database";
import { PageShell } from "@/components/PageShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Orders | Mini Greens Company" };

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-(--color-border) text-(--color-muted)",
  confirmed: "border-(--color-border) text-(--color-muted)",
  processing: "border-(--color-sage) text-(--color-sage)",
  shipped: "border-(--color-sage) text-(--color-sage)",
  delivered: "border-(--color-olive) text-(--color-sage-light)",
  cancelled: "border-(--color-border) text-(--color-muted) line-through",
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <PageShell
      eyebrow="My Orders"
      title="Everything You've"
      accent="Ordered So Far"
      intro="A record of every box we've cut for you, including anything currently on its way."
    >
      {(orders ?? []).length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
          <p className="text-(--color-muted)">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-(--color-olive) px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
          >
            Browse microgreens
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders ?? []).map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 transition-colors hover:border-(--color-sage)"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-xl">{order.order_number}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wide uppercase ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-(--color-muted)">
                    Placed {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    {order.delivery_date && ` · Delivery ${order.delivery_date}${order.delivery_time ? `, ${order.delivery_time}` : ""}`}
                  </p>
                  <p className="mt-3 text-sm text-(--color-cream)">
                    {order.order_items.map((i) => `${i.quantity} × ${i.product_name}`).join(", ")}
                  </p>
                </div>
                <p className="font-display text-2xl">₹{Number(order.total).toFixed(0)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
