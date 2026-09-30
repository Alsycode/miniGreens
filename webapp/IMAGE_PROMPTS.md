# Product photo prompts — white-theme set

Goal: every microgreen and smoothie photo sits on the same clean white background, so it
blends into the white product cards and cream sections, the way the tea tube cutouts do.

## How to use

- **Model:** `kling-image-v3_0` · **Aspect:** `1:1` · **Resolution:** `2k` · **Count:** 1
- Paste the **shared style block** after each product line, so all images come out
  looking like one set.
- Generate **one image first** and check it before doing the rest.
- **Done (2026-09-21):** all 13 microgreens and 5 smoothies were generated and live in
  `webapp/public/images/products/white/`, wired up in `lib/productImages.ts`. To redo one,
  regenerate it and save it under a **new filename** (next/image caches by URL, so reusing
  the same name keeps showing the old picture), then update its line in `lib/productImages.ts`.

---

## Shared style block — microgreens

```
Studio product photograph on a seamless pure white background (#FFFFFF), no horizon line,
no backdrop texture. The tray is centered, shot from a three-quarter front angle about 25
degrees above, 85mm lens, whole tray in frame taking up about 70% of the width, with
even white space above and below. Soft diffused daylight from the upper left, a gentle soft
contact shadow directly under the tray, no hard shadows. Crisp focus across the leaves,
natural true-to-life colour, fresh and dewy but not wet. Premium minimal e-commerce style,
bright and airy. No text, no labels, no logos, no hands, no extra props.
```

**Tray (keep identical in every shot):** a shallow square tray of natural light kraft
paperboard, densely packed with living microgreens growing from a pale fibre grow mat, so
the stems read clearly at the front edge.

## Microgreens — subject lines (paste the style block after each)

| Save as | Subject line |
|---|---|
| `arugula.png` | Arugula microgreens: slender pale green stems, small bright green heart-shaped and slightly lobed leaves. |
| `beetroot.png` | Beetroot microgreens: vivid magenta-red stems, small narrow leaves shading from dark green to burgundy. |
| `broccoli.png` | Broccoli microgreens: pale white-green stems, small deep green heart-shaped leaves with a faint purple tinge. |
| `fenugreek.png` | Fenugreek (methi) microgreens: short pale stems, small oval clover-like bright green leaves in threes. |
| `mustard.png` | Mustard microgreens: pale stems, broad rounded heart-shaped bright green leaves, slightly frilly edges. |
| `pak-choi.png` | Pak choi microgreens: thick pale green stems, rounded spoon-shaped glossy mid-green leaves. |
| `pink-radish.png` | Pink radish microgreens: bright hot-pink stems, fresh green heart-shaped leaves. |
| `red-amaranth.png` | Red amaranth microgreens: deep fuchsia-magenta stems and small oval leaves with crimson undersides. |
| `red-cabbage.png` | Red cabbage microgreens: purple-violet stems, blue-green heart-shaped leaves with purple veins. |
| `sunflower.png` | Sunflower microgreens: thick crisp pale stems, large pointed teardrop-shaped bright green leaves, a few black seed hulls on top. |
| `turnip.png` | Turnip microgreens: pale stems blushing pink at the base, bright green heart-shaped leaves. |
| `wheatgrass.png` | Wheatgrass: dense upright blades of vivid emerald-green grass, evenly trimmed, about 12 cm tall. |
| `white-radish.png` | White radish microgreens: pure white stems, fresh bright green heart-shaped leaves. |

### Category card (home "Fresh Microgreens" card and shop category tile)

Save as `category-microgreens.png` (then update the `microgreens` entry in
`lib/productImages.ts`). **Aspect `4:3`.**

```
Three shallow square kraft paperboard trays of living microgreens, pea shoots, pink radish
and sunflower, arranged in a loose overlapping group on the right two-thirds of the frame,
the left third left as empty pure white space. Seamless pure white background (#FFFFFF),
three-quarter view about 25 degrees above, soft diffused daylight from the upper left,
gentle soft contact shadows. Bright, airy, premium minimal e-commerce style. No text, no
logos, no hands.
```

---

