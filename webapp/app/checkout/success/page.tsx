import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: order } = orderId
    ? await supabase.from("orders").select("*").eq("id", orderId).maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center md:px-10">
      <CheckCircle size={56} weight="fill" className="mx-auto text-(--color-success)" />
      <h1 className="font-display mt-6 text-3xl font-bold text-(--color-navy)">Payment Successful!</h1>
      <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">
        Your order has been placed. We&apos;ll notify you as it progresses.
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border border-(--color-border) bg-white p-6 text-left">
          <div className="flex justify-between border-b border-(--color-border) py-2 text-sm">
            <span className="text-(--color-muted)">Order Number</span>
            <span className="font-medium text-(--color-ink)">{order.order_number}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-(--color-muted)">Total</span>
            <span className="font-medium text-(--color-ink)">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/orders"
          className="rounded-full bg-(--color-accent) px-7 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-(--color-border) px-7 py-3.5 text-sm font-semibold text-(--color-ink) transition-colors hover:border-(--color-navy)"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
