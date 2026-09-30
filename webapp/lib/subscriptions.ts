// Business data reproduced here (rather than imported from the mobile mock) since
// the mobile mock's images use React Native require() which doesn't resolve in
// Turbopack. Only the TypeScript type is shared, matching admin/lib/data.ts.
import type { SubscriptionPlan } from "@mobile/types";

export type { SubscriptionPlan };

export const subscriptionPlans: SubscriptionPlan[] = [
  { id: "sub-1", name: "Starter", description: "Perfect for individuals starting their wellness journey", price: 399, unit: "week", deliveryFrequency: "Weekly", items: ["2 smoothies", "1 fresh juice", "Free delivery"], benefits: ["Free delivery", "Flexible skip", "Cancel anytime"], isPopular: false, color: "#4CAF50" },
  { id: "sub-2", name: "Wellness", description: "Our most popular plan for daily freshness", price: 699, unit: "week", deliveryFrequency: "Weekly", items: ["4 smoothies", "3 fresh juices", "1 seasonal special"], benefits: ["Free delivery", "Priority support", "Cancel anytime"], isPopular: true, color: "#2E7D32" },
  { id: "sub-3", name: "Family", description: "Complete freshness for the whole family", price: 1199, unit: "week", deliveryFrequency: "Weekly", items: ["6 smoothies", "6 fresh juices", "2 seasonal specials"], benefits: ["Free delivery", "Priority support", "15% off add-ons", "Cancel anytime"], isPopular: false, color: "#1B5E20" },
  { id: "sub-4", name: "Active Greens Box", description: "Curated microgreens box for the health-conscious", price: 499, unit: "week", deliveryFrequency: "Weekly", items: ["3 microgreens", "1 seasonal special", "Care instructions"], benefits: ["Free delivery", "Flexible skip", "Cancel anytime"], isPopular: false, color: "#66BB6A" },
  { id: "sub-5", name: "Golden Years Box", description: "Nourishing microgreens crafted for senior wellness", price: 599, unit: "week", deliveryFrequency: "Weekly", items: ["2 nutrient-dense microgreens", "1 wellness shot pack", "Senior-friendly recipes"], benefits: ["Free delivery", "Flexible skip", "Cancel anytime"], isPopular: false, color: "#FFA726" },
  { id: "sub-6", name: "Workplace Wellness Box", description: "Keep your team thriving with fresh microgreens weekly", price: 699, unit: "week", deliveryFrequency: "Weekly", items: ["5 assorted microgreens", "2 wellness shots", "Team recipes"], benefits: ["Free delivery", "Priority support", "Bulk ordering", "Cancel anytime"], isPopular: true, color: "#5a7538" },
];

// Maps a plan's freeform item line (e.g. "2 smoothies", "1 fresh juice") to a shop
// category slug and count, so the checkout flow can let people choose which actual
// flavors fill those slots. Lines with no leading count or no matching category
// (delivery perks, "seasonal special", etc.) are shown as-is, not made pickable.
const ITEM_CATEGORY_KEYWORDS: { keyword: string; slug: string }[] = [
  { keyword: "smoothie", slug: "smoothies" },
  { keyword: "juice", slug: "juices" },
  { keyword: "microgreen", slug: "microgreens" },
  { keyword: "tea", slug: "tea-blends" },
];

export interface ParsedPlanItem {
  raw: string;
  qty: number | null;
  categorySlug: string | null;
}

export function parsePlanItem(raw: string): ParsedPlanItem {
  const match = raw.match(/^(\d+)\s+(.*)$/);
  if (!match) return { raw, qty: null, categorySlug: null };
  const qty = Number(match[1]);
  const rest = match[2].toLowerCase();
  const found = ITEM_CATEGORY_KEYWORDS.find(({ keyword }) => rest.includes(keyword));
  return { raw, qty, categorySlug: found?.slug ?? null };
}
