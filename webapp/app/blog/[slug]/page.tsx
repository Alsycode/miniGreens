import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { JOURNAL_POSTS, getJournalPost, toIsoDate } from "@/lib/journal";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return JOURNAL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) return { title: "Story Not Found | Mini Greens Company" };

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | Mini Greens Company`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) notFound();

  const related = JOURNAL_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);
  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [`${SITE_URL}${post.image}`],
    datePublished: toIsoDate(post.date),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Journal", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 2, name: post.title, item: url },
    ],
  };

  return (
    <div className="bg-(--color-cream)">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-14 md:px-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--color-forest)/60 transition-colors hover:text-(--color-forest)"
        >
          <ArrowLeft size={14} weight="bold" />
          Back to the Journal
        </Link>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">
          {post.category}
        </p>
        <h1 className="font-serif-display mt-2 text-4xl leading-[1.08] text-(--color-forest) sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-(--color-forest)/55">
          {post.date} · {post.readTime}
        </p>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            priority
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-10 space-y-5">
          {post.body.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={i}
                  className="font-serif-display pt-4 text-2xl leading-snug text-(--color-forest)"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-(--color-forest)/80">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-[15px] leading-relaxed text-(--color-forest)/80">
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="mt-14 flex flex-wrap gap-3 border-t border-black/5 pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-(--color-forest) px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-(--color-forest)/90"
          >
            Shop Greens
            <ArrowRight size={15} weight="bold" />
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-(--color-forest)/20 px-6 py-3 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
          >
            More Stories
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 pb-16 md:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">
            More in {post.category}
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_14px_rgba(31,58,36,0.08)] transition-shadow hover:shadow-[0_8px_28px_rgba(31,58,36,0.16)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={r.image}
                    alt={r.imageAlt}
                    fill
                    sizes="(min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif-display text-lg leading-snug text-(--color-forest)">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
