# Blue Tea — Design System Reference

Extracted from https://bluetea.co.in on 2026-09-06 (Shopify storefront, Montserrat theme).
Companion to [`BLUETEA_RESEARCH_REPORT.md`](./BLUETEA_RESEARCH_REPORT.md).
Values marked *(approx)* are read from computed styles / on-screen sampling, not a brand kit.

---

## 1. Design philosophy

> **Clean white wellness canvas + one disciplined blue + one loud yellow buy-button, wrapped in
> relentless trust and value cues.**

- **High-key & airy** — white/near-white backgrounds, bright product photography, generous
  whitespace. Health-forward and friendly, *not* dark/luxury/artisanal.
- **Colour comes from the product** — butterfly-pea blue, hibiscus red, chamomile yellow live in
  the packaging and photography; the UI itself stays neutral so products pop.
- **Single accent discipline** — Blue = identity (logo, headings, icons, links). Yellow = the one
  primary action. Red = price-drop / urgency only. Text = #222.
- **Trust as ornament** — badges, star counts, MRP strikethrough, marquee claims, Shark Tank
  markers are treated as first-class UI, placed on nearly every section.
- **Value made legible** — per-unit pricing, "Best Value" tier, free-gift threshold shown inline.
- **System + campaign layers** — a systematic component library underneath; expressive full-bleed
  image banners with a script/display headline font on top for seasonal/creator campaigns.
- **Mobile-first** — centered logo, drawer nav, slide-out cart, sticky add-to-cart bar, large tap
  targets.

---

## 2. Colour tokens

| Token | Value *(approx)* | Use |
|---|---|---|
| `--blue-700` **brand** | `#27398F` (rgb 39 57 143) | Logo, headings, announcement bar bg, icons, links, trust icons |
| `--blue-900` deep | `#1E2A6B` *(approx)* | Banner headline text, gradients |
| `--yellow-CTA` | `#FFD814` (rgb 255 216 20) | **Primary button** (Add to Cart / Buy), pill-shaped |
| `--yellow-CTA-hover` | `#FEC42D` (rgb 254 196 45) *(approx)* | CTA hover/pressed |
| `--red-sale` | `#EC0101` / `#EB001B` | Sale price, discount %, urgency text |
| `--ink` | `#222222` (rgb 34 34 34) | Body text |
| `--ink-muted` | `#696969` (rgb 105 105 105) | Secondary text, "inclusive of all taxes", struck MRP |
| `--line` | `#DDDDDD` / `rgba(34,34,34,.12)` | Borders, dividers, card outlines |
| `--surface` | `#FFFFFF` | Page & card background |
| `--surface-alt` | `#E1E3E4` / `#EBEEF0` *(approx)* | Section tints, image placeholders |
| Accent product hues | butterfly-pea blue, hibiscus magenta/red, chamomile gold, mint green | Photography / packaging only, not UI |

**Rules**
- Exactly one yellow CTA per view; secondary actions are outline/blue-text or plain links.
- Red is reserved for money-saving/urgency — never decorative.
- Announcement bar: `--blue-700` bg, white text.

---

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| Primary UI / body / headings | **Montserrat**, `Helvetica, Arial, sans-serif` fallback | Whole storefront |
| Campaign banner headlines | Script / bold display face | Delivered as baked image text (e.g. "Tanya's", "Loved Brews") — not live web type |
| Review stars | `JudgemeStar` icon font | Judge.me widget |

**Scale & treatment *(observed)***
- Section titles: uppercase, letter-spaced, blue or ink — e.g. `NEW ARRIVALS`, `THE VOICE OF OUR CUSTOMERS`, `OUR STORY`.
- Product title: ~16–20px, medium, ink.
- Price: sale price ~18–22px bold red; MRP ~13–14px `line-through` muted.
- Benefit tag: ~12–13px, muted, ` | `-separated ("Metabolic Support | Boosts Immunity").
- Body copy: ~14–16px, line-height ~1.6.
- Buttons: uppercase or title-case, semibold, letter-spacing ~0.02–0.05em.

---

## 4. Layout & spacing

- **Container:** ~1200–1280px max width, centered; ~16px gutters on mobile.
- **Grid:** PLP 2-up (mobile) → 3/4-up (desktop); home rails are horizontal carousels with
  peek + prev/next arrows.
- **Section rhythm:** large vertical padding (~48–80px desktop / ~32px mobile) between blocks;
  alternating white / faint-tint sections.
- **Radius:** cards & inputs ~6–10px; **buttons fully rounded (pill)**; badges pill.
- **Shadow:** minimal — hairline borders (`--line`) preferred over elevation; soft shadow on
  slide-out cart, sticky bar, hover-lift on cards.
