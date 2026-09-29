# Webapp SEO Audit — 2026-09-24

Scope: `webapp/` (Next.js 16, the Blue Tea reskin — the customer-facing site intended to replace `website/`). Technical/on-page audit from source code, since the site isn't deployed to a public domain yet (no live crawl/ranking data available).

## Findings, by severity

### Critical

1. **No `robots.txt` or `sitemap.xml`.** No `app/robots.ts` or `app/sitemap.ts`, no static files in `public/`. Search engines have no crawl guidance and no authoritative list of URLs to index. This alone will badly delay/limit indexing once the site goes live.
2. **No `metadataBase`, canonical URLs, or Open Graph/Twitter metadata anywhere.** `app/layout.tsx` sets only a static `title`/`description`. Zero pages define `openGraph`, `twitter`, or `alternates.canonical`. Consequences: shared links on WhatsApp/social/iMessage show no preview card; Google may pick the wrong canonical among near-duplicate URLs (e.g. `/shop?x=` query variants); no control over how the domain resolves relative OG image paths.
3. **Blog/Journal has no article pages.** [lib/journal.ts](webapp/lib/journal.ts) defines a full `slug` field per post, but there is no `app/blog/[slug]/page.tsx` route, and [JournalGrid.tsx](webapp/components/journal/JournalGrid.tsx) renders cards with no links at all. This is the site's only content-marketing surface (the thing that ranks for informational, top-of-funnel keywords like "microgreens vs vegetables") and it currently produces zero indexable pages. All existing article slugs and copy are dead weight.
4. **No structured data (JSON-LD).** No `Product`, `Organization`, `BreadcrumbList`, `Article`, or `FAQPage` schema anywhere in `webapp`. Product pages ([app/shop/[slug]/page.tsx](webapp/app/shop/[slug]/page.tsx:64)) have price, rating, and review_count already in the data model but emit none of it as schema — meaning no rich results (star ratings, price) in search, even after the site is fully indexed.

### High

5. **Homepage has no page-level metadata.** [app/page.tsx](webapp/app/page.tsx) exports no `metadata`, so it inherits the generic layout title/description verbatim — the same title/description that also apply to every other unmetadated route. Homepage title/description is the single highest-value tag on the whole site and it's currently just a fallback.
6. **Metadata coverage is inconsistent across routes.** `about`, `blog`, `shop`, `shop/[slug]`, `contact`, `subscriptions`, `terms`, `privacy`, `returns`, `shipping-policy`, `orders`, `login`, `partner/*`, `offers`, `checkout/success` all export `metadata`. Missing: `page.tsx` (home), `cart`, `checkout`, `subscribe`, `subscriptions/custom`. Cart/checkout arguably shouldn't be indexed at all (see #8), but the home page gap is significant, and `subscribe`/`subscriptions/custom` are conversion-relevant marketing pages that should be indexable and titled distinctly.
7. **Product descriptions are used verbatim as meta descriptions** ([app/shop/[slug]/page.tsx:75](webapp/app/shop/[slug]/page.tsx:75)): `description: product.description ?? undefined`. Product body copy is rarely written to the ~155-char meta-description length or with a call-to-action, so these will get truncated or replaced by Google with an auto-generated snippet.

### Medium

