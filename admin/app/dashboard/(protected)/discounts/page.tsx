import { createSupabaseServerClient } from "@/lib/supabase/server";
import DiscountsClient from "@/components/DiscountsClient";

export default async function DiscountsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: discounts } = await supabase
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Discounts</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <DiscountsClient discounts={discounts ?? []} />
      </div>
    </div>
  );
}
