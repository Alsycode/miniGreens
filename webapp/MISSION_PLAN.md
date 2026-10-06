# Mission Placement Plan: Farmers and Women Who Grow

Scope: the two pasted manifestos ("A New Revolution in Agriculture" and "Women Who Grow, Families That Rise") and the Sumam women-entrepreneur program, placed in the `webapp/`.
Method: Six Thinking Hats. Each hat looks at the same question from one angle. The synthesis at the end is the plan.

Question: **Where and how should the farmer and women-empowerment story live in the webapp so it feels like the core of the company, not a footnote?**

Status: **P2 and P3 built (2026-10-06).** `app/women-who-grow/page.tsx` is live in the code and listed in `app/sitemap.ts`.

**Decisions answered (2026-10-06):**
- Real partners and photos: **not used.** No names, no photos, no consent flow.
- Earnings claims: **none, and no figures.** Copy is about opportunity and ownership only.
- Language: **English only.** No Hindi version.
- Route: **`/women-who-grow`.**
- Sumam: **named on the page with a generic description and a partner-apply CTA.** No eligibility, benefits, or cohort details until decision 1 is answered.

**Still open:** decision 1 (Sumam facts) and decision 6 (what "farmers" covers). P4 through P7 are not built.

---

## White hat: the facts we have

- Two long-form manifestos. One is about farmers as partners and agri-tech (farmers, growers, consumers and businesses connected through technology). One is about women: opportunity, a platform, and building something of their own.
- The business model, as described: women grow microgreens at home, Mini Greens sells them, and there is **no platform fee**. Existing copy already says "0% platform fee for women partners" in `components/PartnerApplyForm.tsx`, and the homepage repeats it in `components/home/PartnerSection.tsx`.
- Existing homes for this story:
  - `app/about/page.tsx` already has a story path (`components/story/StoryPath.tsx`) and a team section.
  - `app/partner/apply`, `app/partner/dashboard`, `app/partner/business-order` cover the partner program.
  - `components/home/FarmStory.tsx` already tells a farm-to-table story on the homepage.
- Gaps:
  - No page says "women" as the headline. The women message is only implied by the partner copy.
  - No page presents "Sumam" at all.
  - No page names farmers as partners in the agri-tech sense from the first manifesto.
- Unknowns I cannot resolve from the repo:
  - What Sumam actually offers: training, a stipend, a cohort, a timeline, an application route.
  - Whether any women are already earning through the program. Real names and numbers would make the case far stronger than the manifesto alone.
  - Whether we can publish photos of real partners, and whether they have consented.

## Red hat: feelings and gut reaction

- The manifestos are emotional and sincere. They should stay emotional. Do not turn them into a corporate brochure.
- Risk: the words "revolution", "movement" and "India rises" can read as hype. Visitors who see a claim they cannot verify will trust the site less. The strongest proof is a real woman's story, not adjectives.
- Women reading this should feel "this is for me, and I can start this week", not "this is nice for others". The copy should speak to the reader directly, with the concrete first step visible.
- Farmers should feel respected as partners, not thanked as suppliers.

## Black hat: risks and what could go wrong

- **Unverified claims.** "Empowers women a lot", "a revolution", "a movement", and "a community where women make a living". Publishing income or outcome claims without data is a trust and legal risk. Keep statements to what the company does and can prove (no platform fee, the partner model, the Sumam program). Income claims need real numbers or a disclaimer.
- **Existing inconsistency.** `HOMEPAGE_PLAN.md` says the free-delivery promise does not match the flat fee. The no-platform-fee promise is a similar kind of claim, so it needs to be checked against the real settlement and payout flow before we shout it.
- **Sumam is undefined in the repo.** Writing copy about a program the site cannot link to, apply to, or describe in detail will produce a dead end.
- **Tone drift.** The manifestos are long. Pasting them whole onto a page will hurt conversion and mobile reading.
- **Language.** The copy is English. If the audience is mainly Indian women in smaller towns, a Hindi or regional-language version may matter more than polish.
- **Overlap.** `FarmStory`, `about`, and `PartnerSection` already tell parts of this story. A new section that repeats them will make the homepage longer and blurrier.

