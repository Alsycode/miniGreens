# Tea-Focus UI — Plan, Progress & Image Prompts

Client direction (2026-09-08): **microgreen tea bags are the primary product** — the app
should lead with tea, in the "Microgreen Tea" light design language (pale-green canvas, white
cards, deep forest green CTAs, olive-green accents, serif headings).

---

## 1. Status

### ✅ Done (this pass) — verified in Expo web preview

| Area | Change |
|---|---|
| **Theme** `src/theme/colors.ts` | Flipped to the reference light palette. Two greens: `primary #2C4A32` (deep forest — CTAs, active tab, emphasis) + `accent #6f8f4a` (olive — price, links, selected). Canvas `#F3F7EA`, white cards. Old dark palette saved in `src/theme/colors.dark.bak.ts`. |
| **Shadows** `src/theme/spacing.ts` | Soft green-cast elevation for white-on-cream. |
| **Bottom tab bar** `src/app/(tabs)/_layout.tsx` | Light — white bar, hairline top, olive-tinted active pill, deep-green active icon/label. |
| **Home header** | Brand lockup "MiniGreens 🌿" + tagline "Pure Microgreen Tea. A Healthier You. 🌿". |
| **Search** | Placeholder → "Search microgreen tea blends…". |
| **Home hero card** (new) | `TeaHeroCard` in `index.tsx` — "NATURE IN A CUP" kicker, serif "Microgreen Tea", sub, deep-green pill "Shop Microgreen Tea →", 3 floating benefit badges (Antioxidants / Immunity / Energy). |
| **Category row** | `CategoryCard` gained a `circle` variant — round thumbnail + label + olive active underline. Home now renders categories as circles. |
| **Best sellers** | Heading → "Best Selling Microgreen Teas", sub → "Customer favourites, brewed for a better you. 🌿", "View all" in olive. |
| **Promo card** | Deep-forest gradient, "SMALL GREENS. BIG BENEFITS." / "Live Healthier with Microgreens" / "Explore Teas", + 3 benefit badges (Detox / Immunity / Energy). |
| **Blend list** `src/app/(tabs)/explore.tsx` | Full rewrite → tea-blend list. Serif "Tea Blends" header + sub. Filter chips (Tea/blend category floats first). Rows grouped by **derived taste family** (Everyday Greens / Citrus & Bright / Cool & Minty / Warming / Spiced & Masala / Floral / Fruity) with uppercase labels + counts. Each **`BlendRow`**: thumbnail with a per-blend accent ring (hash → botanical palette) + leaf fallback, name with the `(Bag)` variant split out muted, 1-line description, derived **taste tag pills** (`blendTags()` keyword scan + always `caffeine-free`), olive price, and a `+ Add` pill that becomes a `− n +` stepper — wired to `useCartStore`. Sticky **"N blends · ₹X → View cart"** bar (deep green) when the cart is non-empty. |

**Real assets wired** (from repo-root `assets/`, added by the client):
- `assets/tea-hero.png` → home hero card (`TEA_HERO` in `index.tsx`).
- `assets/bannerpic.png` → home promo card background.
- `assets/cat-microgreen-tea.png` / `cat-tea-blends.png` / `cat-loose-leaf.png` / `cat-tea-kits.png` /
  `cat-accessories.png` → circular category row. Matched by category **name** via `categoryArt()` in
  `index.tsx` → passed to `CategoryCard` as `imageOverride`. Currently only "Microgreens" resolves
  (→ `cat-microgreen-tea.png`); the rest auto-apply once the client creates the "Tea Blends",
  "Loose Leaf", "Tea Kits", "Accessories" categories in Supabase.
- Product-card images still come from Supabase per-product data — replaced when the tea catalogue is live.

### ⬜ Not done yet (next passes)

1. **Blend list — polish left:** taste-family filter chips (currently filters by *category*,
   families are only section groups); Bag/Tin variant selector; the taste derivation is keyword-based
   and only gets accurate once the real tea catalogue (Green Vitality, Green Lemon, …) is the data —
   verify tags then. Cart-bar add/stepper is wired but not click-tested in the web preview.
2. **Product detail (tea)** — bags per box, steep time & temp, caffeine-free badge,
   "best for" (morning/post-meal/evening), microgreen + botanical breakdown, "pairs well with" rail.
