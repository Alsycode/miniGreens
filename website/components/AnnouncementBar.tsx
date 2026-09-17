"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = { text: string; href?: string };

const MESSAGES: Message[] = [
  { text: "Free delivery on orders over ₹499" },
  { text: "Subscribe & save — a fresh box, every week", href: "/subscriptions" },
  { text: "Loved across 30,000+ kitchens · 4.7★ average rating" },
];

const INTERVAL = 4500;

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (MESSAGES.length < 2) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // hold on the first message
    const id = setInterval(
      () => setIndex((i) => (i + 1) % MESSAGES.length),
      INTERVAL,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-(--color-olive) text-white">
      <div className="relative mx-auto h-9 max-w-7xl overflow-hidden px-6 text-center text-xs font-medium">
        {MESSAGES.map((m, i) => {
          const body = m.href ? (
            <Link href={m.href} className="underline-offset-2 hover:underline">
              {m.text}
            </Link>
          ) : (
            m.text
          );
          return (
            <div
              key={m.text}
              aria-hidden={i !== index}
              className="absolute inset-0 flex items-center justify-center px-6 transition-opacity duration-500"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
