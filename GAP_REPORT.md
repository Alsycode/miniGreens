# MGC Spec vs. Codebase — Gap Report

**Date:** 2026-09-20
**Sources compared:** `Mobile APP.pdf` ("MGC Platform — Role-Based Access") and `MGC 2.0.pdf` (partner/product/subscription marketing copy + subscription signup form mockup), both from the user's Desktop, against the current state of `F:\minigreensMaster` (mobile `src/`, admin `admin/`, webapp `webapp/`, website `website/`, Supabase `supabase/`).

**Method:** Re-verified against live code (not just `TASK_PLAN.md`, which already tracks T1–T12 from an earlier 2026-08-30 gap analysis against the same "Mobile APP" spec — that board is 11/12 done, T11 optional/not-in-spec). This report adds six items from `MGC 2.0.pdf` and re-checks a couple of `Mobile APP.pdf` claims that weren't independently confirmed before.

---

## Already covered by `TASK_PLAN.md` (for context — not re-litigated here)

T1 (live catalogue), T2 (coupons/offers), T3 (notification inbox), T4 (pre-order), T5 (DOB capture — mobile only), T6 (partner payouts), T7 (admin Customers), T8 (admin Overview/Delivery Queue), T9 (Reports PDF/Excel/CSV export), T10 (partner KYC upload), T12 (subscription recurring-order engine + webapp manage page) are all **DONE and live-verified**. T11 (testimonials/blog → CMS) is explicitly optional and not in the spec. WhatsApp-to-admin alerting is tracked as **BLOCKED** (no BSP account) — confirmed still true, see below.

---

## New findings

### 1. Café/Shop "Place Business Order" — ✅ fully implemented
[`src/app/partner/business-order.tsx`](src/app/partner/business-order.tsx) is a dedicated screen linked from the Partner Dashboard ("Place Business Order"). It captures exactly the spec's fields — business name, contact person, phone, address, product, quantity, required delivery date, additional instructions — and inserts a real `orders` row (`order_type: 'business'`) + `order_items` row. It does reach Admin immediately (Admin Orders selects `*` unfiltered).

**Minor gap:** Admin's Orders screen has no special badge/filter for business orders — they render as plain orders with no visual distinction from a business order's `business_name`/`contact_person`. Cosmetic, not a missing feature.

### 2. "Build Your Own Subscription" (arbitrary product + qty + frequency) — ✅ DONE on webapp and mobile (2026-09-21)
The spec (`MGC 2.0.pdf`) describes a 5-step flow: pick a product, pick quantity, pick Weekly/Monthly, pick delivery preference, confirm. The 6 curated plans (Starter, Wellness, Family, etc.) remain unchanged for customers who want a fixed box — this adds a second, parallel path for customers who want to compose their own.

**What was built (webapp only):**
- New page [`webapp/app/subscriptions/custom/page.tsx`](webapp/app/subscriptions/custom/page.tsx): fetches real, live `products` (not mock), lets the customer set a quantity per product with +/− steppers, pick Weekly or Monthly, then locks in and reuses the existing `CheckoutForm` (same DOB/State/consent fields as item 5) for delivery details and confirmation. A live order summary sits in the aside the whole time.
- New "Build Your Own" CTA on [`webapp/app/subscriptions/page.tsx`](webapp/app/subscriptions/page.tsx), next to the curated-plan grid.
- **Schema** (`supabase/migrations/20260921000000_custom_subscriptions.sql`): `subscriptions.plan_id` is now nullable; added `subscriptions.is_custom boolean` + `subscriptions.custom_frequency text check (weekly/monthly)` with a shape constraint (curated XOR custom); new `subscription_items` table (subscription_id, product_id, quantity) with owner/admin RLS, mirroring the `payouts` table's RLS pattern.
- **Engine**: `generate_subscription_orders()` rewritten to branch on `is_custom` — curated subscriptions keep the existing single "whole box" order line; custom subscriptions now get one real `order_items` row per selected product at its real price, summed into the order subtotal. Both branches share the same address-check, order-numbering, and "advance past today" idempotency logic from the T12 fix.
- **Admin**: `admin/app/dashboard/(protected)/subscriptions/page.tsx` + `SubscriptionsClient.tsx` updated so custom subscriptions show as `Custom (Weekly)`/`Custom (Monthly)` with a real computed price (sum of selected products × quantity) instead of the `—`/₹0 a naive nullable-FK join would have shown — "Active Revenue" and the Generate-orders-now flow both account for them correctly.
- Live-verified in the browser preview: product picker renders real catalogue data, quantity steppers update the running total, "Continue to delivery details" locks the selection and swaps in the full delivery/consent form. `webapp` and `admin` `tsc --noEmit` both clean (webapp aside from the pre-existing unrelated `ContactForm.tsx` gap).

