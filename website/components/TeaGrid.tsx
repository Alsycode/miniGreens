import Link from "next/link";
import { ArrowRight, Leaf } from "@phosphor-icons/react/dist/ssr";
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
    .select("slug, name, description, price, images, rating, review_count")
    .eq("is_available", true)
    .eq("category_id", category.id)
    .order("is_featured", { ascending: false })
    .limit(4);

  if (!products || products.length === 0) return null;

  return (
    <section id="teas" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(220px,1fr)_3fr] lg:items-start lg:gap-12">
        <div>
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
            <Leaf size={16} weight="fill" />
            Our Teas
          </div>
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">
            Small Greens
            <br />
            <span className="text-(--color-sage)">Big Benefits</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-(--color-muted)">
            Thoughtfully crafted blends with farm-fresh microgreens for every
            moment — naturally caffeine-free.
          </p>
          <Link
            href="/shop?category=tea-blends"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-(--color-border) px-7 py-3.5 font-medium text-(--color-cream) transition-colors hover:border-(--color-sage)"
          >
            View All Teas
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={{
                slug: product.slug,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                image: resolveProductImage(product.slug, product.images),
                rating: product.rating,
                reviewCount: product.review_count,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
