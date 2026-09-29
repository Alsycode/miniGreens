"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JOURNAL_CATEGORIES, type JournalCategory, type JournalPost } from "@/lib/journal";

type Filter = "All" | JournalCategory;

export function JournalGrid({ posts, featuredSlug }: { posts: JournalPost[]; featuredSlug: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  // "All" skips the featured story (it's shown above); a category filter includes it.
  const visible =
    filter === "All" ? posts.filter((p) => p.slug !== featuredSlug) : posts.filter((p) => p.category === filter);
  const filters: Filter[] = ["All", ...JOURNAL_CATEGORIES];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">
            Latest from the journal
          </p>
          <h2 className="font-serif-display mt-2 text-3xl text-(--color-forest) sm:text-4xl">
            More Stories
          </h2>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter stories">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-(--color-forest) text-white"
                    : "border border-(--color-forest)/20 bg-white text-(--color-forest) hover:border-(--color-forest)"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_14px_rgba(31,58,36,0.08)] transition-shadow hover:shadow-[0_8px_28px_rgba(31,58,36,0.16)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-forest) backdrop-blur">
                {post.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[11px] font-medium uppercase tracking-wider text-(--color-forest)/55">
                {post.date} · {post.readTime}
              </p>
              <h3 className="font-serif-display mt-3 text-xl leading-snug text-(--color-forest)">
                {post.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-(--color-forest)/70">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-(--color-forest)/60">No stories in this category yet.</p>
      )}
    </div>
  );
}
