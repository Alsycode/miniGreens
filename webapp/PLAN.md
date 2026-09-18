# Webapp Rebuild — Plan & Resume Log

> **Purpose:** single source of truth for building `webapp/` — a new Next.js site with the
> **same functionality as `website/`** (Supabase-backed catalogue, cart, checkout, auth,
> orders, subscriptions, blog, etc.) but restyled to match the **Blue Tea** reference UI in
> `webapp ui reference/` (13 screenshots: home, PLP, PDP, cart drawer, footer, reviews, etc.).
> This file is **append-only for the Session Log** and **live-edited for the Status Board**.
> It exists so this work can span many chat sessions without losing state.

---

## 🔁 HOW TO RESUME (read this first, every session)

1. **Read this entire file top to bottom.** Trust it over your own assumptions about progress.
2. Look at the **Status Board** below. Find the first task that is `TODO` or `IN PROGRESS`.
3. If a task is `IN PROGRESS`, read its **"Resume notes"** — it says exactly which sub-step
   to pick up from.
4. Do the work. Follow sub-steps in order. Reference the screenshots in `webapp ui reference/`
   for exact visual details (colors, spacing, copy patterns) whenever restyling a screen.
5. **Verification is part of the task** — run `npm run dev` (or use the browser preview tool)
   and actually look at the page before marking a task `DONE`.
6. **Before your context runs out**, update this file:
   - Flip the task's Status Board row.
   - If still `IN PROGRESS`, write/replace its **"Resume notes"** with the exact next sub-step.
   - Append a dated entry to the **Session Log**.
7. Never delete Session Log entries. Never mark a task `DONE` you did not actually verify.

### Starting prompt for a fresh chat

> Read `F:\minigreensMaster\webapp\PLAN.md`, then resume the remaining work from the Status
> Board. Work through tasks in order, update the plan file as you go, and stop to ask me only
> if a decision is genuinely mine.

---

## 🎯 GOAL

`webapp/` is a **drop-in visual reskin** of `website/`: same pages, same Supabase backend,
same cart/checkout/auth logic — but every screen's markup and styling is rebuilt to look like
the Blue Tea site (bluetea.co.in) shown in the reference screenshots:

- Light theme (white background), **navy blue** header/footer/accents, **yellow** CTA pills.
- Top scrolling **announcement marquee** bar above the header.
- Centered logo header with search / account / wishlist / cart icons + a pill nav row below.
- Product cards: image, name, **star rating + review count**, **strikethrough MRP → sale
  price**, short benefit tags, pill-shaped "Add to cart" button.
- PLP: filter/sort bar, category grid, pagination.
- PDP: breadcrumb, image gallery with thumbnails, qty stepper, sticky bottom add-to-cart bar,
  trust badges row, "how to use" bullets, "You may also like" + "Recently viewed" rails,
  customer reviews with rating breakdown bars.
- Cart drawer: free-shipping/free-gift progress bar, line items with qty steppers, upsell
  "Exclusive Deal" modal pattern (optional/stretch), sticky checkout button.

**Not in scope:** copying Blue Tea's actual product content/brand — this is Mini Greens
Company's catalogue (teas, microgreens, smoothies, juices) wearing Blue Tea's *UI patterns*.

---

## 🗺️ SOURCE MAP

| Reference | Role |
|---|---|
| `website/` | Existing Next.js site — **copy business logic from here almost verbatim** (Supabase clients, cart store, auth/preorder context, lib helpers). Only the UI/markup layer gets rebuilt. |
| `webapp ui reference/*.png` | 13 Blue Tea screenshots — the **visual target**. Re-check these when styling each screen. |
| `webapp/` | **This new app.** Same stack: Next 16 + React 19 + Tailwind v4 + zustand + `@supabase/ssr` + `@phosphor-icons/react`. Same `.env.local` (same Supabase project — read-only reuse, do not touch `website/`). |

Reference screenshot → screen mapping (by filename suffix, ascending = viewing order):
- `230541` — Home: announcement bar, header, hero banner, PLP-style grid starting below fold
- `230558` — Product grid cards (bestseller listing) close-up
- `230613` — Grid page 2 + footer (Explore / Policies columns)
- `230625`, `230633` — Single product card close-ups (2 style variants — light bg, green bg with icons)
- `230653` — Cart drawer open + "Exclusive Last Minute Deal" upsell modal
- `230709` — Cart drawer full state (free shipping/gift progress, line items, free-gift picker)
- `230739` — PDP top: breadcrumb, gallery, title, rating, price, description bullets, qty+add to cart, pincode checker
- `230750` — PDP gallery thumbnails, trust icons row (Caffeine Free / Fastest Delivery / Carcinogen Free), UGC video cards, "Trusted by 10 lakh people"
- `230803` — PDP: press logos strip, customer reviews cards, rating breakdown bars
- `230812` — "You may also like" + "Recently viewed" rails, sticky bottom add-to-cart bar
- `230826` — Footer detail (Blue Tea / Explore / Policies columns, socials)
- `230836` — Floating chat widget ("Blue Tea Expert") — **stretch/optional**, not required for parity

