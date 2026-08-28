# MiniGreens (MGC Platform) — Build Plan & Session Log

> **For Claude:** Read this file FIRST at the start of any session working on this rebuild.
> It tells you what's done, what's in progress, and the exact next step. Update the
> "Session Log" and "Current Status" sections before your context runs out, so the next
> session can resume cold with no lost work. Do not restart planning from scratch —
> trust this file over your own assumptions about progress.

## Source of truth

- Gap analysis vs `D:\Mobile APP.pdf` (MGC Platform spec) was done in chat on 2026-08-18.
- Target: turn the current customer-only mock-data app into the full MGC platform —
  Customer / Partner / Café-Shop / Admin roles on one Supabase backend.
- Backend/DB choice: **Supabase** (Postgres + Auth + Storage + Realtime), confirmed by user.
- Full phased plan (Phase 0–4) is below under "Phases."

## Current Status — READ THIS FIRST

**Phase: 4 — Payments — DONE (2026-08-20), verified end-to-end**

### Phase 4 finished (2026-08-20, continuation session)

Picked up at step 2 of the plan below (step 1, the cart store, was already done). Built
everything through step 11:

- **Cart wired into the UI**: [ProductCard.tsx](src/components/product/ProductCard.tsx)'s
  "Add To Cart" (default variant) and the `+` pill (compact variant) now call
  `useCartStore.getState().addItemBySlug(...)` via a nested `Pressable` so the card's own
  `onPress` doesn't also fire.
- [product/[id].tsx](src/app/product/[id].tsx): header heart icon replaced with a cart
  icon + live badge (`useCartStore(s => s.items.length)`) routing to `/cart`; bottom CTA
  changed from the old "Preorder Now" to "Add to Cart" (adds the selected quantity, then
  routes to `/cart` on success).
- New [src/app/cart.tsx](src/app/cart.tsx) — lists cart items (qty +/-, remove), subtotal,
  "Proceed to Checkout" → `/checkout`. Empty state routes to Explore.
