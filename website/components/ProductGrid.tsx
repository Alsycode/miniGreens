import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight, Leaf } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/ProductCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function ProductGrid() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug, name, description, price, images")
    .eq("is_available", true)
    .order("is_featured", { ascending: false })
    .limit(4);

  return (
    <section id="microgreens" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
            <Leaf size={16} weight="fill" />
            Our Microgreens
          </div>
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">
            Fresh Microgreens
            <br />
            <span className="text-(--color-sage)">Picked for You</span>
          </h2>
        </div>

        <div className="hidden gap-3 sm:flex">
          <button className="flex size-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-cream) transition-colors hover:border-(--color-sage)">
            <CaretLeft size={16} />
          </button>
          <button className="flex size-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-cream) transition-colors hover:border-(--color-sage)">
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      {(products ?? []).length === 0 ? (
        <p className="text-sm text-(--color-muted)">No products available right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(products ?? []).map((product) => (
            <ProductCard
              key={product.slug}
              product={{
                slug: product.slug,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                image: product.images[0] ?? null,
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-full border border-(--color-border) px-7 py-3.5 font-medium text-(--color-cream) transition-colors hover:border-(--color-sage)"
        >
          View All Microgreens
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
