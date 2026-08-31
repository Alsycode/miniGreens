# Test Report Fix Tracker

Tracks progress on the bugs listed in [`TEST_REPORT_2026-08-31.md`](TEST_REPORT_2026-08-31.md).

**Legend:** ⬜ TODO · 🟡 IN PROGRESS · ✅ DONE · ⏭️ SKIPPED (with reason)

## How to resume in a new chat

Read this file. Pick the first ⬜ / 🟡 row in the table. The "Notes" column
says what was done and what's left. Fixes are made on branch `dark-theme`.
Verify with `npx tsc --noEmit` (must stay clean) plus the per-bug check listed.

---

## Status board

| # | Sev | Area | Status | Notes |
|---|-----|------|--------|-------|
| BUG-01 | P1 | Onboarding persistence | ✅ | `useAppStore` now wrapped in `persist` (MMKV id `app-store`, key `minigreens-app-store`); persists `hasCompletedOnboarding` + `searchHistory`. tsc clean. |
| BUG-02 | P1 | Coupon `used_count` never incremented | ✅ | Migration `supabase/migrations/20260831120000_discount_used_count.sql` **pushed to remote 2026-08-31** (recreates `verify_razorpay_payment` with already-paid idempotency guard + `used_count` bump when order has `discount_code`). Functional check (real paid order → counter +1) still worth doing on next live pass. Per-user cap NOT done (optional). |
| BUG-03 | P1 | Checkout success infinite spinner | ✅ | `checkout/success.tsx` — fetch now sets `loadFailed` on error/empty + 8s timeout; added a "Payment Successful / View My Orders" fallback screen. tsc clean. |
| BUG-04 | P1 | Profile edit email no-op | ✅ | `profile/edit.tsx` — Email field now `readOnly` with hint; removed the no-op email write. tsc clean. |
| BUG-05 | P2 | Business order shows in customer Orders | ✅ | `(tabs)/orders.tsx` query now `.neq('order_type','business')`; `order/[id].tsx` pay button also excludes `order_type === 'business'`. tsc clean. |
| BUG-06 | P2 | Profile edit: Change Photo / Bio stubs | ✅ | `profile/edit.tsx` — removed "Change Photo" button + non-persisted Bio field (done together with BUG-04). |
| BUG-07 | P2 | Search recent list hardcoded | ✅ | `src/app/search.tsx` — `recentSearches` now reads `useAppStore.searchHistory`; `SearchBar.onSubmit`, recent-item tap, and suggestion-chip tap all call `addSearchHistory` (via `recordSearch`); Clear button wired to `clearSearchHistory` + haptic. History persists via the store's MMKV `persist` (partialize already includes `searchHistory`). tsc clean. |
| BUG-08 | P2 | Subscriptions: no payment step | ⏭️ | SKIPPED per user (2026-08-31) — a real fix needs a recurring-billing design (Razorpay subscriptions/mandates + `next_delivery_date` + recurring logic); out of scope for this bug-fix pass. Raise as its own task if wanted. |
| BUG-09 | P2 | Coupon not recomputed on qty change | ✅ | `checkout/index.tsx` — new `useEffect([subtotal])` re-calls `validate_discount` for the applied coupon whenever the live subtotal changes: updates `appliedCoupon.amount` (fixes stale % discount) or removes the coupon + shows a reason if it no longer qualifies (e.g. min-order). Transient RPC errors keep the last good amount. tsc clean. |
| BUG-10 | P2 | Order insert not transactional | ✅ | On `order_items` insert failure, the just-created `orders` row is now deleted (`supabase.from('orders').delete().eq('id', order.id)`) before surfacing the error. Applied in `checkout/index.tsx`, `preorder/[slug].tsx`, and `partner/business-order.tsx`. tsc clean. |
| BUG-11 | P2 | Partner post-submit nav inconsistent | ✅ | `partner/business-order.tsx` success now `router.replace('/order/<id>')` (same as the pre-order + standard checkout flows — lands on the new order's detail screen) instead of `/partner/dashboard`. `partner/apply.tsx` keeps `/partner/submitted` (KYC-application confirmation, different action). tsc clean. |
| BUG-12 | P3 | Order item thumbnails never rendered | ✅ | `(tabs)/orders.tsx` + `order/[id].tsx` — empty `<View>` replaced with `<Image source={resolveImageSource(item.image ?? getProductPlaceholder(item.product_name))}>`; falls back to a generated SVG placeholder when `order_items.image` is null. tsc clean. |
| BUG-13 | P3 | Delivery fee shown early / odd value | ✅ | `checkout/index.tsx` — `DELIVERY_FEE` `35.49` → `40` (round INR). It's a flat fee so showing it on the review step is intentional (price transparency); only the odd figure was fixed. tsc clean. |
| BUG-14 | P3 | Contact screen placeholder links | 🟡 | `profile/contact.tsx` — Instagram link now `https://instagram.com/minigreens.in` (was generic `instagram.com`). Email / phone / WhatsApp still placeholder values (`hello@minigreens.in`, `+91 98765 43210`) — **need real values from the user** before they can be finalised. |
| BUG-15 | P3 | Profile Reviews tile hardcoded 0 | ✅ | `(tabs)/profile.tsx` — removed the `Reviews` stat tile (no reviews feature); avatar fallback now `getAvatarPlaceholder(displayName)` instead of a mock URL that can 404. tsc clean. |
| BUG-16 | P3 | Cart has no persistence | ✅ | `store/useCartStore.ts` wrapped in `zustand/middleware` `persist` (MMKV id `cart-store`, key `minigreens-cart-store`, `partialize` → `items`). Cart now survives an app restart. tsc clean. |
| BUG-17 | P3 | Web-only FadeInUp visibility bug | ⏭️ | SKIPPED — web-preview-only cosmetic (native unaffected). It's a documented `react-native-reanimated` web gotcha (see `TASK_PLAN.md:104`); a real fix is a broad multi-screen refactor (swap mapped `Animated.View entering` for plain `View`) best done deliberately, not as a bug patch. |

---

## Session log

### 2026-08-31 — session start
- Created this tracker. Beginning BUG-01.

### 2026-08-31 — BUG-01..06 pass
- **BUG-01 ✅** `src/store/useAppStore.ts` wrapped in `zustand/middleware` `persist`
  with an MMKV-backed `createJSONStorage` (MMKV id `app-store`, persist key
  `minigreens-app-store`). `partialize` persists only `hasCompletedOnboarding` +
  `searchHistory` (profile is re-fetched from Supabase on launch).
- **BUG-03 ✅** `src/app/checkout/success.tsx` — added `loadFailed` state, error
  handling on the order fetch, an 8s watchdog timeout, and a fallback
  "Payment Successful — View My Orders / Continue Shopping" screen so a failed
  order-row load after a successful payment no longer traps the user.
- **BUG-04 + BUG-06 ✅** `src/app/profile/edit.tsx` — `Field` gained `readOnly` +
  `hint` props; Email is now read-only (removed from the `profiles.update`, which
  was already the case, and now visibly non-editable). Removed the "Change Photo"
  button (haptic-only stub) and the Bio field (never persisted). Dropped unused
  styles `changePhotoBtn`, `bioInput`; added `inputReadOnly`, `inputTextReadOnly`,
  `fieldHint`.
- **BUG-02 🟡 CODE DONE, MIGRATION NOT PUSHED.** New file
  `supabase/migrations/20260831120000_discount_used_count.sql` `create or
  replace`s `verify_razorpay_payment` (based on the latest version in
  `20260821000000_inventory_decrement.sql`) adding:
  1. an early `return true` when `payment_status = 'paid'` already (prevents a
     double stock decrement / double coupon bump on a repeat call);
  2. `update public.discounts set used_count = coalesce(used_count,0)+1 where
     lower(code) = lower(btrim(order.discount_code))` on the genuine paid
     transition.
  No `src/types/database.ts` change needed (function signature/return unchanged).
  **ACTION FOR USER — push the migration** (same recipe as prior tasks):
  ```
  npx --yes supabase db push --db-url '<session pooler url>'
  ```
  Then verify: place a real paid order with a limited coupon and confirm
  `discounts.used_count` incremented by exactly 1; call `verify_razorpay_payment`
  again for the same order and confirm it stays at +1 (idempotent).
  Per-user redemption cap (`discount_redemptions` table) intentionally NOT built —
  flagged optional in the report; raise with user if wanted.
- tsc `npx tsc --noEmit` clean after every change above.
- **BUG-05 ✅** `src/app/(tabs)/orders.tsx` — added `.neq('order_type','business')`
  to the orders query so partner business orders no longer appear in the customer
  Orders tab. `src/app/order/[id].tsx` — the "Complete/Retry Payment" button
  condition now also excludes `order_type === 'business'` (in case a business
  order is opened via a direct link/notification).

### 2026-08-31 — BUG-02 migration pushed
- `npx supabase db push` applied `20260831120000_discount_used_count.sql` to the
  remote DB cleanly (`{"message":"Finished supabase db push"}`). BUG-02 → ✅.
  Remaining: a live functional check (place a real paid order with a limited
  coupon, confirm `discounts.used_count` +1 and idempotent on re-verify).

### 2026-08-31 — PAUSED for context handoff
- Done this session: BUG-01 ✅, BUG-02 ✅, BUG-03 ✅, BUG-04 ✅, BUG-05 ✅, BUG-06 ✅.
- All changes on branch `dark-theme`, not committed. `npx tsc --noEmit` clean.

### 2026-08-31 — BUG-07 pass
- **BUG-07 ✅** `src/app/search.tsx` now uses `useAppStore` for recent searches:
  `recentSearches` = `searchHistory` selector; new `recordSearch(raw)` helper
  trims + calls `addSearchHistory`. Wired into `SearchBar.onSubmit`, recent-item
  tap, and suggestion-chip tap. Clear button `onPress` → `clearSearchHistory()` +
  `Haptics.selectionAsync()`. Persistence already handled by the store's MMKV
  `persist` (`partialize` includes `searchHistory`). `npx tsc --noEmit` clean.
### 2026-08-31 — BUG-08..BUG-11 pass
- **BUG-08 ⏭️** SKIPPED per user — needs a real recurring-billing design.
- **BUG-09 ✅** `checkout/index.tsx` — `useEffect([subtotal])` re-validates the
  applied coupon against the live subtotal (updates amount / drops it if it no
  longer qualifies). Guarded against loops via an equality check in the state
  updater; transient RPC errors are ignored (keep last good amount).
- **BUG-10 ✅** Orphaned-order rollback on `order_items` failure in
  `checkout/index.tsx`, `preorder/[slug].tsx`, `partner/business-order.tsx`.
- **BUG-11 ✅** `partner/business-order.tsx` success → `/order/<id>` (matches
  pre-order + standard checkout). `apply.tsx` unchanged (`/partner/submitted`).
- `npx tsc --noEmit` clean after all of the above.

### 2026-08-31 — BUG-12..BUG-17 pass (P3)
- **BUG-12 ✅** order-item thumbnails rendered in `(tabs)/orders.tsx` +
  `order/[id].tsx` via `resolveImageSource` + `getProductPlaceholder` fallback.
- **BUG-13 ✅** `DELIVERY_FEE` `35.49` → `40`.
- **BUG-14 🟡** Instagram deep-link fixed; email/phone/WhatsApp are still
  placeholders — **blocked on real contact details from the user.**
- **BUG-15 ✅** Reviews stat tile removed; avatar fallback → `getAvatarPlaceholder`.
- **BUG-16 ✅** `useCartStore` now MMKV-persisted (`persist`, `partialize` items).
- **BUG-17 ⏭️** SKIPPED — web-only cosmetic, documented Reanimated web gotcha.
- `npx tsc --noEmit` clean.

### 2026-08-31 — follow-up (theming pass + BUG-12 real fix)
- **BUG-12 follow-up:** the order-item `<Image>` was still blank on web because
  `src/utils/placeholders.ts` `svgDataUri` (and the banner/avatar helpers) built
  `data:image/svg+xml;charset=utf-8,<svg…>` with a **raw `#`** in fill colours —
  the browser read it as a URI fragment → blank. Wrapped the SVG body in
  `encodeURIComponent`. Placeholder thumbnails now render (verified on Orders).
  Also switched `item.image ?? …` → `item.image || …` so an empty-string image
  falls back too, and added `resizeMode="cover"`.
- **Theming (user request, not a tracked bug):** price / rupee / screen-title
  colour switched from the teal `colors.primaryDark` / `primaryLight` to
  `colors.accent` (`#96FF1F`) across: product cards (all variants) + card
  quantity stepper, product detail (price pill, total, quantity), nutrition
  gram values, Orders (title + totals), Order detail (title + totals),
  Subscriptions (title + plan price), Explore title. Login logo centered
  (`alignSelf: 'center'`). Product-card unit badge ("350ml") moved from an
  absolute `top:150` position into normal flow at the top of the overlay body
  (`unitBadgeInline`) so a 2-line name no longer overlaps it.
- `npx tsc --noEmit` clean.

### Status: all 17 bugs triaged
- ✅ done: BUG-01..07, 09, 10, 11, 12, 13, 15, 16
- 🟡 partial: BUG-14 (needs real contact info)
- ⏭️ skipped: BUG-08 (needs recurring-billing design), BUG-17 (web-only cosmetic)
- All changes on branch `dark-theme`, **not committed**. `npx tsc --noEmit` clean.
- Not yet live-verified (no auth in web preview): BUG-02 functional check,
  BUG-09/10 (payment paths), BUG-12/15/16 visual on device.
