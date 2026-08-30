import { createSupabaseServerClient } from "@/lib/supabase/server";
import PartnersClient from "@/components/PartnersClient";

export default async function PartnersPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: partners }, { data: payouts }] = await Promise.all([
    supabase.from("partners").select("*").order("applied_at", { ascending: false }),
    supabase.from("payouts").select("*").order("requested_at", { ascending: false }),
  ]);

  const businessById = new Map((partners ?? []).map((p) => [p.id, p.business_name]));
  const payoutRows = (payouts ?? []).map((p) => ({
    ...p,
    businessName: businessById.get(p.partner_id) ?? "Unknown partner",
  }));

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Partners</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <PartnersClient partners={partners ?? []} payouts={payoutRows} />
      </div>
    </div>
  );
}
