# Microgreens App — Home Screen Refinement Specification

## Purpose

This document is the **single source of truth for refining the existing Home Screen** of the microgreens app.

The goal is to take the **existing Home Screen implementation** and refine it so that it follows the **same visual language, composition, atmosphere, hierarchy, spacing, and interaction styling as the supplied reference image**.

This is a **refinement, not a redesign**.

Do not create a new app or replace the current Home Screen architecture unnecessarily.

---

# 1. Core Design Direction

Use this principle throughout the implementation:

> **Preserve the existing microgreens app's content, functionality, imagery, and brand identity, while making its visual language closely follow the supplied reference.**

The reference should control:

- visual atmosphere
- layout rhythm
- spacing philosophy
- card treatment
- surface treatment
- typography hierarchy
- green accent usage
- imagery integration
- navigation treatment
- overall premium feel

The existing application should continue to control:

- actual products
- product names
- prices
- product images/assets
- data
- functionality
- routes
- cart behavior
- search behavior
- navigation behavior
- state management

Do not blindly reproduce text or product content from the reference.

---

# 2. VERY IMPORTANT — Do Not Redesign From Scratch

Before writing code:

1. Inspect the existing Home Screen.
2. Identify the existing components used by the screen.
3. Identify existing design tokens / CSS variables / theme values.
4. Identify the existing product data and image assets.
5. Identify existing reusable UI components.
6. Understand how horizontal product/category scrolling currently works.
7. Understand the current bottom navigation implementation.
8. Understand responsive behavior.

Then refine the existing implementation.

Do NOT:

- rebuild the Home Screen from scratch without reason
- replace existing business logic
- replace product data
- replace Supabase/API logic
- change authentication
- change routing
- change cart logic
- introduce a new UI framework
- introduce unnecessary dependencies
- rewrite unrelated screens
- modify unrelated components unless a shared visual token/component genuinely needs refinement

If an architectural change is genuinely required, explain why before making it.

---

# 3. Reference Image Interpretation

The supplied reference is the visual target.

The target is NOT simply "dark green".

The reference works because it creates a **single visual environment**.

The screen should feel like:

> a premium fresh-food / wellness brand existing inside a subtle botanical environment.

It should NOT feel like:

> a black app with random green decorations.

The following principles are mandatory.

---

# 4. Background / Environment

## Current direction

Keep the app fundamentally dark.

Use a near-black / deep charcoal base.

Suggested conceptual range:

- Base background: near-black charcoal
- Secondary atmospheric green: extremely dark forest green
- Accent: fresh natural green

Do not make the whole screen bright green.

## Botanical atmosphere

The reference uses botanical imagery as part of the environment.

Implement this carefully:

- use subtle large-scale botanical imagery behind appropriate areas
- keep imagery low contrast
- keep imagery partially obscured
- allow leaves/organic shapes to appear behind content
- use gradients/overlays only when necessary to maintain readability

The botanical background should be felt before it is consciously noticed.

It should NEVER compete with:

- product imagery
- product names
- prices
- buttons
- navigation

### Avoid

- obvious stock-photo backgrounds
- huge visible leaves covering text
- strong blur everywhere
- heavy green gradients
- excessive glow
- decorative backgrounds behind every card

---

# 5. Surface Philosophy

One of the most important changes is moving away from:

> black background + obvious outlined black cards

toward:

> dark environment + subtly elevated/translucent green-tinted surfaces.

Cards should have:

- very dark green/charcoal surfaces
- subtle transparency where appropriate
- extremely restrained borders
- subtle depth
- consistent corner radius
- consistent internal padding

Borders should define structure without becoming the main visual element.

If the border is immediately noticeable, it is probably too strong.

Do not turn every surface into glassmorphism.

Use translucency selectively.

---

# 6. Color System

Establish/reuse centralized design tokens.

Do not scatter arbitrary colors throughout components.

Conceptually define:

```text
background
background-elevated
surface
surface-elevated
border-subtle
text-primary
text-secondary
text-muted
accent
accent-soft
accent-surface
```

