import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order Confirmed | Mini Greens Company",
  robots: { index: false, follow: false },
};

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
      <CheckCircle size={56} weight="fill" className="mx-auto text-(--color-leaf)" />
      <h1 className="font-serif-display mt-6 text-4xl leading-[1.08] text-(--color-forest)">Payment Successful!</h1>
      <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">
        Your order has been placed. We&apos;ll notify you as it progresses.
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border border-black/[0.07] bg-white p-6 text-left shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
          <div className="flex justify-between border-b border-black/[0.07] py-2 text-sm">
            <span className="text-(--color-forest)/70">Order Number</span>
            <span className="font-medium text-(--color-forest)">{order.order_number}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-(--color-forest)/70">Total</span>
            <span className="font-medium text-(--color-forest)">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/orders"
          className="rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-black/[0.07] px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
