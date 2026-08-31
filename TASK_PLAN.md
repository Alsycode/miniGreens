# MGC Platform — Remaining Work Plan & Resume Log

> **Purpose:** single source of truth for the remaining build work identified in the
> 2026-08-30 gap analysis against `D:\Mobile APP (1).pdf` (the MGC Platform spec).
> This file is **append-only for the Session Log** and **live-edited for the Status Board**.
> It exists so work can span many chat sessions without losing state.

---

## 🔁 HOW TO RESUME (read this first, every session)

1. **Read this entire file top to bottom.** Trust it over your own assumptions about progress.
2. Read `BUILD_PLAN.md` too — it covers Phases 0–4 (the pre-2026-08-30 rebuild, all DONE) and
   has the codebase conventions, dev-server recipe, and verification tricks. Do not repeat that work.
3. Look at the **Status Board** below. Find the first task that is `TODO` or `IN PROGRESS`.
4. If a task is `IN PROGRESS`, read its **"Resume notes"** line (added by the previous session) —
   it says exactly which sub-step to pick up from.
5. Do the work described under that task's section. Follow the sub-steps in order.
6. **Verification is part of the task** — a task is not `DONE` until its "Definition of done"
   checks pass (typecheck + live check in the browser preview).
7. **Before your context runs out**, update this file:
   - Flip the task's Status Board row (`TODO` → `IN PROGRESS` → `DONE`).
   - If still `IN PROGRESS`, write/replace its **"Resume notes"** line with the exact next sub-step.
   - Append a dated entry to the **Session Log** describing what you did, what you verified,
     and any surprises / decisions.
8. Never delete Session Log entries. Never mark a task `DONE` you did not verify.

### Starting prompt for a fresh chat

> Read `F:\minigreensMaster\TASK_PLAN.md` and `F:\minigreensMaster\BUILD_PLAN.md`, then
> resume the remaining work from the Status Board. Work through tasks in order, update the
> plan file and Session Log as you go, and stop to ask me only if a decision is genuinely mine.

---

## ✅ STATUS BOARD

| ID | Task | Area | Priority | Status |
|----|------|------|----------|--------|
| T1 | Move mobile catalogue onto live Supabase data | Mobile / Customer | P0 | DONE (2026-08-30) |
| T2 | Coupons & offers (checkout coupon field + My Offers screen) | Mobile / Customer | P1 | DONE (2026-08-30) — migration pushed + DB-verified |
| T3 | In-app notification inbox (+ `notifications` table) | Mobile + DB | P1 | DONE (2026-08-30) — migration pushed + DB-verified |
| T4 | Pre-order flow (mobile) + pre-orders reach Admin | Mobile + DB + Admin | P1 | DONE (2026-08-30) — migration pushed + live-verified end to end |
| T5 | Capture DOB (register + profile edit) + surface birthday reward | Mobile | P2 | DONE (2026-08-30) — migration pushed + DB-verified |
| T6 | Partner payouts (earnings → payout tracking, both sides) | Mobile + Admin + DB | P2 | DONE — `verify_t6.mjs` 22/22 (2026-08-30) **and** full app click-through (2026-08-31): mobile Earnings card (gross ₹3000 / fee 10% / net ₹2700 / available ₹2700) → Request Payout → admin Payouts tab Approve→processing→Mark paid → mobile shows Paid, paid_out ₹2700 / available ₹0. Admin Reports Partner Payouts gained real Paid Out / Pending cols. |
| T7 | Admin: Customers screen | Admin | P2 | DONE (2026-08-30) — admin `tsc` clean + live-verified (list, tiles, drawer) |
| T8 | Admin: wire Overview dashboard + Delivery Queue off real data | Admin | P2 | DONE (already complete — plan gap-analysis was stale) |
| T9 | Admin: Reports export as PDF + Excel (CSV already done) | Admin | P3 | DONE (2026-08-31) — Export ▾ menu (CSV/Excel/PDF) live: `write-excel-file` + `jspdf`/`jspdf-autotable` chunks load on click, handlers run clean (no console error / alert); Partner Payouts tab shows the new Paid Out / Pending cols. Only the on-disk file open is unconfirmable in the sandbox (downloads suppressed). |
| T10 | Partner KYC document upload | Mobile + Admin + Storage | P3 | DONE (2026-08-31) — migration live; full chain verified in the running apps: mobile `partner/apply` KYC section → Add Document → upload to `partner-kyc/<uid>/…` → submit; admin drawer lists the doc, signed-URL download returns the exact bytes (admin RLS select works), Verify KYC flips the badge + persists. One caveat: `expo-document-picker`'s **web** teardown throws a `removeChild` redbox after a synthetic file inject — upload still succeeds; native has no such path. |
| T11 | (Optional) Testimonials / Why-Choose / Blog → DB + admin CMS | Full-stack | P4 | TODO |
| — | ~~WhatsApp-to-Admin new-order alert~~ | — | — | **BLOCKED** — no WhatsApp BSP account. Out of scope until credentials exist. |

Priority key: **P0** foundational (do first) · **P1** high customer value · **P2** rounding out roles ·
**P3** admin polish · **P4** nice-to-have.

