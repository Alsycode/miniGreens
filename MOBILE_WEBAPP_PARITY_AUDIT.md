# Mobile App vs Webapp — Strict Feature Parity Audit

**Date:** 2026-10-06
**Scope:** Direct feature comparison of `src/` (Expo mobile app) against `webapp/` (Next.js storefront, port 3100) — NOT against the original PDF spec (that's `GAP_REPORT.md` / `TASK_PLAN.md` T1–T12, already done and 11/12 closed).
**Method:** Two independent full-route inventories (every file under `webapp/app/` and `src/app/`), then diffed feature-by-feature.

Tracked, resumable task list for closing these gaps now lives in **`TASK_PLAN.md`** as **T13–T16**. This file is the reference audit (like `GAP_REPORT.md` was for the spec gap analysis) — read `TASK_PLAN.md` to resume work, don't re-derive this analysis.

---

## Real gaps — mobile is missing something webapp has

### 1. Homepage marketing depth (→ T13, P2)
Webapp's `/` (`webapp/app/page.tsx`) has several marketing sections mobile's Home tab doesn't:
- **FindYourBlend** — quiz-style teaser directing users toward a product recommendation
- **SignatureProduct** — a hero spotlight on one flagship product
- **FarmStory** — brand/provenance storytelling block
- **BusinessStrip** — a partner-program CTA strip shown to *all* visitors (not just existing partners)
- **JoinSection** — newsletter / mailing-list signup

Mobile's Home (`src/app/(tabs)/index.tsx`) has a different mix (birthday banner, offers teaser, product rails, a microgreen-benefits promo block, subscription upsell, article teasers, testimonials, why-choose-us) — some overlap, but these five are webapp-only. Biggest functional miss: **BusinessStrip** (mobile only shows partner info to users who are already partners/applicants — there's no general "become a partner" CTA for an ordinary customer on Home) and **newsletter signup** (no equivalent capture-an-email mechanism anywhere in the mobile app).

### 2. Product ratings/reviews display on PDP (→ T15, P2)
Webapp's product detail page (`webapp/app/shop/[slug]/page.tsx`) renders a `RatingSummary` (aggregate star rating + review count, gated by a `SHOW_RATINGS` flag). Mobile's `src/app/product/[id].tsx` has no rating/review display at all — confirmed deliberately dropped per a `BUG-15` comment in `src/app/(tabs)/profile.tsx` that removed a "Reviews" stat tile, but the PDP-level aggregate display was never added to mobile in the first place. `products.rating` / `products.review_count` columns already exist and are populated in the seed (used elsewhere), so this is a pure UI gap, no schema work needed.

### 3. "Women Who Grow" marketing landing page (→ T14, P3)
Webapp has a dedicated `/women-who-grow` page — static content promoting the women's-entrepreneurship partner track, linking into `/partner/apply?type=women`. Mobile has no equivalent screen; the only women-partner surface on mobile is the business-type chip inside `partner/apply.tsx` itself, with no standalone explainer page.

### 4. Returns & Shipping Policy pages (→ T16, P3)
Webapp has standalone `/returns` and `/shipping-policy` pages (static legal content). Mobile only has `profile/privacy.tsx` and `profile/terms.tsx` — no returns policy or shipping policy screen exists anywhere in `src/app/`.

---

## Parity confirmed (no action needed)
- **Build-your-own subscription**, **DOB/State/consent fields on subscription signup**, **partner KYC upload**, **coupon/offers redemption**, **notification inbox** — all previously tracked in `TASK_PLAN.md`/`GAP_REPORT.md` and built on both sides.
- **Partner bulk/business ordering** — disabled on *both* sides (`BUSINESS_ORDER_ENABLED = false` hardcoded in both `webapp/app/partner/business-order/page.tsx` and `src/app/partner/business-order.tsx`). Not a mobile gap — it's a shared, deliberately-parked feature on both apps.
- **Checkout, cart, order history, order detail, search, catalogue browse** — equivalent real-data coverage on both.

## Mobile is actually ahead of webapp (noted for completeness, not actionable here)
- **Saved-address book**: mobile has a full standalone CRUD screen (`profile/addresses.tsx`); webapp only lets you add/delete an address inline during checkout, no dedicated address-book page. **Kept as-is** — user reviewed this list on 2026-10-06 and chose to leave it.
- ~~**Partner payouts**: mobile's partner dashboard has an Earnings card + "Request Payout" flow...~~ **REMOVED 2026-10-06.** User decided mobile-only extras should come out too, not just webapp-only gaps go in. This one had already been stripped from `partner/dashboard.tsx` in the user's own uncommitted work before being raised; DB/RPCs/admin Payouts tab were left intact (hide, not delete — see T6 in `TASK_PLAN.md`). Mobile's partner dashboard now matches webapp's: order stats + order history only.
- **Settings screen**: mobile has a dedicated settings screen (though its toggles are currently non-functional — see below); webapp has no equivalent settings page at all. **Kept as-is** — user reviewed this list on 2026-10-06 and chose to leave it.

## Separate defect, not a parity gap (flagging, not tasking)
`src/app/profile/settings.tsx` — all notification/dark-mode/analytics toggles are local `useState` only, never persisted to Supabase or device storage; they silently revert on app restart. This predates this audit and isn't caused by anything webapp does or doesn't have — fix only if the user wants it, separately from parity work.

---

## Summary table

| # | Gap | Area | Mobile Task | Priority |
|---|---|---|---|---|
| 1 | Homepage marketing sections (quiz, signature product, farm story, business strip, newsletter) | Mobile Home | T13 | P2 |
| 2 | Product rating/review aggregate display on PDP | Mobile Catalogue | T15 | P2 |
| 3 | "Women Who Grow" landing page | Mobile Marketing | T14 | P3 |
| 4 | Returns & Shipping Policy pages | Mobile Support/Legal | T16 | P3 |
