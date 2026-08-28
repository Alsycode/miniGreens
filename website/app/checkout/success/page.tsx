import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
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
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-xl px-6 py-16 text-center md:px-10">
        <CheckCircle size={56} weight="fill" className="mx-auto text-(--color-sage)" />
        <h1 className="font-display mt-6 text-4xl">Payment Successful!</h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">
          Your order has been placed. We&apos;ll notify you as it progresses.
        </p>

        {order && (
          <div className="mt-8 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-left">
            <div className="flex justify-between border-b border-(--color-border) py-2 text-sm">
              <span className="text-(--color-muted)">Order Number</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-(--color-muted)">Total</span>
              <span className="font-medium">₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/orders"
            className="rounded-full bg-(--color-olive) px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
          >
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-(--color-border) px-7 py-3.5 text-sm font-medium text-(--color-cream) transition-colors hover:border-(--color-sage)"
          >
            Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
