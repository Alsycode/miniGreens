"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@mobile/database";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export async function createProduct(product: ProductInsert) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").insert(product);
  revalidatePath("/dashboard/products");
}

export async function updateProduct(id: string, patch: ProductUpdate) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").update(patch).eq("id", id);
  revalidatePath("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/dashboard/products");
}
