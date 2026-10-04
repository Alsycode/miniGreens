import Image from "next/image";
import Link from "next/link";
import { Leaf, Star } from "@phosphor-icons/react/dist/ssr";
import type { HomeProduct } from "@/lib/homeProducts";
import { BLEND_PROFILE } from "@/lib/blends";
import { displayName } from "@/lib/productCopy";
import { productImageFit } from "@/lib/productImages";
import { QuickAdd } from "@/components/home/QuickAdd";
import { SHOW_RATINGS } from "@/lib/reviews";

// Short card labels for the original ranges; any category added in the admin falls back to
// its own name.
const CATEGORY_LABEL: Record<string, string> = {
  "tea-blends": "Tea Bag",
  microgreens: "Microgreens",
  juices: "Juice",
};

export function HomeProductCard({ product }: { product: HomeProduct }) {
  const name = displayName(product.name);
  const caption = BLEND_PROFILE[product.slug]?.taste ?? product.description;
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_14px_rgba(31,58,36,0.08)] transition-shadow hover:shadow-[0_8px_28px_rgba(31,58,36,0.16)]">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-(--color-cream)">
        {product.category && (CATEGORY_LABEL[product.category] ?? product.categoryName) && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-(--color-forest)">
            {CATEGORY_LABEL[product.category] ?? product.categoryName}
          </span>
        )}
        {product.image ? (
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className={`${productImageFit(product.image)} transition-transform duration-500 group-hover:scale-105`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf size={32} className="text-(--color-forest)/30" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-serif-display text-lg leading-tight text-(--color-forest) sm:text-xl">{name}</h3>
        </Link>
        {caption && <p className="mt-1 line-clamp-1 text-[13px] text-(--color-forest)/65">{caption}</p>}
        {SHOW_RATINGS && product.rating != null && product.rating > 0 && (
          <p className="mt-2 flex items-center gap-1 text-xs text-(--color-forest)/70">
            <Star size={12} weight="fill" className="text-(--color-sun-dark)" />
            <span className="font-semibold text-(--color-forest)">{product.rating.toFixed(1)}</span>
            {product.reviewCount != null && product.reviewCount > 0 && <span>({product.reviewCount})</span>}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-semibold text-(--color-forest)">₹{product.price}</span>
            {hasDiscount && (
              <span className="text-xs text-(--color-forest)/50 line-through">₹{product.originalPrice}</span>
            )}
          </p>
          {/* Round icon on phones, where two-up cards leave no room for the pill. */}
          <span className="sm:hidden">
            <QuickAdd slug={product.slug} name={name} variant="icon" />
          </span>
          <span className="hidden sm:block">
            <QuickAdd slug={product.slug} name={name} />
          </span>
        </div>
      </div>
    </div>
  );
}