8. **No `noindex` on non-content routes.** `cart`, `checkout`, `checkout/success`, `login`, `orders`, `partner/dashboard`, `subscriptions/manage`, `partner/submitted` are all client-state/account pages with no SEO value and no metadata — by default they're indexable. Left alone, Google can crawl and index thin/empty/duplicate states (e.g. an empty cart page) as content, diluting the domain's perceived quality.
9. **Heading structure is fine but shallow.** Every checked route has exactly one `<h1>` (homepage's is in [HomeHero.tsx](webapp/components/home/HomeHero.tsx)) — good — but most marketing sections beneath it are built from styled `<div>`/`<p>` rather than a clear `h2`/`h3` outline, so there isn't a strong topical hierarchy for crawlers to parse the page around.
10. **Image alt text is a genuine strength, with one gap.** Descriptive, keyword-relevant `alt` text is present on nearly every content image (hero, farm story, product shots, journal cards) — this is well done. Two components ([Gallery.tsx](webapp/components/pdp/Gallery.tsx:16), [CategoryTrio.tsx](webapp/components/home/CategoryTrio.tsx)) pass `alt={name}` from dynamic product/category names, which is correct as long as those names are never empty strings upstream.
11. **`public/images` is 219MB across 104 files**, several PNGs over 500KB (uncompressed hero/product shots). Next/Image will still serve optimized WebP/AVIF at request time, so this isn't a direct ranking hit, but it inflates build/deploy size and increases the chance of slow LCP on first requests before CDN caching warms up. Source assets should be compressed/converted before they enter `public/`.

### Low

12. No favicon/app icons declared via `metadata.icons` (relying on Next.js default `/favicon.ico` convention — verify the file actually exists and is branded).
13. No `viewport` export customization (fine on defaults, just noting it wasn't set explicitly, so no theme-color for mobile browser chrome).

## Priority action plan

**P0 — do before any public launch (crawl foundation)**
1. Add `app/sitemap.ts` — generate from static routes + live product slugs (Supabase `products`) + (once built) blog slugs.
2. Add `app/robots.ts` — allow marketing/shop/blog routes, disallow `/cart`, `/checkout`, `/orders`, `/login`, `/partner/dashboard`, `/subscriptions/manage`, point to the sitemap.
3. Set `metadataBase` in `app/layout.tsx` to the production domain so all relative OG/canonical URLs resolve correctly.
4. Add `metadata` (title + description) to `app/page.tsx`, `app/subscribe/page.tsx`, `app/subscriptions/custom/page.tsx`.
5. Add `robots: { index: false }` metadata (or move to route handlers with `noindex` headers) on `cart`, `checkout`, `checkout/success`, `login`, `orders`, `partner/dashboard`, `subscriptions/manage`, `partner/submitted`.

**P1 — before you start link-building / promoting**
6. Build `app/blog/[slug]/page.tsx` using the existing `JOURNAL_POSTS` data, with `generateMetadata`, real article body content, and `Article` JSON-LD. Link to it from `JournalGrid.tsx`. This unlocks the site's main organic-content channel.
7. Add `openGraph` + `twitter` metadata to the shared layout (site-wide defaults: name, logo/OG image, `summary_large_image`) and override per key page (home, shop/[slug], blog/[slug]) with product/article-specific title, description, and image.
8. Add `Product` JSON-LD to `app/shop/[slug]/page.tsx` (name, image, price, availability, aggregateRating from the existing `rating`/`review_count` fields) — enables star-rating rich snippets.
9. Add `Organization` JSON-LD (name, logo, sameAs social links) to the root layout, and `BreadcrumbList` JSON-LD on shop/product/blog pages.
10. Rewrite product meta descriptions as dedicated ~150-char copy instead of reusing the on-page description verbatim.

**P2 — polish**
11. Add `alternates.canonical` per page (self-referencing at minimum; matters once query-string variants of `/shop` exist).
12. Introduce `h2`/`h3` structure into major homepage sections (FarmStory, TrustPromise, PartnerSection, BusinessStrip) for clearer topical hierarchy.
13. Compress/convert source images in `public/images` (target <200KB per hero/product PNG, consider `.webp` sources) before they're committed.
14. Add `metadata.icons` pointing to a real branded favicon/apple-touch-icon set, and a `viewport` export with `themeColor`.

## Not assessed (needs a live URL)
Once `webapp` is deployed to a real domain, a follow-up pass should pull actual Search Console / Semrush data (indexed-page count, Core Web Vitals field data, keyword rankings, backlink profile) — none of that exists yet for a pre-launch site, so this audit is code-only.

## Follow-up pass — 2026-09-29 (live dev-server check with nextjs-seo-optimizer skill)
Verified against `next dev`: robots.txt, sitemap.xml (12 static + all products + 7 blog posts), Product/BreadcrumbList/Organization JSON-LD, blog article pages — all working. Fixed in this pass:
- Per-page `alternates.canonical` on shop, blog, about, contact, subscriptions, partner/apply, terms, privacy, returns, shipping-policy (only home/products/blog posts had them).
- Removed the layout-level `og:url` (it made every page claim the homepage as its OG URL).
- `noindex` added to cart, checkout, subscribe, subscriptions/custom, offers, partner/business-order (last two were also missing from robots.txt; now disallowed).
- Keyword-bearing titles + descriptions for shop, blog, about, subscriptions, partner/apply, and the legal/contact pages.
- `viewport.themeColor`.
Open items: `components/ContactForm.tsx:56` fails `next build` (Supabase `contact_messages` type is `never[]`); Contact page address says Wayanad, Kerala while copy says Bangalore (NAP consistency); Organization JSON-LD still lacks `logo`/`sameAs`.
