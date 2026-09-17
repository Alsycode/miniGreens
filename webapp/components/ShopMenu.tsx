"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";

const SHOP_ITEMS = [
  { label: "Teas", href: "/shop?category=tea-blends", note: "Microgreen tea bags" },
  { label: "Microgreens", href: "/shop?category=microgreens", note: "Fresh-cut trays" },
  { label: "Smoothies", href: "/shop?category=smoothies", note: "Cold-blended" },
  { label: "Juices", href: "/shop?category=juices", note: "Cold-pressed" },
];

export function ShopMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onShop = pathname === "/shop";
  const activeCategory = onShop ? searchParams.get("category") : null;

  useEffect(() => {
    setOpen(false);
    pinned.current = false;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        pinned.current = false;
      }
    }
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        pinned.current = false;
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }
  function scheduleClose() {
    if (pinned.current) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            pinned.current = next;
            return next;
          });
        }}
        className={`flex items-center gap-1 transition-colors hover:text-(--color-accent-dark) ${
          onShop ? "text-(--color-navy)" : ""
        }`}
      >
        Shop
        <CaretDown
          size={12}
          weight="bold"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-3 w-56 overflow-hidden rounded-xl border border-(--color-border) bg-white p-1.5 shadow-xl shadow-black/10"
        >
          {SHOP_ITEMS.map((item) => {
            const isActive = activeCategory === item.href.split("category=")[1];
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={`flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-(--color-bg-muted) ${
                  isActive ? "bg-(--color-bg-muted) text-(--color-navy)" : "text-(--color-muted)"
                }`}
              >
                <span className="text-sm font-medium text-(--color-navy)">{item.label}</span>
                <span className="text-xs text-(--color-muted)">{item.note}</span>
              </Link>
            );
          })}

          <div className="my-1.5 h-px bg-(--color-border)" />

          <Link
            href="/shop"
            role="menuitem"
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-(--color-bg-muted) ${
              onShop && !activeCategory ? "bg-(--color-bg-muted) text-(--color-navy)" : "text-(--color-muted)"
            }`}
          >
            All products
          </Link>
        </div>
      )}
    </div>
  );
}
