import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/ProductCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveProductImage } from "@/lib/productImages";

export async function TeaGrid() {
  const supabase = await createSupabaseServerClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "tea-blends")
    .maybeSingle();

  if (!category) return null;

  const { data: products } = await supabase
    .from("products")
    .select("slug, name, description, price, original_price, images, rating, review_count")
    .eq("is_available", true)
    .eq("category_id", category.id)
    .order("is_featured", { ascending: false })
    .limit(4);

  if (!products || products.length === 0) return null;

  return (
    <section id="teas" className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-(--color-navy)/60">
            Our Teas
          </p>
          <h2 className="font-display mt-1 text-3xl font-bold text-(--color-navy) sm:text-4xl">
            Small Greens, Big Benefits
          </h2>
        </div>
        <Link
          href="/shop?category=tea-blends"
          className="hidden items-center gap-2 rounded-full border border-(--color-navy)/20 px-5 py-2.5 text-sm font-semibold text-(--color-navy) transition-colors hover:border-(--color-navy) sm:flex"
        >
          View All
          <ArrowRight size={15} weight="bold" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={{
              slug: product.slug,
              name: product.name,
              description: product.description,
              price: Number(product.price),
              originalPrice: product.original_price != null ? Number(product.original_price) : null,
              image: resolveProductImage(product.slug, product.images),
              rating: product.rating,
              reviewCount: product.review_count,
            }}
          />
        ))}
      </div>
    </section>
  );
}
