import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveProductImage } from "@/lib/productImages";

export type HomeProduct = {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  image: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
};

/**
 * All available products for the homepage sections, featured first then by rating.
 * Wrapped in `cache` so Bestsellers and FindYourBlend share one round-trip per request.
 */
export const getHomeProducts = cache(async (): Promise<HomeProduct[]> => {
  const supabase = await createSupabaseServerClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, slug"),
    supabase
      .from("products")
      .select("slug, name, description, price, original_price, images, category_id, rating, review_count")
      .eq("is_available", true)
      .order("is_featured", { ascending: false })
      .order("rating", { ascending: false, nullsFirst: false }),
  ]);

  const slugById = new Map((categories ?? []).map((c) => [c.id, c.slug]));
  return (products ?? []).map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : null,
    image: resolveProductImage(p.slug, p.images),
    rating: p.rating != null ? Number(p.rating) : null,
    reviewCount: p.review_count,
    category: slugById.get(p.category_id ?? "") ?? null,
  }));
});