- **`preorder.tsx` retired**, replaced with a 3-step real checkout flow:
  - [checkout/index.tsx](src/app/checkout/index.tsx) — Review (real cart items) →
    Delivery (date/time/notes) → Address (real `addresses` table, live-fetched) → on
    confirm, inserts one real `orders` row (`order_type='standard'`, `status='pending'`)
    + one `order_items` row per cart item, then routes to `/checkout/pay`.
  - [checkout/pay.tsx](src/app/checkout/pay.tsx) — the Razorpay WebView screen per the
    original plan: calls `supabase.functions.invoke('create-razorpay-order', ...)`,
    renders a local HTML string embedding `checkout.js`, and on the `handler`/`ondismiss`
    callbacks posts a message back to RN, which calls
    `supabase.rpc('verify_razorpay_payment', ...)` and routes to success/failure states.
  - [checkout/success.tsx](src/app/checkout/success.tsx) — confirmation screen (fetches
    the real order for the summary).
  - Installed `react-native-webview` via `npx expo install` (wasn't installed before).
  - [order/[id].tsx](src/app/order/[id].tsx) shows a "Retry Payment"/"Complete Payment"
    button routing back into `/checkout/pay` whenever `payment_status !== 'paid'`.
- **Real addresses**: [profile/addresses.tsx](src/app/profile/addresses.tsx) rewritten
  from mock data to the live `addresses` table — list/add/edit/delete/set-default, using
  a bottom-sheet `Modal` form (no new UI library needed). RLS already permitted this from
  Phase 0, no migration needed.
- **Orders + order detail wired live**:
  [(tabs)/orders.tsx](src/app/%28tabs%29/orders.tsx) and
  [order/[id].tsx](src/app/order/[id].tsx) now read the real `orders`+`order_items`
  (+`addresses` for the detail screen) tables for the signed-in user via
  `useFocusEffect`, replacing mock data entirely. Both show `payment_status` alongside
  order `status`.
- **Admin Orders wired live**:
  [orders/page.tsx](admin/app/dashboard/%28protected%29/orders/page.tsx) now server-fetches
  `orders` joined with `order_items`, `profiles` (customer name), and `addresses`, same
  pattern as every other Phase 2/3 admin page.
  [OrdersClient.tsx](admin/components/OrdersClient.tsx) adds a Payment column/badge next
  to Status, and the drawer's "Save Status" button is now wired to a real server action
  ([orders/actions.ts](admin/app/dashboard/%28protected%29/orders/actions.ts)) instead of
  being decorative. This is the "Payment status reflected in Admin Orders" checklist item
  — done.
- **Found and fixed a real pre-existing type gap** while wiring this up:
  [database.ts](src/types/database.ts) was missing the Phase 4 migration's payment
  columns (`razorpay_order_id`/`razorpay_payment_id`/`razorpay_signature`/
  `payment_status`) entirely — added them, plus a `PaymentStatus` type and a `Functions`
  entry for `verify_razorpay_payment` so `supabase.rpc(...)` type-checks. Separately,
  every table's hand-written `Relationships` field was `[]` — this had been silently
  fine for every join used so far (single embed, or two embeds off different base
  tables), but the new admin Orders query (`orders` embedding `order_items` + `profiles`
  + `addresses` together) hit a real `tsc` failure: supabase-js's typed-embed resolver
  needs real `Relationships` metadata to disambiguate multiple simultaneous embeds, and
  without it produces `SelectQueryError` types. Fixed by adding proper
  `foreignKeyName`/`columns`/`referencedRelation`/`referencedColumns` entries for every
  FK actually used in a join across both apps (`addresses.profile_id`,
  `orders.profile_id`, `orders.delivery_address_id`, `order_items.order_id`,
  `order_items.product_id`, `subscriptions.profile_id`/`plan_id`/`address_id`,
  `partners.profile_id`). This also happened to reveal (and fix) a **pre-existing**
  broken type on the untouched `subscriptions` admin page
  ([subscriptions/page.tsx](admin/app/dashboard/%28protected%29/subscriptions/page.tsx))
  that had apparently been silently broken since Phase 2 — same root cause, same fix.
- Both apps type-check clean (`npx tsc --noEmit` at repo root for mobile,
  `cd admin && npx tsc --noEmit` for admin).
- **Verified live end-to-end in the browser preview** (admin login password was supplied
  fresh by the user this session, not reset): logged in, confirmed the Orders page
  renders correctly against the genuinely-empty real `orders` table (all-zero tabs, "No
  orders match your filters"), then inserted a disposable test order + order_item via
  service_role (customer = the admin's own profile, since no real checkout has happened
  yet), reloaded, and confirmed the row rendered correctly — customer name via the
  `profiles` join, item summary, total, status badge, and the new payment badge all
  correct. Opened the drawer (via `javascript_tool`, same blind-spot-in-inspection-tool
  caveat as the Phase 1 Partners drawer — `position: fixed` elements don't show up in
  `read_page`/`get_page_text`), changed status to "Confirmed" via the select + "Save
  Status" button, and confirmed via a direct query that `orders.status` actually flipped
  in Postgres — the server action works. Deleted the test order + item afterward and
  reloaded to confirm the table is back to genuinely empty.
- Scratch scripts used for the service-role test-data insert/cleanup were written to the
  session scratchpad directory (not the repo) and deleted immediately after use, per the
  established pattern — they briefly held the service_role key inline, never committed.

### Mobile checkout/cart/payment flow — actually exercised (2026-08-20, later same day)

The "no real device/simulator available" caveat above turned out to be dodgeable: this
project has `react-native-web` + an unused `web` script (`expo start --web`) already in
`package.json`. Tried it — first attempt via the Browser pane's `preview_start` hung
indefinitely at "Starting Metro Bundler" with the port never opening (a real hang, not
just slow: same result across two separate launches). Root cause: Expo CLI's `--non
-interactive` flag isn't recognized by this Expo SDK version ("use $CI=1 instead") and it
was silently blocking on a stdin prompt that never arrives in a non-TTY background shell.
**Fix, for next time**: launch with the `CI` env var set (`$env:CI = "1"` in PowerShell)
via a detached `Start-Process -FilePath cmd.exe -ArgumentList "/c","npx expo start --web
--port <port>"` (plain `npx` isn't directly `Start-Process`-able on Windows — it's a
`.cmd` shim, needs the `cmd.exe /c` wrapper) — this actually opened the port within ~30s
and finished its first bundle (1740 modules) in about 4 minutes.

Added a `"MiniGreens Mobile Web"` entry to [.claude/launch.json](.claude/launch.json) for
future sessions (`expo start --web --port 8090`) — **note it still needs `CI=1` in the
environment to avoid the interactive-prompt hang**; the launch.json entry alone isn't
sufficient if the preview tool doesn't set that env var, in which case fall back to the
manual `Start-Process`/`CI=1` recipe above.

**Two real caveats about this verification path, so a future session doesn't
over-trust it**:
1. `react-native-webview` has no web target at all (confirmed: no `.web.tsx`/`.web.js`
   variant in the package) — the actual Razorpay checkout iframe can never be exercised
   this way, only everything up to and including the `create-razorpay-order` Edge
   Function call that happens just before the WebView would mount.
2. The Browser pane's `computer{action:"screenshot"}` never worked this session ("the
   Browser pane is not displayed") — all verification below was DOM-level
   (`javascript_tool`, reading `innerText`/`innerHTML`), same as every admin-dashboard
   verification in earlier phases. One extra wrinkle specific to this app: Reanimated's
   `entering={FadeInUp...}` animations start every element at `visibility: hidden` and
   animate it visible — normally invisible to a user but it means `element.innerText`
   reads empty even when the DOM is fully correct. Worked around by cloning the subtree
   and forcing `visibility: visible` on every hidden node before reading `innerText`
   (`el.cloneNode(true)` + `querySelectorAll` override) — this is a read-only inspection
   trick, not a code change, and is worth reusing if verifying this app in a headless
   browser again.

**What was actually walked through, end-to-end, in real bundled RN code (not a script
standing in for it)**, all against the live Supabase project, using the same admin
account (email/password auth works for any role, not just admin — role only gates the
admin *dashboard*, not Supabase Auth itself):
1. Onboarding → Skip → `/auth/login` → signed in with real credentials → correctly
   routed to the tab navigator.
2. Home tab rendered 11 real "Add To Cart" buttons from live `products`. Clicked one —
   confirmed via DOM inspection of `/cart` (using in-app `history.pushState` +
   `popstate` navigation, not a hard reload, since the cart store is intentionally
   in-memory-only and a hard reload would have reset it) that the real product
   (**Strawberry Banana Glow, ₹99.00**) was resolved from Supabase by slug and added
   with the correct subtotal — confirms `ProductCard`'s nested-`Pressable` wiring
   doesn't also trigger card navigation (URL stayed on `/` after the click).
3. "Proceed to Checkout" → Review step showed the real cart item and correct math
   (₹99.00 + ₹35.49 delivery = ₹134.49) → Delivery step accepted real text input →
   Address step correctly showed "No saved addresses yet." (genuinely true for this
   profile) → "Add New Address" routed to `/profile/addresses`.
4. Filled and submitted the real address form (Modal) — confirmed it wrote to the live
   `addresses` table and rendered back correctly (label, default badge, full address,
   phone).
5. Returned to `/checkout` (fresh mount, so had to re-click through Review → Delivery →
   Address) — the just-created address now appeared and was pre-selected as the
   default. Clicked "Place Order".
6. **This actually inserted a real row into `orders` and `order_items`** (verified via a
   direct Postgres query with the real IDs from the URL the app navigated to) — correct
   `profile_id`, `delivery_address_id`, `subtotal`/`delivery_fee`/`total`, `order_type`,
   and `status='pending'`. The app then auto-navigated to
   `/checkout/pay?orderId=<real-uuid>`.
7. **The `create-razorpay-order` Edge Function call from `checkout/pay.tsx` genuinely
   fired and succeeded** — confirmed by the fact that `razorpay_order_id` on the fetched
   order row was a real Razorpay order id (`order_TS2GrPQJ91RPmL`), which only gets
   written by that Edge Function. This is a stronger verification of the payment-screen
   code than last session's scripted RPC test, because this time it ran from the actual
   `checkout/pay.tsx` component's real `useEffect`, not a hand-written substitute script.
   The screen then correctly fell back to react-native-webview's own "does not support
   this platform" message instead of crashing (expected — see caveat 1 above).
8. Navigated to `/orders` and to `/order/<id>` (via in-app navigation) — both correctly
   rendered the real order: order number, both status badges, item, date, total, full
   payment summary, and the joined delivery address. The order-detail screen's
   "Complete Payment"/"Retry Payment" button (shown because `payment_status !== 'paid'`)
   correctly routed back to `/checkout/pay?orderId=...`.
9. Cleaned up afterward: deleted the test `order_items` row, the `orders` row, and the
   test `addresses` row via service_role, confirmed both tables are back to empty.
   Stopped both dev servers (the Browser-pane-tracked one and the manually
   `Start-Process`-launched one — **the manual one is NOT tracked by `preview_stop` and
   has to be killed by PID via `Get-CimInstance Win32_Process` +
   `Stop-Process -Force`**, worth remembering if this recipe is reused).

**This resolves the "never run outside `tsc`" caveat for the cart/checkout/orders/
addresses code paths** — they're now genuinely proven correct against live data, not
just type-checked. The one thing still never exercised is the Razorpay checkout iframe
itself (the actual card-entry UI and the `handler`/`ondismiss` postMessage callbacks),
since that requires a real native WebView (Android/iOS), which this environment still
cannot provide. If a physical device or simulator becomes available, that's the one
remaining piece worth walking through by hand — everything else in the payment flow
(order creation, Edge Function call, RPC verification logic, UI states before/after
payment) is now verified.

### Phase 4 history (pre-continuation, kept for context)

### What's done and verified (backend payment infrastructure)

Razorpay test-mode credentials are stored (never in git — see "How secrets are stored"
below):
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_test_sB1CuLDdPp4G2R` (publishable, safe client-side)
- Key Secret is in the DB only, see below (never put it in a file or chat again this
  session — it's already stored, just reuse `public.get_razorpay_credentials()`)

**Migrations pushed** (all under `supabase/migrations/`, applied in order):
- `20260820180000_payments.sql` — `orders` gained `razorpay_order_id`,
  `razorpay_payment_id`, `razorpay_signature`, `payment_status` (check: pending/paid/
  failed) columns. Also created `private` schema + `private.secrets` table (key/value,
  RLS-locked, and — important gotcha below — **invisible to PostgREST entirely, even for
  service_role**) and a first version of `public.create_razorpay_order()` that turned out
  to be broken (see next point).
- `20260820190000_fix_razorpay_order_creation.sql` — dropped that broken function.
  **Root cause**: the Postgres `http` (pgsql-http) extension has a real bug calling
  Razorpay's `POST /v1/orders` — confirmed via direct testing that plain `GET` requests
  succeed but `POST` fails with `OpenSSL SSL_read: SSL_ERROR_SYSCALL` regardless of
  headers/auth. **Do not retry the `http`-extension approach for calling Razorpay from
  Postgres — it's a dead end, verified.** Order creation now happens in a Supabase Edge
  Function instead (Deno's native `fetch` has no such issue).
- `20260820191000_fix_secrets_access.sql` — added `public.get_razorpay_credentials()`,
  a `SECURITY DEFINER` function returning `(key_id, key_secret)` from `private.secrets`,
  with `execute` revoked from `public/anon/authenticated` and granted only to
  `service_role`. **Why this exists**: `private.secrets` can't be queried directly via
  PostgREST/the JS client's `.schema('private')` — Supabase's REST gateway only exposes
  the `public` schema (and `graphql_public`) by default, full stop, regardless of role.
  This `public`-schema RPC is the workaround; the Edge Function calls it with the
  service-role key.
- `20260820192000_fix_hmac_verify.sql` then `20260820193000_fix_hmac_search_path.sql` —
  two iterations fixing `public.verify_razorpay_payment()`. **Gotcha**: pgcrypto's
  `hmac()` (and other pgcrypto functions) live in Supabase's `extensions` schema, not
  `public` — a `SECURITY DEFINER` function needs `set search_path = public, extensions`
  or `hmac()` isn't found, even though `create extension pgcrypto` "succeeded". The final
  version in `20260820193000` is correct and tested (see below).

**Edge Function deployed**: `supabase/functions/create-razorpay-order/index.ts`. Takes
`{ order_id }`, uses the caller's own JWT to read the order (RLS —
`orders_select_own_or_admin` — naturally enforces ownership, no manual check needed),
uses a service-role client to call `get_razorpay_credentials()` + create the Razorpay
order via `fetch()`, writes `razorpay_order_id` back, returns
`{ razorpay_order_id, amount, currency, key_id }` for the client to open Checkout with.
Deployed via
`SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy create-razorpay-order --project-ref xdjpwulpkuykxrxqalrh --use-api`
(`--use-api` avoids needing local Docker). **The access token used to deploy was a
one-off personal access token the user generated and pasted in chat — it was used only
for that command and was not stored anywhere. If you need to redeploy this function or
add another one, ask the user for a fresh token the same way** (Account Settings →
Access Tokens on supabase.com, generate, paste, use immediately).

**Both pieces verified live end-to-end** via a disposable test order (created, tested,
deleted — same pattern as every other phase):
- `create-razorpay-order` Edge Function: returned a real Razorpay order
  (`order_TRzTFvxPFQHvdj`) with correct amount (order total × 100 paise) and the right
  key_id.
- `public.verify_razorpay_payment(order_id, payment_id, signature)`: correctly returned
  `false` for a wrong signature (and set `payment_status='failed'`), `true` for a
  correctly-computed HMAC-SHA256 signature (and set `payment_status='paid'`,
  `status='confirmed'` if it was `'pending'`).

**How secrets are stored** — for this project's pattern going forward: DB-side secrets
(Key Secret, used by both the Edge Function's RPC call and the Postgres verify function)
live in `private.secrets`, inserted via a one-off `pg` connection script written to the
scratchpad directory and deleted immediately after — **never** committed to a migration
file (that would put the plaintext secret in git history). If you need to rotate or add
a secret, follow that same pattern: write a throwaway Node script using the `pg` package
(see "Direct Postgres access" below for how), run it, delete it.

**Direct Postgres access recipe** (needed repeatedly this session for things Postgres
internals hide from PostgREST — checking `pg_cron`/`pg_net` state, inserting into
`private.secrets`, debugging `hmac()`'s schema): no `psql` binary is available in this
environment, and `npx --yes -p pg node -e "..."` inexplicably swallows stdout. What
works: write a `.js` file to the scratchpad directory with `Write`, `cd` into scratchpad
and `npm install pg --no-save` once per session (fast, cached), then run
`NODE_PATH="<scratchpad>/node_modules" node "<scratchpad>/script.js"` from the repo root
(don't `cd` first — some path resolution is flaky when combined with `cd` in this
sandbox). Delete the script when done if it touched secrets.

### What's NOT done — this is the actual next step

**The mobile app has no real checkout at all** — this was discovered mid-session and is
why Phase 4 is bigger than "add Razorpay to an existing checkout." Confirmed by reading
the code, not assumption:
- `src/app/preorder.tsx` hardcodes `products[0]` regardless of which product was tapped,
  and never writes to Supabase — it's a UI mockup only.
- `src/app/(tabs)/orders.tsx` reads the mock `orders` array, not the real `orders` table.
- `src/app/profile/addresses.tsx` reads the mock `addresses` array, not the real
  `addresses` table (this was already known from the Phase 2 pre-existing-bugs pass, but
  the `.type` field bug was fixed there — the screen itself is still mock-data-only).
- `src/components/product/ProductCard.tsx`'s "Add To Cart" button is decorative — no
  `onPress`, no cart state exists anywhere (`grep -rn "cart" src` before this session
  found zero real cart infrastructure).
- `src/app/product/[id].tsx` still reads from mock `products`, not live Supabase.

**User was asked and explicitly chose "build it all now"** (not a minimal stub) when
this gap was surfaced — see Session Log below for the exact exchange. So the remaining
Phase 4 work is:

1. **`src/store/useCartStore.ts` — DONE**, already built this session. Zustand store,
   `addItemBySlug(slug, qty)` resolves the *real* Supabase product by slug (mock and
   live product slugs match — they came from the same seed source, confirmed by spot
   check) and stores the item with the real product UUID, so `order_items.product_id`
   will be a valid FK. `removeItem`, `updateQuantity`, `clearCart`, `cartSubtotal()`
   helper. In-memory only (no persistence across app restarts) — acceptable scope trim,
   not yet flagged to the user, mention it if it matters.
2. **Wire "Add to Cart"** in `ProductCard.tsx` (`default` and `compact` variants) to call
   `useCartStore.getState().addItemBySlug(...)` — needs a nested `Pressable` around just
   the cart button/pill so it doesn't also trigger the card's own `onPress` (React
   Native's touch responder system: the innermost `Pressable` that claims the touch wins,
   it won't bubble to the parent — this is a known-safe pattern, not a risk).
3. **Product detail** (`src/app/product/[id].tsx`) — still reads from mock `products` for
   display (out of scope per the user's answer, which was about checkout/addresses/
   orders, not the whole catalog browsing UI — re-confirm scope with the user if unsure,
   don't unilaterally expand further). Just fix the bottom CTA: replace "Preorder Now"
   with "Add to Cart" (calls the cart store with the selected `quantity`) and a cart icon
   in the header (badge = `useCartStore(s => s.items.length)`) routing to a new
   `src/app/cart.tsx`.
4. **New `src/app/cart.tsx`** — list cart items, qty +/-, remove, subtotal, "Checkout"
   button → routes into the checkout flow.
5. **Rework `src/app/preorder.tsx` into a real checkout** (or build a new
   `src/app/checkout/index.tsx` and retire preorder.tsx — either is fine, use judgement
   once in the code) — Review (real cart items, not hardcoded) → Delivery (date/time/
   notes) → Address (real `addresses` table, see next point) → on confirm: insert one
   real `orders` row (`order_type='standard'`, `status='pending'`, `payment_status`
   defaults to `'pending'`) + one `order_items` row per cart item, then proceed to
   payment (next point).
6. **Real addresses** — wire `src/app/profile/addresses.tsx` to the live `addresses`
   table (list/add/edit/delete/set-default via `supabase.from('addresses')`, RLS already
   permits `profile_id = auth.uid()` for all operations — no new migration needed, the
   policies already exist from Phase 0's `addresses_all_own`). The checkout flow's
   address step needs this to select a real `address_id` for the order.
7. **Razorpay payment screen** — a WebView (`react-native-webview` — **not installed
   yet**, run `npx expo install react-native-webview` first) loading a small local HTML
   string that embeds Razorpay's `checkout.js`, configured with the
   `{razorpay_order_id, amount, currency, key_id}` from calling
   `supabase.functions.invoke('create-razorpay-order', { body: { order_id } })`. On
   Razorpay's `handler` callback (success) or `ondismiss` (cancel), have the embedded JS
   `window.ReactNativeWebView.postMessage(...)` the result back; the RN side's
   `onMessage` reads `razorpay_payment_id`/`razorpay_signature`, calls
   `supabase.rpc('verify_razorpay_payment', { p_order_id, p_razorpay_payment_id,
   p_razorpay_signature })`, and routes to a confirmation screen (clear the cart) on
   `true`, or shows a retry/failure state on `false`.
   **Reminder of the earlier architecture decision**: WebView was chosen over the native
   `react-native-razorpay` SDK specifically because the mobile app has never been run on
   a device/simulator (native modules would need an EAS dev-client build, a bigger new
   requirement); WebView stays testable in Expo Go. Don't silently switch to the native
   SDK without re-confirming with the user, since it changes the testing story.
8. **Wire `src/app/(tabs)/orders.tsx` and `src/app/order/[id].tsx`** to the real `orders`
   (+`order_items`) table for the logged-in user, replacing mock data, showing
   `payment_status`.
9. **Admin Orders live** — `admin/app/dashboard/(protected)/orders/page.tsx` and
   `admin/components/OrdersClient.tsx` currently read `admin/lib/data.ts` mock data (this
   was true since before Phase 1, confirmed still true this session). Wire to the real
   `orders` table (join `profiles` for customer name, same pattern as every other admin
   page built in Phase 2/3), show `payment_status` as a column/badge. This is the
   explicit "Payment status reflected in Admin Orders" checklist item.
10. **Type-check both apps + verify live** once built, same rigor as every other phase —
    create a disposable test order through the *actual UI* if at all possible (the
    Browser pane can't drive the mobile app the way it drives the admin Next.js app;
    for the mobile pieces, verifying via direct Supabase queries after manually walking
    the flow, or via the same kind of scripted RPC calls used to verify the backend this
    session, is the fallback — note clearly in this file which verification method was
    actually used for which piece).
11. **Update this file** when done, same as every phase.

**A new session should start by re-reading this entire section, then picking up at step
2** (step 1's cart store already exists). Do not re-derive the "no real checkout exists"
finding from scratch — it's confirmed above, trust it.

## Phase 3 Detail (DONE, 2026-08-20)

**Phase: 3 — Automation & reporting — DONE (2026-08-20), verified end-to-end**

- **Expo/EAS account created this session.** Project linked via `"extra":
  {"eas":{"projectId":"9214a803-7b08-4c1e-844d-4b3c19b751e1"}}` in
  [app.json](app.json). No paid tier needed — Expo push notifications are free
  regardless of usage; only EAS Build/Update at volume cost money, and this project
  doesn't use those yet.
- Installed `expo-notifications` + `expo-device`, added the `expo-notifications` config
  plugin to `app.json`.
- Migration [supabase/migrations/20260820140000_notifications.sql](supabase/migrations/20260820140000_notifications.sql)
  pushed live:
  - `profiles.push_token text` column.
  - `pg_net` extension + `public.send_expo_push_notification(token, title, body, data)`
    — calls Expo's push API (`https://exp.host/--/api/v2/push/send`) directly from
    Postgres via `net.http_post`. **No Expo access token needed** — Expo's push send
    endpoint is keyed by the device's push token itself, not a project credential.
    Wrapped in `exception when others then null` so a bad/stale token can never break
    the order/profile write that triggered it.
  - Trigger `orders_notify_status_change` (after insert or update of `status` on
    `orders`) → `public.notify_order_status_change()` — pushes "Order placed" on
    insert, then a status-specific message (confirmed/processing/shipped/delivered/
    cancelled) whenever `status` changes, straight to the customer's `push_token`.
  - `public.send_birthday_offers()` — finds profiles whose `date_of_birth` matches
    today and have a `push_token`, sends a push referencing the currently-active
    `discounts` row with `is_birthday_offer = true` (managed via the Phase 2 Discounts
    admin page — no separate birthday admin UI needed).
  - `pg_cron` extension + a daily `birthday-offers-daily` job at 09:00 UTC calling
    `send_birthday_offers()`. Confirmed live via a direct `pg` connection query
    (`select * from cron.job` → `active: true`) since neither `pg_net` nor `pg_cron`
    internals are exposed through PostgREST — verify this way again if touching it.
- Mobile [src/lib/notifications.ts](src/lib/notifications.ts) — sets the foreground
  notification handler, `registerForPushNotificationsAsync()` (skips gracefully on
  simulators/web via `Device.isDevice`, requests permission, reads the EAS project ID
  from `Constants.expoConfig.extra.eas.projectId`), `syncPushTokenForUser()` writes the
  token to `profiles.push_token`. Wired into
  [src/store/useAuthStore.ts](src/store/useAuthStore.ts)'s `fetchProfile` so it runs on
  every login/session-restore.
- Admin Reports module:
  [admin/app/dashboard/(protected)/reports/page.tsx](admin/app/dashboard/%28protected%29/reports/page.tsx)
  (server component, aggregates live `orders`/`order_items`/`profiles`/`partners`/
  `subscriptions`/`subscription_plans`/`discounts`) +
  [admin/components/ReportsClient.tsx](admin/components/ReportsClient.tsx) (6 summary
  cards, 5 tabbed report sections — Sales, Products, Partner Payouts, Subscriptions,
  Discounts — each with a client-side CSV export button, no library needed). Added to
  [admin/components/Sidebar.tsx](admin/components/Sidebar.tsx) main nav.
- **Scope reduction, noted not hidden:** the Phase 3 checklist said "PDF/Excel export";
  built CSV only (opens fine in Excel, no added dependency). Add a real PDF/XLSX export
  library later if the user specifically wants those formats.
- **WhatsApp-to-admin notifications were NOT built** — still blocked on a WhatsApp
  Business Solution Provider account/credentials, which don't exist yet. Nothing was
  stubbed for it (no dead placeholder code); wire it up once BSP creds exist, following
  the same `pg_net`-from-a-trigger pattern used for push notifications, or a Supabase
  Edge Function if the BSP needs a signed request the trigger can't build inline.
- Both apps type-check clean (`npx tsc --noEmit` at repo root for mobile, `cd admin &&
  npx tsc --noEmit` for admin).
- **Verified live end-to-end**: logged into the admin dashboard, confirmed the Reports
  page correctly shows all-zero summary cards against the real (genuinely empty)
  `orders` table, then inserted a disposable test order + order_item via service_role,
  confirmed both the Sales tab (customer name, total, status) and the Products tab
  (units × price aggregation) reflected it correctly, clicked Export CSV and confirmed
  no console errors, then deleted the test rows. Confirmed the `pg_cron` job and the
  order-status trigger both exist and are active via a direct Postgres connection.
  Push notifications themselves are **not yet exercised on a real device** — that
  requires the mobile app running with EAS credentials and a physical device or a
  development build, which is outside what this session's tooling can drive (folded
  into the existing "mobile never run outside `tsc`" caveat below).

