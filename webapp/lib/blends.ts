// Microgreen tea blend profiles, from the MGC 2.0 product brief ("Microgreen Bags"
// table). Keyed by product slug; the DB holds price/rating, this holds the taste
// language the homepage uses to help people choose.

export type BlendProfile = { taste: string; notes: string };

export const BLEND_PROFILE: Record<string, BlendProfile> = {
  "green-vitality-bag": { taste: "Fresh, mild, refreshing", notes: "Lemongrass & mint" },
  "green-lemon-bag": { taste: "Light, citrusy", notes: "Lemongrass & lemon peel" },
  "green-detox-bag": { taste: "Fresh, slightly spicy", notes: "Mint & coriander" },
  "green-masala-bag": { taste: "Warm, aromatic", notes: "Ginger, tulsi & cardamom" },
  "mint-green-bag": { taste: "Cool, refreshing", notes: "Mint & lemongrass" },
  "green-apple-bag": { taste: "Mild, fruity", notes: "Dried apple & cinnamon" },
  "ginger-green-bag": { taste: "Warm, citrusy", notes: "Ginger & lemon peel" },
  "green-hibiscus-bag": { taste: "Tart, refreshing", notes: "Hibiscus, mint & lemon peel" },
};

export type BlendMoment = {
  id: "morning" | "detox" | "warm" | "cool";
  title: string;
  blurb: string;
  slugs: [string, string];
};

export const BLEND_MOMENTS: BlendMoment[] = [
  { id: "morning", title: "Morning Energy", blurb: "Bright, fresh starts.", slugs: ["green-vitality-bag", "green-lemon-bag"] },
  { id: "detox", title: "Daily Detox", blurb: "Clean, lively greens.", slugs: ["green-detox-bag", "green-hibiscus-bag"] },
  { id: "warm", title: "Warm & Comforting", blurb: "Cosy, spiced cups.", slugs: ["green-masala-bag", "ginger-green-bag"] },
  { id: "cool", title: "Cool & Light", blurb: "Easy after-meal sips.", slugs: ["mint-green-bag", "green-apple-bag"] },
];