## Accent green

Green is a BRAND ACCENT.

It should not become the second background color.

Use brighter green primarily for:

- active navigation
- prices
- important links
- selected category
- primary CTA
- important badges
- small status indicators

Use softer/darker green for:

- subtle surfaces
- borders
- background atmosphere
- hover/pressed states

Do NOT make every icon green.

Do NOT make every border neon green.

Do NOT make every button green.

---

# 7. Typography

The reference has a clear typography hierarchy.

Maintain a hierarchy such as:

### Primary greeting / hero

Strong but not oversized.

### Section heading

Clearly stronger than body copy.

### Supporting text

Muted and smaller.

### Product title

Strong enough to scan quickly.

### Product description

Secondary.

### Price

High visual importance, using the brand accent.

Avoid:

- too many font weights
- huge headings
- excessive uppercase text
- decorative fonts everywhere
- inconsistent typography between cards

The interface should feel editorial and premium without becoming ornamental.

---

# 8. Header

Refine the existing header to follow the reference's composition.

The header should contain:

- greeting
- user name
- subtle botanical/brand accent if already part of the app
- supporting tagline
- notification action
- cart action
- appropriate status/header spacing

The greeting should be visually subordinate to the user's name.

The user's name should be the strongest element in the header.

Keep the header spacious.

Do not overcrowd it.

Actions should use restrained circular/translucent containers rather than heavy outlined buttons.

Notification/cart badges should be small and intentional.

---

# 9. Search Bar

The search bar is a major structural element.

It should feel integrated into the environment.

Desired characteristics:

- wide
- rounded
- dark translucent surface
- subtle border
- search icon
- muted placeholder
- filter/action control on the right
- generous horizontal padding

The filter control can use the accent color, but avoid making it look like a neon button.

The search field should visually connect the header to the category section.

---

# 10. Category Section

The category row should closely follow the reference philosophy.

Each category item should have:

- product/category image
- small icon where appropriate
- category label
- subtle dark surface
- rounded corners
- consistent dimensions

The selected category should have:

- slightly stronger green border/accent
- subtle green atmospheric treatment
- small active indicator underneath

Do not make all category cards equally visually loud.

The selected state should be obvious but elegant.

Maintain horizontal scrolling if it already exists.

Do not break touch/scroll behavior.

---

# 11. Section Headers

For sections such as:

- Best Sellers
- Seasonal Picks
- other existing Home Screen sections

use a consistent pattern:

```text
SECTION TITLE                         View all →
Supporting subtitle
```

The section title should be visually strong.

The subtitle should be muted.

"View all" should use the accent color but remain secondary to the section title.

Maintain consistent spacing above and below every section.

The vertical rhythm between sections is extremely important.

---

# 12. Product Cards

Product cards are one of the highest-priority refinements.

The reference uses large, image-led cards but they still feel like part of a collection.

Each card should contain:

1. Product image
2. Optional badge
3. Favorite action
4. Product size/volume badge if applicable
5. Product name
6. Short description
7. Price
8. Quantity control

## Image treatment

Product photography should remain the visual hero.

Do not put a generic solid black rectangle behind every image.

Allow the product photography to visually merge into the surrounding dark surface where appropriate.

The image area should feel immersive.

## Card surface

Use:

- dark green/charcoal
- subtle translucency
- subtle border
- restrained shadow/elevation
- consistent radius

## Badge

Badges should be compact.

Examples:

- BESTSELLER
- SEASONAL
- NEW

Use green or appropriate category colors sparingly.

Do not make badges enormous.

## Favorite

Use a small circular/translucent action.

It should not visually compete with the product.

## Price

Price should be one of the most visually prominent text elements in the lower portion of the card.

Use the brand green.

## Quantity control

Make it compact and refined.

It should feel integrated with the card instead of looking like a separate UI widget.

---

# 13. Product Carousel Behavior

If the current Home Screen uses a horizontal carousel:

KEEP IT.

Do not replace it with a grid unless the current product requirements explicitly require a grid.

The user should see:

