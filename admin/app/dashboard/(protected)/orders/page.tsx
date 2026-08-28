import { createSupabaseServerClient } from "@/lib/supabase/server";
import OrdersClient from "@/components/OrdersClient";

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(full_name, email), addresses(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      {/* Heading */}
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Orders</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <OrdersClient orders={orders ?? []} />
      </div>
    </div>
  );
}
