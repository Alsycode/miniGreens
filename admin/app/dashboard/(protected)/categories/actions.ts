"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@mobile/database";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type ActionResult = { ok: true } | { ok: false; error: string };

function refresh() {
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}

export async function createCategory(category: CategoryInsert): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").insert(category);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "A category with that slug already exists." : error.message,
    };
  }
  refresh();
  return { ok: true };
}

export async function updateCategory(id: string, patch: CategoryUpdate): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "A category with that slug already exists." : error.message,
    };
  }
  refresh();
  return { ok: true };
}

/** Swap the sort position of two neighbouring categories. */
export async function swapCategoryOrder(
  a: { id: string; sort_order: number },
  b: { id: string; sort_order: number },
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  // Equal values (e.g. both left at the default) would make the swap a no-op, so nudge.
  const aOrder = a.sort_order === b.sort_order ? b.sort_order + 1 : b.sort_order;
  const [r1, r2] = await Promise.all([
    supabase.from("categories").update({ sort_order: aOrder }).eq("id", a.id),
    supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);
  const error = r1.error ?? r2.error;
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

/** Deleting is only allowed for empty categories; otherwise products would become uncategorised. */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `This category still has ${count} product${count === 1 ? "" : "s"}. Move or delete them first, or hide the category instead.`,
    };
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}