Recommended order: **T1 → T5 → T2 → T3 → T4 → T7 → T8 → T6 → T9 → T10 → T11**.
(T1 first because it touches the most screens; T5 is tiny and unblocks T2's birthday-coupon surface.)

---

## 🗺️ CONVENTIONS & CODEBASE MAP

**Two apps in one repo:**
- **Mobile** — Expo / expo-router / React Native, in `src/`. Screens are file-based routes under `src/app/`.
- **Admin** — Next.js 16 (Turbopack) + Tailwind v4, in `admin/`. Pages under `admin/app/dashboard/(protected)/`.
- **Backend** — Supabase (Postgres + Auth + Storage + RLS). Migrations in `supabase/migrations/`, seed in `supabase/seed.sql`.
- **Website** — `website/` — marketing/pre-order only, localStorage, NOT part of this plan.

**Key mobile files:**
| Path | Role |
|---|---|
| `src/mock/index.ts` | All mock catalogue data (products, categories, banners, lifestyleArticles, testimonials, whyChooseUs, subscriptionPlans, faqs). **T1 removes the product/category reliance on this.** |
| `src/types/index.ts` | App-domain TS types (hand-written) |
| `src/types/database.ts` | Supabase row types (hand-written — CLI gen blocked, no Docker). **Add new tables/columns here whenever you write a migration.** |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/store/useAuthStore.ts` | Auth: session, `profile` row, signIn/signUp/signOut, `initialize()` |
| `src/store/useCartStore.ts` | Cart; `addItemBySlug` already queries live `products` by slug |
| `src/store/useAppStore.ts` | Onboarding flag + a stale `preorder` slice (used by T4) |
| `src/app/_layout.tsx` | Root Stack; **register every new route here**. Has `QueryClientProvider` (react-query is installed and ready). |
| `src/app/(tabs)/_layout.tsx` | Bottom tab bar (Home / Search / Orders / Rewards / Profile) |
| `src/utils/placeholders.ts` | `resolveImageSource()` — handles both `require()` results and string URIs |
| `src/components/ui/*` | Typography, Button, Card, TextField, EmptyState, Loading, ErrorNotice, SearchBar |
| `src/components/product/ProductCard.tsx` | variants: `default` (full-bleed image + fade), `horizontal`, `compact`, `seasonal` |
| `src/theme/` | `colors`, `spacing`, `borderRadius`, `typography` |

**Data-fetch pattern to use for T1+ (react-query):**
```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const { data: products = [], isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const { data, error } = await supabase.from('products').select('*, category:categories(*)').eq('is_available', true);
    if (error) throw error;
    return data;
  },
});
```
Some screens currently use `useFocusEffect` + `useState` + raw `supabase.from(...)` (see
`src/app/(tabs)/orders.tsx`, `subscriptions.tsx`). Either style is acceptable; prefer react-query
for read-heavy catalogue screens so caching is shared.

**Known gotcha — Reanimated on web:** `<Animated.View entering={FadeInUp…}>` sometimes leaves
list content stuck at `visibility:hidden` on `react-native-web` when the screen mounts during a
route transition. For **lists of mapped cards**, use a plain `<View>` (see `src/app/articles.tsx`
and `src/app/article/[id].tsx` — built 2026-08-30 with this workaround). One-shot headers/heroes
with `entering` are fine.

**DB / migrations:**
- Migration file name: `supabase/migrations/YYYYMMDDHHMMSS_short_name.sql`. Write forward-only SQL.
- Every table needs **RLS policies** — follow the patterns in `20260818190000_init_schema.sql`
  (`*_all_own` for owner access, `is_admin()` helper for admin access).
- After writing a migration: add the matching types to `src/types/database.ts` (and to the admin's
  own DB types if it has separate ones), and if it's reference data, add rows to `supabase/seed.sql`.
- The user applies migrations to the live project (they hold the DB password / pooler URL). When a
  task needs a migration pushed, **stop and tell the user the exact `supabase db push` / SQL to run**,
  then continue once they confirm.
- `products` already has: `stock`, `is_available`, `is_preorder`, `is_featured`, `is_seasonal`,
  `is_best_seller`, `rating`, `review_count`, `nutrition` (jsonb), `benefits` (text[]), `tags` (text[]).
- `orders` already has: `order_type` ('standard' | 'business'), `status`, `payment_status`,
  `razorpay_*`, `delivery_address_id`, `delivery_date`, `delivery_time`, `notes`, `order_number`.
- `discounts` already exists (flat/%, `is_birthday_offer`, `is_active`, `expires_at`, `code`, …) —
  T2 consumes it, does not recreate it.
- Stock decrements once inside `verify_razorpay_payment` (migration `20260821000000`).
- Order-status push + birthday-offer push already exist (`20260820140000_notifications.sql`) — but
  there is **no `notifications` table** for an in-app inbox (that's T3).

**How to run & verify the mobile app (from `BUILD_PLAN.md`, condensed):**
1. Dev server: `.claude/launch.json` has `"MiniGreens Mobile Web"` (`expo start --web --port 8090`).
   It needs `CI=1` in the env or it hangs on a stdin prompt. If `preview_start` hangs, launch detached
   via PowerShell `Start-Process cmd.exe /c "npx expo start --web --port 8090"` with `$env:CI="1"`.
   First bundle takes ~2–4 min.
2. There is a **Supabase Auth login gate**. To reach the tabs without credentials: `navigate` to
   `http://localhost:8090/explore` (renders inside the tab navigator), then in the page run JS to
   click the "Home" tab: find the leaf element whose text is `"Home"` and `.click()` it plus a few
   ancestors. `router` navigation between in-app routes works; hard-navigating to deep routes can
   leave Reanimated content hidden (see gotcha above) — prefer in-app taps for verification.
3. `resize_window` to `mobile` resets on navigation — re-apply it before each screenshot.
4. Screenshots on animation-heavy screens (Home) can return stale frames; `get_page_text` /
   `read_page` are more reliable for content checks. Wait 3–6 s after nav before screenshotting.
5. Typecheck: `npx tsc --noEmit` at repo root (mobile). For admin: `cd admin && npx tsc --noEmit`.
   **Both must pass before a task is DONE.**

---

## 📋 TASKS (detailed)

### T1 — Move mobile catalogue onto live Supabase data  `P0`

**Goal:** Home / Explore / Search / Category / Product-detail read `products` + `categories`
from Supabase, not `src/mock/index.ts`. Removes the mock↔DB split (today only the cart hits the DB).

**PDF ref:** §1 "Browse MGC products", §6 "One Central MGC Database".

**Prerequisites:** none. `products`/`categories` are already seeded (`supabase/seed.sql`).
Confirm the seed is actually applied to the live project first (`select count(*) from products;`
via the user, or the app's cart already resolving slugs proves it is).

**Steps:**
1. Create `src/services/catalog.ts` with react-query hooks:
   - `useProducts(opts?)` → `supabase.from('products').select('*, category:categories(*)').eq('is_available', true)`
   - `useProduct(slug)` → single by slug
   - `useCategories()` → `supabase.from('categories').select('*').order('name')`
   - Derive `featured` / `seasonal` / `bestSeller` client-side from the boolean columns, or add
     filtered hooks (`useProducts({ bestSeller: true })`).
2. Add a **mapper** `dbProductToUi(row)` in the same file that shapes a DB row into whatever the
   `ProductCard` / product-detail screen expects (watch: `images` is `text[]` in DB but the UI
   currently gets `require()` assets from mock; for now map `images[0]` to a string URL and let
   `resolveImageSource` handle it — DB `images` is empty in seed, so **also keep a slug→local-asset
   fallback map** so the app keeps its bundled imagery until real image URLs exist in Storage).
   Put that fallback map in `src/services/catalog.ts` (e.g. `LOCAL_IMAGE_BY_SLUG`).
3. Rewrite these screens to use the hooks instead of importing from `../../mock`:
   - `src/app/(tabs)/index.tsx` — Home (Best Sellers, Seasonal Picks, Featured, Categories chips)
   - `src/app/(tabs)/explore.tsx` — grid + category filter + sort
   - `src/app/search.tsx` — search results
   - `src/app/category/[slug].tsx` — category listing
   - `src/app/product/[id].tsx` — detail (nutrition, benefits, related)
   Keep `lifestyleArticles`, `testimonials`, `whyChooseUs`, `faqs` on mock for now (T11 covers those).
4. Add loading (`<Loading/>` / skeletons) and empty/error states to each screen.
5. Keep `categories` at the 3 real rows (`smoothies`, `juices`, `microgreens`). The 4th "Bowls"
   chip added on 2026-08-29 is **mock-only** — either add a real `bowls` category row in a migration
   + seed, or drop the 4th chip. **Decision needed from user** — note it and default to dropping it
   if unanswered.
6. Delete now-dead product/category exports from `src/mock/index.ts` only after every screen is migrated
   and typecheck is clean (keep the file — other exports still used).

**DB work:** none required (optional: add `bowls` category row; add a `products.images` backfill later).

**Definition of done:**
- `npx tsc --noEmit` clean.
- Live check: Home + Explore + a category + a product detail all render from Supabase (verify by
  temporarily changing a product's `price` in the DB and seeing it reflected, or by counting rows).
- Add-to-cart still works end-to-end from the migrated screens.
- No screen imports `products` or `categories` from `../../mock`.

**Resume notes:** DONE 2026-08-30 — see Session Log.

---

### T2 — Coupons & offers  `P1`

**Goal:** Customer can enter a coupon code at checkout and see the discount applied; a "My Offers"
screen lists currently-valid discounts (including their birthday coupon when active).

**PDF ref:** §1 "Receive offers and discounts", "Receive birthday rewards"; §4 Admin "Discounts".

**Prerequisites:** T5 (DOB) makes the birthday coupon meaningful but is not a hard blocker.
`discounts` table already exists.

**Steps:**
1. **Server: a validation RPC.** New migration `..._apply_discount.sql`:
   `public.validate_discount(p_code text, p_subtotal numeric)` → returns
   `{ valid boolean, reason text, discount_type text, discount_value numeric, discount_amount numeric }`.
   Rules: code exists, `is_active`, not expired, `min_order_amount` (add column if missing) satisfied,
   birthday offers only valid if `auth.uid()`'s `date_of_birth` month/day = today (or within a window).
   Compute `discount_amount` (flat vs percent, capped at subtotal).
2. Add `discount_code text`, `discount_amount numeric default 0` columns to `orders` (migration).
   Update `src/types/database.ts`.
3. **Checkout UI** (`src/app/checkout/index.tsx`): add a "Coupon code" `TextField` + "Apply" button
   on the Review step. On apply → call `validate_discount` → show applied state / error via
   `ErrorNotice`. Recompute the total (`subtotal − discount_amount + DELIVERY_FEE`). On "place order",
   write `discount_code` + `discount_amount` onto the `orders` insert.
4. **My Offers screen** `src/app/offers.tsx` (new, register in `_layout.tsx`; link from Profile menu
   in `src/app/(tabs)/profile.tsx` and/or a card on Home): react-query fetch of
   `discounts` where `is_active` and not expired and applicable to this user (public promo codes +
   their birthday offer if in-window). Each row: code, description, "Tap to copy" (use
   `expo-clipboard`, already a dep).
5. **Admin**: `admin/app/dashboard/(protected)/orders/*` — show `discount_code` / `discount_amount`
   in the order drawer. `reports` — include discount usage (may already be partially there).

**Definition of done:** apply a real active code at checkout → total drops → order row stores the
code+amount → visible in Admin order drawer. Invalid/expired code shows a clear error. My Offers
lists active discounts. Both apps typecheck.

**Resume notes:** DONE 2026-08-30 — migration `20260830140000` pushed; DB-verified
(`validate_discount` happy/min-order/bogus paths all correct; `orders.discount_code` +
`discount_amount` present). Mobile checkout coupon UI + `/offers` screen not yet clicked
through on a running app, but the RPC contract they call is proven. See Session Log.

**Deviations from the step list, noted not hidden:**
- Step 1: `validate_discount(p_code, p_subtotal)` returns **`json`** (not a table/record) —
  `supabase.rpc()` then hands the client a plain object, no `data[0]` unwrap. Shape:
  `{ valid, reason, code?, discount_type?, discount_value?, discount_amount? }`.
- Step 1: did **not** add a `min_order_amount` column — the table already has `min_order_value`
  (from `20260820090000`); the RPC uses that.
- Step 1: birthday-offer gate is **birth-month == current month** (simple, defensible for v1),
  not a day-window. `send_birthday_offers()` already uses exact MM-DD for the push; the coupon is
  deliberately looser so a user can still redeem it any day that month.
- Step 3: coupon field lives on the **Review** step (as specified), above Order Summary. A
  `Discount · CODE` line appears in the summary and the total recomputes
  (`subtotal − discount + delivery`, floored at 0). `discount_code` + `discount_amount` are
  written on the `orders` insert in `handlePlaceOrder`.
- Step 5 (Admin): order drawer now shows a `Discount · CODE  −₹N` line between Delivery fee and
  Total when `discount_amount > 0`. Reports already pulls `discounts` — left as-is for now
  (discount **usage** reporting off `orders.discount_code` not added; flag if the user wants it).
- `used_count` is **not** incremented on order placement yet — no usage-tracking trigger was
  added. `validate_discount` already refuses codes at/over `usage_limit`, but nothing bumps the
  counter. Add an `AFTER INSERT ON orders` trigger (or fold into `verify_razorpay_payment`) if
  per-code usage limits need to actually enforce. Noted for a follow-up.

---

### T3 — In-app notification inbox  `P1`

**Goal:** A "Notifications" screen listing order updates, offers, birthday rewards, partner events —
persisted, with unread state. Today only transient OS push exists.

**PDF ref:** §1 "Receive notifications".

**Steps:**
1. **Migration `..._notifications_table.sql`:**
   ```sql
   create table public.notifications (
     id uuid primary key default gen_random_uuid(),
     profile_id uuid not null references public.profiles(id) on delete cascade,
     type text not null,               -- 'order_status' | 'offer' | 'birthday' | 'partner' | 'system'
     title text not null,
     body text not null,
     data jsonb not null default '{}',
     read_at timestamptz,
     created_at timestamptz not null default now()
   );
   -- RLS: select/update (read_at) own rows; insert via security-definer functions only.
   ```
2. **Wire the existing triggers to also insert a row.** In `20260820140000_notifications.sql`'s
   `notify_order_status_change()` and `send_birthday_offers()`, alongside the existing
   `send_expo_push_notification(...)` call, `insert into public.notifications (...)`. Do this in a
   NEW migration that `create or replace`s those functions (don't edit the old file).
3. **Also insert** a notification row when a coupon becomes available (T2) and on partner
   approval/rejection (see `partners` status change — add a trigger if none).
4. **Mobile UI:**
   - `src/app/notifications.tsx` (new, register route). List via react-query, newest first,
     unread dot, "mark all read" (bulk `update ... set read_at = now()`).
   - Header bell icon on Home (`src/app/(tabs)/index.tsx`) already exists with a static green dot —
     make the dot reflect `count(*) where read_at is null` and route to `/notifications`.
   - Optional: a lightweight realtime subscription (`supabase.channel('notifications')`) to refresh
     the badge; polling on focus is an acceptable v1.
5. Handle the push-tap deep link: `src/lib/notifications.ts` `handleNotification` / a response
   listener → `router.push` to `/notifications` or the specific order.

**Definition of done:** change an order's status in the DB → a notification row appears → shows in
the inbox with unread dot → tapping marks read → badge count updates. Typecheck clean.

**Resume notes:** DONE 2026-08-30 — migration `20260830150000` pushed; DB-verified
(table + 2 RLS policies; `notify_order_status_change` / `send_birthday_offers` bodies insert
inbox rows; partner trigger exists; **functional** — order insert + status flip produced 2
`notifications` rows). Mobile `/notifications` screen + Home bell badge not yet clicked
through on a running app. See Session Log.

**Deviations / notes:**
- Step 1: RLS = `select` own-or-admin, `update` own. **No insert policy** — all inserts go
  through the SECURITY DEFINER trigger fns (they bypass RLS). `data` defaults `'{}'::jsonb`,
  `not null`.
- Step 2: `create or replace`d `notify_order_status_change()` and `send_birthday_offers()` in the
  NEW migration (old `20260820140000` file untouched). `notify_order_status_change` no longer
  early-returns when the user has no `push_token` — it always writes the inbox row, then pushes
  only if a token exists. `send_birthday_offers` likewise now notifies **all** birthday users
  (inbox), not just those with a token.
- Step 3: **partner** approval/rejection → new `notify_partner_status_change()` +
  `after update of status on partners` trigger (separate from the existing BEFORE trigger that
  promotes the role). **Coupon-becomes-available** notification was NOT added — T2 has no
  per-user coupon assignment, so there's no discrete "became available" event; the birthday
  notification already covers the one meaningful case. Revisit if T2 grows targeted coupons.
- Step 4: `src/app/notifications.tsx` (new, route registered). react-query (`staleTime: 0`,
  `refetchOnMount: 'always'`), newest-first, unread = tinted row + dot, header "checkmark-done"
  button = mark-all-read (`update … set read_at = now() where profile_id = … and read_at is
  null`). Tapping a row marks just that row read then deep-links via `routeFromNotificationData`.
  Home bell (`src/app/(tabs)/index.tsx`): now routes to `/notifications` and the green dot is
  gated on a `['notifications-unread', profileId]` count query (`staleTime: 0`). Plain `<View>`/
  `<Pressable>` list per the Reanimated-web gotcha. No realtime channel — focus/mount refetch is
  the v1 (plan said that's acceptable).
- Step 5: `src/lib/notifications.ts` gained `routeFromNotificationData(data)` +
  `addNotificationResponseListener()` (handles both a live tap and cold-start via
  `getLastNotificationResponseAsync`). Wired into the root `_layout.tsx` effect. `order_status`
  data → `/order/<id>`, everything else → `/notifications`.
- `notifications` types added to `src/types/database.ts` (shared with admin via `@mobile/database`).

---

### T4 — Pre-order flow  `P1`

**Goal:** Customer can pre-order a product flagged `is_preorder`; the pre-order reaches Admin.

**PDF ref:** §1 "Pre-order products"; §4 Admin Orders "Pre-orders", Products "Pre-orders".

**Context:** `products.is_preorder` boolean exists. There is **no `preorders` table** and the old
preorder screen was retired in Phase 4 (checkout always sends `order_type='standard'`).
`src/store/useAppStore.ts` still has a stale `preorder` slice.

**Decision needed from user:** model pre-orders as (a) a value of `orders.order_type` (`'preorder'`)
— simplest, reuses the whole orders pipeline, or (b) a separate `preorders` table. **Recommend (a).**
Default to (a) if unanswered. Steps below assume (a).

**Steps:**
1. Migration: allow `orders.order_type` to be `'preorder'`; add `orders.expected_availability_date date`
   (nullable). Update `src/types/database.ts`.
2. Product detail (`src/app/product/[id].tsx`): when `product.is_preorder`, swap the "Add to Cart"
   CTA for "Pre-order" → routes into a pre-order variant of checkout (or a dedicated
   `src/app/preorder/[slug].tsx`). Pre-order can skip payment (or take it — user decision; default:
   no upfront payment, `payment_status='pending'`, `status='pending'`).
3. On submit: insert an `orders` row with `order_type='preorder'`, one `order_items` row, chosen
   address + notes. Fire the same status-notification trigger (it already runs on insert).
4. Orders list (`src/app/(tabs)/orders.tsx`) + detail: label pre-orders distinctly; show
   `expected_availability_date`.
5. **Admin Orders** (`admin/app/dashboard/(protected)/orders/`): add "Pre-orders" to the status/type
   tabs/filters; the drawer should let admin set `expected_availability_date` and convert a pre-order
   to a normal order (`order_type='standard'`) when stock lands.
6. Remove the dead `preorder` slice from `useAppStore.ts` (and `Preorder` type from
   `src/types/index.ts` if fully unused).

**Definition of done:** pre-order a flagged product on mobile → row in `orders` with
`order_type='preorder'` → appears under Admin Orders' Pre-orders filter → admin can set an ETA and
convert it. Typechecks clean.

**Resume notes:** DONE 2026-08-30 — migration `20260830160000` pushed; full flow live-verified
(mobile pre-order placement → order detail → Orders pill; admin Pre-orders tab → ETA save
persists → Convert to standard drops it from the tab). See Session Log.

**What was built:**
- Migration `20260830160000`: drop+re-add `orders_order_type_check` to allow `'preorder'`;
  `orders.expected_availability_date date` (nullable).
- `src/types/database.ts`: `OrderType` gains `'preorder'`; `orders` Row/Insert gain
  `expected_availability_date`.
- `src/types/index.ts`: `Product` gains `isPreorder`; **deleted** the dead `Preorder` interface.
  `src/store/useAppStore.ts`: **removed** the stale `preorder` slice + import.
- `src/services/catalog.ts`: `dbProductToUi` maps `isPreorder: row.is_preorder`.
- `src/app/product/[id].tsx`: when `product.isPreorder` — a "Available for pre-order" pill under
  the price and the bottom CTA becomes **"Pre-order"** → `router.push('/preorder/<slug>?qty=<n>')`
  (the "Add to Cart" branch is otherwise unchanged).
- **New `src/app/preorder/[slug].tsx`** (route registered): product + qty stepper, "you won't be
  charged now" banner, address picker (same pattern as checkout — `addresses` fetch, radio
  select, "Add New Address" link), notes field. "Place Pre-order" inserts one `orders` row
  (`order_type='preorder'`, `status='pending'`, `delivery_fee: 0`, `total = price*qty`, no
  razorpay) + one `order_items` row, then `router.replace('/order/<id>')`. The existing
  `orders_notify_status_change` trigger fires on insert → "Order placed" push + inbox row (T3).
- `src/app/(tabs)/orders.tsx`: `OrderCard` shows a **PRE-ORDER** pill next to the order number
  for `order_type==='preorder'`, and the footer shows `Expected <date>` when
  `expected_availability_date` is set.
- `src/app/order/[id].tsx`: header card adds **Type: Pre-order** + **Expected availability**
  rows; the "Complete Payment"/"Retry Payment" button is now suppressed for pre-orders
  (`&& order.order_type !== 'preorder'`).
- **Admin** `admin/app/dashboard/(protected)/orders/actions.ts`: `updatePreorderEta(id, eta)` +
  `convertPreorderToStandard(id)`. `admin/components/OrdersClient.tsx`: new **"Pre-orders"**
  filter tab (by `order_type`), a "Pre-order" badge in the drawer, a date input + Save for the
  ETA, and a "Convert to standard order" button.

**Notes / deviations:**
- Pre-orders carry `delivery_fee: 0` / `total = subtotal` — no delivery is scheduled at
  pre-order time. Add the fee when converting/at final checkout if that matters.
- `fetchProducts` still filters `is_available=true`; a pre-order product must be `is_available`
  to show in the catalogue. If admins mark out-of-stock items `is_available=false` they'd vanish
  — revisit with an `.or('is_available.eq.true,is_preorder.eq.true')` if that becomes an issue.
- No cart involvement — pre-order is a direct single-product flow (cleaner than branching the
  3-step cart checkout).

---

### T5 — Capture DOB + surface birthday reward  `P2`

**Goal:** Collect `date_of_birth` so the existing birthday-offer automation has data; show the user
their birthday reward when it's live.

**PDF ref:** §1 "DOB", "Receive birthday rewards"; the automation already exists
(`send_birthday_offers()` in `20260820140000_notifications.sql`) but **no screen captures DOB**.

**Steps:**
1. `profiles.date_of_birth` column already exists (used by the cron). Confirm; add if missing.
2. **Register** (`src/app/auth/register.tsx`): add a DOB date field. Use a simple date input
   (there's no date-picker lib installed — either add `@react-native-community/datetimepicker` via
   `npx expo install`, or three numeric fields / a masked `DD/MM/YYYY` `TextField`). Persist via
   `useAuthStore.signUp` → pass into `supabase.auth.signUp`'s `options.data`, then into the
   `profiles` row (check how the profile row is created — trigger on `auth.users` insert, see
   `20260818190000_init_schema.sql`; may need the trigger to copy `raw_user_meta_data->>'date_of_birth'`).
3. **Profile edit** (`src/app/profile/edit.tsx`): add the same DOB field, `update profiles set date_of_birth`.
4. **Surface:** on the customer's birthday, `send_birthday_offers()` already sends a push + (after T3)
   inserts a notification. Add a dismissible banner on Home when `profile.date_of_birth`'s MM-DD is
   today and an active birthday discount exists.
5. **Admin**: the Customers screen (T7) should display `date_of_birth` / upcoming birthdays.

**Definition of done:** register a new account with a DOB → `profiles.date_of_birth` is set →
editing it in the profile screen persists. Typecheck clean. (Can't fully test the cron without
waiting for a birthday — instead call `select public.send_birthday_offers();` manually after
setting a test profile's DOB to today.)

**Resume notes:** DONE 2026-08-30 — migration `20260830120000` pushed; DB-verified
(`handle_new_user()` carries `date_of_birth`, column exists). The register→profile
round-trip on a real device is still un-run but the DB side is proven. See Session Log.

---

### T6 — Partner payouts  `P2`

**Goal:** Track partner earnings → payouts. Today the Partner Dashboard shows sales/earnings but
there is no payout record or request flow.

**PDF ref:** §2 "View payouts"; §4 Admin Partners "Payouts", Reports "Payouts".

**Steps:**
1. **Migration `..._payouts.sql`:**
   ```sql
   create table public.payouts (
     id uuid primary key default gen_random_uuid(),
     partner_id uuid not null references public.partners(id) on delete cascade,
     amount numeric not null check (amount > 0),
     status text not null default 'pending',   -- 'pending' | 'processing' | 'paid' | 'rejected'
     period_start date, period_end date,
     note text,
     requested_at timestamptz not null default now(),
     paid_at timestamptz
   );
   -- RLS: partner can select own + insert (request); admin can do everything.
   ```
   Add a view or RPC `partner_earnings_summary(partner_id)` computing gross sales, platform fee
   (use `partners.platform_fee_percent`, women-partner rule already applies 0%), net earned,
   already-paid-out, and available-to-withdraw.
2. **Mobile Partner Dashboard** (`src/app/partner/dashboard.tsx`): add an "Earnings" card
   (gross / fee / net / paid / available) and a "Request payout" button → inserts a `payouts` row
   (`status='pending'`) for the available amount. A payout history list below.
3. **Admin Partners** (`admin/app/dashboard/(protected)/partners/`): a Payouts tab/section —
   list pending payout requests, approve (→ `processing` → `paid` with `paid_at`), reject.
4. **Admin Reports**: include payouts in the reports module.

**Definition of done:** with a test partner that has ≥1 completed business order, the dashboard shows
a correct earnings breakdown, "Request payout" creates a row, and Admin can move it to `paid`.
Both apps typecheck.

**Resume notes (2026-08-30 — DB layer done, UI not started):**

DONE + committed (commit right after `4db6d0e`):
- **Migration `supabase/migrations/20260830170000_payouts.sql`** — **NOT PUSHED yet.**
  - `public.payouts` (id, partner_id fk→partners cascade, amount `check > 0`, status
    `check in ('pending','processing','paid','rejected')` default 'pending', period_start/end,
    note, requested_at, paid_at). Indexes on `(partner_id, requested_at desc)` and `status`.
  - RLS: `payouts_select_own_or_admin`, `payouts_insert_own` (ownership only), `payouts_update_admin`.
  - `partner_earnings_summary(p_partner_id uuid) returns json` — SECURITY DEFINER, ownership/admin
    guarded. gross = non-cancelled `order_type='business'` orders by the partner's profile; fee =
    gross × `platform_fee_percent`/100; net = gross − fee; `paid_out` = Σ paid payouts; `pending` =
    Σ pending+processing payouts; `available = max(net − paid_out − pending, 0)`. Returns
    `{gross, fee_percent, fee, net, paid_out, pending, available}` (or `{error}`).
  - `request_payout(p_partner_id uuid) returns json` — SECURITY DEFINER; recomputes `available`,
    refuses if `< 1`, else inserts a `payouts` row (`status='pending'`, `amount=available`).
    Returns `{ok, payout_id, amount}` or `{error}`.
  - grants: both fns `to authenticated`.
- **`src/types/database.ts`** — `PayoutStatus` type; `payouts` table Row/Insert/Update/Relationships;
  `Functions.partner_earnings_summary` + `Functions.request_payout`. Mobile `tsc` clean.

**DECISION taken (was implicit):** modelled as **option (a) style** — no separate earnings ledger;
`partner_earnings_summary` derives everything live from `orders` + `payouts`. "Earned" = all
non-cancelled business orders (matches what `partner/dashboard.tsx` already shows as "Total Sales");
did NOT gate on `payment_status='paid'` because partner business orders don't currently go through
Razorpay. Revisit if business orders start taking payment.

**UI now built (2026-08-30, session resuming T6) — steps 2–5 done, typecheck-clean:**
- **Mobile `src/app/partner/dashboard.tsx`** — `load()` now also `supabase.rpc('partner_earnings_summary', { p_partner_id: partner.id })` + `supabase.from('payouts').select('*').eq('partner_id', partner.id).order('requested_at', desc)`, run in a `Promise.all` with the existing orders fetch. New **Earnings card** (Gross / Platform fee (X%) / Net earned / Paid out / Pending requests / **Available to withdraw**) + **"Request Payout"** button (disabled when `available < 1` or in-flight) → `supabase.rpc('request_payout', …)` → on success `load()`, on `data.error`/`error` shows `<ErrorNotice>`. New **Payout History** list below it (amount, status dot+label, requested/paid dates). Status colours: pending=warning, processing=info, paid=success, rejected=error. Kept the existing 3 stat cards (Total Sales / Net Earnings / Orders) untouched above.
- **Admin `partners/actions.ts`** — `updatePayoutStatus(payoutId, 'processing'|'paid'|'rejected')` → `update payouts set status, paid_at = (status==='paid' ? now() : null)` + `revalidatePath('/dashboard/partners')`.
- **Admin `partners/page.tsx`** — now `Promise.all`s a `payouts` fetch alongside partners, joins `business_name` in JS → `payoutRows`, passes `payouts={payoutRows}` to `PartnersClient`.
- **Admin `PartnersClient.tsx`** — new **"Payouts"** tab (count badge = `payouts.length`). When active, renders a payouts table (Business · Amount · Status · Requested · Paid · Actions) instead of the applications table; the applications table + drawer are gated `tab !== "payouts"`. Row actions by status: pending → [Approve→processing] [Reject]; processing → [Mark paid→paid] [Reject]; paid/rejected → none. Uses the existing `startTransition`.
- **Admin `reports/page.tsx` + `ReportsClient.tsx`** — `payouts` added to the `Promise.all`; aggregated by `partner_id` into paid / pending+processing maps; `PartnerRow` gains `paidOut` + `pendingPayout`; the "Partner Payouts" table + CSV export gain **Paid Out** and **Pending** columns.

Mobile `npx tsc --noEmit` clean; `cd admin && npx tsc --noEmit` clean.

TODO — pick up here:
1. **Push the migration** (tell the user):
   `npx --yes supabase db push --db-url '<session pooler url>'` → applies `20260830170000_payouts.sql`.
2. **Mobile `src/app/partner/dashboard.tsx`** — currently computes `totalSales`/`netEarnings`
   inline from `orders`. Add: on `load()`, also `supabase.rpc('partner_earnings_summary', { p_partner_id: partner.id })`
   and `supabase.from('payouts').select('*').eq('partner_id', partner.id).order('requested_at', {ascending:false})`.
   Replace/augment the stats row with an **Earnings card**: Gross / Fee (X%) / Net / Paid out /
   Available. Add a **"Request payout"** button (disabled when `available < 1`) →
   `supabase.rpc('request_payout', { p_partner_id: partner.id })` → on `data.ok` reload; show
   `data.error` via `ErrorNotice`. Add a **payout history list** below (amount, status badge,
   `requested_at`, `paid_at` when set). Status badge colours: pending=warning, processing=info,
   paid=success, rejected=error.
3. **Admin** `admin/app/dashboard/(protected)/partners/`:
   - `actions.ts`: add `updatePayoutStatus(payoutId: string, status: PayoutStatus)` — `update payouts
     set status, paid_at = (status==='paid' ? now() : null)`; `revalidatePath('/dashboard/partners')`.
   - `page.tsx`: also fetch `payouts` joined to partner business_name (or fetch payouts + partners
     separately and join in JS). Pass `payouts` to `PartnersClient`.
   - `PartnersClient.tsx`: add a `"payouts"` tab key. When active, render a payouts table instead of
     the applications table — columns: Business, Amount, Status, Requested, actions. Row actions by
     status: pending → [Approve→processing] [Reject]; processing → [Mark paid→paid] [Reject];
     paid/rejected → none. Reuse `startTransition`.
4. **Admin Reports** `admin/app/dashboard/(protected)/reports/` — the "Partner Payouts" tab already
   shows *theoretical* net (gross×fee). Add real columns from the `payouts` table: `Paid Out`,
   `Pending`. Fetch `payouts` in `reports/page.tsx`, aggregate by `partner_id`, extend `PartnerRow`
   in `ReportsClient.tsx` + its CSV header/rows.
5. `npx tsc --noEmit` (root) + `cd admin && npx tsc --noEmit` both clean.
6. Live-verify: needs a test partner (approved) with ≥1 business order. `partner_earnings_summary`
   returns a correct breakdown → "Request payout" creates a `pending` row → admin approves →
   processing → paid (sets `paid_at`) → mobile shows it moved to Paid and `available` dropped.
   Clean up test rows after.

---

### T7 — Admin: Customers screen  `P2`

**Goal:** Build the "Coming Soon" Customers section.

**PDF ref:** §4 Admin "Customers" (list, profiles, orders, subscriptions, purchase history, birthday info).

**Steps:**
1. `admin/components/Sidebar.tsx` — move `Customers` out of the `comingSoon` array into the live nav
   (it's line ~34). Point it at `/dashboard/customers`.
2. `admin/app/dashboard/(protected)/customers/page.tsx` (new, server component) — server-fetch
   `profiles` where `role='customer'` with counts: total orders, total spent, active subscription,
   `date_of_birth`. Follow the exact server-fetch + client-component pattern of
   `admin/app/dashboard/(protected)/orders/page.tsx` + `OrdersClient.tsx`.
3. `admin/components/CustomersClient.tsx` (new) — searchable/sortable table; row → drawer with the
   customer's profile, address(es), order history, subscription history, birthday.
4. Respect admin RLS — admin reads via `is_admin()` policies (already exist on `profiles`, `orders`,
   `subscriptions`, `addresses`).

**Definition of done:** `cd admin && npx tsc --noEmit` clean; the page renders the real customer list
and a working detail drawer against live data (verify in the admin preview — see `BUILD_PLAN.md` for
the admin login/verify recipe).

**Resume notes:** CODE COMPLETE 2026-08-30 (no migration — admin-only). Remaining: confirm
`cd admin && npx tsc --noEmit` clean, then live-check in the admin preview (list renders,
drawer opens with orders/addresses/subs/birthday). Flip Status Board row to DONE after.

**What was built:**
- `admin/components/Sidebar.tsx`: "Customers" moved from `comingSoon` into the live nav
  (`/dashboard/customers`, `Users` icon); the now-empty "Coming Soon" section is hidden.
- `admin/app/dashboard/(protected)/customers/page.tsx` (new server component): parallel-fetches
  `profiles` (role='customer'), all `orders`, `subscriptions` (+plan embed), `addresses`; joins
  in JS into a `Customer[]` with `orderCount`, `totalSpent`, `hasActiveSubscription`, and nested
  `orders` / `subscriptions` / `addresses`. Same server-fetch → client-component shape as
  `orders/page.tsx`. Reads via the cookie-scoped admin client (RLS `is_admin()` covers all four
  tables).
- `admin/components/CustomersClient.tsx` (new): 3 summary tiles (total / active subscribers /
  birthdays this month), search (name/email/phone), sort (recent / top spenders / most orders /
  name), table (Customer · Orders · Total Spent · Subscription · Birthday · Joined — birthday
  cell shows "· in Nd" when ≤30 days away). Row → slide-over drawer (same pattern as
  `OrdersClient`) with profile grid, addresses, full order history (with PRE-ORDER tag), and
  subscription history.
- **This also closes the T5 admin gap** — DOB / upcoming birthdays are now visible to admins.

**Note:** no server actions — this screen is read-only (matches the task). Editing a customer
(e.g. correcting a DOB) still happens only on the mobile side.

---

### T8 — Admin: wire Overview + Delivery Queue off real data  `P2`

**Goal:** Two remaining dummy admin screens read live data.

**Context:** Overview dashboard (`admin/app/dashboard/(protected)/page.tsx`) and Delivery Queue
(`admin/app/dashboard/(protected)/delivery/page.tsx`) render hardcoded arrays (dated "23 Dec 2024").
The Delivery Queue's "Mark Delivered" toggle is client-state only and resets on refresh.

**Steps:**
1. **Overview**: replace the mock KPIs with server-fetched aggregates — today's/this-week's orders &
   revenue, new customers, active subscriptions, pending partner applications, pending payouts (T6),
   low-stock products. Recent-activity feed from the latest `orders` rows. Same server-component
   pattern as the other admin pages.
2. **Delivery Queue**: fetch `orders` where `status in ('confirmed','processing','shipped')` joined
   with `addresses` + `profiles`, grouped/sorted by `delivery_date` + `delivery_time`. Wire
   "Mark Delivered" to a real server action that sets `orders.status='delivered'` (mirror
   `admin/app/dashboard/(protected)/orders/actions.ts`). That status change already fires the
   customer push + (after T3) the notification insert.

**Definition of done:** both pages show real numbers; "Mark Delivered" persists (confirm with a
direct query that `orders.status` flipped). Admin typechecks clean.

**Resume notes:** DONE — found **already complete** on 2026-08-30 (the gap-analysis note above
was stale). `admin/app/dashboard/(protected)/page.tsx` server-fetches today's orders, monthly
revenue, active subscriptions, pending deliveries, a real 7-day revenue chart
(`RevenueChartWrapper` takes a `data` prop), top sellers from `order_items`, and a recent-orders
table — no hardcoded arrays. `admin/app/dashboard/(protected)/delivery/page.tsx` fetches
`orders` for today's `delivery_date` grouped by `delivery_time`; `delivery/actions.ts`
`markOrderDelivered()` does a real `update … status='delivered'` + `revalidatePath`, and
`DeliveryQueueClient` calls it via `startTransition` (optimistic local update, then persists).
No code change needed.

---

### T9 — Admin: Reports export as PDF + Excel  `P3`

**Goal:** The Reports module exports PDF and Excel, not just CSV.

**PDF ref:** §4 "Reports can be downloaded as: PDF / Excel / CSV".

**Steps:**
1. Find the existing CSV export in `admin/app/dashboard/(protected)/reports/` (page + client).
2. **Excel**: add `xlsx` (SheetJS) to `admin/`; build a `.xlsx` from the same report dataset
   (`XLSX.utils.json_to_sheet` → `XLSX.writeFile` / Blob download). One sheet per report section.
3. **PDF**: add `jspdf` + `jspdf-autotable` to `admin/`; render each report as a titled table.
   (Or, if the report views are already nice HTML, a server route using `@react-pdf/renderer` or a
   print stylesheet — pick whichever is least code given the current Reports layout.)
4. A single "Export ▾" menu with CSV / Excel / PDF options per report.

**Definition of done:** each report downloads a valid `.xlsx` and `.pdf` with the same data as its
CSV. Admin typechecks clean.

**Resume notes (2026-08-30 — coded, not yet download-tested live):**

- **Deps added to `admin/`:** `jspdf` + `jspdf-autotable` (PDF), `write-excel-file` (Excel).
  **Did NOT use SheetJS `xlsx`** — the npm-registry build (`0.18.5`) carries 8 unfixable
  high-sev advisories (prototype-pollution / ReDoS, both in the *parser* we wouldn't use).
  `write-excel-file` is write-only, clean audit, purpose-built for JSON→xlsx. Deviation from
  the step list's "add `xlsx`", noted here.
- **`admin/components/ReportsClient.tsx` rewritten around a `tables` descriptor:** a
  `useMemo<Record<Section, ReportTable>>` where `ReportTable = { slug, title, headers, rows }`.
  The old per-section `ExportButton` + `toCsv`/`downloadCsv` are gone; one `<ExportMenu table={tables[section]} />`
  renders an "Export ▾" dropdown (click-outside to close) with **CSV / Excel / PDF** items.
  - `exportCsv` — same escaping as before, `downloadBlob`.
  - `exportExcel` — `await import("write-excel-file/browser")`, bold header row, numeric cells
    typed `Number`, `.toFile("<slug>.xlsx")`, sheet name = report title (≤31 chars).
  - `exportPdf` — `await import("jspdf")` + `jspdf-autotable`; title + timestamp heading,
    `autoTable` with dark-green header fill.
  All three lazily dynamic-import so the libs stay out of the main bundle.
- CSV output is byte-identical to before (Partner Payouts still has the T6 Paid Out / Pending
  columns). Admin `npx tsc --noEmit` clean.
- **Live-verified 2026-08-31** (admin preview, logged in as shyamalfred@gmail.com): Reports → the
  **Export ▾** dropdown renders CSV / Excel / PDF. Clicking **Excel** loads the
  `write-excel-file/browser` chunk (200) and runs with no console error / no alert; clicking **PDF**
  loads `jspdf` + `jspdf-autotable` chunks (200) and runs clean. Partner Payouts tab now shows the
  **Paid Out** (₹2700) / **Pending** (₹0) columns off the real `payouts` table. The one thing the
  automated browser can't confirm is the file landing on disk — downloads are suppressed in the
  pane; a human click in a real browser is the only remaining check, and the generation code path
  ran without error. **T9 DONE.**

---

### T10 — Partner KYC document upload  `P3`

**Goal:** Partner application collects identity/business documents; Admin reviews them.

**PDF ref:** §2 partner registration + Admin "Partner applications / KYC/details".

**Steps:**
1. Supabase **Storage**: create a private bucket `partner-kyc` (via migration or dashboard — tell the
   user if it's a dashboard action). RLS/storage policy: a partner can upload to a path prefixed with
   their `auth.uid()`; admins can read all.
2. `partners` table: add `kyc_documents jsonb default '[]'` (array of `{ name, path, uploaded_at }`)
   and `kyc_status text default 'pending'`. Update types.
3. **Mobile apply** (`src/app/partner/apply.tsx`): add a document picker (`expo-document-picker` /
   `expo-image-picker` — `npx expo install`), upload to Storage, store the paths on the `partners`
   row. Show upload progress + list.
4. **Admin Partners drawer**: list the uploaded docs with signed-URL preview/download links; add
   approve/reject of KYC separate from partner approval if useful.

**Definition of done:** a partner applicant can attach a file, it lands in the `partner-kyc` bucket
under their uid, and Admin can open it. Both apps typecheck.

**Resume notes (2026-08-31 — coded, migration NOT pushed):**

- **Migration `supabase/migrations/20260831000000_partner_kyc.sql`** — NOT PUSHED. Creates:
  - private Storage bucket `partner-kyc` (`insert into storage.buckets ... on conflict do nothing`).
  - `partners.kyc_documents jsonb not null default '[]'` (array of `{name, path, uploaded_at}`)
    and `partners.kyc_status text not null default 'pending' check in (pending|verified|rejected)`.
  - 4 RLS policies on `storage.objects` (`partner_kyc_{insert,select,update,delete}_own`): an
    authenticated user may touch objects only under a folder named after their `auth.uid()`
    (path = `<uid>/<file>`); admins additionally get `select` on all `partner-kyc` objects.
- **Dep:** `npx expo install expo-document-picker` (was none installed). No config plugin needed.
- **`src/types/database.ts`** — `KycStatus` type, `KycDocument` interface; `partners` Row gains
  `kyc_documents: KycDocument[]` + `kyc_status: KycStatus`, Insert gains both as optional.
- **Mobile `src/app/partner/apply.tsx`** — new "KYC Documents (optional)" section: dashed
  "Add Document" button → `DocumentPicker.getDocumentAsync({ type: ['image/*','application/pdf'] })`
  → `fetch(uri).arrayBuffer()` → `supabase.storage.from('partner-kyc').upload('<uid>/<ts>_<name>', body, {contentType})`
  → appends `{name, path, uploaded_at}` to local `docs`. Each uploaded row shows name + a
  remove (×) that also `storage.remove([path])`. `docs` is written to the `partners` insert as
  `kyc_documents`. Upload spinner + `error` surfacing. Guarded on `session`.
- **Admin `partners/actions.ts`** — `updateKycStatus(partnerId, 'pending'|'verified'|'rejected')`.
- **Admin `PartnersClient.tsx`** drawer — new "KYC Documents" block: `kyc_status` badge, list of
  `kyc_documents` each with an **Open** button (`createSupabaseBrowserClient().storage.from('partner-kyc').createSignedUrl(path, 120)`
  → `window.open`), and **Verify KYC** / **Reject KYC** buttons wired to `updateKycStatus` (with a
  local optimistic `setSelected`). Uses the admin's cookie session → `is_admin()` satisfies the
  storage select policy.
- Mobile `npx tsc --noEmit` clean; admin `npx tsc --noEmit` clean. Admin eslint on changed files: pending.

**DONE — live-verified 2026-08-31:**
1. Migration pushed (no ownership error on the `storage.objects` policies).
2. Mobile `partner/apply`: the "KYC Documents (optional)" section + hint + dashed **Add Document**
   button render. The button opens a file input with exactly `accept="image/*,application/pdf"`,
   `multiple=false`. Picking a file uploaded it and the filename appeared in the list with a
   remove (×). Submitting the application landed on the Partner Dashboard ("Application under
   review") → a `partners` row now exists with `kyc_documents = [the file]`.
3. Storage (checked from the admin's own logged-in session): `list partner-kyc` returns the
   applicant's `<uid>` folder (proves the admin `select` policy via `is_admin()`), the object is
   at `<uid>/<ts>_kyc-live-test.pdf`, `createSignedUrl` → fetching it returns the **exact bytes**
   the mobile upload wrote.
4. Admin drawer: KYC Documents block shows the doc + **Open** button + **Verify KYC / Reject KYC**.
   Clicking **Verify KYC** flipped the badge `KYC pending` → `KYC verified` and disabled the
   button (`updateKycStatus` server action persisted).
5. **Caveat:** ~2–4 s after the upload, `expo-document-picker`'s **web** teardown threw
   `Failed to execute 'removeChild'` (`apply.tsx:209`). The upload had already succeeded and the
   app recovered on dismiss. Almost certainly the web picker's DOM cleanup choking on a
   *synthetic* file inject (no real OS dialog available) — native iOS/Android don't use that code
   path. A real file-pick on web would confirm. **T10 DONE.**

---

### T11 — (Optional) Testimonials / Why-Choose / Blog → DB + admin CMS  `P4`

**Goal:** Make the remaining mock content (`testimonials`, `whyChooseUs`, `lifestyleArticles`)
editable by Admin instead of hard-coded.

**Only do this if the user asks.** It's not in the PDF. Sketch:
1. Tables `articles`, `testimonials`, `site_content` (key/value for "Why Choose" items). RLS: public
   read, admin write.
2. Migrate `src/app/articles.tsx` + `src/app/article/[id].tsx` + Home's Healthy Living + testimonials
   sections to react-query fetches. Keep the `ArticleBlock[]` content shape.
3. Admin pages under `admin/app/dashboard/(protected)/content/` — CRUD for articles + testimonials.
4. Seed the current mock values so nothing visually regresses.

**Resume notes:** _(none yet)_

---

## 🧾 SESSION LOG (append-only — newest at top)

### 2026-08-31 — Final live-verification pass: T6 + T9 + T10 all DONE

Ran both dev servers (admin :4001, mobile web :8090). User supplied the mobile login
(`razoralf67@gmail.com`) and, after the email-link reset failed (redirected to a dead
`localhost:3000`), ran `reset_admin.mjs` — which reset `shyamalfred@gmail.com` →
`MgcAdmin#2026`, set that profile `role='admin'`, approved the "MGC Verify Cafe" partner
application submitted from the app, and added ₹1500 business orders (ran twice → ₹3000 gross).

**T6 — verified end to end in both apps:**
- Mobile partner dashboard: Earnings card renders gross ₹3000 / fee 10% −₹300 / net ₹2700 /
  paid out ₹0 / pending ₹0 / **available ₹2700**. Clicked **Request Payout** → pending ₹2700,
  available ₹0, Payout History row "₹2700 · Pending".
- Admin Partners → **Payouts tab**: row "MGC Verify Cafe · ₹2700 · Pending". Clicked
  **Approve** → Processing, **Mark paid** → Paid + Paid-date set.
- Back on mobile (reload): paid out ₹2700 / pending ₹0 / available ₹0, Payout History
  "₹2700 · Paid · Requested … · Paid …".
- Admin Reports → Partner Payouts tab shows the new **Paid Out ₹2700 / Pending ₹0** columns.

**T10 — verified end to end:**
- Mobile `partner/apply`: "KYC Documents" section + **Add Document** → file input
  `accept="image/*,application/pdf"`. Uploaded a test PDF → filename listed with a remove (×).
  Submitted → Partner Dashboard "Application under review" → `partners` row with `kyc_documents`.
- From the admin's logged-in session: `list partner-kyc` returns the applicant's `<uid>` folder
  (admin `select` policy via `is_admin()` works), object at `<uid>/<ts>_kyc-live-test.pdf`,
  `createSignedUrl` → fetch returns the **exact bytes** the mobile upload wrote.
- Admin drawer: KYC block lists the doc with **Open** + **Verify KYC / Reject KYC**. Clicked
  **Verify KYC** → badge `KYC pending` → `KYC verified`, button disabled (server action persisted).
- Caveat: `expo-document-picker` **web** teardown threw a `removeChild` redbox after the
  synthetic file inject; upload succeeded, app recovered. Native has no such path — a real
  web file-pick would confirm it's injection-only.

**T9 — verified live:**
- Reports → **Export ▾** menu renders CSV / Excel / PDF. **Excel** → `write-excel-file/browser`
  chunk loads (200), handler runs, no console error / alert. **PDF** → `jspdf` + `jspdf-autotable`
  chunks load (200), same. The actual file-on-disk is unconfirmable (browser-pane downloads
  suppressed) — a human click is the only remaining check; the generation path ran clean.

**Test data left in the DB** — cleanup script written at `cleanup_verify.mjs` (git-ignored):
deletes the "MGC Verify Cafe" partner + its payout + the BIZVERIFY orders + the `partner-kyc`
object, and reverts `razoralf67@gmail.com` to `role='customer'`. `shyamalfred@gmail.com` stays
admin (`MgcAdmin#2026`) — that's the real admin account; creds now in `CREDENTIALS.md`.

### 2026-08-31 — T10 migration pushed

User ran `supabase db push` → `Finished supabase db push.` applying
`20260831000000_partner_kyc.sql`. **No ownership error** on the four
`create policy ... on storage.objects` statements — they applied via the pooler
fine, so the dashboard-SQL-Editor fallback wasn't needed. `partner-kyc` bucket +
`partners.kyc_documents`/`kyc_status` are live. Wrote `verify_t10.mjs` (git-ignored,
service-role) for the user to run — same "sandbox blocks DB-writing scripts"
situation as T6. Committed `b2cdc1e` (code) + `c0d2ae4` (push note).

### 2026-08-31 — T10 coded (partner KYC upload), migration unpushed

Built the whole T10 surface (full detail in T10 "Resume notes"):
- Migration `20260831000000_partner_kyc.sql` (NOT pushed): private `partner-kyc`
  bucket + `partners.kyc_documents`/`kyc_status` + 4 uid-scoped `storage.objects`
  RLS policies (admin gets select-all).
- `expo-document-picker` installed (no plugin needed).
- Mobile `partner/apply.tsx`: "Add Document" → pick image/PDF → upload to
  `partner-kyc/<uid>/<ts>_<name>` → row added to the `partners` insert as
  `kyc_documents`; per-doc remove also deletes the object.
- Admin `PartnersClient.tsx` drawer: KYC status badge, document list with **Open**
  (signed URL via the browser client), **Verify / Reject KYC** → new
  `updateKycStatus` server action.
- Mobile + admin `tsc` clean; admin eslint on changed files clean.

Next: user pushes `20260831000000_partner_kyc.sql`, then live-verify the
upload→review→verify round trip. (Watch for a possible ownership error on
`create policy ... on storage.objects` via the pooler — fallback noted in T10.)

### 2026-08-30 — T6 verified 22/22 → DONE

User ran `node verify_t6.mjs` → **ALL GREEN, 22/22**. Confirmed live against the
remote DB: `payouts` selectable; `partner_earnings_summary` returns
`gross 1000 / fee% 10 / fee 100 / net 900 / paid_out 0 / pending 0 / available 900`
for one ₹1000 business order at 10% fee; `request_payout` → `{ok, amount:900}` +
a `pending` payouts row; summary then shows `pending 900 / available 0`; a second
`request_payout` is refused (`"Nothing available to withdraw right now."`); after
`status='paid'` the summary shows `paid_out 900 / pending 0 / available 0`;
disposable partner/order/user all cleaned up, no leftover rows. Mobile + admin
`tsc` and admin `eslint` were already clean. **T6 DONE.** Only unpolished edge:
the mobile Earnings card + admin Payouts-tab *rendering* haven't been eyeballed in
a running app (they call the now-proven RPCs) — fold into the next apps pass.

`verify_t6.mjs` stays at repo root (git-ignored; holds the service-role key) for
re-runs — safe to delete.

### 2026-08-30 — T6 migration pushed; T9 built; CREDENTIALS.md added

- **`20260830170000_payouts.sql` PUSHED** — user supplied the DB password; ran
  `npx --yes supabase db push --db-url '<session pooler>'` →
  `{"message":"Finished supabase db push."}`, no errors. So `public.payouts` + its 3
  RLS policies + `partner_earnings_summary()` + `request_payout()` are now live (the
  DDL all validated on apply).
- **Functional T6 verification NOT yet run** — wrote
  `scratchpad/verify_t6.mjs` (service-role supabase-js: spins up a disposable
  approved partner + one ₹1000 business order, asserts the earnings math
  gross 1000 / fee 100 / net 900 / available 900, `request_payout` → pending row,
  second call refused, admin mark-paid → paid_out 900 / available 0, then deletes
  everything). This session's Bash sandbox **blocked** both `npm i pg` and running the
  mjs script (network + service-role key). Left for the user to run, or fold into the
  next running-apps click-through.
- **T9 done in code** (see T9 Resume notes) — Export ▾ menu (CSV/Excel/PDF) in
  `ReportsClient.tsx`; deps `jspdf` + `jspdf-autotable` + `write-excel-file` added to
  `admin/`. tsc + eslint clean. Commits `a233967` (T6 UI) and `68dd729` (T9).
- **`CREDENTIALS.md` created at repo root** (git-ignored via a new `.gitignore` entry)
  — Supabase account login, DB password, session-pooler string + the `db push` command.
  Was previously "never stored"; user chose to store it locally this session.

### 2026-08-30 — T6 UI built (mobile + admin + reports), migration still unpushed

Resumed T6 from "DB layer done". Built all the remaining UI (full detail in the T6
"UI now built" block above):
- Mobile Partner Dashboard: Earnings card + Request Payout button (calls
  `request_payout` RPC) + Payout History list; earnings from `partner_earnings_summary`.
- Admin Partners: new "Payouts" tab with per-status row actions
  (Approve→processing / Mark paid→paid / Reject), backed by a new `updatePayoutStatus`
  server action.
- Admin Reports: "Partner Payouts" tab + CSV gain real **Paid Out** / **Pending**
  columns from the `payouts` table.

Both apps `tsc --noEmit` clean. **Migration `20260830170000_payouts.sql` still NOT
pushed** — nothing touching `payouts` will work at runtime until the user runs
`npx --yes supabase db push --db-url '<session pooler url>'`. Live-verification
(needs an approved test partner with ≥1 business order) is the only remaining step
before T6 → DONE.

### 2026-08-30 — T6 started (DB layer only), then paused for a new chat

Wrote + committed the T6 database layer: migration `20260830170000_payouts.sql`
(`payouts` table + RLS + `partner_earnings_summary()` + `request_payout()` RPCs) and the
matching `src/types/database.ts` entries. Mobile `tsc` clean. **Migration NOT pushed.**
Mobile Partner Dashboard UI, admin Payouts section, and Reports wiring are **not started** —
full step list is in the T6 "Resume notes" above. Next chat picks up at "push the migration".

Also this session (all committed on branch `dark-theme`, no git remote configured):
T1/T5/T2/T3 (`fa0f864`), T4 (`19e05ec`, migration pushed + live-verified), T7 (`cef83cc`,
live-verified), T8 (found already done), plus verification/plan commits. Migrations
`20260830120000` / `140000` / `150000` / `160000` are all pushed & live.
**Not yet pushed: `20260830170000_payouts.sql`.**

Build note: user's installed APK predates Phase 3 (no push notifications) → OTA won't reach
it; they'll do a fresh `eas build --profile preview` after the remaining tasks + testing.

### 2026-08-30 — T4 + T7 live-verified end to end → both DONE

Migration `20260830160000_preorders.sql` pushed (`Finished supabase db push.`). Ran both
dev servers (mobile web 8091, admin 4001); user logged into each with a real account
(`razoralf67@gmail.com`, temporarily promoted to `role='admin'` for the admin pass, since
the real admin creds were unavailable — reverted after).

**T4 walkthrough (screenshotted):**
- Flagged `products.is_preorder=true` for `wheatgrass`. Product detail → bottom CTA showed
  **"Pre-order"** (not "Add to Cart").
- `/preorder/wheatgrass` rendered: qty stepper, "you won't be charged now" banner,
  pre-selected default address, notes. "Place Pre-order" → `/order/<id>` with order number
  **PRE75517189**, Status Pending, **Type: Pre-order**, **Expected availability: To be
  confirmed**, and **no** Complete-Payment button.
- Orders tab: the row shows the green **PRE-ORDER** pill.
- Admin Orders: new **"Pre-orders"** tab (count 1). Drawer showed the Pre-order badge +
  Expected-availability date input + "Convert to standard order". Set ETA 2026-09-15 → Save
  → **persisted across a full reload**. Clicked "Convert to standard order" → Pre-order
  badge + controls vanished, and the **Pre-orders tab count dropped to 0**.

**T7 walkthrough (screenshotted):**
- "Customers" now in the live sidebar nav. Page renders: 3 summary tiles (Total Customers /
  Active Subscribers / Birthdays This Month), search, "Recently joined" sort, table
  (Customer · Orders · Total Spent · Subscription · Birthday · Joined).
- Only 1 customer listed — correct: `razoralf67` was temporarily `role='admin'` so the
  `role='customer'` filter excluded it. Row → drawer opened with all sections rendering
  (profile grid incl. "Birthday: Not set", Addresses (0), Order History (0), Subscriptions
  (0)). Populated-drawer case not shown live but it's the same read-only pattern as
  `OrdersClient`.

Servers stopped. **Cleanup pending (user):** delete order `PRE75517189` + its items/
notification, `products.is_preorder=false` for wheatgrass, and revert
`razoralf67@gmail.com` to `role='customer'`.

### 2026-08-30 — T7 code complete (Admin Customers screen)

Admin-only, no migration. `admin/components/Sidebar.tsx`: "Customers" moved from
`comingSoon` into live nav; empty Coming-Soon section now hidden. New
`admin/app/dashboard/(protected)/customers/page.tsx` (server component) parallel-fetches
`profiles` (role='customer') + all `orders` + `subscriptions` (plan embed) + `addresses`,
joins in JS → `Customer[]` with orderCount / totalSpent / hasActiveSubscription / nested
history. New `admin/components/CustomersClient.tsx`: 3 stat tiles, search, sort, table with
a Birthday column ("· in Nd" when ≤30 days), row → slide-over drawer (profile grid,
addresses, order history w/ PRE-ORDER tag, subscription history). Read-only (no server
actions). **Closes the T5 admin gap** — admins can now see DOB / upcoming birthdays.

`cd admin && npx tsc --noEmit` clean (exit 0). Live check in the admin preview still
pending (needs admin login creds from the user) — pattern is copied verbatim from the
working `orders` / `subscriptions` pages so risk is low.

### 2026-08-30 — T4 code complete (pre-order flow)

Modelled as `orders.order_type='preorder'` (option a), no upfront payment — both defaults
per the task's "decision needed" note.

**Migration `20260830160000_preorders.sql`** — NOT PUSHED: widen `orders_order_type_check`
to include `'preorder'`; add `orders.expected_availability_date date`.

**Mobile:** `Product` UI type gains `isPreorder`; catalog mapper sets it. Product detail
swaps the bottom CTA to "Pre-order" (+ a pill under the price) → new
`src/app/preorder/[slug].tsx` (qty stepper, no-charge banner, address picker, notes) which
inserts an `orders` row (`order_type='preorder'`, `delivery_fee 0`) + one `order_items` row
and routes to `/order/<id>`. Orders list shows a PRE-ORDER pill + "Expected <date>";
order detail adds Type / Expected-availability rows and hides the payment CTA for
pre-orders. Dead `Preorder` type + `useAppStore.preorder` slice removed.

**Admin:** new "Pre-orders" filter tab in Orders; drawer gets a Pre-order badge, an
`expected_availability_date` date input + Save, and a "Convert to standard order" button.
New server actions `updatePreorderEta` / `convertPreorderToStandard`.

**Verification:** mobile `npx tsc --noEmit` clean (exit 0). Admin
`cd admin && npx tsc --noEmit` clean (exit 0). No live check yet — migration unpushed,
and no product is flagged `is_preorder` in the DB.

### 2026-08-30 — T2/T3 also verified in the running app (mobile web)

Started this session's own Expo web server on **port 8091** (added a
`"MiniGreens Mobile Web 8091"` entry to `.claude/launch.json` — 8090 was held by
another chat). User logged in with a real test account (`razoralf67@gmail.com`);
Claude drove the rest. All screenshotted:

**T2**
- Profile → **My Offers** renders the live `WELCOME15` discount (15% OFF pill,
  description, "Expires Sep 29, 2026", code box, "Tap to copy" — clipboard write fired).
- Checkout **Review** step shows the new "Coupon code" card. Applying `WELCOME15` →
  "WELCOME15 applied" + Remove, and the summary gained `Discount · WELCOME15  −₹25.50`
  (exactly 15% of ₹170), Total dropped ₹205.49 → **₹179.99** (170 − 25.50 + 35.49). ✓ math.
- Removing it, then applying `FAKECODE99` → inline red "That code doesn't exist." (the
  RPC's `reason`), total back to ₹205.49. ✓

**T3**
- Home bell → `/notifications`. Empty state ("You're all caught up"), mark-all button
  disabled at 0 unread.
- After inserting one test row: list shows it with unread tint + green dot; mark-all
  enabled. Tapping the row cleared the unread styling (read_at written, query refetched).
- Reset the row to unread + reloaded → Home bell shows the green dot. (Note: the bell
  badge only re-queries on Home **mount** — a notification arriving while Home is already
  foregrounded won't light it until next mount / app reopen. No realtime channel in v1;
  acceptable, but flag if "instant badge" is wanted → add a `supabase.channel` sub or
  invalidate on push-received.)

Disposable data (`WELCOME15` discount, the test notification) to be removed by the user
with the cleanup SQL Claude provided. No order rows were created (walkthrough stopped at
the Review step). Dev server stopped.

Screens still not exercised anywhere: birthday banner (needs a profile whose DOB month =
now + an active `is_birthday_offer` discount), and the register→profile DOB round-trip.

### 2026-08-30 — Migrations pushed + T5/T2/T3 verified live → all DONE

User ran `npx supabase db push --db-url '<session pooler>'` (had to use `npx --yes` so the
CLI install prompt didn't cancel it; the in-app "Run" button can't answer stdin prompts).
Applied: `20260821000000_inventory_decrement` (had been sitting unpushed too),
`20260830120000_dob_from_signup` (T5), `20260830140000_apply_discount` (T2),
`20260830150000_notifications_table` (T3). `Finished supabase db push.`

Verification (SQL Editor script — created disposable coupon + order, checked, cleaned up;
`pg_get_functiondef` needs `::regproc` not `::regprocedure` for no-arg fns). **13/13 PASS:**
- T5: `handle_new_user()` body references `date_of_birth`; `profiles.date_of_birth` exists.
- T2: `orders.discount_code` + `discount_amount` exist; `validate_discount('ZZVERIFY10',500)`
  → `valid`, `discount_amount = 50` (10% of 500); below `min_order_value` → invalid; bogus
  code → invalid.
- T3: `notifications` table + 2 RLS policies exist; `partners_notify_status_change` trigger
  exists; `notify_order_status_change()` and `send_birthday_offers()` bodies insert into
  `public.notifications`; **functional** — inserting an order then flipping its status to
  `confirmed` produced exactly 2 inbox rows.

Not exercised (needs the app running on a device / unblocked web server): the actual mobile
screens (`/offers`, `/notifications`, checkout coupon field, Home bell badge). Code + types
typecheck clean; the DB contracts they depend on are now proven.

**Housekeeping:** two commits landed on `dark-theme` earlier this session — `51cc24e`
(26 bundled images) and `fa0f864` (T1/T5/T2/T3 code + 3 migrations + this file). No git
remote configured, so nothing pushed. `assets/mini/` (43 MB unused dupes) added to
`.gitignore`. **Account + DB passwords were shared in chat this session — user to rotate
both** (Supabase → Account → Security; Settings → Database → Reset database password —
nothing running uses the DB password).

### 2026-08-30 — T3 code complete (in-app notification inbox)

Same session as T2 below. Built the whole T3 surface; migration unpushed.

**Migration `supabase/migrations/20260830150000_notifications_table.sql`** — NOT PUSHED:
- `public.notifications` (id, profile_id fk→profiles cascade, type, title, body, data jsonb
  `'{}'`, read_at, created_at) + `(profile_id, created_at desc)` and partial `read_at is null`
  indexes. RLS: select own-or-admin, update own; **no insert policy** (SECURITY DEFINER fns only).
- `create or replace notify_order_status_change()` — now always inserts a `notifications` row
  (type `order_status`), then pushes only if the profile has a `push_token`. Previously it
  bailed entirely with no token.
- `create or replace send_birthday_offers()` — inserts a `birthday` inbox row for every profile
  whose MM-DD matches today (was: only push-token holders), still pushes when a token exists.
- NEW `notify_partner_status_change()` + `after update of status on public.partners` trigger →
  `partner` inbox row + push on approved / rejected.

**`src/types/database.ts`** — `notifications` Row/Insert/Update/Relationships added.

**`src/app/notifications.tsx`** (new; route in `src/app/_layout.tsx`) — react-query list
(`staleTime: 0`, `refetchOnMount: 'always'`, limit 100, newest first). Unread rows are
primary-tinted with a dot; `checkmark-done` header button bulk-sets `read_at`. Row tap →
marks that row read → `routeFromNotificationData(n.data)`. `Loading` / `ErrorNotice` /
`EmptyState`. Plain `<Pressable>` list (Reanimated-web gotcha).

**`src/app/(tabs)/index.tsx`** — bell now `router.push('/notifications')`; the green
`bellDot` is gated on `unreadCount > 0` from a new `['notifications-unread', profile?.id]`
head/count query (`staleTime: 0`).

**`src/lib/notifications.ts`** — `routeFromNotificationData()` (`order_status` → `/order/<id>`,
else `/notifications`) + `addNotificationResponseListener()` (live tap + cold-start via
`getLastNotificationResponseAsync`), wired into the root `_layout.tsx` effect alongside
`useAuthStore.initialize()`.

**Deliberately skipped:** realtime `supabase.channel` subscription (focus/mount refetch is the
accepted v1); "coupon became available" notification (no discrete event — no targeted coupons
in T2).

**Verification:** mobile `npx tsc --noEmit` clean. Admin `cd admin && npx tsc --noEmit` re-run
after the shared-type change: clean (exit 0). No live check (migration unpushed; also the
port-8090 conflict from the T2 entry still applies).

### 2026-08-30 — T2 code complete (coupons & offers)

**Migration `supabase/migrations/20260830140000_apply_discount.sql`** — NOT PUSHED, user must run:
- `alter table orders add column discount_code text` + `discount_amount numeric(10,2) not null default 0`.
- `public.validate_discount(p_code text, p_subtotal numeric) returns json`, `security definer`,
  `set search_path = public`, `stable`. Case-insensitive code lookup; checks `is_active`,
  `starts_at`/`expires_at` window, `usage_limit` vs `used_count`, `min_order_value` vs subtotal,
  and for `is_birthday_offer` rows requires the caller's `profiles.date_of_birth` month == current
  month. Computes `discount_amount` (percentage → `round(subtotal*value/100,2)`; flat → `value`),
  caps at `max_discount_amount` then at subtotal. Returns
  `{valid, reason, code?, discount_type?, discount_value?, discount_amount?}`.
  `grant execute ... to authenticated, anon`.

**`src/types/database.ts`** — `orders` Row/Insert gained `discount_code` / `discount_amount`
(Insert optional); `Functions.validate_discount` added. Admin imports the same file via
`@mobile/database`, so the admin drawer change type-checks off this too.

**Checkout** (`src/app/checkout/index.tsx`) — Review step now has a "Coupon code" card above
Order Summary: `TextField` (auto-uppercase) + "Apply" (`variant="outline"`, `loading`), calls
`supabase.rpc('validate_discount', { p_code, p_subtotal: subtotal })`. On `valid` → applied
state (green pill + "Remove"); on failure → inline `couponError` caption with the RPC's `reason`.
`discountAmount` / `total` recompute; a `Discount · CODE  −₹N` row shows in the summary.
`handlePlaceOrder` writes `discount_code` + `discount_amount` on the `orders` insert.

**My Offers** (`src/app/offers.tsx`, new; route registered in `src/app/_layout.tsx`; linked from
Profile → Account menu as "My Offers" / `pricetag-outline`) — react-query fetch of
`discounts` where `is_active`, ordered `created_at desc`. Client filter: must have a `code`,
inside `starts_at`/`expires_at` window, under `usage_limit`; `is_birthday_offer` rows only show
when the signed-in profile's birth month == current month. Each card: value pill
(`20% OFF` / `₹50 OFF`), optional BIRTHDAY tag, description, min-order + expiry meta, and a
dashed code box — tap anywhere on the row to `Clipboard.setStringAsync` (label flips to
"Copied" for 1.8 s). `Loading` / `ErrorNotice` / `EmptyState` states. Plain `<View>` list per the
Reanimated-web gotcha.

**Admin** (`admin/components/OrdersClient.tsx`) — order drawer shows
`Discount · <code>  −₹<amount>` between Delivery fee and Total when `discount_amount > 0`.
Admin Orders/Reports queries are `select('*')` so no query changes were needed.

**Verification:** mobile `npx tsc --noEmit` clean. Admin `cd admin && npx tsc --noEmit` clean (exit 0).
Live check NOT done this session — port 8090 is held by another chat's Expo server that this
session's Browser tools can't reach, and `validate_discount` can't be exercised until the
migration is pushed anyway. Next session (or after the push): start this session's own web
server, create a disposable active `discounts` row, and walk checkout → apply → place order →
confirm `orders.discount_code`/`discount_amount` persisted and the Admin drawer shows it.

### 2026-08-30 — T5 code complete (capture DOB)

**New `src/utils/date.ts`** — `maskDobInput` (types `DD/MM/YYYY` as you go),
`parseDobInput` (`DD/MM/YYYY` → ISO `YYYY-MM-DD`, validates real calendar date, 1900..now),
`formatDobDisplay` (ISO → `DD/MM/YYYY`), `isBirthdayToday(iso)`.

**Register** (`src/app/auth/register.tsx`) — new optional "Date of Birth (optional)"
`TextField` (number-pad, masked, maxLength 10). Validated on submit; passed as ISO to
`signUp(email, password, fullName, dobIso)`.

**`useAuthStore.signUp`** — 4th optional `dateOfBirth` param. Puts `date_of_birth` into
`supabase.auth.signUp` `options.data`; **and** if a session comes back immediately
(email-confirmation disabled) also does a direct `profiles.update({ date_of_birth })`
as a fallback in case the DB trigger predates the metadata copy.

**Migration `supabase/migrations/20260830120000_dob_from_signup.sql`** — `create or
replace public.handle_new_user()` to also insert
`nullif(raw_user_meta_data->>'date_of_birth','')::date`. **NOT PUSHED — user must run it.**
Original `handle_new_user` (in `20260818190000_init_schema.sql`) only copied
`full_name` + `email`.

**Profile edit** (`src/app/profile/edit.tsx`) — was 100% mock + a no-op Save. Now reads
`useAuthStore().profile`, has Name / Email / Phone / **Date of Birth** / Bio fields, and
Save does a real `profiles.update({ full_name, phone, date_of_birth })` + `fetchProfile`
+ `router.back()`, with an `ErrorNotice` on failure. (`email` field is display-only —
changing auth email needs the auth API; left for later. `bio` stays local-only — no
`profiles.bio` column.) Dropped the `import { profile } from '../../mock'`.

**Home** (`src/app/(tabs)/index.tsx`) — new `<BirthdayBanner/>` above the search bar:
shows only when `isBirthdayToday(profile.date_of_birth)`, dismissible, and react-query-
fetches the active `is_birthday_offer` discount to show its `code` when one exists.

**Verification:** `npx tsc --noEmit` clean. Live-checked on `localhost:8090`: register
screen shows the DOB field and the mask works ("15082019" → "15/08/2019"); profile/edit
renders the DOB field with no crash when `profile` is null. Full register→profile
round-trip + `send_birthday_offers()` not exercised — needs the migration pushed and a
real confirmed account.

### 2026-08-30 — T1 complete (mobile catalogue on live Supabase)

**New file `src/services/catalog.ts`** — react-query hooks over live data:
- `useProducts(filter?)` → `products` from `products` where `is_available`, ordered by
  `created_at desc`; client-side `featured`/`seasonal`/`bestSeller`/`categoryId` filters.
- `useProduct(slug)` → single product (`data` is `Product | null`).
- `useCategories()` → `categories` from `categories` ordered by name, each with a live
  `productCount` computed from a parallel `products` query.
- `useCategory(slug)` → one category derived from `useCategories()`.
- Mappers `dbProductToUi` / `dbCategoryToUi` shape DB rows into the hand-written UI
  `Product` / `Category` types (`src/types/index.ts`). `toNutrition()` coerces the
  jsonb `nutrition` blob with safe fallbacks (seed only has calories + 2 vitamins etc.).
- `LOCAL_IMAGE_BY_SLUG` (23 entries) + `LOCAL_CATEGORY_IMAGE_BY_SLUG` (3) — bundled
  `require()` artwork keyed by slug, since DB `products.images` / `categories.image`
  are empty in the current seed. Falls back to `getProductPlaceholder` if a slug is
  unknown. **When real Storage URLs exist, prefer `row.images[0]` over the local map.**
- NOTE: did **not** use a `select('*, category:categories(*)')` embed — the
  hand-written `products` `Relationships: []` makes supabase-js emit a
  `SelectQueryError` type for that embed (same root cause documented in BUILD_PLAN's
  Phase 4 notes). Plain `select('*')` + the separate `useCategories` count query.

**Screens migrated off `src/mock` (products/categories only):**
- `src/app/(tabs)/index.tsx` — `useProducts()` + `useCategories()`; `activeCat` now
  starts `undefined` (was `categories[0]?.id`). `banners`/`lifestyleArticles`/
  `testimonials`/`whyChooseUs` still from mock (T11).
- `src/app/(tabs)/explore.tsx` — `useProducts()` + `useCategories()`; added `<Loading>`,
  `<ErrorNotice onDismiss={refetch}>`, and guarded the empty state with
  `!isLoading && !isError`.
- `src/app/search.tsx` — `useProducts()`; added a `<Loading>` branch; `searchSuggestions`
  still mock.
- `src/app/category/[slug].tsx` — `useCategory(slug)` + `useProducts()`; coerces
  `params.slug` to string; full-screen `<Loading>` while either query is pending; the
  "Category Not Found" branch only shows after load.
- `src/app/product/[id].tsx` — `useProduct(id)` + `useProducts()` for related; coerces
  `params.id`; full-screen `<Loading>` while pending.

**`src/mock/index.ts`** — deleted the `products` and `categories` export arrays (kept a
pointer comment). Image `require()` consts and `Product`/`Category` type imports left in
place (harmless, no `noUnusedLocals`); other exports untouched.

**Decision taken (was flagged "decision needed"):** dropped the 4th **Bowls** category
chip — there is no `bowls` row in the DB and the plan said default-to-drop if unanswered.
Category chips are now the 3 real rows (Juices / Microgreens / Smoothies).

**Verification:** `npx tsc --noEmit` clean. Live-checked against the running
`localhost:8090` Expo web server (another chat's server, same repo — Metro picked up the
edits): Home (Best Sellers + Seasonal populated, no Bowls), Explore (13 product prices
matching seed exactly, 3 category chips), `/category/juices` ("5 products", 5 rows, DB
description), `/product/broccoli` (₹220.00, 4.9/81 reviews, DB description/nutrition/
tags/related). Reads done via the clone-and-force-`visibility:visible` trick (Reanimated
`FadeInUp` web gotcha — visual only, ~530 hidden nodes, no data issue). Add-to-cart path
unchanged (`useCartStore.addItemBySlug` already hits live `products` by slug, and slugs
now come straight from the DB). Search + category screens' `<Loading>` branches not
individually exercised live but are trivial.

**Next session: T5** (tiny — capture DOB), then T2.

### 2026-08-30 — Plan created
- Ran gap analysis vs `D:\Mobile APP (1).pdf`. Built the **blog reader** (not a task here — done
  this session): `src/app/articles.tsx`, `src/app/article/[id].tsx`, fleshed-out
  `lifestyleArticles` in `src/mock/index.ts`, `LifestyleArticle`/`ArticleBlock` types, routes in
  `src/app/_layout.tsx`, Home "Healthy Living" cards + "View all" wired. Verified live. Typecheck clean.
- Corrected an old memory: inventory **does** decrement now (migration `20260821000000`, inlined in
  `verify_razorpay_payment`).
- Confirmed for the tasks below: **DOB is captured nowhere** (register + profile edit both lack it);
  Admin **Customers** page does not exist (it's in `comingSoon` in `admin/components/Sidebar.tsx`);
  there is **no `notifications` table**; the mobile catalogue (Home/Explore/Search/Category/Detail)
  still renders from `src/mock/index.ts` while only the cart hits live Supabase.
- Created this file with tasks T1–T11. Nothing in the Status Board started yet — **next session: begin T1.**