A real device/simulator test pass for mobile is still an open, unrelated caveat (never
been run outside `tsc`, ongoing since Phase 0) — this would also be the point to
actually verify push notifications arrive on a device, not just that the pipeline is
wired correctly server-side.

## Phase 2 Detail (DONE, 2026-08-20)

**Phase: 2 — Commerce completeness — DONE (2026-08-20), verified end-to-end**

Everything in the Phase 2 checklist below is built, type-checked, and verified live:

- Migration [supabase/migrations/20260820090000_discounts_and_products.sql](supabase/migrations/20260820090000_discounts_and_products.sql)
  pushed live (`discounts` table + `products.is_preorder`).
- [src/types/database.ts](src/types/database.ts) updated with `discounts` table,
  `products.is_preorder`, `DiscountType`/`DiscountTarget` types.
- Admin Products page: [admin/app/dashboard/(protected)/products/page.tsx](admin/app/dashboard/%28protected%29/products/page.tsx)
  + [actions.ts](admin/app/dashboard/%28protected%29/products/actions.ts) +
  [admin/components/ProductsClient.tsx](admin/components/ProductsClient.tsx) — tabs
  (All/Featured/Pre-order/Out of Stock), drawer to edit price/stock/flags, delete,
  "Add Product" modal with auto-slug.
