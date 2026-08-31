# MiniGreens — Flow Guide (see every flow for yourself)

**Updated:** 2026-08-31

This is a hands-on walkthrough. For each flow it tells you **what to do**, **what
you should see**, and **where it can be tested** (web preview vs a real
device/emulator).

---

## 0. Setup — run the app

### Option A — Expo web (fastest, for UI + read-only flows)

```bash
cd F:/minigreensMaster
npx expo start --web --port 8090
```

Open `http://localhost:8090`. Good for: onboarding, catalogue browsing, layouts,
empty states. **Cannot**: log in (auth session doesn't persist the same way),
run Razorpay payment (`react-native-webview` has no web build).

> There is a `.claude/launch.json` entry **"MiniGreens Mobile Web"** that does the
> same thing.

### Option B — real device / emulator (for the full experience)

```bash
cd F:/minigreensMaster
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator), or scan the QR with Expo
Go. This is the only way to test **login, payment, push notifications, KYC file
upload, and haptics**.

### Prerequisites for the account-gated flows

- A **user account**. Create one in-app via **Register**, or use an existing
  Supabase Auth user. If your Supabase project has "Confirm email" on, you must
  click the confirmation link before you can log in.
- To see **partner** flows you must have applied and been **approved**
  (`partners.status = 'approved'`) — an admin flips this in the Admin dashboard
  or directly in the Supabase table editor.
- To see **pre-order**, at least one product needs `is_preorder = true`.
- To see **birthday** flows, set your `profiles.date_of_birth` to today's
  month + day, and have an active discount with `is_birthday_offer = true`.

---

## 1. Onboarding

**Where:** web or device.
**Do:** launch the app fresh (or open `/onboarding`).
**See:**
1. Slide 1 "Sip Fresh, Live Well" — berry photo, 3 feature rows, **Next** + **Skip**.
2. Tap **Next** → Slide 2 "100% Natural Goodness" — mango-bottle photo, 3 cards.
3. Tap **Next** → Slide 3 "Your Daily Wellness" — green photo, 3 rows, **Get Started** (no Skip).
4. **Get Started** (or **Skip** on 1/2) → routes to **Login**.

> Known: the "seen onboarding" flag isn't persisted yet, so it reappears on the
> next launch (BUG-01).

---

## 2. Register → Login

**Where:** device (web can't hold the auth session).
**Do — Register:**
1. From Login tap **Sign Up**.
2. Fill Full Name, Email, (optional) **Date of Birth** — type digits, it
   auto-masks to `DD/MM/YYYY`. Password ≥ 6 chars, Confirm Password must match.
3. Tap **Create Account**.
**See:** either you land on the Home tab (email confirmation off), or a
"Check your email" screen (confirmation on) → confirm → come back → **Log In**.

**Do — Login:** enter email + password → **Log In** → Home tab.
**Do — Logout:** Profile tab → **Sign Out** → back to Login.

---

## 3. Browse the catalogue

**Where:** web or device (reads the live database with the anon key).

- **Home tab** — scroll: category chips, **Best Sellers** carousel, promo card,
  **Seasonal Picks**, **Featured Products**, subscription block, articles,
  testimonials.
- **Search tab (Explore)** — tap a **category** chip to filter; tap a **sort**
  chip (Most Popular / Newest / Price: Low / Price: High).
- **Category page** — from a Home category chip → list filtered to that category
  with a product count.
- **Product detail** — tap any product card → hero image with dots, price +
  discount %, star rating, **Quantity** stepper, description, **Nutrition** grid,
  **Benefits**, **Storage**, **How to Enjoy**, tags, **You May Also Like**.
- **Search** — magnifier / search bar → type "mango", "choco", "radish" → live
  results grid. (The "Recent" list is placeholder — BUG-07.)

---

## 4. Cart

**Where:** web or device.
**Do:**
1. On a product card, tap the **+** in the inline stepper (or open a product and
   tap **Add to Cart**). Watch the number go up and the Home **bag badge** update.
2. Open **Cart** (bag icon on Home, or cart icon on a product page).
3. Change quantity with **+ / −**; hit **−** at qty 1 to remove; or tap the
   **trash** icon.
4. Check the **Subtotal**.
5. Tap **Proceed to Checkout**.

**Empty state:** clear the cart → "Your cart is empty" + **Start Shopping**.

---

## 5. Checkout (needs login + at least one saved address)

**Where:** device recommended (payment is next). The 3 steps themselves render on web.
**Do:**
1. **Review** step — see each line item, a **Coupon code** box, and the Order
   Summary (Subtotal / Delivery Fee / Total).
   - Type a coupon and tap **Apply**. Valid → green "CODE applied" + a Discount
     line in the summary. Invalid → a reason message ("expired", "min order…",
     "birthday month only", …). Tap **Remove** to clear it.
   - Tap **Continue to Delivery**.
2. **Delivery** step — pick a **date** chip (Today / Tomorrow / weekday) and a
   **time** chip; optional **Notes**. **Select Address** unlocks once both are set.
3. **Address** step — pick a saved address (radio), or **Add New Address**
   (opens the Addresses screen). Tap **Place Order**.
**See:** you're routed to the **Payment** screen (`/checkout/pay?orderId=…`).

---

## 6. Payment (device only)

**Where:** real device / emulator — `react-native-webview` does not exist on web.
**Do:**
1. The Razorpay Checkout sheet opens in a WebView. Use Razorpay **test card**
   details (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV, OTP as
   prompted) — the project's key mode determines whether test or live cards work.
2. Complete or dismiss:
   - **Success** → "Verifying payment…" → **Payment Successful!** screen with the
     order number + total → **View My Orders** / **Continue Shopping**.
   - **Dismiss** → back to checkout.
   - **Failure** → "Payment Failed" with **Try Again** / **View Order**.
**Behind the scenes:** `verify_razorpay_payment` checks the HMAC signature, sets
`payment_status = 'paid'`, and decrements `products.stock` once.

**Retrying later:** Orders → open an unpaid order → **Complete Payment** /
**Retry Payment**.

---

## 7. Orders & tracking

**Where:** web or device (reads live; you need to be the order owner).
**Do:**
- **Orders tab** — cards show order number, **payment** badge + **status** badge,
  a PRE-ORDER pill where relevant, item list, date, total. Tap one.
- **Order detail** — order info block, an animated **5-step tracker** (Order
  Placed → Confirmed → Processing → Shipped → Delivered), items, Payment Summary,
  Delivery Address, Notes. Cancelled orders hide the tracker.
- Change an order's `status` in the Admin dashboard (or Supabase), pull-to-refresh
  / re-open the screen, and watch the tracker advance.

---

## 8. Pre-order (needs a product with `is_preorder = true`)

**Where:** device recommended.
**Do:**
1. Open that product → the CTA reads **Pre-order** (not Add to Cart), with an
   "Available for pre-order" note.
2. Tap **Pre-order** → the pre-order screen: product + **Quantity**, a "You won't
   be charged now" banner, address picker, optional notes.
3. Tap **Place Pre-order** → routed straight to the **order detail** (no payment).
**See:** in the Orders tab it carries a **PRE-ORDER** pill and, once Admin sets it,
an "Expected …" date. It also appears in the Admin Orders list.

---

## 9. Subscriptions / Rewards

**Where:** web (browse) / device (subscribe).
**Do:**
1. **Rewards tab** — scroll the plans (Starter / Active Greens Box / Golden Years
   Box / Wellness — "MOST POPULAR"), each with includes + benefits.
2. Tap **Get Started** on a plan (must be logged in) → an `active` subscription is
   created and you land on **Manage My Subscription**.
3. **Manage** — **Pause** → status Paused; **Resume** → Active; **Cancel** →
   Cancelled + a **Browse Plans** button.
> There is no payment/billing on subscriptions yet (BUG-08).

---

## 10. My Offers

**Where:** web or device.
**Do:** Profile → **My Offers** (or wherever it's linked).
**See:** a card per active coupon — value pill (`20% OFF` / `₹50 OFF`), a
**BIRTHDAY** pill if it's a birthday offer *and* it's your birth month, min-order
+ expiry, and a dashed **code box**. Tap the code → "Copied" → paste it in the
Checkout coupon field.
**Empty state** (no active discounts): "No offers right now".

---

## 11. Notifications inbox

**Where:** device (needs your `profiles` row) — web shows the empty state.
**Do:**
1. Home → **bell** icon (a green dot means unread).
2. See the list: order updates, birthday, partner, offer, system — each with an
   icon, title, body, relative time. Unread rows are highlighted with a dot.
3. Tap a row → marked read + routed (order notifications open that order).
4. Top-right **double-check** icon → **mark all read** (the Home bell dot clears).

To generate one: place/advance an order (order-status trigger), or insert a row
into `notifications` for your `profile_id` in Supabase.

---

## 12. Birthday reward

**Where:** device.
**Setup:** set `profiles.date_of_birth` to today (month + day), ensure a discount
row has `is_birthday_offer = true` and `is_active = true`.
**See:**
- **Home** shows a "Happy Birthday! 🎉" banner with the coupon code (dismissible).
- **My Offers** shows that coupon with a BIRTHDAY pill.
- At **Checkout**, the code applies only during your birth month; other months
  return "only valid during your birthday month", and no DOB returns "add your
  date of birth…".

---

## 13. Profile & addresses

**Where:** web or device.
**Do:**
- **Profile tab** — avatar, name, email, live **Orders** / **Addresses** counts,
  menu sections, **Sign Out**.
- **Edit Profile** — change **Full Name / Phone / Date of Birth** → **Save
  Changes** (persists). *Email, Bio, Change Photo don't save yet — BUG-04/06.*
- **Saved Addresses** — **Add New Address** (bottom-sheet form: label, name,
  phone, street, apartment, city, state, ZIP) → Save. Tap a card to **make it
  default**; pencil to **edit**; trash to **delete** (with confirm). First address
  is auto-default. These feed Checkout + Pre-order.

---

## 14. Partner — apply

**Where:** device (KYC upload).
**Do:**
1. Profile → **Become an MGC Partner**.
2. Pick a **Business Type** (chip), fill Business Name / Contact / Phone /
   Address. Optionally **Add Document** (KYC) — pick an image or PDF; it uploads
   to `partner-kyc/<your-uid>/…`.
3. Tap **Submit Application**.
**See:** the **Application Submitted** screen — verified-shield art, "What happens
next?" (Application Review / Email Confirmation / Get Started), a **Need help? →
Contact Support** strip, and **Back to Home**.
Your `partners` row now exists with `status = 'pending'`.

---

## 15. Partner — dashboard, earnings, payout

**Where:** web or device — **requires `partners.status = 'approved'`** (flip it in
Admin or Supabase).
**Do:**
1. Profile → **Partner Dashboard** (the menu row changes once you're a partner).
2. See: status header + shield, **stat cards** (Total Sales / Net Earnings /
   Orders this month), **Place Business Order** button, **Earnings** card
   (Gross sales / Platform fee / Net earned / Paid out / Pending requests /
   **Available to withdraw**), **Payout History**, **Order History**.
3. If "Available to withdraw" ≥ ₹1, tap **Request Payout** → a `payouts` row is
   created (status `pending`). It appears in Payout History and in the Admin
   **Payouts** tab.
4. In Admin: **Approve** → `processing` → **Mark paid**. Back in the app, pull to
   refresh — the row shows **Completed**, "Paid out" goes up, "Available" drops
   to ₹0.

---

## 16. Partner — place a business order

**Where:** web or device (approved partner).
**Do:** Partner Dashboard → **Place Business Order** → details are pre-filled;
pick a **Product** chip, set **Quantity** and a **Required Delivery Date**,
optional instructions → **Submit Order**.
**See:** you're returned to the dashboard; a new `orders` row with
`order_type = 'business'` now exists and shows in the Admin Orders list.
*(It also currently shows in your own customer Orders tab — BUG-05.)*

---

## 17. Static info screens

**Where:** web or device.
Profile → **About**, **FAQ**, **Contact Us** (mail / call / WhatsApp deep-links
work), **Settings**, plus **Terms** and **Privacy**. Content is placeholder copy.

---

## Quick reference — what needs a device

| Needs a real device / emulator | Works in the web preview |
|---|---|
| Log in / register (session), payment, push notifications, KYC file picker, haptics, deep-link buttons (mail/tel) | Onboarding, all catalogue browsing, cart, checkout steps (up to payment), subscriptions browsing, My Offers, empty states, layout / theme review |
