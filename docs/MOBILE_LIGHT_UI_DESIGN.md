# MiniGreens Mobile — Light UI Design System

Direction brief for flipping the Expo app from its current **dark botanical** theme to a
**light / white** theme, per the client + investor request (2026-09-07).

Synthesised from 4 reference boards the client liked (see *§0 Reference boards*). Companion to
[`BLUETEA_DESIGN.md`](./BLUETEA_DESIGN.md) (that doc = Blue Tea web storefront; this doc = our
mobile app). Token names below map 1:1 onto the existing `src/theme/` files so the change is a
re-point, not a rewrite.

> **Use this doc to:** (a) drive the ChatGPT image-generation prompts in *§9* to pick a look,
> then (b) re-point `src/theme/colors.ts` + `spacing.ts` to ship it.

---

## 0. Reference boards (what the client liked)

| # | Board | What to take from it |
|---|---|---|
| 1 | **"Zaika" gourmet food app** | Warm cream canvas, **serif display headings**, deep forest-green pill CTAs, edge-to-edge food photography, floating circular icon buttons, calm bottom tab bar. Closest to our existing type system (we already use DM Serif Display). |
| 2 | **"Foodie favorites delivered fast"** | Pale warm canvas, soft **sage-green** buttons, very rounded cards, playful 3D food/character art, big friendly CTAs. |
| 3 | **"Fresh Groceries Delivered to Your Doorstep"** | Near-white clinical canvas, **emerald** accent, 3D product renders on tinted category cards, full cart + checkout + address + payment flow, bottom nav with a centred cart FAB. |
| 4 | **Deep-green-framed food board** | Cream cards inside a **pine-green** shell, green section headers, product grid with small thumb + price. |

**Consensus:** light warm-neutral canvas · white cards · **two greens** (one deep/structural, one
lively/accent) · real food photography · generous rounding · soft (not floating) shadows · bottom
tab bar. Keep our serif-for-headings identity.

---

## 1. Design philosophy

> **A bright, warm "fresh-from-the-farm" canvas. White cards float on a soft cream ground.
> One deep botanical green carries structure and CTAs; one lively leaf green is the accent that
> makes price, active state and freshness pop. Photography is the colour.**

- **High-key & warm, not clinical.** Page ground is a soft cream, not pure `#FFF` — it keeps the
  organic/botanical feel and lets white cards read as elevated.
- **Two greens, disciplined.**
  - `primary` = **deep forest green** → primary buttons, active nav, key headings/icons,
    selected states, structural fills.
  - `accent` = **lively leaf green** → price, "fresh today" / bestseller badges, progress bars,
    inline links, focus ring. One accent-green moment per card, max.
- **Photography is the colour.** Microgreens, smoothies and juices are already vivid — UI stays
  neutral (cream / white / ink / green) so the food carries the saturation.
- **Depth via soft shadow, not borders.** On dark we removed shadows; on light we bring back a
  *soft* elevation (`rgba(31,45,35,.06)`) plus an optional hairline. Cards should look liftable,
  not outlined.
- **Keep the type identity.** DM Serif Display headings + Plus Jakarta Sans body carry over
  unchanged — it's what makes board #1 feel premium rather than a generic delivery app.