- Admin Discounts page: same pattern under `.../discounts/` +
  [admin/components/DiscountsClient.tsx](admin/components/DiscountsClient.tsx) — CRUD
  over `discounts` (code, type, value, target, min/max order value, expiry, birthday
  flag, active toggle).
- Admin Subscriptions page: `.../subscriptions/page.tsx` +
  [admin/components/SubscriptionsClient.tsx](admin/components/SubscriptionsClient.tsx)
  — read-only list, `subscriptions` joined with `profiles` + `subscription_plans`, tabs
  by status, active-revenue total.
- [admin/components/Sidebar.tsx](admin/components/Sidebar.tsx) — Products/Discounts/
  Subscriptions moved into main nav; Customers/Reports remain in Coming Soon.
- Mobile [src/app/(tabs)/subscriptions.tsx](src/app/%28tabs%29/subscriptions.tsx)
  rewritten to fetch `subscription_plans` live and insert a `subscriptions` row on
  subscribe (`address_id` nullable, not blocked on address). New
  [src/app/subscription/manage.tsx](src/app/subscription/manage.tsx) for pause/resume/
  cancel, registered in `src/app/_layout.tsx`, "My Subscription" added to the profile
  menu in [src/app/(tabs)/profile.tsx](src/app/%28tabs%29/profile.tsx).
