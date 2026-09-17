# Blue Tea (bluetea.co.in) — Website Research Report

**Researched:** 2026-09-06
**URL:** https://bluetea.co.in
**Brand entity:** Redplum Private Ltd. (formerly "Blue Tea India"), Madhyamgram, Kolkata
**Category:** Direct-to-consumer (D2C) Ayurvedic / flower-based herbal tea
**Positioning line:** *"Health in Every Sip"* · *"Enter the World of Beautiful Teas"*
**Proof markers used everywhere:** "As Seen on Shark Tank India", "30 Lakh+ Happy Customers", "Featured on Shark Tank India"

> Purpose of this document: capture how the Blue Tea storefront is built and how it behaves, as a
> reference while refining the MiniGreens website/store UI. A companion file,
> [`BLUETEA_DESIGN.md`](./BLUETEA_DESIGN.md), extracts the reusable design system.

---

## 1. Snapshot

| Aspect | Finding |
|---|---|
| Platform | **Shopify** (theme built on Montserrat; storefront domain `blueteain.myshopify.com`) |
| Checkout | **GoKwik** one-click checkout + KwikPass OTP login + KwikCart slide-out cart + GoKwik RTO/"Frontline Guardian" fraud/COD control |
| Reviews | **Judge.me** (carousel + PDP widget + rating histogram + customer photos/videos) |
| Shipping / serviceability | **Shiprocket** (pincode "Check Product Availability" on PDP) |
| Promo bars | **Hextom Event Promotion Bar** (rotating announcement strip) |
| Upsell / cross-sell | **Logbase SellEasy** ("You may also like", frequently-bought-together) + a "push cart" upsell app |
| Product badges | **Samita Product Labels** ("Best Value", "As Seen On Shark Tank", sale flags) |
| Support / assistant | **HelioAI** floating chat assistant (circular presenter avatar, bottom-right) |
| UGC / community | **Togethr** ("mini-wt") shoppable UGC + Widgetic embeds |
| Analytics/consent | Shopify Consent Tracking API, Shopify Perf Kit 3.8.9 |
| Primary font | **Montserrat**, sans-serif (Helvetica/Arial fallback) |
| Brand colour | Royal/navy blue **#27398F** |
| CTA colour | Yellow **#FFD814** (Amazon "Buy now" yellow), pill-shaped |
| Sale/urgency colour | Red **#EC0101 / #EB001B** |

**Design philosophy in one sentence:** a conversion-optimised Shopify D2C store that dresses a
standard "hero → social proof → product rails → story" funnel in a clean white canvas, a single
strong blue, one loud yellow buy-button, and relentless trust/urgency cues (Shark Tank, review
counts, MRP-strikethrough, per-teabag pricing, "Best Value" badges).

---

## 2. Design philosophy & brand feel

