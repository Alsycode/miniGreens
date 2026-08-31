# MiniGreens — Flow Test Report

**Date:** 2026-08-31
**Scope:** MiniGreens **mobile app** (`src/`) — every user-facing flow.
**Method:** full source review of all 38 route screens + stores + services + the
Supabase migrations, plus live smoke-testing of every screen reachable without a
login in the Expo **web** preview (`expo start --web`, port 8091).
**Not covered:** the `admin/` Next.js dashboard and the `website/` marketing site
(separate apps, not part of this request).

---

## 1. How testing was done

| Layer | What was checked |
|---|---|
| **Static / code review** | Every screen in `src/app/**`, the three Zustand stores, `services/catalog.ts`, `lib/*`, and the 15 SQL migrations behind the flows. |
| **Live (web preview)** | Onboarding, Login, Register, Home, Explore, Category, Product detail, Search, Cart, Subscriptions, My Offers, Partner "Application Submitted", Partner Dashboard (with a temporary mock partner). |
| **Live — blocked** | Anything behind a login. The web preview cannot authenticate (no test account is stored in `CREDENTIALS.md`, and creating one / signing in is out of scope for an automated pass). Payment cannot run on web at all — `checkout/pay.tsx` uses `react-native-webview`, which does not exist on `react-native-web`. These paths were verified by reading the code + the migration RPCs they call. |

**Type safety:** `npx tsc --noEmit` is **clean** across the whole `src/` tree.

**Overall verdict:** the app is in good shape. Catalogue, cart, checkout data
model, orders, subscriptions, offers, notifications, pre-order, and the full
partner suite are wired to live Supabase and internally consistent. The issues
below are mostly **polish, stub screens, and two real backend gaps** (coupon
usage limit + onboarding persistence). Nothing blocks the core buy-flow.

---

## 2. Bugs & gaps found

Severity: **P1** = user-visible broken behaviour / data problem ·
**P2** = confusing or incomplete · **P3** = cosmetic / nice-to-have.

### P1 — should fix

| # | Area | Problem | Where | Suggested fix |
|---|---|---|---|---|
| **BUG-01** | Onboarding | `hasCompletedOnboarding` lives in `useAppStore`, which has **no persistence**. On every cold start `src/app/index.tsx` sees the flag as `false` and routes to `/onboarding` — even for a logged-in user. Onboarding is shown again on every launch. | `src/store/useAppStore.ts` (plain `create()`, no `persist`); `src/app/index.tsx:17` | Wrap `useAppStore` in `zustand/middleware` `persist` with the MMKV adapter already used in `src/lib/supabase.ts`, persisting at least `hasCompletedOnboarding`. |
| **BUG-02** | Coupons | `discounts.used_count` is **never incremented**. `validate_discount` checks `used_count >= usage_limit`, and `checkout/index.tsx` stores `discount_code`/`discount_amount` on the order, but nothing bumps the counter on order placement. A coupon with `usage_limit = 100` can be redeemed unlimited times. There is also no per-user usage cap. | `supabase/migrations/20260830140000_apply_discount.sql` (check only); `checkout/index.tsx:597` `handlePlaceOrder` | Increment `used_count` inside `verify_razorpay_payment` (on a genuine paid order) — or add an `apply_discount(order_id)` RPC called right after the order insert. Optionally add a `discount_redemptions(discount_id, profile_id)` table for per-user limits. |
| **BUG-03** | Checkout → Success | `checkout/success.tsx` renders `<Loading fullScreen />` until the order row loads, with **no error branch and no timeout**. If the `orders` fetch fails or returns nothing (RLS hiccup, bad id), the user is stuck on an infinite spinner *after their payment already succeeded*. | `src/app/checkout/success.tsx:1319` `if (!order) return <Loading …>` | Add a failed state after ~8 s / on error with an "Order placed — view my orders" button (payment is already done at this point). |
| **BUG-04** | Profile edit | The **Email** field is rendered and editable, but `handleSave` only writes `full_name`, `phone`, `date_of_birth`. Editing the email and hitting Save silently changes nothing. | `src/app/profile/edit.tsx:301` (`.update({...})` omits `email`) | Either make the Email field read-only (email changes belong to Supabase Auth, not `profiles`), or wire it through `supabase.auth.updateUser({ email })` + reflect the pending-confirmation state. |

