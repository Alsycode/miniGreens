# Webapp Homepage — Conversion & UI Plan

Sources: `MGC 2.0.pdf` (partner model, product line-up, subscription model, subscription form)
and `Mobile APP.pdf` (one platform, Customer / Partner / Café roles, birthday rewards, offers).
Scope: `webapp/app/page.tsx` and `webapp/components/home/*`. Status: **All phases (P1–P6) done (2026-09-21).** Remaining open items are listed at the end of the P5/P6 notes.

> **P6 notes:**
> - **Hero:** image-first on mobile (full opacity, instead of 40%). CTAs are Shop Now (`/shop`) + Start a Subscription (weekly builder), and the subline names all three categories.
> - **Rhythm:** Bestsellers is white and Find Your Blend is cream, so the sections now alternate. Handwritten doodles are down to 2 (hero + Green Detox).
> - **Type:** all 9–11px homepage text is now 12px (except the cart badge digit). The Green Detox badge is bigger.
> - **Mobile:** new `home/StickyShopBar` (scroll-driven; shows after the hero, hides at the footer). Bestseller cards use the round add button on phones. The mobile menu has search.
> - **Nav:** "Partner With Us" link; desktop links no longer wrap at 1024px. The cart drawer says "1 item".
> - **Images:** not converted. `next/image` already serves resized WebP via `/_next/image`.
> - **Open items:** free-delivery ≥₹499 promise vs the flat ₹35.49 checkout fee; birthday discount must exist in admin;
>   `/subscriptions` still leads with the curated smoothie boxes; tube images for Apple/Ginger/Hibiscus; decision 1 (drinks line);
>   unused `public/images/leaf-bg.png`; pre-existing `ContactForm.tsx` type error.

> **P5 notes (decisions 5–6 answered):** social proof wasn't real, so `lib/reviews.ts` `SHOW_RATINGS = false`
> hides seeded star ratings on the homepage cards, shop cards and product pages (flip it when a real reviews system exists).
> The hardcoded `Testimonials` were deleted and replaced by `home/TrustPromise` (commitments the site already makes, plus a
> "Tell us what you think" link to /contact). The announcement bar lost "Free gift ≥₹999" (never implemented) and
> "30,000+ customers". No first-order offer. Capture = `home/JoinSection` (`#join`): logged out → sign up
> (`/login?redirect=/#join`); logged in without a DOB → inline birthday form that writes `profiles.date_of_birth`; with a DOB →
> links to orders and subscriptions. The footer form now GETs `/login?email=` (the login form prefills the email). No new tables.
> **Open issue:** the cart drawer promises free delivery ≥ ₹499, but `checkout/page.tsx` and `cart/page.tsx` always
> charge a flat `DELIVERY_FEE = 35.49`. **Needs:** an active `is_birthday_offer` discount in admin, or the birthday reward copy is empty.

> **P4 notes:** new `home/FarmStory` (merges the deleted `FarmToCup` + `WhyMicrogreens`; the CTA is now Shop
> Fresh Microgreens, and health claims are softened), `home/PartnerSection`, `home/BusinessStrip`. Page order: … Subscription →
> Green Detox → Farm story → Partner → Reviews → Business. Decision 4: the "0% platform fee for women
> partners" line was already public in `PartnerApplyForm`, so the homepage repeats it. The business strip links
> to `/partner/apply?type=<cafe|restaurant|shop|fitness_wellness|community>`. The apply page now presets
> the type and keeps it through the login redirect. `public/images/leaf-bg.png` is now unused.

> **P3 notes:** the subscription teaser now sits right after Find Your Blend. Weekly/Monthly/Build Your Own
> link to the existing builder `/subscriptions/custom`, which now reads `?frequency=weekly|monthly` and
> `?product=<slug>` and keeps them through the login redirect. Green Detox has an "Or get it delivered every
> week" link. That resolves decision 3 for these plans: **price = sum of chosen products**, same as the builder.
> **Not changed:** `/subscriptions` (reskinned separately on 2026-09-21), which still leads with the
> curated smoothie/juice boxes from the `subscription_plans` table. The homepage links there only as
> "See our curated boxes". Aligning that page with the MGC 2.0 structure is a separate task.

