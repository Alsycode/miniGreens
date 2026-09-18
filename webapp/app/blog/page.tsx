import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Journal | Mini Greens Company" };

const POSTS = [
  {
    title: "Why Microgreens Beat Full-Grown Vegetables",
    date: "12 July 2026",
    readTime: "5 min read",
    excerpt:
      "A handful of broccoli microgreens carries a concentration of sulforaphane you would struggle to match with a whole head of broccoli. Here's what the research actually says.",
  },
  {
    title: "Keeping Your Greens Alive For A Week",
    date: "28 June 2026",
    readTime: "4 min read",
    excerpt:
      "Most people lose their greens to condensation, not time. A paper towel and the right shelf in your fridge will get you three extra days.",
  },
  {
    title: "Five Ways We Use Pea Shoots At Home",
    date: "14 June 2026",
    readTime: "6 min read",
    excerpt:
      "Beyond the salad bowl — folded into an omelette, wilted through hot dal, blitzed into a pesto that keeps for a fortnight.",
  },
  {
    title: "What Sustainable Really Means On A Small Farm",
    date: "30 May 2026",
    readTime: "7 min read",
    excerpt: "Reusable trays, a closed-loop water system, and the parts of our operation we're still not happy with.",
  },
  {
    title: "The Case For Eating Seasonally, Indoors",
    date: "16 May 2026",
    readTime: "5 min read",
    excerpt: "Growing under lights doesn't mean ignoring the seasons. Our rotation still follows what grows best, and when.",
  },
  {
    title: "Meet The Team Behind Your Weekly Box",
    date: "02 May 2026",
    readTime: "3 min read",
    excerpt: "Six people, one growing room, and a 4am start. A short introduction to the hands that cut your greens.",
  },
];

export default function BlogPage() {
  return (
    <PageShell
      eyebrow="Journal"
      title="Notes From The Growing Room"
      intro="Recipes, research, and the occasional honest account of what went wrong in the greenhouse this month."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <article
            key={post.title}
            className="flex flex-col rounded-2xl border border-(--color-border) bg-white p-6 transition-colors hover:border-(--color-navy)"
          >
            <p className="text-xs font-semibold tracking-wide text-(--color-navy)/60 uppercase">
              {post.date} · {post.readTime}
            </p>
            <h2 className="font-display mt-3 text-lg font-semibold leading-snug text-(--color-ink)">
              {post.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