### P2 — confusing / incomplete

| # | Area | Problem | Where |
|---|---|---|---|
| **BUG-05** | Orders (customer) | A **business order** placed by a partner (`order_type = 'business'`) also shows up in the customer **Orders** tab (same `profile_id`). Opening it shows a **"Complete Payment"** button because the condition is only `payment_status !== 'paid' && order_type !== 'preorder'`. Business orders have no self-serve payment (they go to Admin), so this button leads nowhere useful. | `src/app/(tabs)/orders.tsx` (no filter on `order_type`); `src/app/order/[id].tsx:975` |
| **BUG-06** | Profile edit | **"Change Photo"** and the **Bio** field are non-functional stubs — Change Photo only fires a haptic; Bio is never persisted. | `src/app/profile/edit.tsx:350`, `:385` |
| **BUG-07** | Search | The **Recent searches** list is hardcoded (`['mango fresh','choco chill','watermelon fresh']`) and the **Clear** control has an empty `onPress`. `useAppStore.searchHistory` / `addSearchHistory` / `clearSearchHistory` exist but are never used, and searches are never recorded. | `src/app/search.tsx:25`, `:85` |
| **BUG-08** | Subscriptions | "Get Started" on a plan **immediately** inserts an `active` subscription with **no payment step and no billing**. Fine for a demo, but there is no charge, no `next_delivery_date`, and no recurring logic. | `src/app/(tabs)/subscriptions.tsx:441` `handleSubscribe` |
| **BUG-09** | Coupon re-validation | If a coupon is applied, then the user goes back to Cart and changes quantities, the **percentage** discount's absolute amount is not recomputed on return to Checkout (only clamped to the new subtotal via `Math.min`). | `src/app/checkout/index.tsx:530` |
| **BUG-10** | Order integrity | `handlePlaceOrder` inserts the `orders` row first, then `order_items`. If the items insert fails, the order row is **orphaned** (exists with zero items, no cleanup). Low probability but no transaction / rollback. | `src/app/checkout/index.tsx:607`–`650`; same pattern in `preorder/[slug].tsx` and `partner/business-order.tsx` |
| **BUG-11** | Partner nav consistency | `partner/business-order.tsx` success → `router.replace('/partner/dashboard')`, while `partner/apply.tsx` success → `/partner/submitted`. Not wrong, just two different post-submit destinations in the same area. | `src/app/partner/business-order.tsx:991` |

### P3 — cosmetic / minor

| # | Area | Problem |
|---|---|---|
| **BUG-12** | Orders / Order detail | Order-item thumbnails are never rendered — `orders.tsx` and `order/[id].tsx` draw an empty coloured `<View>` where the product image should be. `order_items.image` is stored but unused, and for known catalogue slugs the image is a bundled `require()` (a number), so `preorder` even stores `null`. |
| **BUG-13** | Checkout review | The Order Summary shows **"Delivery Fee ₹35.49"** on step 1 before a date/address is chosen; the fee value (`35.49`) is also an odd figure for INR. |
| **BUG-14** | Contact screen | Instagram row opens generic `https://instagram.com`, not the `@minigreens.in` handle. Email/phone are placeholder values (`hello@minigreens.in`, `+91 98765 43210`). |
| **BUG-15** | Profile | The **Reviews** stat tile is hardcoded to `0` (no reviews feature exists). Avatar falls back to a mock URL that may 404. |
| **BUG-16** | Cart / catalogue | `useCartStore` has no persistence — the cart empties on app restart. |
| **BUG-17** | Web preview only | Screens that render **lists** of cards inside `<Animated.View entering={FadeInUp…}>` can mount with the cards stuck at `visibility:hidden` on `react-native-web` during a route transition (documented in `TASK_PLAN.md`). Seen this session on the onboarding screen. **Native is unaffected**; it only matters when demoing in a browser. |