## Shared style block — smoothies

```
Studio product photograph on a seamless pure white background (#FFFFFF), no horizon line.
A single clear glass bottle, 350 ml, tall and slim with rounded shoulders, plain kraft
paper cap, no label, filled with the smoothie, centered and upright. The bottle takes up
about 55% of the frame height, with the garnish arranged low around its base. Shot straight
on, slightly above bottle-middle height, 85mm lens. Soft diffused daylight from the upper
left, a subtle rim highlight on the glass, a gentle soft contact shadow, light condensation
droplets on the glass. Thick, creamy, opaque smoothie texture, natural true-to-life colour.
Premium minimal e-commerce style, bright and airy. No text, no labels, no logos, no hands,
no straws.
```

## Smoothies — subject lines (paste the style block after each)

| Save as | Subject line |
|---|---|
| `choco-chill.png` | Choco Chill smoothie: rich cocoa-brown chocolate smoothie. Garnish: a few banana slices, a small pile of cacao nibs, a sprig of sunflower microgreens. |
| `mango-fresh.png` | Mango Fresh smoothie: vivid golden-orange mango smoothie. Garnish: fresh mango cubes, a mango cheek, a few mint leaves. |
| `mint-melon-smoothie.png` | Mint Melon smoothie: pale honeydew-green smoothie. Garnish: a honeydew melon wedge, fresh mint sprigs. |
| `papaya-glow.png` | Papaya Glow smoothie: warm coral-orange papaya smoothie. Garnish: half a ripe papaya showing black seeds, a lime wedge. |
| `strawberry-banana-glow.png` | Strawberry Banana Glow smoothie: blush-pink strawberry-banana smoothie. Garnish: halved fresh strawberries, banana slices. |

`choco-chill` is currently a `.jpg`. Save the new one as `choco-chill.png` and update its
line in `lib/productImages.ts`.

---

## Still missing: 3 tea tubes

`website/`'s carousel only has 5 tubes. **Ginger Green**, **Green Apple** and **Green
Hibiscus** still show the old brewed-cup photos. To match, use `image_to_image` with
`--image website/public/images/carousel/green-detox.png` and:

```
Same kraft paper tube, same "mini greens" label layout and typography, same mossy stone
base and composition, but the label reads "<Blend Name>" and the surrounding greens are
<ginger root and pea shoots | green apple slices and sunflower shoots | hibiscus flowers
and red amaranth>. Pure black background, studio lighting identical to the reference.
```

Then cut out the black background the same way the existing tubes were made
(`scratchpad/kling/cutout.mjs`, per the note in `website/components/TeaCarousel.tsx`).

---

## Homepage category tiles — sage set (done 2026-09-21)

Generated with `kling text_to_image --model kling-image-v3_0 --aspectRatio 3:2 --imgResolution 2k`
to match the light sage tea-bag tile (`category-tea-blends.png`). Saved as JPEG (1800w):
`products/category-microgreens-sage.jpg`, `products/category-drinks-sage.jpg`.

Shared look: *bright, airy photo on a seamless pale sage-green paper background (soft light
mint-cream, like #E9EEDC), about 30–45° above, soft diffused daylight from the upper left, gentle soft
shadows, garnishes scattered casually, generous pale negative space. No text, labels, logos or hands,
and no dark background.*

- **Microgreens:** a shallow kraft paperboard tray of living pea shoots, sunflower, pink radish and broccoli
  microgreens, slightly right of centre, with cut sprigs, tiny leaves and seeds scattered around it.
- **Drinks:** three kraft-capped glass bottles (pink strawberry smoothie, orange carrot juice, pale green
  cucumber-mint juice) with strawberries, a lemon half, a carrot, cucumber slices and microgreen sprigs.

**Carrot, Lemon & Radish Juice** was redone with the smoothie style block above (1:1) → `products/white/carrot-lemon-radish-juice.jpg`.

## Brand claim (add to all new pack and OG artwork)
Include a small badge reading "India's First Microgreens Brand" (source of truth: `webapp/lib/brand.ts`). Keep it secondary to the logo, on packaging, the OG/social banner, and hero imagery.