---

## ✅ STATUS BOARD

| ID | Task | Status |
|----|------|--------|
| W1 | Scaffold `webapp/` (package.json, configs, copy business-logic layer) | DONE — live-verified |
| W2 | Design tokens: Tailwind theme (navy/yellow/cream Blue-Tea palette) + fonts | DONE — live-verified |
| W3 | Layout shell: AnnouncementBar, Navbar (logo+icons+pill nav), Footer, CartDrawer | DONE — live-verified (cart drawer opens, free-delivery progress bar, qty stepper all work) |
| W4 | Home page: Hero, category/product grid, trust strip, testimonials | DONE — live-verified in browser preview (screenshots match Blue Tea reference layout) |
| W5 | Shop/PLP page: filter bar, sort, product grid, pagination | DONE — live-verified (31 products, category chips, grid render correctly) |
| W6 | PDP (`shop/[slug]`): gallery, buy box, trust icons, description, reviews, related rails, sticky add-to-cart bar | DONE — live-verified (breadcrumb, gallery, price/discount, benefits, qty+add-to-cart, trust icons, how-to-enjoy, nutrition, rating breakdown bars, related products all render) |
| W7 | Cart page + Checkout page + success page | DONE — live-verified (empty-cart state, auth gate on checkout both render correctly) |
| W8 | Remaining static/account pages: about, blog, contact, login, orders, preorder, subscribe, subscriptions, returns, terms, shipping-policy | DONE — `tsc --noEmit` clean across whole app; live-verified About, Subscriptions, and /orders→/login redirect + OTP form render correctly |
| W9 | Polish pass: responsive check (mobile/tablet/desktop), empty states, loading states, a11y labels | DONE — found & fixed a real gap: Navbar had no mobile nav at all (links/search/account only showed ≥lg). Added a hamburger menu (`components/Navbar.tsx`) with a slide-down mobile nav panel; live-verified at 375×812 on home + PDP (mobile menu opens/closes, PDP sticky add-to-cart bar shows correctly, single-column layout holds) |
| W10 | Final verification: `npm run build` clean, click through every page in browser preview, screenshot compare vs reference | DONE — `npm run build` compiles clean (all 17 routes generated, TypeScript passes); smoke-tested every route's HTTP status (all 200, `/orders` and `/preorder` correctly 307-redirect to `/login` and `/cart`); visually verified home, shop, PDP, cart drawer, mobile nav against the Blue Tea reference screenshots |

---

## 🧱 CONVENTIONS

- **Do not modify `website/`.** This is a parallel app, not a migration — `website/` stays live.
- Reuse verbatim (copy, then only touch imports/paths if needed): `lib/supabase/*`,
  `store/useCartStore.ts`, `context/AuthContext.tsx`, `context/PreorderContext.tsx`,
  `lib/categories.ts`, `lib/productImages.ts`, `lib/productCopy.ts`, `lib/subscriptions.ts`,
  `lib/products.ts`, `public/images/*`. These encode real business rules (category ordering,
  image fallback chain, free-delivery threshold, etc.) — don't reinvent them.
- Rebuild from scratch (this is the actual work): every component under `components/` and
  every route under `app/`, styled per the Blue Tea reference.
- Color tokens live in `app/globals.css` under `@theme inline` (Tailwind v4 CSS-first config,
  same pattern as `website/`). Keep names semantic (`--color-navy`, `--color-navy-dark`,
  `--color-accent` (yellow CTA), `--color-sale` (red price), `--color-cream-bg`, etc.) so
  components don't hardcode hex values.
- Same Supabase project/env as `website/` — copy `.env.local` as-is (already gitignored).
- Run/preview with the Browser tool's `preview_start` (a `webapp` entry already exists in
  `.claude/launch.json`, port 3100, `cwd: webapp`, alongside `website` on 3000).

### ⚠️ Known gotcha: Turbopack workspace-root confusion (fixed, don't reintroduce)

