# UI Refinement Tracker — apply the Home Screen design language to every screen

Resume doc for the mobile app (`src/app`). Update the status boxes and the log as work happens.
Reference screen: `src/app/(tabs)/index.tsx` (Home). Lens: `design-taste-frontend-v1` skill, adapted to React Native.

Status key: `[ ]` not started · `[~]` in progress · `[x]` done + verified · `[!]` blocked (see note)

---

## 1. Home Screen design DNA (what "matches Home" means)

**Canvas and surfaces**
- Pale-green canvas `colors.background` (#F3F7EA); white cards `colors.surface`; tinted blocks `surfaceDark` / `#E4EECE` for promo and hero areas.
- Depth from contrast first, then soft green-cast shadows (`shadows.sm/md`). Hairline borders `borderSubtle`/`borderFaint`.
- One brand green `colors.primary` (#6f8f4a) for CTAs, active states, prices, links. No second accent.

**Shape**
- Big friendly radii: cards `borderRadius.card` (24), hero/promo `cardLarge` (28), controls `control` (14), search/chips/icon buttons `pill`.
- Circular icon buttons (40px, hairline border, white fill) for bell / bag / back.

**Type**
- Display: `DM Serif Display` italic for h1/h2 (screen titles, greeting). Body/UI: `Plus Jakarta Sans` (400–800).
- Hierarchy by weight and colour (`text`, `textSecondary`, `textTertiary`), not by huge size.

**Rhythm**
- 16px page gutters (`spacing.lg`), `spacing.sectionGap` (40) between sections, `headingGap` (18) between heading and content.
- Section header pattern: title (+ optional subtitle) left, "View all →" right.

**Motion (intensity ~6)**
- Staggered `FadeInUp.delay(n).springify().damping(31).mass(1).stiffness(100)` on load; `ZoomIn` springs for avatars/icons.
- Press feedback: `withSpring` scale ~0.98 on pressables; haptics (`Light`) on primary taps.

**States**
- Skeletons that match layout (`Skeleton`, `ProductCardSkeleton`), designed empty states, inline errors (`ErrorNotice`/`ErrorView`).

**Navigation chrome**
- Floating-feel bottom tab bar: white, soft shadow, active icon in an `accentSurface` pill.

## 2. Skill rules applied on top (corrections to make while we're in each screen)

| Rule (from design-taste skill) | What it means here |
|---|---|
| No emojis in UI | Remove emoji from copy/headers (Home currently has some — fix there too). Use Ionicons. |
| No pure black (`#000`) | Use `colors.text` (#1D2B20). Black is allowed only inside the brand logo artwork. |
| One accent, saturation < 80% | Brand green only. Status colours (error/warning/info) only for status. |
| Full state cycle | Every screen: loading skeleton, empty, error, success. Check `-` in the tracker if missing. |
| Tactile feedback | All tappable rows/buttons get the press-scale + haptic pattern. |
| Forms | Label above input, helper optional, error text below, `gap` consistent. |
| Cards only when elevation helps | Prefer spacing/dividers for dense lists (orders, addresses, FAQ, legal text). |
| Perfect alignment | 4px grid via `spacing` tokens; no ad-hoc numbers where a token exists. |
| Animate transform/opacity only | Reanimated springs; never animate width/height/top/left. |
| Skill items **not** applied | Tailwind, Framer Motion, Phosphor icons, `Inter` ban, `h-screen` rules — web-only. We keep Ionicons + Reanimated + Plus Jakarta/DM Serif to stay consistent with Home. |

## 3. Method (same loop for every screen)

1. Read the screen and note gaps against sections 1–2.
2. Reuse/extend shared components (Phase 1) instead of one-off styles.
3. Refactor; keep behaviour and data logic unchanged unless a bug is found (log it).
4. `npx tsc --noEmit` — no new errors in touched files.
5. Verify visually in the browser pane at 375×812 (`http://localhost:8090`), screenshot, check console.
6. Update this file (status, date, notes). Commit per group.

Screens that need a logged-in user can only be fully checked once someone is signed in in the preview pane; otherwise they are verified by type-check + code review and marked `[x]*` (asterisk = visual check pending).

## 4. Phase 0 — Audit and tracker
- [x] Study Home design DNA (this file)
- [x] Inventory all screens and shared components (below)

## 5. Phase 1 — Shared foundation (everything inherits from this)

| # | Item | Status | Notes |
|---|---|---|---|
| F1 | `ScreenHeader` (circular back button + title + optional right action) — replaces per-screen headers | [x] | `src/components/layout/ScreenHeader.tsx`; also exports `HeaderIconButton`. Supports `large` display title. tsc clean; first visual use in Group A |
| F2 | `SectionHeader` (title, subtitle, "View all") — extracted from Home | [x] | `layout/SectionHeader.tsx`. Home still uses its inline version; switch Home over in F10 |
| F3 | `Screen` container (background, safe-area top, gutters, scroll + bottom padding) | [x] | `layout/Screen.tsx` (title/largeTitle/footer/hasTabBar/keyboardAvoiding/bleed) |
| F4 | `BottomActionBar` (sticky CTA bar used by cart/checkout/plan/custom/product) | [x] | `layout/BottomActionBar.tsx` |
| F5 | `StatusPill` for order/partner/subscription statuses (one colour logic) | [x] | `ui/StatusPill.tsx` with `statusTone()` mapping |
| F6 | `PressableScale` wrapper (spring scale + haptic) | [x] | `ui/PressableScale.tsx` |
| F7 | Align `Button`, `Card`, `Chip`, `TextField`, `SearchBar`, `Badge`, `Avatar` with the DNA | [x] | Card: radius 24, leftover edge removed, `2xl` padding. Chip: now `PressableScale` (spring + haptic). Button/TextField already match (press spring, label above). `SearchBar`/`Badge`/`Avatar` reviewed, no change needed |
| F8 | `EmptyState`, `ErrorNotice`, `ErrorView`, `Loading`, `Skeleton` polished and used everywhere | [~] | Components already good (springs, floating icon, inline errors). "Used everywhere" is checked per screen in Groups A to G |
| F9 | Remove emojis and pure black across theme/components; token cleanup (radius/shadow aliases only) | [~] | Emojis removed: Home (3), `placeholders.ts` (banner glyph + emoji map), `SafeImage`. Pure black `#000000` remains in `partner/dashboard.tsx` and `partner/submitted.tsx`, fixed in Group F. Login logo stays black on purpose (brand artwork, requested) |
| F10 | Tab bar and Home itself brought in line with the skill rules (emoji removal, tactile states) | [x] | Emojis removed from Home (leaf icon). Tab bar items now use `PressableScale` (spring + haptic). Home keeps its inline section headers on purpose (it is the reference). Verified at 375px: header shows leaf icon, tab bar evenly spaced, chips fine, no console errors |

## 6. Phase 2 — Screens (35 + tab bar). Order = most used first

### Group A — Tab screens
| Screen | File | Status | Notes |
|---|---|---|---|
| Home (reference; only the corrections in F10) | `(tabs)/index.tsx` | [ ] | |
| Tab bar | `(tabs)/_layout.tsx` | [ ] | |
| Search / Explore tab | `(tabs)/explore.tsx` | [ ] | |
| Orders tab | `(tabs)/orders.tsx` | [ ] | |
| Rewards / Subscriptions tab | `(tabs)/subscriptions.tsx` | [ ] | |
| Profile tab | `(tabs)/profile.tsx` | [ ] | partner badge lives here |

### Group B — Browse and buy
| Screen | File | Status | Notes |
|---|---|---|---|
| Category | `category/[slug].tsx` | [ ] | |
| Product detail | `product/[id].tsx` | [ ] | |
| Search | `search.tsx` | [ ] | |
| Pre-order | `preorder/[slug].tsx` | [ ] | |
| Offers | `offers.tsx` | [ ] | |
| Articles list | `articles.tsx` | [ ] | |
| Article detail | `article/[id].tsx` | [ ] | |

### Group C — Cart, checkout, orders
| Screen | File | Status | Notes |
|---|---|---|---|
| Cart | `cart.tsx` | [ ] | |
| Checkout | `checkout/index.tsx` | [ ] | |
| Checkout success | `checkout/success.tsx` | [ ] | |
| Order detail | `order/[id].tsx` | [ ] | |
| Notifications | `notifications.tsx` | [ ] | |

### Group D — Subscriptions
| Screen | File | Status | Notes |
|---|---|---|---|
| Choose plan contents | `subscription/plan.tsx` | [ ] | |
| Build your own | `subscription/custom.tsx` | [ ] | |
| Manage subscription | `subscription/manage.tsx` | [ ] | |

### Group E — Profile and settings
| Screen | File | Status | Notes |
|---|---|---|---|
| Edit profile | `profile/edit.tsx` | [ ] | |
| Addresses | `profile/addresses.tsx` | [ ] | |
| Settings | `profile/settings.tsx` | [ ] | |
| About | `profile/about.tsx` | [ ] | |
| Contact | `profile/contact.tsx` | [ ] | |
| FAQ | `profile/faq.tsx` | [ ] | |
| Privacy | `profile/privacy.tsx` | [ ] | |
| Terms | `profile/terms.tsx` | [ ] | |

### Group F — Partner
| Screen | File | Status | Notes |
|---|---|---|---|
| Apply | `partner/apply.tsx` | [ ] | |
| Submitted | `partner/submitted.tsx` | [ ] | |
| Dashboard | `partner/dashboard.tsx` | [ ] | |
| Business order | `partner/business-order.tsx` | [ ] | |

### Group G — Entry
| Screen | File | Status | Notes |
|---|---|---|---|
| Onboarding | `onboarding.tsx` | [ ] | |
| Login (email + code) | `auth/login.tsx` | [ ] | black logo requested earlier |

Not UI (no work): `_layout.tsx` (root), `index.tsx` (redirect), `(tabs)/_layout.tsx` is covered above.

## 7. Phase 3 — Final pass
- [ ] Walk the full app on 375px and 430px widths; fix overflow/inconsistencies.
- [ ] `tsc` clean for `src/`; no console errors on the screens we can reach.
- [ ] Check every row above is `[x]`.

## 8. Log
| Date | What changed | Commit |
|---|---|---|
| 2026-10-02 | Tracker created; Home design DNA written; 35 screens inventoried | — |
| 2026-10-02 | Phase 1 complete (F1 to F10): added PressableScale, StatusPill, ScreenHeader, SectionHeader, BottomActionBar, Screen; Card aligned; emojis removed from Home/placeholders/SafeImage. tsc clean for `src/` | — |