> **P2 notes:** new `home/CategoryTrio`, `home/Bestsellers` (+ `BestsellerTabs`, `HomeProductCard`,
> `QuickAdd`), `home/FindYourBlend` (replaces the deleted `DailyNeed`). Data comes via `lib/homeProducts.ts`
> (React `cache`, one query shared by both sections), and taste copy is in `lib/blends.ts`. **Placeholders:**
> Green Apple / Ginger Green / Green Hibiscus use the old brewed-cup photos from `productImages.ts`, so swap
> them there when tube cutouts land. The "Microgreen Drinks" tile maps to smoothies + juices until decision 1 is made.

> **P1 notes:** all 8 blends are already seeded in Supabase (`supabase/migrations/20260908164500_tea_blends.sql`,
> with ratings and review counts), so decision 2 is half-answered. Only images are missing. The homepage
> teaser no longer uses `lib/subscriptions.ts`, but `/subscriptions` and `/subscribe` still show the old
> smoothie/juice plans. That page needs the same rework before the "Start Weekly/Monthly" CTAs land well.

---

## 0. Positioning the homepage has to carry

From the two docs, MGC is **not just a tea shop**. It is:

> **A healthy-food & microgreens platform** — customers buy and subscribe, partner growers
> earn, cafés source in bulk. *"You Grow. We Connect. Together, We Grow."*

Three customer product categories (per MGC 2.0):

| Category | What it is | In the webapp today |
|---|---|---|
| 🌱 Raw Microgreens | fresh trays for home/meals | `microgreens` ✅ |
| 🍃 Microgreen Bags | ready-to-brew blends (8 SKUs) | `tea-blends` ✅ (only 5 images) |
| 🥤 Microgreen Drinks | for runners / active / health communities | ❌ — site has `smoothies` + `juices` instead |

The homepage must speak to **3 audiences**, in this priority:
1. **Customer** (buy / subscribe) — ~80% of the page
2. **Partner grower** (women, seniors, homemakers, home growers) — one strong section
3. **Café / shop / office** (bulk orders) — one compact strip

The current page talks only to #1, and even there mostly about a single product.

---

## 1. Content fixes that come *from the PDFs* (do first — they're wrong today)

| # | Issue | Where | Fix |
|---|---|---|---|
| 1.1 | Green Detox described as "pea, radish, broccoli and sunflower" | `SignatureProduct.tsx` | PDF: **broccoli + arugula, mint + coriander, "fresh, slightly spicy"** |
| 1.2 | Subscription teaser shows "4 smoothies, 3 juices" / "Workplace Wellness Box" | `SubscriptionTeaser.tsx`, `lib/subscriptions.ts` | Replace with PDF plans: **Weekly Plan / Monthly Plan / Build Your Own**, and example bundles *Weekly Green* (Raw + Bags), *Active Lifestyle* (Bags + Drinks), *Complete MGC* (all three) |
| 1.3 | "Daily Need" only covers 3 blends + microgreens | `DailyNeed.tsx` | Map to the 8-blend line-up using the PDF's taste profiles (see §3.3) |
| 1.4 | Testimonial praises "the hibiscus one" | `Testimonials.tsx` | OK — Green Hibiscus exists in PDF, but make sure the SKU is live, or swap the quote |
| 1.5 | Category language "tea" vs PDF "Microgreen Bags" | site-wide copy | Decide one customer-facing name. Recommend **"Microgreen Tea Bags"** on the homepage (clear to shoppers) with "Microgreen Bags" as the category |

**Open question for you:** the PDF's second table ("MGC Green Lemon / Original / Apple / Tulsi / Mint / Ginger", sunflower-broccoli-arugula bases) — is that the **Microgreen Drinks** line, or a v2 of the bags? It decides what goes in the Drinks tile.

---

## 2. New homepage structure (top → bottom)

```
 0  Announcement bar      rotating: free gift ≥₹999 · first-order offer · Bengaluru delivery
 1  Hero                  customer promise + 2 CTAs (Shop / Subscribe)          [rework]
 2  Category trio         Raw Microgreens · Microgreen Bags · Microgreen Drinks [new]
 3  Bestsellers           4–8 real products, price, rating, quick-add           [new]
 4  Find your blend       8 blends by moment/taste (replaces "Daily Need")      [rework]
 5  Subscription          Weekly / Monthly / Build-your-own + "Why subscribe"   [rework, moved up]
 6  Signature product     Green Detox, corrected copy, benefits + quick-add     [keep, fix]
 7  Farm → cup + Why MG   merged into one story section, shop CTA               [merge]
 8  Community / Partner   "Become an MGC Partner" — grow & earn                 [new]
 9  Reviews               real reviews from DB, honest aggregate                [rework]
10  Business strip        Cafés · Restaurants · Offices · Gyms → bulk order     [new]
11  Join / offer          WhatsApp or email capture + birthday reward hook      [new]
    Footer
```