- **Mobile-first commerce.** Sticky add-to-cart bar, bottom tab bar, large tap targets, pill
  CTAs, quantity steppers, free-delivery progress bar (from board #3).

---

## 2. Colour tokens — dark → light mapping

Re-point these keys in `src/theme/colors.ts`. **Every existing key keeps its name**; only the
value changes, so screens/components need no edits. Values are a starting kit — tune on device.

### 2.1 Brand greens

| Const | Dark (now) | **Light (new)** | Role |
|---|---|---|---|
| `ACCENT` | `#8BE04B` | `#3E9B4F` | lively leaf green — price, active nav, badges, selected, links |
| `ACCENT_SOFT` | `#6FB83C` | `#2F7A3D` | pressed / hover / secondary marks |
| `ON_ACCENT` | `#06130D` | `#FFFFFF` | text/icons on green fills (now white — fills are dark green) |
| *(new)* `PRIMARY` | — | `#2F4B3A` | **deep forest green** — primary CTA, active tab, structural fills, icon accents |
| *(new)* `PRIMARY_PRESSED` | — | `#243B2E` | primary button pressed |

> Note: on dark, `primary` and `accent` were the *same* bright green. On light they **split** —
> `primary` = deep `#2F4B3A`, `accent` = leaf `#3E9B4F`. Update the `primary*` block accordingly.

### 2.2 Environment & surfaces

| Token | Dark (now) | **Light (new)** | Use |
|---|---|---|---|
| `backgroundSunken` | `#070908` | `#F1ECE0` | deepest wells / behind grouped sections |
| `background` | `#0A0D0B` | `#FAF7F0` | **app base** — warm cream |
| `backgroundElevated` | `#0E1310` | `#F5F1E7` | ground behind card groups / promo bands |
| `surface` | `#141A15` | `#FFFFFF` | standard card |
| `surfaceElevated` | `#1A211B` | `#FFFFFF` + shadow `raised` | card that must separate from another card |
| `surfaceVariant` | `#1B221C` | `#F3EFE4` | inputs, secondary fills, image placeholders |
| `surfaceDark` | `#0C1F16` | `#EAF3E7` | editorial / promo blocks (soft green tint) |
| `surfaceDarkMid` | `#12281C` | `#DDEBD8` | deeper green promo tint |
| `surfaceTranslucent` | `rgba(18,24,19,.72)` | `rgba(255,255,255,.82)` | search field / bottom-nav blur layer |

### 2.3 Borders

| Token | **Light (new)** | Use |
|---|---|---|
| `borderFaint` | `rgba(27,36,31,0.05)` | inside-card dividers |
| `borderSubtle` | `rgba(27,36,31,0.08)` | card hairline over cream |
| `border` | `#E9E3D5` | inputs, list dividers |
| `borderLight` | `#F0EBDE` | faintest divider |
| `borderStrong` | `rgba(27,36,31,0.16)` | emphasised divider |
| `borderAccent` | `rgba(62,155,79,0.40)` | selected category / focus ring |

### 2.4 Text

| Token | Dark (now) | **Light (new)** | Use |
|---|---|---|---|
| `textPrimary` / `text` | `#F3F5F0` | `#1B241F` | near-black with green cast — headings & body |
| `textSecondary` | `#9BA69B` | `#586159` | supporting copy |
| `textMuted` / `textTertiary` | `#69736B` | `#8A9088` | captions / least emphasis |
| `textInverse` | `#FFFFFF` | `#FFFFFF` | text over food photography / dark overlays (unchanged) |
| `onAccent` | `#06130D` | `#FFFFFF` | on green fills |
| `textAcid` | `#8BE04B` | `#2F7A3D` | green inline emphasis on white |

### 2.5 Accent system

| Token | **Light (new)** | Use |
|---|---|---|
| `accent` | `#3E9B4F` | price, active nav icon, key badge |
| `accentSoft` | `#2F7A3D` | pressed |
| `accentDim` | `rgba(62,155,79,0.45)` | |
| `accentSurface` | `#EAF3E7` | green chip / icon-pill background |
| `accentSurfaceStrong` | `rgba(62,155,79,0.14)` | tint over imagery / hover |
| `primary` | `#2F4B3A` | **primary CTA fill, active tab, FAB** |
| `primaryLight` | `#8FC79B` | subtle green accents on light |
| `primaryDark` | `#243B2E` | pressed / emphasis icons |
| `primaryBg` | `#EAF3E7` | alias → `accentSurface` |

### 2.6 Status (retune "Light" variants to pale-on-white)

| Token | **Light (new)** | `*Light` bg |
|---|---|---|
| `error` | `#D64545` | `#FBEAEA` |
| `success` | `#3E9B4F` | `#E7F4E9` |
| `warning` | `#D98A1F` | `#FBF0DE` |
| `info` | `#3B7FD1` | `#E7F0FB` |

### 2.7 Overlay & shadow

| Token | **Light (new)** |
|---|---|
| `overlay` | `rgba(20,28,22,0.45)` — scrim behind modals / on hero photos |
| `shadow` | `rgba(31,45,35,0.14)` — base shadow colour for elevation |

`green` / `warm` numeric ramps: **keep as-is** — already light-friendly. `warm.500 #ED881E`
stays available for offers / urgency accents (use sparingly, like Blue Tea's red).

---

## 3. Typography — carries over, 2 tweaks

Keep `src/theme/typography.ts` families and scale. Changes for light:

1. **`h1` / `h2` → upright, not italic.** Swap `fontFamily.displayItalic` → `fontFamily.display`
   in `textVariants.h1` and `h2`. Board #1's serif headings are upright; italic reads casual on
   a bright canvas. Keep `letterSpacing: -1 / -0.5`.
2. **Section labels** (`textVariants.label`, uppercase + `letterSpacing: 2`) render in
   `accentSoft` `#2F7A3D` or `textMuted` on light — matches the green section headers in boards
   #3/#4.

| Role | Family | On light |
|---|---|---|
| `h1` `h2` | DM Serif Display (upright) | `textPrimary` `#1B241F`; hero headline may sit on cream or over a photo (then `textInverse`) |
| `h3` `h4` | Plus Jakarta Sans ExtraBold / Bold | `textPrimary` |
| `body` `bodySmall` | Plus Jakarta Sans Regular | `textPrimary` / `textSecondary` |
| `caption` | Plus Jakarta Sans Regular | `textMuted` |
| `button` | Plus Jakarta Sans SemiBold, `letterSpacing 0.2` | `onAccent` on filled, `primary` on ghost |
| `label` | Plus Jakarta Sans Bold, UPPERCASE, `letterSpacing 2` | `accentSoft` / `textMuted` |
| price | Plus Jakarta Sans ExtraBold | `accent` `#3E9B4F` |

---

## 4. Layout · radius · shadow

**Spacing** (`spacing.ts`): keep the 4px scale, `sectionGap: 40`, `headingGap: 18`. Unchanged.

**Radius** (`borderRadius`): soften slightly vs dark (boards sit ~16–20, not 24):

| Alias | Dark (now) | **Light (new)** |
|---|---|---|
| `badge` | 8 | 8 |
| `control` | 14 | 12 |
| `card` | 24 | **20** |
| `cardLarge` | 28 | **24** |
| `pill` | 9999 | 9999 (buttons, chips, search, FAB) |

**Shadow** (`shadows`): light theme needs real elevation — white cards on cream won't separate
by contrast alone. Re-point to soft green-cast shadows:

```ts
shadowColor: '#1F2D23',           // green-black, not pure #000
card:   { offset:{0,4},  opacity:0.06, radius:14, elevation:2 }
raised: { offset:{0,10}, opacity:0.10, radius:24, elevation:5 }
sm:     { offset:{0,1},  opacity:0.05, radius:3,  elevation:1 }
md:     { offset:{0,3},  opacity:0.07, radius:10, elevation:2 }
lg:     { offset:{0,8},  opacity:0.10, radius:20, elevation:4 }
xl:     { offset:{0,16}, opacity:0.14, radius:32, elevation:8 }
none:   unchanged
```

Cards: `surface` fill + `shadows.card` + optional `borderSubtle` hairline.
Bottom sheet / sticky bar / cart drawer: `shadows.xl` + top hairline.

**`layout`**: `bottomTabHeight: 80`, `headerHeight: 60`, `heroHeight: 420` unchanged.
`productCardWidth: 160`, `contentMaxWidth: 500` unchanged.

---

## 5. Core components (light spec)

### 5.1 Top bar
Transparent over cream; no bottom border until scrolled, then `borderSubtle` hairline + subtle
`surfaceTranslucent` blur. Left: location / back. Right: circular icon buttons (search, cart with
`accent` count badge) — white fill, `shadows.sm`, ink icon (board #1).

### 5.2 Bottom tab bar
White (`surfaceTranslucent` blur) top hairline `borderSubtle`. 5 tabs. Active = `primary`
`#2F4B3A` icon + label + a small `accent` dot/underline. Inactive = `textMuted`.
Optional centre **cart FAB**: `primary` fill circle, white cart icon, lifted with `shadows.raised`
(board #3).

### 5.3 Product card
```
┌──────────────────────────────┐
│  ╭────────────────────────╮   │  surface #FFF, radius card(20), shadows.card
│  │     food photo (4:3)    │  │  photo fills top, radius 20 top corners
│  │              [♥]        │  │  wishlist: white circle, shadows.sm, top-right
│  ╰────────────────────────╯   │
│  Sunflower Microgreens        │  h4 / Jakarta Bold, textPrimary
│  peppery · vitamin-rich       │  caption, textMuted
│  ₹149   ·  50g                │  price = accent #3E9B4F ExtraBold; unit = textMuted
│        ╭───────────────╮      │
│        │  + Add  (pill) │      │  primary #2F4B3A fill, white text, pill
│        ╰───────────────╯      │
└──────────────────────────────┘
```
"Fresh today" / "Bestseller" badge = `accentSurface` chip, `accentSoft` text, top-left over photo.

### 5.4 Buttons
- **Primary:** `primary` `#2F4B3A` fill, white text, `pill`, full-width on mobile, `shadows.sm`.
  Pressed → `primaryDark`.
- **Secondary:** white fill, `primary` text, `1px primary` border, `pill`.
- **Ghost / link:** `accentSoft` text, no fill.
- **Quantity stepper:** `−  n  +`, white fill, `borderSubtle`, `control` radius, ink glyphs;
  `+`/`−` tap targets ≥ 40px.

### 5.5 Category card (board #3)
Rounded (`cardLarge`), soft tint fill from a rotating set: `accentSurface` `#EAF3E7`,
`warm.100` `#FDE8D6`, `#EAF0FB`, `#F3EEE4`. 3D/cutout product render or photo, label in
`textPrimary` Bold, count in `textMuted`. Chevron in `primary`.

### 5.6 Section header
`label` style ("SHOP BY GREEN", "FRESH SMOOTHIES") in `accentSoft`, with a serif `h3` line under
it in `textPrimary`, and a "See all →" link (`accentSoft`) right-aligned.

### 5.7 Free-delivery progress bar (cart) — from board #3
Track `surfaceVariant`, fill `accent`, label "Add ₹120 for free delivery" in `textSecondary`.
On threshold: fill `primary`, leaf icon, "Free delivery unlocked".

### 5.8 Sticky add-to-cart bar (PDP)
Pinned bottom, white, top hairline + `shadows.xl`. Left: price (`accent` ExtraBold) + unit.
Right: qty stepper + **Add to cart** primary pill.

### 5.9 Cart line item
White row, `borderLight` divider. Left: 56px rounded thumb. Middle: name (Bold) + variant
(caption). Right: qty stepper; price `accent`. Swipe / trash → `error`.

### 5.10 Checkout (board #3 flow)
Stacked white cards on cream: **Delivery address** (pin icon `primary`, "Change" link),
**Delivery slot** (selectable pills — selected = `primary` fill / white; idle = white /
`border`), **Payment method** (radio rows, selected = `borderAccent` ring + `accentSurface`
tint), **Bill summary** (dashed `border` divider above total; total in `h4`), then a full-width
**Place order** primary pill in a sticky footer with `shadows.xl`.

### 5.11 Input / search field
`pill` radius, `surfaceVariant` fill, no border at rest; focus → white fill + `borderAccent`
ring. Leading search icon `textMuted`. Placeholder `textMuted`.

### 5.12 Empty / success states
Cream ground, centred serif `h2`, one-line `textSecondary` sub, a simple line/3D leaf spot
illustration in greens, single primary pill CTA.

### 5.13 Blog / article reader
White reading surface, cream page margins. `h1` serif (upright), body Jakarta 16/26,
pull-quotes with a `primary` left rule. Inline images radius `card`.

---

## 6. Imagery direction

The current `ASSET_PROMPTS.md` produces **dark** food shots ("Deep charcoal-black background,
moody low-key lighting"). For the light UI, regenerate product imagery with a bright brief:

- **Background:** soft warm white / pale cream seamless, or a light oak / marble surface.
- **Light:** bright, soft, diffused daylight from the side; gentle shadows, no hard black.
- **Grade:** warm, high-key, medium-low contrast, fresh and clean (match board #1/#3).
- **Styling:** fresh produce, herbs, citrus, water droplets, linen; microgreen trays with soil.
- **Framing:** straight-on or 45°, generous negative space top/left for card text overlays.
- **Consistent** crop ratio 4:3 for cards, 1:1 for thumbs, 3:2 for hero.
- Keep "No text, no watermark."
- Signature hero shot: a living microgreens tray being misted, or a smoothie pour, on white.

A `ASSET_PROMPTS_LIGHT.md` should fork the existing recipes with this brief swapped in.

---

## 7. Motion

Restrained, same as dark theme:
- Card press: scale `0.98`, 120ms.
- Add-to-cart: item thumb flies to cart FAB; badge count bumps (spring).
- Bottom sheet / cart drawer: slide + fade, 240ms ease-out.
- Progress bar fill: 400ms ease-out on quantity change.
- Skeletons: `surfaceVariant` blocks with a subtle cream shimmer (not white-on-white).
- No scroll-jacking, no parallax on hero.

---

## 8. Migration checklist (when a look is chosen)

1. `src/theme/colors.ts` — split `primary` (deep) vs `accent` (leaf); re-point environment,
   surface, border, text, status, overlay, shadow per *§2*.
2. `src/theme/spacing.ts` — `card 24→20`, `cardLarge 28→24`, `control 14→12`; re-point
   `shadows` to green-cast soft elevation per *§4*.
3. `src/theme/typography.ts` — `h1`/`h2` → `fontFamily.display` (upright).
4. Set app `StatusBar` style to `dark` content; splash / nav-bar backgrounds → cream.
5. Audit hard-coded `#000` / `#FFF` / dark hexes in `src/components` + `src/features` — replace
   with tokens.
6. Swap product imagery via `ASSET_PROMPTS_LIGHT.md`; keep filenames.
7. QA contrast: body ≥ 4.5:1 (`#1B241F` on `#FAF7F0` ✓), `primary` button text (white on
   `#2F4B3A` ✓), `accent` price text (`#3E9B4F` on white ≈ 3.6:1 — OK for ≥18px bold price,
   bump to `accentSoft` `#2F7A3D` for small text).

---

## 9. ChatGPT image-generation prompts (to pick a look)

Generate each screen **portrait 1024 × 1536**. Paste the **Style preamble** + one **Screen
prompt**. Generate 2–3 variants per screen, then pick the board that feels right and we build
tokens to match.

### Style preamble (prepend to every prompt)

```
A single mobile app screen UI design for "MiniGreens", a fresh microgreens, cold-pressed
juice and smoothie delivery app. Light theme. Warm off-white cream background (#FAF7F0),
pure white cards with soft rounded corners (about 20px radius) and very soft shadows.
Two greens only: a deep forest green (#2F4B3A) for primary buttons, the active tab and
icons, and a lively leaf green (#3E9B4F) for prices, badges and links. Near-black
green-tinted text (#1B241F), muted grey-green secondary text. Elegant upright serif
headings (DM Serif Display style) paired with a clean geometric sans-serif for body
(Plus Jakarta Sans style). Bright, warm, high-key food photography of microgreens,
smoothies and juices — no dark or moody shots. Pill-shaped buttons. Generous whitespace,
calm and premium, "fresh from the farm" feel. Bottom tab bar with 5 icons, active icon in
deep green. Realistic iOS status bar. No lorem ipsum gibberish — use short real labels.
Flat UI mockup, straight-on, high fidelity.
```

### Screen prompts

**Onboarding / welcome**
```
Screen: a full-bleed bright photo of a living microgreens tray being misted with water at
the top two-thirds, fading into cream. Large upright serif headline "Fresh greens,
delivered daily." One line of sans sub-copy. A full-width deep-green pill button "Get
started" and a "Sign in" text link below. Three small page-dots.
```

**Home**
```
Screen: top bar with a location row "Deliver to · Koramangala" and two round white icon
buttons (search, cart with a green count badge). A serif greeting "Good morning, Aditi".
A rounded search field. A horizontal row of soft-tinted category chips (Microgreens,
Smoothies, Juices, Salad kits). A promo band with pale green tint: "30% off first order".
Section header label "SHOP BY GREEN" over a serif line "Fresh today", with a 2-column grid
of white product cards: food photo, name, "peppery · vitamin-rich", green price "₹149",
and a small deep-green "+ Add" pill. Bottom tab bar: Home, Shop, Orders, Learn, Profile.
```

**Shop / category grid**
```
Screen: header "Microgreens" with back chevron and a filter icon. A row of filter pills
(All, Spicy, Mild, Bestsellers) — "All" selected in deep green. A 2-column scroll grid of
white product cards with bright photos, names, green prices, unit weights, wishlist hearts,
and deep-green "+ Add" pills. One card shows a green "Fresh today" badge.
```

**Product detail**
```
Screen: large bright square photo of sunflower microgreens with rounded bottom corners and
a white circular back button and heart over it. Below on cream: serif title "Sunflower
Microgreens", a green price "₹149" with "50g" unit, a star rating "4.8 (212)". Short
description paragraph. A "Nutrition" row of small pill tags. A quantity stepper. Sticky
bottom white bar with the price on the left and a wide deep-green "Add to cart" pill on
the right.
```

**Cart**
```
Screen: header "My cart · 3 items". A free-delivery progress bar: "Add ₹120 for free
delivery", track light, fill leaf green. Three white line-item rows: 56px rounded thumb,
product name, variant, a −/+ quantity stepper, green price. A bill summary card: subtotal,
delivery fee, dashed divider, bold total "₹486". Sticky footer with a full-width deep-green
"Checkout" pill.
```

**Checkout**
```
Screen: header "Checkout". Stacked white cards on cream: "Delivery address" with a green
pin icon, an address line and a "Change" link. "Delivery slot" with selectable pills — one
("Today, 5–7 PM") filled deep green. "Payment" with radio rows (UPI selected, ringed in
green with a pale green tint). "Bill summary" with a bold total. Sticky footer: wide
deep-green "Place order" pill.
```

**Blog / article reader ("Learn")**
```
Screen: a white reading page on cream margins. A bright rounded hero photo of microgreens.
An upright serif headline "Why microgreens beat mature greens". Byline and read-time in
muted green. Two paragraphs of body text. A pull-quote with a deep-green vertical rule on
the left. Bottom tab bar with "Learn" active in deep green.
```

**Profile**
```
Screen: header "Profile". A white card with a circular avatar, name "Aditi Rao", and a
green "Manage" link. A list of white rows with left icons and chevrons: Orders,
Subscriptions, Addresses, Payment methods, Notifications, Help. A subtle "Log out" text
link in muted red at the bottom. Bottom tab bar with "Profile" active in deep green.
```

---

## 10. Quick-reference token block

```ts
// MiniGreens — LIGHT theme starting kit (retune on device)
export const light = {
  // greens
  primary:        '#2F4B3A',  // deep forest — CTA, active tab, FAB, structural
  primaryPressed: '#243B2E',
  primaryLight:   '#8FC79B',
  accent:         '#3E9B4F',  // leaf — price, badge, active icon, link
  accentSoft:     '#2F7A3D',  // pressed, small green text
  accentSurface:  '#EAF3E7',  // green chip / pill bg
  onAccent:       '#FFFFFF',

  // environment
  backgroundSunken:  '#F1ECE0',
  background:         '#FAF7F0',
  backgroundElevated: '#F5F1E7',
  surface:           '#FFFFFF',
  surfaceVariant:    '#F3EFE4',
  surfaceDark:       '#EAF3E7',   // promo tint
  surfaceTranslucent:'rgba(255,255,255,0.82)',

  // borders
  borderFaint:  'rgba(27,36,31,0.05)',
  borderSubtle: 'rgba(27,36,31,0.08)',
  border:       '#E9E3D5',
  borderAccent: 'rgba(62,155,79,0.40)',

  // text
  textPrimary:   '#1B241F',
  textSecondary: '#586159',
  textMuted:     '#8A9088',
  textInverse:   '#FFFFFF',

  // status
  error:'#D64545', success:'#3E9B4F', warning:'#D98A1F', info:'#3B7FD1',

  // overlay / shadow
  overlay: 'rgba(20,28,22,0.45)',
  shadowColor: '#1F2D23',

  // radius
  radiusControl: 12, radiusCard: 20, radiusCardLarge: 24, radiusPill: 9999,

  // font (unchanged)
  fontDisplay: 'DMSerifDisplay_400Regular',       // upright for h1/h2 on light
  fontSans:    'PlusJakartaSans_400Regular',
} as const;
```