```text
[ Product A ] [ Product B ] [ partial Product C ]
```

This communicates that more products are available.

Avoid making one product so wide that the next products become meaningless slivers.

The carousel should feel intentional and balanced.

Ensure:

- consistent card width
- consistent gap
- smooth horizontal scrolling
- no accidental clipping
- no layout shift
- proper touch behavior

---

# 14. Promotional Banner

The promotional/collection banner should feel like part of the environment.

It should combine:

- dark botanical imagery
- strong headline
- short supporting copy
- CTA
- product/food imagery

The banner should NOT look like a separate rectangular advertisement pasted into the page.

Use the same:

- radius
- border philosophy
- typography
- accent treatment
- spacing language

as the rest of the Home Screen.

The imagery should have a smooth relationship with the dark background.

---

# 15. Seasonal / Secondary Sections

Existing sections below the promotional banner should follow the same system.

Do not invent a completely different card style.

Maintain:

- consistent section headers
- consistent card radius
- consistent spacing
- consistent badges
- consistent favorite controls
- consistent typography
- consistent image treatment

The user should immediately recognize that every section belongs to the same product.

---

# 16. Bottom Navigation

The bottom navigation should follow the reference closely.

It should feel like an elevated layer over the application rather than a separate solid black footer.

Use:

- dark translucent surface
- subtle top/border separation
- appropriate blur only if supported and useful
- consistent icon style
- clear active state
- muted inactive states

The active tab should use the brand green.

Avoid making inactive icons too bright.

Maintain the existing navigation behavior exactly.

Do not modify routes just to change styling.

---

# 17. Spacing System

Create or normalize a spacing scale.

Avoid arbitrary spacing values across components.

The screen should have:

- consistent horizontal page padding
- consistent section spacing
- consistent card gaps
- consistent internal card padding
- consistent header spacing
- consistent bottom navigation spacing

The reference feels polished largely because spacing is systematic.

Do not solve layout problems by randomly increasing margins.

---

# 18. Border Radius System

Normalize corner radii.

Use a small number of radius levels, for example:

```text
small
medium
large
pill
```

Do not use a different radius for every component.

The entire interface should feel like it belongs to one design system.

---

# 19. Shadows / Depth

Depth should come primarily from:

1. contrast
2. surface opacity
3. image integration
4. subtle shadows
5. atmospheric background

Do not use strong drop shadows everywhere.

Avoid obvious floating-card effects.

The reference is sophisticated because the depth is subtle.

---

# 20. Motion

Do not introduce unnecessary animation during this refinement.

Only preserve or improve existing interaction feedback.

If animations already exist:

- keep them subtle
- keep them fast
- avoid excessive spring effects
- avoid decorative animations

The visual refinement is the priority.

---

# 21. Responsive Behavior

The Home Screen must remain correct on the actual supported viewport sizes.

Do not optimize only for a screenshot.

Check:

- narrow mobile
- normal mobile
- larger mobile
- supported tablet/web layout if applicable

Do not allow:

- text clipping
- broken horizontal scrolling
- overflowing cards
- navigation overlap
- CTA clipping
- image distortion
- unsafe-area issues

---

# 22. Implementation Strategy

Work incrementally.

### Phase 1 — Audit

Inspect the existing implementation.

Do not change code yet.

Identify:

- Home Screen entry point
- components
- styling system
- tokens
- image assets
- product components
- category components
- navigation
- responsive rules

Then summarize the implementation plan.

### Phase 2 — Foundation

Refine only:

- colors
- surfaces
- borders
- typography
- spacing
- radii
- shadows
- accent system

Do not redesign layout yet.

Render and inspect.

### Phase 3 — Header + Search

Refine:

- header
- greeting
- action buttons
- search

Render and inspect.

### Phase 4 — Categories

Refine:

- category cards
- selected state
- spacing
- imagery

Render and inspect.

### Phase 5 — Best Sellers

Refine:

- section header
- carousel
- product cards
- image treatment
- badges
- price
- quantity controls
- favorite controls

Render and inspect.

### Phase 6 — Promotional Banner

