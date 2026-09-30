"use client";

import { useState, type ReactNode } from "react";

export type BestsellerTab = { id: string; label: string; href: string; cards: ReactNode[] };

export function BestsellerTabs({ tabs }: { tabs: BestsellerTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <>
      <div role="tablist" aria-label="Product categories" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                on
                  ? "border-(--color-forest) bg-(--color-forest) text-white"
                  : "border-(--color-forest)/20 bg-(--color-cream) text-(--color-forest) hover:border-(--color-forest)"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {current.cards}
      </div>
    </>
  );
}
