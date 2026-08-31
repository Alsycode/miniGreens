# MiniGreens — Feature / Flow Status

**As of:** 2026-08-31
**App:** MiniGreens mobile (Expo / expo-router / React Native, `src/`)
**Backend:** Supabase (Postgres + Auth + Storage + RLS), Razorpay for payments.

Legend:
**LIVE** = wired to Supabase, works end to end ·
**LIVE (mobile only)** = works, but needs a real device/emulator (not the web preview) ·
**PARTIAL** = works but has a stub or gap (see notes / `TEST_REPORT_2026-08-31.md`) ·
**MOCK** = renders from local sample data, not the database ·
**NOT BUILT** = intentionally absent.

---

## Customer app

| Flow | Status | Notes |
|---|---|---|
| **Onboarding carousel** | LIVE | 3 slides → Login. Flag not persisted → re-shows every launch (BUG-01). |
| **Sign up** (email + password + optional DOB) | LIVE | Handles both "email confirmation on" and "off" Supabase configs. DOB stored on `profiles.date_of_birth`. |
| **Log in / Log out** | LIVE | Session persisted in MMKV. Sign-out clears session + profile. |
| **Home dashboard** | LIVE | Greeting, birthday banner, search entry, category chips, Best Sellers / Seasonal / Featured (all from live `products`), promo + subscription editorial blocks, articles, testimonials, "Why Choose". Bell dot = live unread-notification count. |
| **Browse — Explore** | LIVE | Category filter + 4 sorts (Popular / Newest / Price ↑ / Price ↓). |
| **Browse — Category page** | LIVE | Products filtered to one category. |
| **Product detail** | LIVE | Images, price/discount, rating, nutrition, benefits, storage, tips, tags, related products. Add-to-cart or Pre-order CTA. |
| **Search** | PARTIAL | Live filter over product name + tags. "Recent searches" are hardcoded and "Clear" is a no-op (BUG-07). |
| **Cart** | LIVE | Inline steppers on cards, add from detail, qty +/- , remove, subtotal. Not persisted across app restarts (BUG-16). |
| **Checkout** | LIVE | 3 steps (Review → Delivery → Address), progress tracker, delivery date/time chips, notes, address pick. Inserts `orders` + `order_items`. |
| **Coupons at checkout** | PARTIAL | `validate_discount` RPC checks active / window / min-order / usage-limit / birthday-month and returns the discount amount. **`used_count` is never incremented** → usage limits don't actually bite (BUG-02). |
| **Payment (Razorpay)** | LIVE (mobile only) | `create-razorpay-order` edge fn → Razorpay Checkout (WebView) → `verify_razorpay_payment` RPC (HMAC verify) → sets `payment_status='paid'` and decrements `products.stock` once. Not runnable in the web preview. |
| **Order confirmation screen** | PARTIAL | Shows order number + total. No error/timeout branch if the order fails to load → possible infinite spinner (BUG-03). |
| **Orders list** | LIVE | Payment + status badges, pre-order pill, tap → detail. Also shows partner *business* orders (BUG-05). |
| **Order detail + tracking** | LIVE | 5-step animated status tracker, items, payment summary, delivery address, notes, "Complete / Retry Payment" for unpaid non-preorders. |
| **Pre-order** | LIVE | For `is_preorder` products. No charge now; creates `orders` row with `order_type='preorder'`, `delivery_fee=0`. Appears in Orders + Admin. |
| **Subscriptions / Rewards tab** | PARTIAL | Plans from `subscription_plans`. Subscribe creates an `active` row — **no payment, no billing, no recurring engine** (BUG-08). |
| **Manage subscription** | LIVE | Pause / Resume / Cancel — all persisted to `subscriptions`. |
| **My Offers** | LIVE | Active `discounts`, birthday offers gated to birth month, tap-to-copy code. |
| **Notifications inbox** | LIVE | `notifications` table; unread sty­ling + count, mark one / mark all read, deep-link to order. |
| **Push notifications** | LIVE (mobile only) | Token synced to `profiles.push_token` on login (real device only). Order-status + birthday pushes are sent from DB triggers. Tapping a push routes to the order / inbox. |
| **Birthday reward** | LIVE | Home banner on the day; coupon only valid in the birth month (server-enforced). |
| **Profile — view** | LIVE | Name, email, live order + address counts. Reviews stat hardcoded `0` (BUG-15). |
| **Profile — edit** | PARTIAL | Name / phone / DOB save. **Email field doesn't save**, **Bio** + **Change Photo** are stubs (BUG-04, BUG-06). |
| **Saved addresses** | LIVE | Full CRUD, set-default, first address auto-default. Used by checkout + pre-order. |
| **About / FAQ / Contact / Terms / Privacy** | MOCK (content) | Static screens; content is placeholder copy. Contact deep-links (mail/tel/WhatsApp) work; Instagram link is generic (BUG-14). |
| **Settings** | PARTIAL | Renders; toggles are local UI state (no server-side preferences). |

## Partner app (in-app, role `partner`)

| Flow | Status | Notes |
|---|---|---|
| **Become a Partner (apply)** | LIVE | Business type, details, optional **KYC document upload** to `partner-kyc/<uid>/…` Storage → inserts a `partners` row (status `pending`). |
| **Application Submitted screen** | LIVE | Shown after apply. "What happens next" + Contact Support + Back to Home. |
| **Partner Dashboard** | LIVE | Status header + verified-shield art, stat cards (sales / net / orders), Earnings breakdown via `partner_earnings_summary` RPC, Payout History, Order History. |
| **Request Payout** | LIVE | `request_payout` RPC creates a `payouts` row; Admin approves → processing → paid; mobile reflects Paid / available ₹0. Verified end-to-end 2026-08-31 (`TASK_PLAN.md` T6). |
| **Place Business Order** | LIVE | Pre-filled partner details, product chips from live `products`, qty, required date, notes → `orders` row `order_type='business'` for Admin. |

## Admin dashboard (`admin/`, Next.js — separate app, not tested in this pass)

Per `TASK_PLAN.md` (verified in earlier sessions): Orders, Products, Discounts,
Partners, Payouts, Customers, Reports (CSV/Excel/PDF export), Overview, Delivery
Queue are all wired to real data. Not re-verified here.

## Not built (by design)

- Product **reviews / ratings write** (ratings are read-only seed data).
- **Wishlist / favourites** (heart button on cards is local-only, not saved).
- **Recurring subscription billing** — subscriptions are free/manual.
- **Content CMS** for articles / testimonials / "why choose" (`TASK_PLAN.md` T11, still TODO — these are MOCK).
- **WhatsApp-to-Admin** new-order alert — blocked, no WhatsApp BSP account.
- **Website order/payment parity** — `website/` is pre-order-only, localStorage, out of scope.

---

## One-line summary

The **core commerce loop is live**: browse (real catalogue) → cart → checkout →
Razorpay payment → paid order → tracking → notifications. The **partner suite is
live** end to end including payouts. The remaining work is polish (a few stub
fields), two backend gaps (coupon counter, onboarding persistence), and the
optional content CMS.
