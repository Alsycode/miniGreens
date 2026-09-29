# Blog SEO plan — 2026-09-29

Method: ~720 Google autocomplete queries (India locale) scraped with Scrapling from 24 microgreens/tea seeds (`/tmp/kw/sug.json`, not committed). No volume data (Semrush unpaid), so ranking is by suggestion frequency, buyer intent and fit with what Mini Greens sells (microgreens, tea blends, juices/smoothies, Bangalore delivery, partner programme).

Existing 7 posts are brand/story pieces. None targets a search query except partly "keeping greens alive" (storage). The posts below are the missing search-driven ones.

## Priority 1 — high demand, direct product fit
| # | Slug | Target keyword | Category |
|---|------|----------------|----------|
| 1 | how-to-grow-microgreens-at-home-in-india | how to grow microgreens at home (in india / without soil) | Kitchen |
| 2 | best-microgreens-and-their-benefits | best microgreens benefits | Nutrition |
| 3 | buy-microgreens-in-bangalore | buy microgreens bangalore / microgreens price | Farm |
| 4 | broccoli-microgreens-benefits-nutrition-recipes | broccoli microgreens benefits / nutrition / price | Nutrition |
| 5 | microgreens-vs-sprouts | broccoli microgreens vs sprouts | Nutrition |
| 6 | do-microgreens-have-protein | do microgreens have protein (sunflower, pea) | Nutrition |
| 7 | microgreens-for-weight-loss | are microgreens good for weight loss / how to eat | Nutrition |

## Priority 2 — long-tail and tea line
| # | Slug | Target keyword | Category |
|---|------|----------------|----------|
| 8 | best-microgreens-recipes-salads-smoothies | best recipes with microgreens / microgreens smoothie | Kitchen |
| 9 | microgreens-for-diabetes | best microgreens for diabetes | Nutrition |
| 10 | microgreen-tea-benefits-when-to-drink | detox tea / green tea benefits, when to drink | Nutrition |
| 11 | microgreens-side-effects-and-safety | microgreens side effects (pregnancy, kids) | Nutrition |
| 12 | how-to-store-microgreens | how to store microgreens (rewrite/merge with "keeping-your-greens-alive-for-a-week") | Kitchen |

## Priority 3 — partner/B2B and niche
| # | Slug | Target keyword | Category |
|---|------|----------------|----------|
| 13 | how-to-start-a-microgreens-business-in-india | how to grow microgreens business / how much can you make | Farm |
| 14 | sunflower-and-pea-shoots-benefits | sunflower microgreens benefits/protein | Nutrition |
| 15 | microgreens-for-kids | growing/eating microgreens with kids | Kitchen |

## Notes
- Each post needs: unique title (<60 chars), 150-char excerpt, 700-1200 words, one h2 per sub-question (matches autocomplete phrasing), internal links to relevant `/shop/<slug>` products, and a 16:9 hero image with descriptive alt text.
- Avoid unverifiable health claims (cancer, diabetes cure). Frame as "may support", cite general nutrition facts only.
- Add each post to `lib/journal.ts` (sitemap and article JSON-LD pick it up automatically).
- Images: `public/images/journal/<slug>.png`, generated with Kling `kling-image-v3_0`, 16:9.
