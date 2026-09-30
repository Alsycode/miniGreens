"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowsClockwise, Storefront } from "@phosphor-icons/react";

/**
 * Mobile-only Shop / Subscribe bar for the homepage. Slides in once the hero has
 * scrolled away and out again when the footer arrives, so it never covers links.
 */
export function StickyShopBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const footer = document.querySelector("footer");
    function onScroll() {
      const pastHero = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      const atFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      setVisible(pastHero && !atFooter);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Hero height changes as its images finish loading, which shifts where
    // "past the hero" falls — recompute then so the bar doesn't flash in early.
    const resizeObserver = new ResizeObserver(onScroll);
    if (hero) resizeObserver.observe(hero);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-(--color-forest)/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-200 md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex gap-2 px-4 py-3">
        <Link
          href="/shop"
          tabIndex={visible ? 0 : -1}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-(--color-sun) py-3 text-sm font-semibold text-(--color-forest)"
        >
          <Storefront size={16} weight="bold" />
          Shop
        </Link>
        <Link
          href="/subscriptions/custom?frequency=weekly"
          tabIndex={visible ? 0 : -1}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-(--color-forest) py-3 text-sm font-semibold text-white"
        >
          <ArrowsClockwise size={16} weight="bold" />
          Subscribe
        </Link>
      </div>
    </div>
  );
}