- Both apps type-check clean on the Phase-2-touched files. Fixed one pre-existing bug
  found along the way in [src/app/partner/business-order.tsx](src/app/partner/business-order.tsx)
  (orders insert was missing `delivery_address_id`/`delivery_time`, same
  "Insert requires nullable columns explicitly" pattern as the hand-written `Database`
  type everywhere else — now passes `null` for both).
- Fixed a pre-existing config bug in root [tsconfig.json](tsconfig.json): it had no
  `exclude`, so `npx tsc --noEmit` at repo root was also compiling `admin/` and
  `website/` (separate Next.js apps with their own `@/` path aliases), producing a wall
  of false-positive "Cannot find module" errors. Added `"exclude": ["node_modules",
  "admin", "website"]`. Always scope mobile-app type-checks this way going forward —
  don't reintroduce the broad include without an exclude.
- **Verified live end-to-end** in the browser preview: reset the admin login password
  via service_role (the original one from Phase 0 bootstrap was lost, user confirmed a
  reset was fine), logged in, then for each new page created disposable test data
  through the real UI, confirmed it landed in Postgres via REST, and deleted it again —
  Products (toggle `is_preorder` on/off, create+delete a test product), Discounts
  (create+delete a test code), Subscriptions (service_role-inserted test row, confirmed
  the profiles/subscription_plans join renders name/email/plan/price/revenue
  correctly, then deleted). Database is clean of test data, only real records remain.

**Pre-existing issues from before Phase 2 — fixed (2026-08-20):**
- `src/app/profile/addresses.tsx` referenced a nonexistent `Address.type` property;
  switched to deriving the icon from `address.label` (Home/Work/other) and dropped the
  dead `?? address.type...` fallback since `label` is always present.