Refine the collection/promotion section.

Render and inspect.

### Phase 7 — Secondary Sections

Refine Seasonal Picks and other existing Home Screen sections.

Render and inspect.

### Phase 8 — Bottom Navigation

Refine only the visual treatment.

Preserve functionality.

Render and inspect.

### Phase 9 — Final Polish

Perform a complete visual review.

Fix inconsistencies in:

- spacing
- typography
- borders
- radii
- green usage
- card heights
- alignment
- image crops
- navigation
- section rhythm

---

# 23. Mandatory Visual QA Loop

After each major phase:

1. Run the application.
2. Capture/render the Home Screen.
3. Inspect the actual rendered result.
4. Compare against the supplied reference.
5. Identify the 3–5 largest visual discrepancies.
6. Fix those discrepancies.
7. Render again.
8. Only continue when the current phase is visually coherent.

Do not assume that code that "looks right" will render correctly.

The rendered screen is the source of truth.

---

# 24. Visual Review Checklist

Before considering the Home Screen complete, verify:

## Overall

- Does it feel like one visual environment?
- Does it feel premium?
- Does it feel like a fresh-food/wellness brand?
- Does it still feel like the original microgreens app?
- Is the design restrained rather than over-designed?

## Background

- Is the background predominantly dark?
- Is botanical atmosphere subtle?
- Does the background support rather than compete with content?

## Header

- Is the greeting hierarchy clear?
- Is the user name prominent?
- Are actions balanced?
- Is there enough breathing room?

## Search

- Does the search bar feel integrated?
- Is the filter action appropriately emphasized?
- Is the contrast sufficient?

## Categories

- Is the selected category obvious?
- Are cards consistent?
- Is horizontal scrolling clean?

## Products

- Are images the hero?
- Are cards consistent?
- Are prices easy to find?
- Are descriptions readable?
- Are controls compact?
- Are cards too tall or visually heavy?

## Promotion

- Does the banner feel integrated?
- Does imagery blend naturally?
- Is the CTA clear without dominating?

## Navigation

- Does it feel elevated?
- Is Home clearly active?
- Are inactive tabs appropriately muted?

## Consistency

- Are radii consistent?
- Are borders consistent?
- Are green accents consistent?
- Are spacing values consistent?
- Are icon styles consistent?
- Are typography levels consistent?

---

# 25. Anti-Slop Rules

These rules override aesthetic experimentation.

DO NOT:

- make everything green
- make everything glassmorphic
- add gradients everywhere
- add glow everywhere
- use excessive blur
- make every element rounded like a pill
- use heavy borders
- use heavy shadows
- add random decorative icons
- add unnecessary badges
- add excessive floating elements
- introduce multiple competing accent colors
- use inconsistent icon sets
- make headings unnecessarily huge
- add decorative effects that do not improve hierarchy
- change functionality for visual reasons
- rewrite working architecture unnecessarily

When uncertain between two visual treatments:

> **Choose the more restrained treatment.**

If an effect is more noticeable than the content it is decorating, reduce it.

---

# 26. Critical Design Principle

Always ask:

> **Does this change improve the relationship between the UI elements and the overall visual environment?**

A component should not merely look attractive by itself.

It must look correct **in context with the entire screen**.

The goal is:

> **A cohesive premium botanical food/wellness environment.**

Not:

> **A collection of individually decorated UI components.**

---

# 27. Definition of Done

The Home Screen is complete only when:

- the existing functionality still works
- existing product data still works
- existing navigation still works
- existing assets are reused where appropriate
- the screen follows the supplied reference's design language closely
- the dark identity is preserved
- botanical atmosphere is subtle
- product imagery remains dominant
- cards feel integrated rather than isolated
- spacing is systematic
- typography hierarchy is clear
- green is used as an accent rather than a second background
- bottom navigation feels integrated
- the entire screen feels like one coherent design system

Do not proceed to redesign Product Detail, Cart, Orders, Profile, or other screens.

**The Home Screen is the only scope of this document.**

Perfect this screen first.
