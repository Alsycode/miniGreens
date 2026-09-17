// Bundled product artwork keyed by slug — mirrors the mobile app's
// LOCAL_IMAGE_BY_SLUG map in `src/services/catalog.ts`. The DB `products.images`
// column is empty in the current seed, so both apps fall back to this local set
// so they show identical imagery. Files live in `public/images/products/`.

const LOCAL_IMAGE_BY_SLUG: Record<string, string> = {
  "strawberry-banana-glow": "/images/products/strawberry-banana-glow.png",
  "mango-fresh": "/images/products/mango-fresh.png",
  "choco-chill": "/images/products/choco-chill.jpg",
  "papaya-glow": "/images/products/papaya-glow.png",
  "mint-melon-smoothie": "/images/products/mint-melon-smoothie.png",
  "carrot-lemon-radish-microgreens-juice":
    "/images/products/carrot-lemon-radish-microgreens-juice.png",
  "cucumber-splash": "/images/products/cucumber-splash.png",
  "apple-sprout": "/images/products/apple-sprout.png",
  "sweet-lime-spark": "/images/products/sweet-lime-spark.png",
  "watermelon-fresh": "/images/products/watermelon-fresh.png",
  "pink-radish": "/images/products/pink-radish.png",
  "white-radish": "/images/products/white-radish.webp",
  wheatgrass: "/images/products/wheatgrass.png",
  beetroot: "/images/products/beetroot.png",
  "pak-choi": "/images/products/pak-choi.png",
  sunflower: "/images/products/sunflower.png",
  mustard: "/images/products/mustard.png",
  fenugreek: "/images/products/fenugreek.png",
  broccoli: "/images/products/broccoli.png",
  arugula: "/images/products/arugula.png",
  turnip: "/images/products/turnip.png",
  "red-amaranth": "/images/products/red-amaranth.png",
  "red-cabbage": "/images/products/red-cabbage.png",

  // Microgreen tea blends — client-supplied bag artwork, shared with the mobile app.
  "green-vitality-bag": "/images/products/green-vitality-bag.png",
  "green-lemon-bag": "/images/products/green-lemon-bag.png",
  "green-detox-bag": "/images/products/green-detox-bag.png",
  "green-masala-bag": "/images/products/green-masala-bag.png",
  "mint-green-bag": "/images/products/mint-green-bag.png",
  "green-apple-bag": "/images/products/green-apple-bag.png",
  "ginger-green-bag": "/images/products/ginger-green-bag.png",
  "green-hibiscus-bag": "/images/products/green-hibiscus-bag.png",
};

// Extra gallery angles for the product detail page, keyed by slug. The first
// image is always the primary (from `resolveProductImage`); these are appended.
// Populated as the styled "brewed cup" shots land in `public/images/products/`.
const GALLERY_EXTRAS_BY_SLUG: Record<string, string[]> = {
  // "green-vitality-bag": ["/images/products/green-vitality-cup.png"],
};

const LOCAL_CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  smoothies: "/images/products/category-smoothies.jpeg",
  juices: "/images/products/category-juices.jpeg",
  microgreens: "/images/products/category-microgreens.jpeg",
  "tea-blends": "/images/products/category-tea-blends.png",
};

/**
 * Resolve a product image: prefer a real URL stored on the row, otherwise fall
 * back to the bundled artwork keyed by slug. Returns `null` when nothing matches.
 */
export function resolveProductImage(
  slug: string,
  images?: string[] | null,
): string | null {
  if (images && images.length > 0 && images[0]) return images[0];
  return LOCAL_IMAGE_BY_SLUG[slug] ?? null;
}

/**
 * Full ordered image list for the product detail page: the primary image first,
 * then any extra angles registered for the slug. Empty when nothing matches.
 */
export function resolveProductGallery(
  slug: string,
  images?: string[] | null,
): string[] {
  const primary = resolveProductImage(slug, images);
  const extras = GALLERY_EXTRAS_BY_SLUG[slug] ?? [];
  return [...(primary ? [primary] : []), ...extras];
}

export function resolveCategoryImage(
  slug: string,
  image?: string | null,
): string | null {
  if (image) return image;
  return LOCAL_CATEGORY_IMAGE_BY_SLUG[slug] ?? null;
}
