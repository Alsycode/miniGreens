import { Leaf } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
import { ProductCard } from "@/components/ProductCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug, name, description, price, images")
    .eq("is_available", true)
    .order("name");

  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
          <Leaf size={16} weight="fill" />
          Shop
        </div>
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          Every Tray We Grow,
          <br />
          <span className="text-(--color-sage)">Cut To Order</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-(--color-muted)">
          Nothing sits in a warehouse. Pick your greens, choose a delivery slot,
          and we harvest the morning your box goes out.
        </p>

        {(products ?? []).length === 0 ? (
          <p className="mt-10 text-sm text-(--color-muted)">No products available right now.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </main>

      <Footer />
    </div>
  );
}
