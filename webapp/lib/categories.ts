// Shared category ordering — mirrors the mobile app's CATEGORY_ORDER in
// `src/app/(tabs)/explore.tsx`. Tea-first, then the fresh lines; anything else
// trails. Keep the two in sync.

export const CATEGORY_ORDER = [
  "tea-blends",
  "microgreens",
  "smoothies",
  "juices",
  "bowls",
] as const;

export function catRank(slug: string): number {
  const i = CATEGORY_ORDER.indexOf(slug as (typeof CATEGORY_ORDER)[number]);
  return i === -1 ? 99 : i;
}

// Per-category shop hero copy. Falls back to the "everything" heading.
export const SHOP_COPY: Record<
  string,
  { eyebrow: string; title: string; accent: string; blurb: string }
> = {
  "tea-blends": {
    eyebrow: "Microgreen Teas",
    title: "Real Greens.",
    accent: "By the Cup.",
    blurb:
      "Functional microgreen tea blends — brewed fresh, naturally caffeine-free. 15 sachets a box.",
  },
  microgreens: {
    eyebrow: "Microgreens",
    title: "Every Tray We Grow,",
    accent: "Cut To Order",
    blurb:
      "Nothing sits in a warehouse. Pick your greens, choose a slot, and we harvest the morning your box goes out.",
  },
  smoothies: {
    eyebrow: "Smoothies",
    title: "Blended Fresh,",
    accent: "Never From Concentrate",
    blurb: "Cold-blended fruit and microgreens, bottled the day they reach you.",
  },
  juices: {
    eyebrow: "Cold-Pressed Juices",
    title: "Pressed That Morning,",
    accent: "Nothing Added",
    blurb: "Raw cold-pressed juice with a microgreen boost. No sugar, no water, no concentrate.",
  },
};

export const SHOP_COPY_DEFAULT = {
  eyebrow: "Shop",
  title: "Everything We Grow,",
  accent: "In One Place",
  blurb:
    "Tea blends, microgreens, cold-pressed juices and smoothies — all farm-fresh from Mini Greens.",
};
