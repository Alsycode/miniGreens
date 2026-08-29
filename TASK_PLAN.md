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
| T2 | Coupons & offers (checkout coupon field + My Offers screen) | Mobile / Customer | P1 | CODE DONE (2026-08-30) — migration `20260830140000` pending user push |
| T3 | In-app notification inbox (+ `notifications` table) | Mobile + DB | P1 | CODE DONE (2026-08-30) — migration `20260830150000` pending user push |
| T4 | Pre-order flow (mobile) + pre-orders reach Admin | Mobile + DB + Admin | P1 | TODO |
| T5 | Capture DOB (register + profile edit) + surface birthday reward | Mobile | P2 | CODE DONE (2026-08-30) — migration `20260830120000` pending user push |
| T6 | Partner payouts (earnings → payout tracking, both sides) | Mobile + Admin + DB | P2 | TODO |
| T7 | Admin: Customers screen | Admin | P2 | TODO |
| T8 | Admin: wire Overview dashboard + Delivery Queue off real data | Admin | P2 | TODO |
| T9 | Admin: Reports export as PDF + Excel (CSV already done) | Admin | P3 | TODO |
| T10 | Partner KYC document upload | Mobile + Admin + Storage | P3 | TODO |
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

**Resume notes:** CODE COMPLETE 2026-08-30. Remaining: (1) user pushes migration
`supabase/migrations/20260830140000_apply_discount.sql`; (2) live-verify the checkout coupon
round-trip + My Offers with a real active `discounts` row once pushed. Flip Status Board row to
DONE after the migration is confirmed applied. See Session Log for what was built.

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

**Resume notes:** CODE COMPLETE 2026-08-30. Remaining: (1) user pushes migration
`supabase/migrations/20260830150000_notifications_table.sql`; (2) live-verify: flip an order's
`status` in the DB → row appears in `/notifications` with the unread dot → tap marks it read →
Home bell dot clears. Flip Status Board row to DONE once the migration is applied + that check
passes.

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

**Resume notes:** _(none yet)_

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

**Resume notes:** CODE COMPLETE 2026-08-30. Only remaining item: user pushes migration
`supabase/migrations/20260830120000_dob_from_signup.sql`, then optionally live-verify the
register→profile round-trip with a real account. Move the Status Board row to DONE once
that migration is confirmed applied. See Session Log for what was built + why.

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

**Resume notes:** _(none yet)_

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

**Resume notes:** _(none yet)_

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

**Resume notes:** _(none yet)_

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

**Resume notes:** _(none yet)_

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

**Resume notes:** _(none yet)_

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