- `src/app/profile/edit.tsx` referenced a nonexistent `Profile.bio` field; the bio input
  was already local-only UI state (this screen doesn't persist to Supabase yet), so it
  now just initializes from `''` instead of `profile.bio`.
- `src/app/profile/addresses.tsx`, `src/components/product/ProductCard.tsx`,
  `src/components/ui/Card.tsx` used `StyleSheet.absoluteFillObject`, which doesn't exist
  in the installed RN version — replaced with `StyleSheet.absoluteFill` (same shape,
  confirmed via `node_modules/react-native/Libraries/StyleSheet/StyleSheet.d.ts`).
- Mobile app (`npx tsc --noEmit` at repo root, now correctly scoped since the
  `tsconfig.json` exclude fix above) is fully clean, zero errors.

**Next immediate step:** Starting Phase 3 (order-event notifications, WhatsApp-to-admin,
Expo push, birthday-offer automation driven by the new `discounts.is_birthday_offer`
flag, Admin Reports module). A real device/simulator test pass for mobile is still an
open, unrelated caveat (never been run outside `tsc`, ongoing since Phase 0).

## Older Status Detail (Phase 0 + Phase 1, both fully done)

**Phase: 0 — Foundation (in progress)**

Done so far (2026-08-18):
- Supabase project connected: ref `xdjpwulpkuykxrxqalrh`, URL `https://xdjpwulpkuykxrxqalrh.supabase.co`.
- `.env` (root, mobile app — anon key only) and `admin/.env.local` (URL + anon +
  service_role) created and confirmed git-ignored (`git check-ignore -v` passed on both).
- `@supabase/supabase-js` installed in root (mobile) and `@supabase/supabase-js` +
  `@supabase/ssr` in `admin/`.
- `npx supabase init` run — local `supabase/` CLI project scaffolded (not yet linked
  to the remote project; no DB password provided, so nothing pushed remotely yet).
- Schema written: [supabase/migrations/20260818190000_init_schema.sql](supabase/migrations/20260818190000_init_schema.sql)
  — tables: profiles (role enum customer/partner/admin, auto-created via trigger on
  auth.users insert), addresses, categories, products, subscription_plans,
  subscriptions, orders, order_items. RLS enabled on all tables (owner-or-admin pattern,
  public read on catalog tables, `public.is_admin()` helper function).
- Seed data written: [supabase/seed.sql](supabase/seed.sql) — generated programmatically
  from the existing mock data (23 products, 3 categories, 6 subscription plans) via
  `scratchpad/gen_seed.mjs` (in the session temp dir, not part of the repo) to avoid
  transcription errors. Orders were NOT seeded (mock orders reference fake profile/
  address ids that don't map to real auth users — skip until there are real accounts).
- Mobile Supabase client: [src/lib/supabase.ts](src/lib/supabase.ts) — uses MMKV (already
  a dependency) as the auth session storage adapter instead of AsyncStorage. Untyped for
  now (`Database` generic to be wired in after `supabase gen types typescript` is run
  against the pushed schema).
- Admin Supabase clients: [admin/lib/supabase/client.ts](admin/lib/supabase/client.ts)
  (browser), [admin/lib/supabase/server.ts](admin/lib/supabase/server.ts) (cookie-based
  SSR client, respects RLS), [admin/lib/supabase/admin.ts](admin/lib/supabase/admin.ts)
  (service_role client, server-only via the `server-only` package guard).

**Migration + seed are LIVE and verified** (2026-08-18): pushed via
`supabase db push --db-url <pooler-url>` (direct `db.<ref>.supabase.co` connection is
IPv6-only and unreachable from this dev machine — had to use the connection **pooler**
host instead: `aws-0-ap-southeast-2.pooler.supabase.com:5432`, username
`postgres.<project-ref>`). Seed applied via a one-off Node script using the `pg` package
(installed with `--no-save`, then removed from `node_modules` afterward — not a real
project dependency). Verified via REST API: `GET /rest/v1/products` returns all 23 rows
with anon key, confirming RLS public-read policy works.

`supabase gen types typescript` does NOT work in this environment even with `--db-url`
— the installed CLI version requires Docker/Podman for that command specifically, and
neither is installed. Worked around it: [src/types/database.ts](src/types/database.ts)
was hand-written to match the migration exactly. If Docker ever becomes available,
regenerate with `supabase gen types typescript --db-url "<pooler-url>" --schema public`
and diff against the hand-written version before replacing it.

**IMPORTANT — project ref correction:** the project ref is `xdjpwulpkuykxrxqalrh` (note
the "k" — `...kuyk...`). An earlier version of this file and the first `.env` writes had
it wrong as `xdjpwulpkuyxrxqalrh` (dropped the k while manually decoding the JWT payload).
Confirmed correct via DNS resolution test and the user's dashboard connection string. If
anything still references the `xdjpwulpkuyxrxqalrh` spelling, it's stale — fix it.

**DB password used but not stored anywhere in the repo** — it was passed inline on the
CLI (`--db-url`) for the one-time push/seed/type-gen attempts and is not saved in any
`.env` file, migration, or this doc. If a future session needs to push more migrations,
ask the user for it again (or set up `supabase link` with a saved access token instead).

**Auth is DONE for both apps** (2026-08-19):

- Mobile: [src/store/useAuthStore.ts](src/store/useAuthStore.ts) (session + profile,
  wraps `supabase.auth`), [src/app/auth/login.tsx](src/app/auth/login.tsx) and
  [src/app/auth/register.tsx](src/app/auth/register.tsx) (email/password — phone OTP
  decision still open, see below). Root routing gate updated in
  [src/app/index.tsx](src/app/index.tsx) (onboarding → login if no session → tabs if
  session) and [src/app/onboarding.tsx](src/app/onboarding.tsx) ("Get Started"/"Skip"
  now route to `/auth/login` instead of straight into the tabs).
  [src/app/(tabs)/profile.tsx](src/app/%28tabs%29/profile.tsx) now shows the real signed-in
  name/email and its Sign Out button calls `useAuthStore().signOut()`. NOTE: the rest of
  the profile screen (order count, addresses count) still reads from mock data — only
  identity/auth is wired to Supabase so far; catalog/orders data migration is Phase 2+.
  **Not yet tested in an actual RN runtime** (no simulator/Expo Go available in this dev
  environment) — verified only via `tsc --noEmit`, which is clean for every touched file.
  Test on a real device/simulator before considering this done-done.
- Admin: replaced the single shared-password system entirely.
  [admin/lib/auth.ts](admin/lib/auth.ts) deleted (dead code, no longer used).
  [admin/middleware.ts](admin/middleware.ts) now uses `@supabase/ssr` to check for a
  valid Supabase session AND that `profiles.role === 'admin'` on every request; signs
  out and redirects to login if either check fails.
  [admin/app/dashboard/login/actions.ts](admin/app/dashboard/login/actions.ts) has
  `login` (email+password via `signInWithPassword`, then the same admin-role check) and
  `logout` server actions. [admin/app/dashboard/login/page.tsx](admin/app/dashboard/login/page.tsx)
  now has email+password fields instead of a single password field.
  [admin/components/Sidebar.tsx](admin/components/Sidebar.tsx) shows the real signed-in
  email and has a working Sign Out button (wired via
  [admin/app/dashboard/(protected)/layout.tsx](admin/app/dashboard/%28protected%29/layout.tsx)
  fetching the user server-side and passing the email down).
  `ADMIN_PASSWORD` removed from `admin/.env.local` and `admin/.env.example` (no longer
  used).
  **Verified end-to-end in the browser preview**: logged in with real credentials,
  confirmed the dashboard renders with live data, confirmed Sign Out redirects back to
  login.

**First admin account created**: email `shyamalfred@gmail.com`, `profiles.role` set to
`admin` via the service_role key (bypassing RLS — this is the one legitimate use of that
key for a one-time bootstrap). Password was randomly generated and given to the user
directly in chat — not stored in this file or anywhere in the repo. There's no
password-reset UI yet; if the user forgets it, reset via the Supabase Dashboard →
Authentication → Users, or re-run the same Admin API pattern used to create the account.

## Phase 1 detail (2026-08-19)

**Schema**: [supabase/migrations/20260819120000_partners.sql](supabase/migrations/20260819120000_partners.sql)
— `partners` table (business_type enum, status enum, platform_fee_percent, KYC-lite
fields: contact_person/phone/address), a `BEFORE INSERT` trigger defaulting
`platform_fee_percent` to 0 when `business_type='women'`, and a `BEFORE UPDATE` trigger
that promotes `profiles.role` to `'partner'` the moment `status` transitions to
`'approved'`. `orders` table extended with `order_type` ('standard'|'business'),
`business_name`, `contact_person` — café/shop bulk orders reuse the same orders
pipeline instead of a parallel table, matching the PDF's "MGC doesn't need a separate
café application" intent. RLS: partners can only see/insert their own application;
only admins can update (approve/reject/fee).
Pushed live the same way as Phase 0 (pooler URL + DB password, which the user re-typed
from memory since it isn't stored anywhere — same policy going forward: ask again next
time a migration needs pushing).

**Mobile**: [src/app/partner/apply.tsx](src/app/partner/apply.tsx) (business type chips,
inserts into `partners`), [src/app/partner/dashboard.tsx](src/app/partner/dashboard.tsx)
(status badge, sales/earnings computed from real business orders, order history),
[src/app/partner/business-order.tsx](src/app/partner/business-order.tsx) (bulk order
form, product picker from live `products` table, inserts into `orders`+`order_items`).
[src/app/(tabs)/profile.tsx](src/app/%28tabs%29/profile.tsx) menu now shows "Become an
MGC Partner" or "Partner Dashboard" depending on `profile.role`. Routes registered in
`src/app/_layout.tsx`. Type-checks clean; **not run on a real device/simulator** (same
caveat as Phase 0's mobile auth — no simulator available in this dev environment).

**Admin**: new `@mobile/database` path alias (both `next.config.ts` turbopack
resolveAlias and `tsconfig.json` paths) so the admin app can import the same
hand-written `Database` type as the mobile app — [admin/lib/supabase/server.ts](admin/lib/supabase/server.ts)
now uses `createServerClient<Database>`. New page
[admin/app/dashboard/(protected)/partners/page.tsx](admin/app/dashboard/%28protected%29/partners/page.tsx)
+ [admin/components/PartnersClient.tsx](admin/components/PartnersClient.tsx) (tabs by
status, drawer with approve/reject/fee-edit) +
[admin/app/dashboard/(protected)/partners/actions.ts](admin/app/dashboard/%28protected%29/partners/actions.ts)
(server actions using the signed-in admin's own cookie-scoped client — no service_role
needed here, RLS's `is_admin()` policy covers it). "Partners" added to
[admin/components/Sidebar.tsx](admin/components/Sidebar.tsx) main nav.

**Verified live end-to-end**: created a throwaway test user + a `women`-type partner
application via the service_role key (bootstrap/test data only), confirmed
`platform_fee_percent` came back `0.00` from the insert trigger, logged into the real
admin UI, opened the application drawer, clicked Approve, confirmed via REST that
`partners.status='approved'` and `profiles.role` flipped to `'partner'`. Deleted the
test user afterward (cascade-deleted its partner row too) — the database is clean of
test data, only real records remain.

One tooling note for future sessions: the browser preview tool's `read_page`/
`get_page_text` don't surface content inside `position: fixed` overlays (the drawer
component here) even though the elements are genuinely in the DOM and interactive —
had to fall back to `javascript_tool` (`document.querySelectorAll('aside')`) to read
drawer content and click its buttons for verification. Real user clicks work fine;
it's just this inspection tool's blind spot. Don't mistake that for a bug in the app.

**Next immediate step:** Nothing blocking — pick up wherever the user directs next.
Phase 1 is fully done. Remaining natural candidates: Phase 2 (Products admin CRUD,
discounts/coupons, subscription management both sides) or Phase 0's still-open loose
end (decide phone-OTP vs. email auth for real; migrate the rest of the app's screens —
catalog/orders/subscriptions browsing — off mock data onto live Supabase queries;
mobile auth/partner screens still need a real device/simulator test pass).

## Environment / Credentials Needed From User

- [x] Supabase project URL
- [x] Supabase anon (public) key
- [x] Supabase service_role key (server-side only, admin dashboard)
- [x] Supabase DB password (used once for initial push, not persisted anywhere — ask
      again if another migration needs pushing)
- [ ] Decision: Supabase Auth phone (OTP) vs email for customer/partner login
- [x] Razorpay test-mode keys (provided 2026-08-20, stored server-side — see Phase 4
      "How secrets are stored" above; never re-ask unless rotating/going to production)
- [ ] WhatsApp BSP choice + credentials (Phase 3, still not provided — blocking item)

## Architecture Decisions Log

- 2026-08-18: Chose Supabase over Firebase for backend (Postgres relational fit for
  orders/subscriptions/partners; single choice, user-confirmed).
- 2026-08-18: Existing mock data (`src/mock/index.ts`, `admin/lib/data.ts`) will be
  migrated into Supabase seed data rather than hand-retyped — reuse the product/category/
  subscription/order records already written.
- 2026-08-18: Existing `Profile`/`Address`/`Order`/`Product`/etc. types in
  `src/types/index.ts` are the starting schema shape — extend, don't replace, when
  designing Postgres tables (keeps mobile app types mostly compatible).

## Phases

### Phase 0 — Foundation
- [x] Create Supabase project (user action)
- [x] `supabase init` local project structure + migrations folder
- [x] Design core schema: profiles (roles: customer/partner/admin), addresses, products,
      categories, orders, order_items, subscriptions, subscription_plans
- [x] Row-level security policies per role
- [x] Apply migration + seed to the live Supabase project (pushed via CLI using the
      connection pooler URL + DB password; verified live via REST API)
- [x] TypeScript types available (`src/types/database.ts`, hand-written — CLI generation
      blocked on missing Docker in this environment; regenerate for real if Docker ever
      becomes available)
- [x] Supabase Auth wired into mobile app (login/register screens, routing gate,
      sign-out) — built and type-checked, NOT yet run on a real device/simulator
- [x] Supabase Auth wired into admin dashboard (replaced single shared-password auth;
      verified end-to-end in browser preview)

### Phase 1 — Core role split — DONE (2026-08-19), verified end-to-end
- [x] Mobile: "Become an MGC Partner" flow + Partner Dashboard (sales/earnings from real
      business orders; payouts not built — no payment gateway yet, that's Phase 4)
- [x] Partner business types (Individual/Women/Café/Restaurant/Shop/Fitness-Wellness/
      Community) + women-partner 0% platform fee rule (DB trigger, verified live)
- [x] Mobile: Café/Shop bulk business-order form → feeds Admin (same `orders` table,
      `order_type='business'`)
- [x] Admin: Partners management screen (list, approve/reject, edit fee %) — verified
      live: approve promotes the applicant's profile to `role='partner'` via DB trigger

### Phase 2 — Commerce completeness — DONE (2026-08-20), verified end-to-end
- [x] Admin: Products management (CRUD, pricing, stock, pre-orders)
- [x] Discounts/coupons engine (flat/%, birthday, subscription, partner/wholesale pricing)
- [x] Mobile: subscription pause/cancel management
- [x] Admin: subscriptions screen (active/paused/cancelled, revenue)

### Phase 3 — Automation & reporting — DONE (2026-08-20) except WhatsApp (blocked)
- [x] Order-event notification pipeline (Supabase DB trigger + `pg_net`, no Edge
      Function needed)
- [ ] WhatsApp notification to Admin on new order (via BSP) — blocked, no BSP account/
      credentials yet
- [x] Customer push/in-app notifications (Expo Push) — Expo/EAS account created this
      session
- [x] Birthday-offer automation driven by DOB (`pg_cron`, daily)
- [x] Admin Reports module (sales/customers/partners/products/subscriptions/revenue/
      discounts/payouts) — CSV export built; PDF/Excel not built (scope reduction, see
      Current Status above)

### Phase 4 — Payments — DONE (2026-08-20), verified end-to-end
- [x] Razorpay backend: order creation (Edge Function) + payment verification (Postgres
      RPC, HMAC-signed), both live-verified — see "Current Status" above
- [x] Razorpay integration in mobile checkout — full cart/checkout/addresses/orders UI
      built from scratch this phase (it didn't exist before), WebView payment screen
      wired to the Edge Function + RPC — see "Phase 4 finished" in Current Status above
- [x] Payment status reflected in Admin Orders — Admin Orders page now reads the live
      `orders` table with a Payment column/badge, live-verified with disposable test data

## Session Log

- **2026-08-18 (part 1)** — Gap analysis completed. Paid-services budget discussed
  (Supabase, Vercel, Expo EAS, Razorpay, WhatsApp BSP, store fees). User confirmed:
  build with Supabase, start now, maintain this file as the cross-session progress
  tracker.
- **2026-08-18 (part 2)** — User supplied Supabase project keys (publishable, anon,
  service_role) directly in chat. Wired env files (git-ignored, verified), installed
  Supabase client libs in both apps, wrote the full Phase 0 schema + RLS migration and
  seed data (generated from existing mock data, not hand-typed), created mobile +
  admin Supabase client helpers.
- **2026-08-18 (part 3)** — User provided the DB password. Caught and fixed a
  transcription error in the project ref (`xdjpwulpkuyxrxqalrh` → correct
  `xdjpwulpkuykxrxqalrh`) before pushing anything further. Direct DB connection is
  IPv6-only and unreachable here, worked around with the connection pooler URL.
  Migration pushed live, seed data pushed live (verified 23 products readable via REST
  with anon key — RLS confirmed working). `supabase gen types typescript` failed
  (needs Docker, not installed) — hand-wrote `src/types/database.ts` instead and wired
  it into the mobile Supabase client. Phase 0 schema work is done; next up is actually
  building the auth screens (mobile) and swapping admin's password auth for Supabase
  Auth — neither started yet.
- **2026-08-19** — Built real auth for both apps (see "Auth is DONE" note above for
  full detail). Along the way, caught two real bugs via `tsc --noEmit` before they'd
  have surfaced at runtime: (1) hand-written `Database` type was missing
  `Relationships`/`Views`/`Functions` fields required by `@supabase/supabase-js`'s
  generic schema contract — fixed. (2) `react-native-mmkv` is on major version 4 in
  this project, which replaced the `new MMKV()` class API with a `createMMKV()`
  factory and renamed `delete()` to `remove()` — the first draft of
  `src/lib/supabase.ts` used the old v2/v3 API and would have crashed immediately on
  import; fixed. Created the first admin account (shyamalfred@gmail.com, role=admin)
  via the Supabase Admin API using the service_role key, then verified the entire
  admin login → dashboard → sign-out cycle in the browser preview with real
  credentials — works end to end. Mobile auth screens are built and type-check clean
  but have NOT been run in a real RN environment (no simulator available here) — that
  still needs doing before calling mobile auth fully verified.
- **2026-08-19 (later, Phase 1)** — Built the Partner role end to end: schema
  (partners table, women-partner 0% fee trigger, approval→role-promotion trigger,
  business-order columns on orders), mobile apply/dashboard/business-order screens,
  admin Partners management screen with approve/reject/fee-edit. Pushed migration live
  (asked user for the DB password again since it's never stored — they re-typed the
  same one from memory). Verified the entire approve flow live in the browser with
  disposable test data, then deleted that test data. See "Phase 1 detail" section above
  for full breakdown. Everything type-checks clean on both apps. Mobile side still
  unverified on a real device/simulator (ongoing caveat, not new to this session).
- **2026-08-20 (Phase 2)** — Pushed the pending discounts/is_preorder migration (blocked
  at session start on the dev machine's C: drive being completely full — 0 bytes free,
  which also broke task-tracking; freed ~4GB by deleting an orphaned 3.81GB npm-cache
  folder on C: that npm wasn't even using anymore, since its real cache is configured to
  live on F:). Then built all of Phase 2: admin Products/Discounts/Subscriptions pages,
  mobile subscribe + manage screens. Found and fixed two pre-existing bugs along the way
  (business-order.tsx orders insert, root tsconfig missing an exclude that was
  swallowing admin/website into the mobile app's type-check). Reset the admin login
  password via service_role (user confirmed this was fine — the original from Phase 0
  bootstrap wasn't available). Verified every new admin page live end-to-end with
  disposable test data, cleaned up after. See "Current Status" above for full detail.
- **2026-08-20 (pre-Phase-3 cleanup)** — Fixed the small list of pre-existing bugs
  flagged but not fixed during the Phase 2 session: `Address.type`/`Profile.bio`
  referencing nonexistent fields, `StyleSheet.absoluteFillObject` typos in 3 files.
  Mobile app now type-checks with zero errors, not just zero errors on touched files.
- **2026-08-20 (Phase 3)** — Walked the user through creating an Expo/EAS account from
  scratch (they didn't know what Expo Push was or that it's free — explained both before
  proceeding) and linked the project via its EAS project ID. Wrote and pushed the
  notifications migration (order-status push triggers + birthday-offer `pg_cron` job),
  wired up mobile push-token registration, and built the Admin Reports module. Verified
  the whole pipeline live: confirmed `pg_cron`/trigger exist via a direct Postgres query
  (necessary since `pg_net`/`pg_cron` aren't visible through PostgREST), and confirmed
  the Reports page aggregates correctly using disposable test order data, cleaned up
  after. WhatsApp-to-admin explicitly not built — still blocked on BSP credentials, not
  stubbed. See "Current Status" above for full detail.
- **2026-08-20 (Phase 4, session ended mid-implementation)** — User confirmed they have a
  Razorpay account and provided test-mode Key ID + Key Secret in chat. Chose "native SDK
  vs WebView" — delegated the decision; picked WebView specifically because the mobile
  app has never run on a device/simulator and native modules would force an EAS
  dev-client build as a new prerequisite, which felt like the wrong new dependency to
  introduce unprompted. Then, while checking where to attach payment, discovered the
  mobile app has **no real checkout at all** — preorder/orders/addresses screens and the
  cart button are all still mock-data/decorative, never migrated in any earlier phase.
  Surfaced this to the user with a scoping question; they chose "build it all now" over
  a minimal stub.
  Built and fully verified the backend half: `orders` payment columns, a `private.secrets`
  table for the Key Secret (had to add a `public.get_razorpay_credentials()` RPC around
  it after discovering PostgREST doesn't expose non-public schemas even to service_role),
  a `create-razorpay-order` Edge Function (had to move off a Postgres `http`-extension
  function after discovering that extension has a real POST bug against Razorpay's API —
  confirmed via direct testing, GET works, POST doesn't), and
  `public.verify_razorpay_payment()` (two fix iterations after discovering pgcrypto's
  `hmac()` lives in an `extensions` schema, not `public`, on Supabase). Deployed the Edge
  Function using a one-off personal access token the user generated and pasted in chat,
  used once, not stored. Verified both pieces live via a disposable test order + scripted
  RPC calls (details in "Current Status" above). Also built `src/store/useCartStore.ts`
  (resolves cart items to real Supabase product UUIDs by slug, so `order_items` FKs stay
  valid) and fixed a matching root-`tsconfig.json` scope gap (the new
  `supabase/functions/` Deno code was getting swept into the mobile app's `tsc`, same
  class of bug as the Phase 2 admin/website one — added it to `exclude`).
  **Session ended here** — user asked to continue in a fresh session before the mobile
  cart/checkout/address/orders UI or the admin Orders live-wiring were built. See
  "Current Status" above (step 2 onward) for the exact next step; everything through
  step 1 is done.
- **2026-08-20 (Phase 4, continuation session — completed)** — Picked up cold from this
  file per its own instructions, starting at step 2. Built the full mobile checkout
  surface: wired "Add to Cart" into `ProductCard.tsx` and the product detail screen,
  built `cart.tsx`, retired `preorder.tsx` in favor of a real `checkout/` flow (review →
  delivery → address → place order → Razorpay WebView pay screen → success screen),
  installed `react-native-webview`, rewrote `profile/addresses.tsx` onto the live
  `addresses` table with a modal add/edit form, and wired `(tabs)/orders.tsx` +
  `order/[id].tsx` to real Supabase data with a payment-status-aware retry button. Wired
  Admin Orders to live data with a Payment column and a working status-update server
  action. Along the way found and fixed two real type gaps: `database.ts` was missing
  the Phase 4 payment columns entirely, and every table's `Relationships: []` was
  silently wrong — harmless for the single/simple joins used until now, but it broke
  `tsc` the moment Admin Orders tried to embed three related tables in one query
  (`order_items` + `profiles` + `addresses`). Fixing that with real FK metadata also
  fixed a pre-existing, previously-undetected break on the untouched Subscriptions admin
  page — same root cause. Both apps type-check clean. Verified live in the browser
  preview: user supplied the current admin password directly (declined the offer to
  reset it), logged in, confirmed Orders renders correctly against the real empty
  table, inserted a disposable test order via service_role, confirmed the customer-name
  join/item summary/status badge/payment badge all render correctly, exercised the
  status-update drawer control end-to-end (confirmed via a direct Postgres query that
  `orders.status` actually changed), then deleted the test data and confirmed the table
  is back to empty. Scratch verification scripts were written to the session scratchpad
  and deleted immediately after (briefly held the service_role key inline, per the
  established pattern). **Phase 4 is now fully done.** The mobile-side checkout/cart/
  payment flow was not exercised in a real RN runtime this session — same ongoing
  device/simulator caveat as every phase before this one; if a device ever becomes
  available, that flow (add-to-cart → checkout → Razorpay WebView → verification) is the
  highest-value thing to walk through by hand next, since it's the newest and most
  integration-heavy piece of the app.
- **2026-08-20 (Phase 4, mobile web verification)** — User pushed back on the "no
  device available" caveat and asked to proceed anyway. Discovered `expo start --web`
  (via `react-native-web`, already a dependency) actually works in this environment —
  first attempt hung indefinitely on a stdin prompt caused by a flag mismatch
  (`--non-interactive` not recognized by this Expo SDK; needs `CI=1` instead), fixed by
  launching detached via PowerShell's `Start-Process -FilePath cmd.exe` with `CI=1` set.
  Added a `"MiniGreens Mobile Web"` entry to `.claude/launch.json` for next time (still
  needs `CI=1` in the environment — see full detail in the new "Mobile checkout/cart/
  payment flow — actually exercised" section above). Then genuinely walked the entire
  flow in real bundled RN code via DOM-level interaction (screenshots don't work in this
  session, same as every prior admin verification — used `javascript_tool` throughout,
  plus a clone-and-force-visible trick to read past Reanimated's entering-animation
  `visibility: hidden` initial state): login → add-to-cart → cart → checkout
  (review/delivery/address) → added a real address via the live modal form → placed a
  real order (confirmed via direct Postgres query, correct on every field) → confirmed
  the `create-razorpay-order` Edge Function genuinely fired from `checkout/pay.tsx`'s
  real code (real `razorpay_order_id` written back) → confirmed the orders list and
  order-detail screens render the real order correctly, including the payment-aware
  retry button routing back into the pay screen correctly. `react-native-webview` itself
  has no web target (confirmed no `.web.tsx` variant exists), so the actual Razorpay
  checkout iframe still can't be exercised outside a real native runtime — that's the
  one remaining gap, and it's now a small, well-scoped one instead of "the whole mobile
  flow is unverified." Cleaned up the test order/order_items/address afterward
  (confirmed tables back to empty) and killed both dev server processes — note the
  manually-`Start-Process`-launched one isn't tracked by the Browser pane's
  `preview_stop` and had to be killed by PID via `Get-CimInstance Win32_Process` +
  `Stop-Process -Force`.
