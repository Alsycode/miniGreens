import { createSupabaseServerClient } from "@/lib/supabase/server";
import SubscriptionsClient from "@/components/SubscriptionsClient";

export default async function SubscriptionsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, profiles(full_name, email), subscription_plans(name, price)")
    .order("started_at", { ascending: false });

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Subscriptions</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <SubscriptionsClient subscriptions={subscriptions ?? []} />
      </div>
    </div>
  );
}
