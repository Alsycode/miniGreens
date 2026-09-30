"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateSubscriptionOrdersNow() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_generate_subscription_orders");
  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/orders");
  if (error) {
    return { error: error.message };
  }
  const created = (data ?? []).filter((row) => row.outcome === "order created").length;
  const skipped = (data ?? []).length - created;
  return { created, skipped };
}
