"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markOrderDelivered(orderId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
  revalidatePath("/dashboard/delivery");
  revalidatePath("/dashboard");
}
