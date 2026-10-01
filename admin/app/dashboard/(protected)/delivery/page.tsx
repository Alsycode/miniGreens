import { createSupabaseServerClient } from "@/lib/supabase/server";
import DeliveryQueueClient from "@/components/DeliveryQueueClient";

function todayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function DeliveryPage() {
  const supabase = await createSupabaseServerClient();
  const today = todayDateString();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(full_name, email), addresses(*)")
    .eq("delivery_date", today)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      {/* Heading */}
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Today — {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Delivery Queue</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <DeliveryQueueClient deliveries={orders ?? []} />
      </div>
    </div>
  );
}