## Yellow hat: benefits and opportunities

- This is the company's differentiator. Competitors sell microgreens. Few sell a path to income for women who grow at home, with no platform fee taken from them.
- The partner program is the natural conversion path. Every mission section can end in "Become a partner" or "Learn about Sumam".
- Stories are cheap content. One short woman-led story per month feeds the blog (`app/blog`, `BLOG_SEO_PLAN.md`) and social posts, and gives SEO long-tail terms like "work from home women microgreens India".
- Farmer partnership copy opens the agri-tech and café/business audience too.

## Green hat: new ideas

1. **A dedicated `/mission` page** (or `/women-who-grow`, which is better for SEO). It holds the full women manifesto, reshaped into short sections, with the Sumam program at the center.
2. **Homepage band.** One short quote-led strip near the partner section: "When a woman grows, a family rises." It links to `/mission`. It replaces nothing, so the page does not get longer overall.
3. **Partner apply page reframed.** Add a short women-focused intro above the form, and keep the "0% platform fee" line visible there.
4. **Farmer and grower section on `/about`.** The first manifesto goes here as a new chapter in the existing StoryPath, under "Farmers as partners".
5. **"Real partners" cards.** Once we have consent, each card has a photo, a first name, a town, and one sentence in her own words. This is the single most persuasive element we could add.
6. **Sumam as its own page** (`/sumam`) once we have the facts, with an apply CTA into the partner flow.
7. **Hindi version** of the mission page, if the audience research supports it.
8. **Impact counter** on the mission page, only when there are real numbers in the database (partners onboarded, orders fulfilled through partners). Do not hardcode numbers.

## Blue hat: process and decisions

Decisions needed before building (owner: the user):

1. **What is Sumam?** Need: description, eligibility, what women get (training, starter kit, mentoring, stipend?), how to apply, and whether it runs in a cohort or on a rolling basis.
2. **Can we name real partners and show photos?** Need consent and at least 3 to 5 stories to start.
3. **Income claims.** Do we want to say anything about earnings? If yes, we need real figures. If not, the copy stays about opportunity and ownership, not money.
4. **Languages.** English only for v1, or add Hindi now?
5. **Route name.** `/mission`, `/women-who-grow`, or `/sumam`? My recommendation: `/women-who-grow` for SEO and the emotional hook, linking to `/sumam` once that exists.
6. **Farmer section.** Is "farmers" about the partner growers, the agricultural supply partners, or both? The first manifesto mixes them.

Proposed sequence:

| Step | What | Depends on |
|---|---|---|
| P1 | Confirm Sumam facts and the decisions above | User |
| P2 | Write the copy: trimmed manifesto, short versions for homepage band and partner intro | P1 |
| P3 | Build `/women-who-grow` page (reuse `components/story/primitives`) | P2 |
| P4 | Homepage band below PartnerSection, linking to the page | P3 |
| P5 | Partner apply page: women intro above the form | P2 |
| P6 | Farmer chapter in `/about` StoryPath | P2 |
| P7 | `/sumam` page and CTA, once facts exist | P1 |
| P8 | Real partner stories and impact counter, when data and consent exist | Ops |
| P9 | Hindi version, if decided | Decision 4 |

Verification for each step: check the page at 375px and 1280px, check the `metadata` and canonical, and check that the existing partner apply flow still works from the new CTAs.

---

## Synthesis (the plan in one paragraph)

Give the women story its own page, `/women-who-grow`, and link to it from a short band on the homepage, the partner apply page, and a new farmer chapter on `/about`. Keep the manifesto's voice but shorten it, and back every claim with something the company actually does (no platform fee, the partner model). Hold back the "revolution" and income language until we have real numbers and real partner stories. Sumam gets its own page only once we can describe it accurately. Phase P1 is the blocker: we need the Sumam facts and the decisions above before any copy is written.