Rationale: products and price appear within the first two scrolls; subscription (highest LTV)
moves from last to 5th; the partner story becomes a brand differentiator ("your order supports
local growers") instead of being hidden on `/partner/apply`.

---

## 3. Section-by-section spec

### 3.1 Hero (`HomeHero.tsx`)
- Headline stays in the brand voice; subline states the offer plainly:
  *"Microgreens, microgreen tea bags & drinks — grown fresh, delivered across Bengaluru."*
- CTAs: **Shop Now** (primary → `/shop`) + **Start a Subscription** (secondary → `/subscribe`).
  Drop "Watch Our Story" unless a real video exists.
- Replace the 4 badges with a trust row: ★ rating (real) · Cut to order · Free delivery on subs · Caffeine-free teas.
- Mobile: image-first (product fully visible, not 40% opacity), text below, badges in a 2×2 grid.

### 3.2 Category trio (new `CategoryTrio.tsx`)
Three large tiles mirroring the PDF's three categories, each with a one-liner from the doc:
- Raw Microgreens — *"for your meals, salads & smoothies"*
- Microgreen Bags — *"an easy daily way to enjoy greens"*
- Microgreen Drinks — *"for active lifestyles & running clubs"*

If Drinks aren't sellable yet: show a **"Coming soon — join the waitlist"** tile (feeds capture, §3.11).

### 3.3 Bestsellers (new, reuse `ProductCard`)
- Server-fetch top products from Supabase (`is_available`, sorted by a `featured`/sales flag).
- Card: image, name, **taste tag from PDF** ("Light, citrusy", "Warm, aromatic"), price, rating, quick-add.
- Tabs or chips: *Tea Bags · Microgreens · Drinks*.

### 3.4 Find your blend (rework `DailyNeed.tsx`)
All 8 blends, grouped by moment, using the PDF's taste column:

| Moment | Blends |
|---|---|
| Morning energy | Green Vitality (fresh, mild) · Green Lemon (light, citrusy) |
| Daily detox | Green Detox (fresh, slightly spicy) · Green Hibiscus (tart) |
| Warm & comforting | Green Masala (Indian herbal) · Ginger Green (warm, citrusy) |
| Cool & light | Mint Green (cool) · Green Apple (mild, fruity) |

Optional v2: a 2-question "Which blend is you?" quiz → recommends 1 + adds to cart.
**Needs:** product images for Green Apple, Ginger Green, Green Hibiscus (only 5 exist in `public/images/tea`).

### 3.5 Subscription (rework `SubscriptionTeaser.tsx`, move up)
Copy straight from MGC 2.0:
- Headline: **"Fresh. Healthy. Delivered Regularly."** Sub: *"Choose your greens. Choose your schedule. Make it a habit."*
- 3 cards: **Weekly Plan** (best for families, regular users) · **Monthly Plan** (individuals, offices) · **Build Your Own** (pick products → qty → weekly/monthly).
- 3-step visual: Choose products → Choose frequency → We deliver.
- "Why subscribe" chips: Freshness · Convenience · Healthy habits · Easy planning · **Supports partner growers**.
- Each card CTA deep-links with the plan preselected (`/subscribe?plan=weekly`).
- Show a subscribe-and-save number if pricing allows (needs decision — see §6).

### 3.6 Signature product (`SignatureProduct.tsx`)
- Fix ingredients per §1.1. Add a "Brew in 3 min" / "15 sachets" line and a quantity stepper.
- Add "Subscribe & save" toggle next to Add to cart.

### 3.7 Farm → cup + Why microgreens (merge `FarmToCup` + `WhyMicrogreens`)
- One section, not two thin ones. Seed → Grow → Harvest → Deliver + 4 benefits.
- Reframe the grow step around the partner network: *"Grown by MGC and our partner growers, to MGC quality standards."*
- CTA → **Shop fresh microgreens** (not /blog). Soften "40x nutrients" claim or cite.

### 3.8 Community / Partner (new `PartnerSection.tsx`)
The biggest missing piece given MGC 2.0.
- Headline: **"Grow with us. We'll help you reach the market."**
- 4-step strip: You Grow → We Connect → We Help You Sell → You Earn.
- Audience chips: Women · Senior citizens · Homemakers · Home growers · Small farmers.
- Highlight **0% platform fee for women partners** (from Mobile APP doc) — strong, specific hook.
- CTA: **Become a Partner** → `/partner/apply` (already exists).
- Tagline: *"You Grow. We Connect. Together, We Grow."*
- For customers it also works as a values/trust section ("every order supports a local grower").

### 3.9 Reviews (`Testimonials.tsx`)
- Pull real reviews + average from DB; show star value that matches the data.
- Drop "30,000+" unless verified. Keep city names consistent with delivery area.
- "View all reviews" → a real reviews anchor or `/shop`.

### 3.10 Business strip (new, compact)
*"Cafés, restaurants, offices & gyms — order in bulk."* Icons for each partner business type
from the Mobile APP doc (Café, Restaurant, Shop, Fitness/Wellness, Community).
CTA → business enquiry (short form or WhatsApp) until the partner dashboard's "Place Business Order" exists.

### 3.11 Join / offer (new)
- WhatsApp-first capture (matches the doc's SMS/WhatsApp consent) with email as fallback.
- Offer: first-order discount **+ birthday reward** ("Tell us your birthday, get a gift") — uses the DOB field the docs require.
- Drinks waitlist can post here too.

---

## 4. Navbar & global (small, high-value)
- "Farm to Home" button → rename **"Subscribe"**.
- Add **"Become a Partner"** to nav links (or footer + mobile menu at minimum).
- Heart icon → either a real wishlist or change to a Package icon for Orders.
- Hide cart badge at 0. Show search on mobile.
- Cart drawer: free-gift progress bar toward ₹999.

## 5. Visual / UI rules for the rework
- Vary layouts: hero (split) → category trio (3-up tiles) → product carousel → subscription (cards on tinted bg) → story (full-bleed image) → partner (dark forest band) → reviews (white) → business strip (thin) → capture (sun-yellow band). No two adjacent sections with the same layout.
- Minimum body text 13px, labels 12px; no 9–11px text on dark backgrounds.
- `ScriptNote` doodles: max 2 on the page (hero + partner).
- One primary CTA colour (sun) per section; secondary is outline.
- Convert hero/product PNGs to WebP/AVIF; hero image `priority`, everything else lazy.
- Mobile: sticky bottom bar "Shop · Subscribe" after the hero scrolls out.

## 6. Decisions needed from you
1. What is the **Microgreen Drinks** line (PDF's second "MGC Green …" table?) and is it sellable now?
2. Are **all 8 bag blends** live in Supabase, and do we have images for Apple / Ginger / Hibiscus?
3. Subscription pricing: fixed Weekly/Monthly prices, or price = sum of chosen products (± a subscriber discount %)?
4. Is the **0% fee for women partners** confirmed for public messaging?
5. Offers: first-order discount amount? Birthday reward (what gift/discount)?
6. Is "30,000+ customers" a real number?
7. Delivery area: Bengaluru-only for everything, or tea bags ship pan-India?

## 7. Build order
| Phase | Work | Size |
|---|---|---|
| **P1 — Fix what's wrong** | §1 copy fixes, subscription plan data, nav label, cart badge, "Watch Our Story" | S |
| **P2 — Get products on the page** | Category trio, Bestsellers row, Find-your-blend with 8 blends | M |
| **P3 — Subscription** | New teaser, moved up, deep-linked plans | M |
| **P4 — Platform story** | Partner section, Business strip, merged Farm/Why section | M |
| **P5 — Capture & trust** | Real reviews, WhatsApp/email + birthday capture, free-gift progress bar | M |
| **P6 — Polish** | Layout rhythm, type sizes, mobile hero + sticky bar, image formats | S–M |

Dependencies: P2 needs decision 2; P3 needs decision 3; P4 needs decision 4; P5 needs decisions 5–6.
