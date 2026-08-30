"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function approvePartner(partnerId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("partners").update({ status: "approved" }).eq("id", partnerId);
  revalidatePath("/dashboard/partners");
}

export async function rejectPartner(partnerId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("partners").update({ status: "rejected" }).eq("id", partnerId);
  revalidatePath("/dashboard/partners");
}

export async function updatePartnerFee(partnerId: string, feePercent: number) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("partners").update({ platform_fee_percent: feePercent }).eq("id", partnerId);
  revalidatePath("/dashboard/partners");
}

export async function updatePayoutStatus(
  payoutId: string,
  status: "processing" | "paid" | "rejected",
) {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("payouts")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("id", payoutId);
  revalidatePath("/dashboard/partners");
}