---

## 3. Flows that passed clean

No defects found in these beyond the notes above:

- **Onboarding carousel** — 3 slides, pagination, Next / Skip / Get Started, routes to Login. (Redesigned this session to match the reference UI.)
- **Login / Register** — validation, DOB capture with `DD/MM/YYYY` mask + calendar-date validation, email-confirmation branch, error surfacing. New `Logo` component renders on both.
- **Catalogue** — Home, Explore (filters + 4 sorts), Category, Product detail, Search all read **live Supabase** via react-query (`services/catalog.ts`); ~24 products + 3 categories load. Bundled artwork is keyed by slug as a fallback.
- **Cart** — add (inline stepper on cards + "Add to Cart" on detail), quantity +/- , remove, subtotal, empty state.
- **Checkout** — 3 steps (Review → Delivery → Address) with a progress tracker, coupon apply/remove via `validate_discount` RPC, date/time chips, notes, address selection, order + `order_items` insert, then hand-off to payment. (Coupon *counter* not incremented — BUG-02.)
- **Payment** — `create-razorpay-order` edge fn → Razorpay Checkout in a WebView → `verify_razorpay_payment` RPC (HMAC verify + one-time `stock` decrement) → success screen. **Mobile-only; not runnable in the web preview.**
- **Orders** — list with payment + status badges, pre-order pill; detail with a 5-step animated status tracker, items, payment summary, delivery address, notes, "Complete / Retry Payment" for unpaid non-preorders.
- **Pre-order** — from a product flagged `is_preorder`: quantity, "no charge now" notice, address, notes → `orders` row with `order_type='preorder'`, `delivery_fee=0`, then straight to the order detail. Shows in Orders with a PRE-ORDER pill + expected-availability line.
- **Subscriptions / Rewards** — plan list from `subscription_plans`, "Most Popular" badge, subscribe → `subscriptions` row, Manage screen (Pause / Resume / Cancel, all persisted).
- **My Offers** — active `discounts` with value pill, birthday pill (only in the user's birth month), min-order + expiry, tap-to-copy code. Empty state verified live.
- **Notifications inbox** — list from `notifications` table, unread styling + dot, per-row mark-read, "mark all read", tap routes to the linked order or back to the inbox; unread count drives the Home bell dot.
- **Birthday reward** — Home banner appears only when `profiles.date_of_birth` is today's month+day, pulls the active birthday coupon code; `validate_discount` server-side enforces "birth month only" and "DOB required".
- **Partner — Apply** → KYC doc upload to `partner-kyc/<uid>/…` storage → submit → **Application Submitted** screen (redesigned this session, uses `assets/tick.jpeg`) → Back to Home.
- **Partner — Dashboard** — header with verified-shield art, 3 stat cards, "Place Business Order", Earnings card (`partner_earnings_summary` RPC: gross / fee / net / paid-out / pending / available), **Request Payout** (`request_payout` RPC), Payout History with status pills, Order History. Verified live with a temporary mock; per `TASK_PLAN.md` T6 the real chain was verified end-to-end on 2026-08-31 including the Admin approve → "Mark paid" round-trip.
- **Partner — Business order** — pre-fills partner details, product chips from live `products`, quantity, required delivery date, notes → `orders` row with `order_type='business'` for Admin.
- **Profile menu** — Edit Profile, Saved Addresses (full CRUD + set-default, all persisted), My Offers, My Subscription, Become-a-Partner / Partner-Dashboard (role-aware), Settings, About, Contact, FAQ, Sign Out.

---

## 4. Recommended fix order

1. **BUG-01** (onboarding persistence) — one small change, high annoyance if shipped.
2. **BUG-02** (coupon usage counter) — real money leak on limited coupons.
3. **BUG-03** (post-payment infinite spinner) — worst-feeling failure mode.
4. **BUG-04 / BUG-06** (profile-edit stubs) — make Email read-only, hide Bio + Change Photo until built.
5. **BUG-05** (business order in customer Orders) — filter `order_type` out of the customer list, or relabel + hide the pay button.
6. Everything else P2/P3 as polish.
