"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@mobile/database";

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/dashboard/orders");
}