3. **Subscription → "Tea Box"** — pick 4/8/12 blends, weekly/monthly, swap anytime, "surprise me".
4. **"Find your blend" quiz** — taste → benefit → caffeine → time-of-day → 3 recommendations.
5. **Onboarding** — copy reframe to tea (currently still "Sip Fresh… smoothies & juices"),
   convert its dark hero to the light look.
6. **Secondary rail** — demote juices/smoothies/bowls to an "Also from MiniGreens" strip.
7. **Data** — `src/mock/index.ts` onboarding/testimonials/FAQ copy still drink-centric.

---

## 2. Design tokens (reference match)

```
primary        #2C4A32   deep forest — primary CTA, active tab, headline emphasis
primaryDark    #233C29   pressed
accent         #6f8f4a   olive — price, links, filter icon, selected underline
accentSoft     #5a7539   pressed olive / small green text
background      #F3F7EA   app canvas (pale green)
surface        #FFFFFF   cards
surfaceDark    #E7EFD5   pale promo tint
hero card bg   #DCE8C2 → #E9F1D8   (inline gradient)
text           #1D2B20 / #5B6B52 / #8A957E
radius         control 12 · card 20 · cardLarge 24 · pill
```

---

## 3. Image prompts

Generate on a **light / warm-daylight** set — no dark or charcoal backgrounds. Tea bags,
steaming cups, dried botanicals, microgreen trays. "No text, no watermark."

### 3.1 Home hero — `src/assets/tea-hero.png` (1200 × 900, PNG)
```
Professional product photography for a wellness app hero banner. A clear glass cup of
vivid green microgreen tea with gentle steam rising, resting on a light oak board.
A few loose microgreen sprigs and a paper tea bag beside it. Soft, bright, diffused
daylight from the left; warm high-key grade; pale green-cream background. The cup and
props sit in the RIGHT HALF of the frame with clean, empty, softly-lit space on the LEFT
for text overlay. Shallow depth of field. No text, no watermark, landscape 4:3.
```

### 3.2 Category circles — square 800 × 800, subject centred, pale-cream seamless background
Each: *"…centred in frame, soft daylight, warm high-key, pale green-cream seamless
background, slight top-down angle, no text, no watermark, square."*

| File / category | Subject |
|---|---|
| `cat-microgreen-tea` | A clear glass cup of bright green microgreen tea with a sprig of microgreens on the rim |
| `cat-tea-blends` | Three paper tea bags fanned out with dried herbs, lemon peel and petals spilling from one |
| `cat-loose-leaf` | A small mound of dried green loose-leaf tea with a wooden scoop |
| `cat-tea-kits` | A minimal ceramic teapot with a glass cup and a small tin, grouped together |
| `cat-accessories` | A stainless steel tea infuser ball and a bamboo scoop on a linen cloth |

### 3.3 Blend product cards — square 800 × 800 (one per SKU: Green Vitality, Green Lemon, Green Detox, Green Masala, Mint Green, Green Apple, Ginger Green, Green Hibiscus…)
```
Professional food photography of a clear glass cup of [BLEND] microgreen herbal tea,
warm-toned and inviting, garnished with its signature ingredients: [INGREDIENTS — e.g.
"fresh mint and a curl of lemon peel" / "sliced ginger and lemon" / "dried hibiscus and
petals" / "a tuft of pea-shoot microgreens"]. A paper tea bag and a few loose botanicals
resting beside the cup on a light oak surface. Bright soft daylight, warm high-key grade,
pale cream background, shallow depth of field. No text, no watermark, square composition.
```

### 3.4 Promo card background — `src/assets/bannerpic.jpeg` (1200 × 800)
```
Bright macro photography of a dense tray of fresh green microgreens with fine water mist
on the leaves, shot slightly from above, warm morning daylight, pale background, lots of
soft focus in the background right side for a dark-green text panel to sit over the left.
No text, no watermark, landscape.
```

---

## 4. How to view

```bash
npx expo start --web --port 8090
```
Home screen shows the new tea-first layout. (Web has a known cosmetic quirk: the entry
animations can leave the feed blank on first paint — one scroll settles it. Native is fine.)
