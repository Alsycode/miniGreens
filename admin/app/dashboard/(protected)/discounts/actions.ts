"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@mobile/database";

type DiscountInsert = Database["public"]["Tables"]["discounts"]["Insert"];
type DiscountUpdate = Database["public"]["Tables"]["discounts"]["Update"];

export async function createDiscount(discount: DiscountInsert) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("discounts").insert(discount);
  revalidatePath("/dashboard/discounts");
}

export async function updateDiscount(id: string, patch: DiscountUpdate) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("discounts").update(patch).eq("id", id);
  revalidatePath("/dashboard/discounts");
}

export async function deleteDiscount(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("discounts").delete().eq("id", id);
  revalidatePath("/dashboard/discounts");
}
