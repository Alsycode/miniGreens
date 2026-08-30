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

export async function updatePreorderEta(orderId: string, eta: string | null) {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("orders")
    .update({ expected_availability_date: eta || null })
    .eq("id", orderId);
  revalidatePath("/dashboard/orders");
}

export async function convertPreorderToStandard(orderId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("orders").update({ order_type: "standard" }).eq("id", orderId);
  revalidatePath("/dashboard/orders");
}