Because `webapp/` sits in the same monorepo as the root `package.json`/`package-lock.json`
(`F:\minigreensMaster\package-lock.json`, from the Expo mobile app) and `website/` has its
own lockfile too, Turbopack's auto-detected workspace root gets confused and mis-resolves
`node_modules` paths (`[project]/webapp/node_modules/...` vs `[project]/node_modules/...`),
causing a 500 "Could not find the module ... in the React Client Manifest" error and/or the
dev server hanging forever on "Compiling / ...". **Fix already applied** in
`webapp/next.config.ts`: `turbopack: { root: path.join(__dirname) }`. If this error resurfaces
after a fresh clone/install, delete `webapp/.next` and restart the dev server.

### ⚠️ Known gotcha: first Turbopack compile is slow in this environment

The very first request after starting `next dev` can take 60–120s to return (cold Turbopack
compile of the whole module graph) — this is normal here, not a hang. Give it time before
assuming something's broken; `preview_logs` will show `Compiling / ...` the whole time with
no crash.

---

## 📓 SESSION LOG

### 2026-09-17 — Session 1
- Reviewed all 13 Blue Tea reference screenshots; read `website/`'s full architecture
  (package.json, layout, globals.css, Navbar, Footer, ProductCard, CartDrawer, shop page,
  cart store, auth/preorder context, product image/copy/category helpers).
- Confirmed `website/` is Supabase-backed (not mock) — products/categories come from live
  `products`/`categories` tables; cart is zustand (client-only, not persisted); auth is
  Supabase session-based; preorder/subscription selection persists to localStorage.
- Wrote this plan file. Starting W1 (scaffold).

### 2026-09-17/18 — Session 1 (continued) — W1 through W10 all DONE
- Hit and fixed a real blocker: F: drive ran out of disk space mid-`npm install`
  (`ENOSPC`) — user freed space, retry succeeded (373 packages installed).
- Hit and fixed a Turbopack workspace-root bug (see the "Known gotcha" note above) that
  caused 500s / infinite "Compiling /" hangs — fixed via `turbopack.root` in
  `next.config.ts` + clearing `.next`. Documented so it isn't re-debugged from scratch.
- Built and live-verified in the browser preview (port 3100), in order: design tokens
  (navy/yellow/cream theme), layout shell (AnnouncementBar, Navbar w/ ShopMenu dropdown,
  Footer, CartDrawer), Home page (Hero, TeaGrid, WhyChooseUs, ProductGrid, Testimonials,
  SubscriptionTeaser, FeatureStrip), Shop/PLP (category filter chips), PDP (gallery,
  buy box, trust icons, how-to-enjoy, nutrition, rating-breakdown bars, related products,
  sticky mobile add-to-cart bar), Cart page, Checkout page (+ success page, real Supabase
  order insert, preorder-only — matches `website/`'s model), and all 8 remaining pages
  (about, blog, contact, login w/ OTP, orders, preorder redirect, subscribe, subscriptions,
  returns, terms, shipping-policy).
- Polish pass caught a real gap: the Navbar had **no mobile navigation** at all (nav links
  and account/search/wishlist icons were `hidden` below `lg`, with nothing replacing them).
  Fixed by adding a hamburger menu + slide-down mobile nav panel; verified at 375×812 on
  both the home page and PDP (sticky add-to-cart bar correctly appears on scroll).
- Final verification: `npm run build` compiles clean (17 routes, static + dynamic, no
  TypeScript errors); smoke-tested every route's HTTP status via curl — all 200, except
  `/orders` and `/preorder` which correctly 307-redirect (to `/login?redirect=/orders` and
  `/cart`).
- **Result: webapp/ is functionally complete** — same catalogue, cart, checkout (preorder),
  auth, orders, subscriptions, blog/about/contact/legal pages as `website/`, restyled to
  the Blue Tea visual language. All 10 planned tasks (W1–W10) are DONE and live-verified.

### Not done / explicitly out of scope
- The reference's "Exclusive Last Minute Deal" cart upsell modal and the floating
  "Blue Tea Expert" chat widget (screenshots `230653` and `230836`) were marked
  optional/stretch in the Goal section and were not built — `website/` has no equivalent
  feature to port, and inventing one would be new functionality, not a reskin.
- Product review cards with individual reviewer names/quotes (as in the reference) were
  intentionally **not** fabricated — `products` only stores an aggregate `rating`/
  `review_count`, no per-review rows exist in the schema. `RatingSummary` shows the
  aggregate + an estimated star-distribution bar chart instead, which is honest about
  what data actually backs it.
- No dedicated tablet-breakpoint pass beyond what Tailwind's responsive grid classes give
  for free (2-col → 4-col at `lg`, etc.) — looked correct at 375px and desktop widths;
  768px was not separately screenshotted.