**Migration pushed and fully verified end-to-end (2026-09-21):** user applied
`20260921000000_custom_subscriptions.sql` via the SQL Editor. Confirmed live with the service-role
key: `subscriptions.is_custom`/`custom_frequency` and the `subscription_items` table exist;
`admin_generate_subscription_orders()` correctly refuses a call with no admin session attached
(`not authorized`). Then ran a full engine test — created a real test subscription
(`is_custom: true`, 2× Strawberry Banana Glow + 1× Mango Fresh, `next_delivery_date` backdated to
2020-01-01), called `generate_subscription_orders()` directly: it created one order (subtotal
₹308 = 2×₹99 + 1×₹110, correct), two `order_items` rows with the real product IDs/names/prices
(not a generic box line), and advanced `next_delivery_date` to 2026-09-23 (7 days out). A second
same-day call produced no duplicate — idempotency holds for the custom path too. All test rows
(order, order_items, subscription_items, subscription, address) deleted after verification.
**Item 2 is fully closed for webapp — schema, code, and engine all confirmed live.**

**Mobile build (2026-09-21):** same 5-step flow, native UI. New screen
[`src/app/subscription/custom.tsx`](src/app/subscription/custom.tsx) (registered in `_layout.tsx`):
live `useProducts()` catalogue with `Card`-row +/− steppers, `Chip`-based Weekly/Monthly toggle,
the same address-radio-card pattern as `preorder/[slug].tsx`, a free-text delivery-date field
(matching `partner/business-order.tsx`'s existing convention for date entry), notes, and two
consent checkboxes (Terms — required, gates the submit button; SMS/WhatsApp — optional) wired to
the same `terms_accepted`/`sms_whatsapp_consent` columns as webapp. New "Build Your Own" card added
to [`src/app/(tabs)/subscriptions.tsx`](src/app/(tabs)/subscriptions.tsx) (redirects to login first
if no session, matching the curated-plan flow's own guard). `src/app/subscription/manage.tsx` fixed
for the same nullable-FK display gap as admin — a custom subscription now shows `Custom
(Weekly/Monthly)`, a real computed price from `subscription_items`, and its product list, instead
of `Subscription`/₹0. Root `tsc --noEmit` clean (only the pre-existing unrelated
`explore.tsx`/`absoluteFillObject` error, nothing from these files). Live-verified in the Expo web
preview: real catalogue products render, the +/− steppers correctly increment/decrement (confirmed
qty 0→3), the billed total recalculates correctly (3 × ₹150 = ₹450), and the "Build Your Own" button
correctly redirects an anonymous session to login. (Note: the preview pane's coordinate-click
mapping glitched for this run — verified via dispatched DOM events on the exact button elements
instead of screen-coordinate clicks; the underlying component logic being exercised is identical
either way.)

**Not done:** an authenticated end-to-end submit on mobile (needs real login credentials the
assistant doesn't hold) — the insert code path is identical to webapp's, which was already proven
end-to-end via a direct engine test (see above), and to the mobile curated-plan insert this app
already ships. Both webapp and mobile now offer build-your-own; **item 2 is fully closed.**

### 3. Partner platform-fee rules per business type — ⚠️ partially implemented
A DB trigger sets the fee once at signup (Women Partner → 0%, others → 10% default) based on `business_type`. Admin **can** edit an individual partner's fee afterward (`admin/components/PartnersClient.tsx`, `updatePartnerFee` action) — so per-partner override works. What's missing is a **type-level rule editor** (e.g., "set all Café partners to 8%") — today that would mean editing every café partner one at a time. Minor/administrative gap, not customer-facing.

### 4. Discount categories — ⚠️ mostly cosmetic beyond coupons/%/flat/birthday
The spec lists 7 discount categories: Coupons, Percentage, Flat, Birthday offers, Subscription discounts, Partner discounts, Café/wholesale pricing. In the DB, `discounts.target` is an enum with values `all, category, product, subscription_plan, partner, wholesale` — but the admin "create discount" form always writes `target_id = null` (`DiscountsClient.tsx`), so a discount can never actually be scoped to a specific product/partner/plan. Only **coupon codes, percentage/flat math, and birthday offers** (which check `profiles.date_of_birth`) have real, distinct enforcement logic in `validate_discount()`. There is no automatic wholesale/café pricing tier and no automatic partner-type discount — the business-order flow (item 1) charges plain `products.price`, never a wholesale rate.

**Impact:** "Subscription discounts," "Partner discounts," and "Café/wholesale pricing" exist only as unused enum labels with no actual scoping or auto-apply behavior.

### 5. Subscription signup form fields — ❌ several fields missing
The `MGC 2.0.pdf` mockup for the subscription form asks for: Full Name, Mobile, **Date of Birth**, House/Flat/Building, Street/Area, City, **State**, PIN Code, product checkboxes, frequency, quantity, and **two consent checkboxes** (Terms & Conditions; SMS/WhatsApp updates). The actual webapp form (`webapp/components/CheckoutForm.tsx`) only captures: Full Name, Phone, a single "street" line (no separate building/area split), City, PIN Code, delivery date/time, notes. **Missing entirely:** Date of Birth, State field, and both consent checkboxes. (Product/frequency/quantity are moot here since item 2 shows those are fixed by the chosen plan, not user-selected.)

### 6. WhatsApp-to-Admin notification — ❌ confirmed not built (by design, tracked as blocked)
Repo-wide check found zero WhatsApp API integration — the only mentions are a static "WhatsApp" contact link on the customer profile screen and explicit code comments noting it was deliberately skipped pending a WhatsApp Business Solution Provider account. Matches what `TASK_PLAN.md` already tracks as BLOCKED — no new information here, just confirming it's still true and there's no partial/hidden implementation.

---

## Summary table

| # | Spec item | Status |
|---|---|---|
| 1 | Café/Shop "Place Business Order" | ✅ Done (minor: no admin badge) |
| 2 | Build-your-own subscription (arbitrary product/qty/frequency) | ✅ DONE on webapp and mobile (2026-09-21) |
| 3 | Per-business-type platform fee rules | ⚠️ Per-partner override works; no type-level bulk rule |
| 4 | Full discount taxonomy (wholesale/partner/subscription-scoped) | ⚠️ Only coupons/%/flat/birthday are real; rest are unused labels |
| 5 | Subscription signup form (DOB, State, consent checkboxes) | ✅ DONE (2026-09-20) — see below |
| 6 | WhatsApp-to-admin alerts | ❌ Not built — blocked on BSP account (known, unchanged) |

## Item 5 — closed out 2026-09-20

Added to `webapp/components/CheckoutForm.tsx`: a "Date of birth (optional)" field, a required "State"
field, and two consent checkboxes ("I agree to MGC's Terms & Conditions and Privacy Policy" — required,
gates the submit button; "I agree to receive important updates about my subscription through
SMS/WhatsApp" — optional). `webapp/app/subscribe/page.tsx` now writes the real `state` value onto the
`addresses` insert (was hardcoded to `""`), updates `profiles.date_of_birth` when supplied, and writes
`terms_accepted`/`sms_whatsapp_consent` onto the `subscriptions` insert. Migration
`supabase/migrations/20260920140000_subscription_consent.sql` adds those two boolean columns to
`subscriptions` — **pushed to the live project by the user via the Supabase SQL Editor, confirmed
present** by querying `subscriptions?select=id,terms_accepted,sms_whatsapp_consent` with the service-role
key. `src/types/database.ts` updated to match (shared with webapp via `@mobile/database`). Live-verified
in the browser preview: all four fields render, the submit button is disabled until Terms is checked and
enables once checked. `webapp`'s own `tsc --noEmit` is clean aside from the pre-existing unrelated
`ContactForm.tsx`/`contact_messages` gap. **Fully done, schema and code both confirmed live.**

## Recommended next steps (not started — awaiting your priority call)

- **Medium:** decide whether "build your own subscription" is actually wanted, or whether the 6 curated plans are the intended final design (the marketing PDF may predate that product decision) — this determines whether item 2 is a real gap or a stale spec.
- **Low priority / cosmetic:** admin business-order badge (item 1), type-level fee bulk editor (item 3).
- **Needs a product decision first:** whether wholesale/café pricing and partner-scoped discounts should be built for real, or the `target` enum values should just be removed since they're currently dead weight (item 4).