1. **Wellness, not luxury.** Bright, airy, high-key product photography on white; blue-pea-flower
   blues, hibiscus reds, chamomile yellows carried in from the packaging. Reads friendly and
   health-forward rather than premium/artisanal. Tagline "Enter the World of *Beautiful* Teas" —
   the colour-changing butterfly-pea tea is the hero visual gimmick ("add lemon → it turns
   purple").
2. **One blue, one yellow, one red.** Disciplined palette. Blue = brand/ąheadlines/icons.
   Yellow = the single most important action (Add to Cart / buy). Red = price drops and urgency
   only. Everything else is white / near-black text (#222).
3. **Trust is the layout.** Nearly every surface carries a proof element: the announcement bar
   cycles Shark Tank + "30 Lakh+ customers" + free-gift threshold; product cards show star rating
   **and raw review count**; the marquee strip repeats "Zero Caffeine · Farm-fresh · All Natural ·
   No preservatives · Plant-Based Teabags"; PDP has a 3-icon trust row (Caffeine Free / Fastest
   Delivery / Carcinogen Free).
4. **Benefit-led naming.** Products are named for outcomes, not botany: "Belly Fat Herbal Tea",
   "Gut Cleanse", "Liver Cleanse", "Sleep Time", "She Balance", "Skin Glow", "Dia Care". Each
   card also has a 2-word benefit tag ("Metabolic Support | Boosts Immunity").
5. **Value engineering on the page.** Variant selector is built as *pricing tiers* (Starter Pack /
   Transformation / Progress) showing **price per tea bag** and a "Best Value" badge — nudging
   basket size, not just a size dropdown.
6. **Campaign layer on top of system.** Seasonal/creator campaigns ("Tanya's Favourites",
   "Brew Better Together", "Wellness Wrapped") are delivered as full-bleed image banners with a
   script/display headline font — they sit *on top of* the otherwise systematic layout.
7. **Mobile-first.** Centered logo, hamburger + mega-menu drawer, slide-out cart, sticky
   add-to-cart bar on PDP, thumb-reachable steppers.

---

## 3. Information architecture

**Primary nav (desktop top bar / mobile drawer):**

- **Bestseller** → `/collections/bestseller`
- **Sampler Pack** → `/collections/sampler`
- **Wellness** → `/collections/wellness-pack`
- **New Arrivals** → `/collections/new-launches`
- **Combo** → `/collections/combos`
- **Corporate Gifting** → `/pages/b2b`
- **About Us** → `/pages/about-us`
- **Blog** → `/blogs/news`
- **Contact** → `/pages/contact-us`

**Mega-menu / drawer sub-collections:**
Wellness Packs · Butterfly Pea Flower Tea Blends (`/collections/blue-tea`) · Flower Tea Blends
(`/collections/loose-tea`) · Herbs & Leaves (`/collections/herbs-leaves`) · Sampler Packs ·
Accessories (`/collections/accessories-1`).

**Header utilities:** centered flower logo · search (`/search`) · account / "Order History" /
"Log in" (GoKwik KwikPass, `javascript:void(0)` modal) · wishlist with count
(`/search/?view=wishlist`) · cart with item count + running total (`/cart`, opens slide-out).

**Footer:**
- Company block: Redplum Private Ltd., Shiv Shakti Complex, Badu Road, Madhyamgram, Kolkata –
  700155 · contact@bluetea.co.in · +91 7980528437 / +91 7980116079
- Social: Facebook, Twitter, Instagram, YouTube, Pinterest
- **EXPLORE:** New Arrivals · Shop · Blog · Our Story · Contact Us
- **POLICIES:** Terms & Condition · Cancellation & Refund Policy · Privacy Policy · Shipping Policy
- "About Blue Tea" SEO paragraph + READ MORE
- © 2025 BLUE TEA

---

## 4. Page-by-page functionality

### 4.1 Global chrome
- **Announcement bar** (Hextom): rotating messages — "Featured on Shark Tank India 🦈",
  "🎁 Free Gift on Orders Above ₹1299!", "🎉 30 Lakh + Happy Customers". Blue background, white
  text, auto-advancing.
- **Sticky header**: shrinks on scroll; logo centered; icons right.
- **Slide-out cart** (GoKwik KwikCart): opens on add-to-cart; free-gift / free-shipping progress,
  quantity edit, upsell slots, "Proceed to checkout" → GoKwik one-page checkout.
- **HelioAI assistant**: persistent circular avatar bottom-right, opens chat/FAQ.
- **Wishlist**: heart on every card + dedicated wishlist view.

### 4.2 Home (`/`)
Sequence:
1. Rotating **hero banners** (campaign creative — "Brew Better Together" / KAHWA range, "Tanya's
   Favourites", "Wellness Wrapped") with prev/next arrows.
2. **Marquee trust strip** — infinite scroll of "Zero Caffeine • Farm-fresh Quality • All Natural
   • No preservatives • Plant-Based Teabags".
3. **"Enter The World of Beautiful Teas"** — bestseller product carousel. Cards: image, Wishlist,
   Quick view, title, benefit tag, MRP (struck) + sale price, review count, **Add to cart**.
4. **"NEW ARRIVALS"** — second product carousel.
5. **"THE VOICE OF OUR CUSTOMERS"** — testimonial cards (name, role, city, short quote).
6. **"OUR STORY"** — mission copy: authentic Indian Ayurvedic herbal tea; ~1000 farmer families
   by 2025; farmer income up 5×; **90% of farmers are women** (women-empowerment angle); farm-to-cup
   supply chain.
7. Footer.

### 4.3 Collection / PLP (e.g. `/collections/bestseller`)
- Collection **hero banner** ("Our Most Loved Brews").
- **Filter** control + **Sort** dropdown (default "Featured").
- Responsive product grid, same card component as home.
- Product-label badges overlaid ("As Seen On Shark Tank", sale %).
- Lazy-loaded images, infinite/`paginated` scroll.

### 4.4 Product / PDP (e.g. `/collections/.../products/butterfly-pea-flower-tea-100-teabags`)
- **Breadcrumb** (Home › Bestseller › Product) + **prev/next product** chevrons + back-to-collection.
- Image gallery (thumbnails + main, zoom, customer photos further down).
- Title + benefit tag ("Supports Fitness | Boosts Energy") + **"Read more"** expander.
- Judge.me **star rating + review count** (e.g. 4.75/5 from 1,103) linking to reviews.
- **Price block**: "MRP ₹1,299.00" struck in grey + "₹899.00" in red + "(inclusive of all taxes)".
- Short benefit bullets (Boosts Metabolism & Fat Burning / Natural Detox / Caffeine-Free &
  Keto-Friendly / Curbs Cravings) + "How to Enjoy" usage copy with emoji.
- **Variant selector as pricing tiers** — card per size:
  - *Starter Pack* — 100 tea bags — ₹1,299 → ₹899 — "₹8.99 per tea bag"
  - *Transformation* — 200 tea bags — ₹2,599 → ₹1,399 — **"Best Value"** — "₹6.50 per tea bag"
  - *Progress* — 300 tea bags — ₹2,999 → ₹1,949 — "₹6.50 per tea bag"
- **Quantity stepper** (− / +).
- **ADD TO CART** (yellow pill) + **Add to Wishlist**.
- **Pincode serviceability**: "Check Product Availability" input + "Check Now" (Shiprocket).
- **Trust icon row**: Caffeine Free · Fastest Delivery · Carcinogen Free.
- **Sticky mobile add-to-cart bar**: mini thumbnail + name + qty stepper + ADD TO CART, pinned
  bottom on scroll.
- "MANUFACTURED & MARKETED BY" disclosure block (FSSAI-style compliance).
- **Customer Reviews** (Judge.me): rating summary, 5→1 star histogram with counts, individual
  reviews with "Full Review" expander, **Customer photos & videos** gallery, "Read More Reviews".
- **"YOU MAY ALSO LIKE"** recommendation rail (Logbase).
- Cross-sell / "frequently bought together" bundle widget.

### 4.5 About Us (`/pages/about-us`)
Mostly image-based long-form: "WHO WE ARE?", "WHAT DO WE OFFER?", "FARMER PROMISE?" — reiterates
Ayurveda + farm-direct + women farmers narrative.

### 4.6 Blog (`/blogs/news`)
Standard Shopify article index → article template (SEO content: tea benefits, recipes, how-to-brew).

### 4.7 Corporate Gifting (`/pages/b2b`)
B2B landing / enquiry page for bulk & corporate gift orders.

### 4.8 Contact (`/pages/contact-us`)
Contact form + address + phone/email + support hours.

### 4.9 Account / auth
Passwordless — **GoKwik KwikPass** phone-OTP modal; "Order History" for logged-in users; no
traditional email/password signup surfaced.

### 4.10 Cart & checkout
`/cart` page + KwikCart slide-out → **GoKwik one-click checkout** (saved address/UPI/COD,
prepaid discounts, COD verification via GoKwik RTO). Free-gift threshold (₹1,299) reinforced in
cart.

---

## 5. Conversion / growth mechanics observed

| Mechanic | Where |
|---|---|
| Social proof — "Shark Tank", "30 Lakh+ customers" | Announcement bar, banners, product badges |
| Review count as trust signal (raw N, not just stars) | Every product card + PDP |
| Anchor pricing — MRP strikethrough + red sale price | Cards + PDP |
| Unit-economics framing — "₹ per tea bag" | PDP variant tiers |
| "Best Value" tier nudge | PDP variant selector |
| Free-gift threshold (₹1,299) | Announcement bar + cart progress |
| Urgency / scarcity language | Banners, promo bar |
| Wishlist (retargeting + return visits) | Global |
| Quick view (reduce clicks to cart) | All product rails |
| Upsell / cross-sell / FBT bundles | PDP + cart (Logbase, push-cart) |
| Pincode serviceability pre-check | PDP (reduces checkout drop-off) |
| One-click OTP checkout (GoKwik) | Global |
| COD + RTO fraud control | Checkout |
| UGC / shoppable customer media | PDP + Togethr widget |
| AI support deflection | HelioAI assistant |
| Benefit-led SKU naming + condition targeting | Catalogue-wide |
| SEO content moat | Blog + footer copy + long-form About |

---

## 6. Catalogue structure

- **Hero line:** Butterfly Pea Flower (the colour-changing "blue tea").
- **Flower ranges:** Hibiscus (skin), Chamomile (sleep), plus blends of each with mint, rose,
  ginger, cinnamon, lavender, lemongrass, citrus.
- **Wellness/functional packs (benefit-named):** Belly Fat, Lean, Slim, Gut Cleanse, Liver
  Cleanse, She Balance, Sleep Time, Stress Relief Calm, Skin Glow, Dia Care, Detox Desi Kahwa.
- **Formats:** loose flower tea (100 g / 50 g), pyramid tea bags (30/50/60/90/120/200/300),
  sachets, monthly packs, sampler packs (6 flavours), combos.
- **Accessories:** Pen Tea Infuser, infusers.
- **Gifting:** gift packs, corporate/B2B.
- Pricing band roughly ₹199–₹2,599 MRP; heavy discounting to ₹199–₹1,949.

---

## 7. Takeaways for MiniGreens

**Worth borrowing:**
- Disciplined 1-brand-colour + 1-CTA-colour system with a hard-working yellow buy button.
- Trust scaffolding: rotating announcement bar, review counts on cards, a repeating
  "why us" marquee strip, a 3-icon trust row on PDP.
- PDP variant selector as **value tiers with per-unit price + "Best Value"**, not a bare dropdown.
- Sticky mobile add-to-cart bar.
- Pincode/serviceability check on PDP before checkout.
- Benefit-led product naming + a 2-word benefit tag on every card.
- Quick view + wishlist on rails; slide-out cart with free-gift progress.
- "Our Story" block with a concrete, verifiable social-impact claim (farmers, women).

**Be cautious about:**
- Very heavy third-party app stack (GoKwik, Judge.me, Hextom, Logbase, Helio, Togethr,
  Shiprocket, Samita…) — real performance/UX cost; fine on Shopify, heavier to hand-roll.
- Aggressive MRP-strikethrough discounting can cheapen a premium/fresh-produce brand.
- Campaign banners are image-only (weak a11y/SEO, no text scaling).
- About/gifting pages are near-entirely images — poor accessibility and slow.

---

## Sources

- [Blue Tea storefront](https://bluetea.co.in) (home, `/collections/bestseller`, PDP, `/pages/about-us`, footer — inspected 2026-09-06)
- [BLUE TEA INDIA — Crunchbase](https://www.crunchbase.com/organization/blue-tea-india)
- [BLUE TEA INDIA — Facebook](https://www.facebook.com/BlueTeaGlobal/)