- **Icons:** simple line icons in `--blue-700` (leaf, cup, flask for "All Natural / Caffeine-Free
  / No Preservatives").

---

## 5. Core components

### 5.1 Announcement bar
Full-width `--blue-700`, white centered text, auto-rotating messages, emoji, no close button.

### 5.2 Header
Sticky; centered flower logo; left hamburger (mobile) / inline nav (desktop); right icons:
search, account, wishlist (count badge), cart (count + running ₹ total). Mega-menu on desktop,
full-height drawer on mobile.

### 5.3 Product card
```
┌─────────────────────────────┐
│ [wishlist ♥]      [badge]    │   ← badge: "Best Value" / "As Seen On Shark Tank" / "-30%"
│                             │
│        product image        │   ← hover: swap image / "Quick view" button
│                             │
│ Product Name                │
│ ★★★★★  (1,103)               │   ← stars + RAW review count
│ Benefit Tag | Benefit Tag   │
│ M̶R̶P̶ ̶₹̶1̶,̶2̶9̶9̶   ₹899           │   ← struck MRP muted + red sale price
│ [   ADD TO CART  (yellow) ] │
└─────────────────────────────┘
```

### 5.4 Buttons
- **Primary:** yellow `#FFD814` pill, ink text, semibold, full-width on mobile.
- **Secondary:** blue outline or blue text link.
- **Quantity stepper:** `−  n  +`, bordered, square-ish.

### 5.5 PDP variant selector (value tiers)
Stacked/again grid of selectable cards, one per size:
```
○ Starter Pack   · 100 TEA BAGS · ₹1̶,̶2̶9̶9̶ ₹899  · ₹8.99 / tea bag
● Transformation · 200 TEA BAGS · ₹2̶,̶5̶9̶9̶ ₹1,399 · [Best Value] · ₹6.50 / tea bag
○ Progress       · 300 TEA BAGS · ₹2̶,̶9̶9̶9̶ ₹1,949 · ₹6.50 / tea bag
```
Selected = blue border + fill tint. Always shows **per-unit price**; highlights one "Best Value".

### 5.6 Trust row (PDP)
3 columns, blue line-icon + 2-word label: *Caffeine Free · Fastest Delivery · Carcinogen Free*.

### 5.7 Marquee strip
Infinite horizontal scroll, `•`-separated claims:
`Zero Caffeine • Farm-fresh Quality • All Natural • No preservatives • Plant-Based Teabags`.

### 5.8 Sticky add-to-cart bar (mobile PDP)
Pinned bottom: mini thumbnail + product name + qty stepper + yellow ADD TO CART.

### 5.9 Pincode checker (PDP)
Text input + "Check Now" button → serviceability + ETA message.

### 5.10 Reviews block (Judge.me)
Average score + N reviews, 5→1 histogram bars with counts, review list with "Full Review"
expander, "Customer photos & videos" thumbnail gallery, "Read More Reviews" link.

### 5.11 Testimonial card
Short quote + name + role + city (e.g. "Anuradha — Startup Professional, Kolkata").

### 5.12 Slide-out cart (GoKwik KwikCart)
Right drawer: free-gift/free-ship progress bar, line items with qty edit, upsell slot,
subtotal, "Proceed to checkout".

### 5.13 Floating assistant
Circular presenter-avatar button bottom-right (HelioAI), opens chat panel.

---

## 6. Imagery direction

- Product bags/tins shot straight-on on white or in bright lifestyle scenes with fresh flowers,
  citrus, ginger, water splashes.
- The **colour-changing pour** (blue → purple with lemon) is the signature hero shot.
- Founders/creators and "Shark Tank" stills used in campaign banners.
- Consistent warm, high-brightness, low-contrast grade.

---

## 7. Motion

- Auto-rotating hero + announcement bar.
- Infinite marquee.
- Card hover: subtle lift + image swap + "Quick view" reveal.
- Drawers/sticky bar: slide + fade.
- Otherwise restrained; no scroll-jacking.

---

## 8. Accessibility / performance notes (gaps to avoid when adapting)

- Campaign banners & About/Gifting pages are **image-only** — no selectable text, poor SR/SEO,
  no reflow on zoom. Prefer real text + CSS for MiniGreens.
- Yellow `#FFD814` on white needs ink (`#222`) text for contrast — never white text on it.
- Very large third-party script payload (GoKwik, Judge.me, Hextom, Logbase, Helio, Togethr,
  Shiprocket). If hand-building, budget these features deliberately.
- Ensure announcement-bar messages are perceivable to screen readers (aria-live, not just CSS
  animation) and pauseable.

---

## 9. Quick-reference token block (for adaptation)

```css
:root {
  /* Blue Tea-derived starting point — retune for MiniGreens' green brand */
  --bt-brand:        #27398F;
  --bt-brand-deep:   #1E2A6B;
  --bt-cta:          #FFD814;
  --bt-cta-hover:    #FEC42D;
  --bt-sale:         #EC0101;
  --bt-ink:          #222222;
  --bt-ink-muted:    #696969;
  --bt-line:         #DDDDDD;
  --bt-surface:      #FFFFFF;
  --bt-surface-alt:  #EBEEF0;

  --bt-font:         "Montserrat", Helvetica, Arial, sans-serif;

  --bt-radius-card:  8px;
  --bt-radius-btn:   999px;   /* pill */
  --bt-container:    1240px;
  --bt-section-y:    64px;
}
```
