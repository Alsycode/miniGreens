// Bundled product artwork keyed by slug; mirrors the mobile app's
// LOCAL_IMAGE_BY_SLUG map in `src/services/catalog.ts`. The DB `products.images`
// column is empty in the current seed, so both apps fall back to this local set
// so they show identical imagery. Files live in `public/images/products/`.

// Microgreens and smoothies use the white-background set in products/white/
// (Kling renders, see IMAGE_PROMPTS.md).
const LOCAL_IMAGE_BY_SLUG: Record<string, string> = {
  "strawberry-banana-glow": "/images/products/white/strawberry-banana-glow.png",
  "mango-fresh": "/images/products/white/mango-fresh.png",
  "choco-chill": "/images/products/white/choco-chill.png",
  "papaya-glow": "/images/products/white/papaya-glow.png",
  "mint-melon-smoothie": "/images/products/white/mint-melon-smoothie.png",
  "carrot-lemon-radish-microgreens-juice": "/images/products/white/carrot-lemon-radish-juice.jpg",
  "cucumber-splash": "/images/products/white/cucumber-splash.png",
  "apple-sprout": "/images/products/white/apple-sprout.png",
  "sweet-lime-spark": "/images/products/white/sweet-lime-spark.png",
  "watermelon-fresh": "/images/products/white/watermelon-fresh.png",
  "pink-radish": "/images/products/white/pink-radish.png",
  "white-radish": "/images/products/white/white-radish.png",
  wheatgrass: "/images/products/white/wheatgrass.png",
  beetroot: "/images/products/white/beetroot.png",
  "pak-choi": "/images/products/white/pak-choi.png",
  sunflower: "/images/products/white/sunflower.png",
  mustard: "/images/products/white/mustard.png",
  fenugreek: "/images/products/white/fenugreek.png",
  broccoli: "/images/products/white/broccoli.png",
  arugula: "/images/products/white/arugula.png",
  turnip: "/images/products/white/turnip.png",
  "red-amaranth": "/images/products/white/red-amaranth.png",
  "red-cabbage": "/images/products/white/red-cabbage.png",

  // Microgreen tea blends: lifestyle photography (with background) of the tube
  // artwork, shared with the mobile app.
  "green-vitality-bag": "/images/tea/blends/green-vitality.png",
  "green-lemon-bag": "/images/tea/blends/green-lemon.png",
  "green-detox-bag": "/images/tea/blends/green-detox.png",
  "green-masala-bag": "/images/tea/blends/green-masala.png",
  "mint-green-bag": "/images/tea/blends/mint-green.png",
  "green-apple-bag": "/images/tea/blends/green-apple.png",
  "ginger-green-bag": "/images/tea/blends/ginger-green.png",
  "green-hibiscus-bag": "/images/tea/blends/green-hibiscus.png",
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
  microgreens: "/images/products/category-microgreens-sage.jpg",
  "tea-blends": "/images/tea/blends/green-vitality.png",
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

// Bottle-shot drinks (smoothies/juices) are styled with the bottle taking only ~55% of
// the frame height, by design, so garnish has room around the base. That reads fine as a
// single product photo, but in a square card grid next to microgreen trays (which fill
// ~70% of their frame) it leaves so much white margin the card looks empty/oversized.
// Zoom these specifically so the bottle fills the card like everything else does.
const BOTTLE_IMAGE_FILENAMES = new Set([
  "choco-chill.png",
  "mango-fresh.png",
  "mint-melon-smoothie.png",
  "papaya-glow.png",
  "strawberry-banana-glow.png",
  "apple-sprout.png",
  "cucumber-splash.png",
  "sweet-lime-spark.png",
  "watermelon-fresh.png",
  "carrot-lemon-radish-juice.jpg",
]);

/**
 * Transparent cutouts must be shown whole (contain + breathing room); photos
 * fill their frame. Pass the result as the `<Image>` className.
 */
export function productImageFit(src: string | null | undefined): string {
  if (!src) return "object-cover";
  const filename = src.split("/").pop() ?? "";
  if (BOTTLE_IMAGE_FILENAMES.has(filename)) return "object-cover scale-[1.3]";
  return "object-cover";
}
