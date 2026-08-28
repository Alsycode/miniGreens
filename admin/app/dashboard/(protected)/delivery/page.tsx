import { createSupabaseServerClient } from "@/lib/supabase/server";
import DeliveryQueueClient from "@/components/DeliveryQueueClient";

const KNOWN_SLOTS = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00"];

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
    .neq("status", "cancelled");

  const grouped = new Map<string, typeof orders>();
  for (const order of orders ?? []) {
    const key = order.delivery_time ?? "Unscheduled";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(order);
  }

  const otherKeys = [...grouped.keys()].filter((k) => !KNOWN_SLOTS.includes(k)).sort();
  const orderedKeys = [...KNOWN_SLOTS.filter((k) => grouped.has(k)), ...otherKeys];
  const slots = orderedKeys.map((time) => ({ time, deliveries: grouped.get(time)! }));

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
        <DeliveryQueueClient slots={slots} />
      </div>
    </div>
  );
}
