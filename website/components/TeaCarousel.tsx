"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

/**
 * Full-viewport blend carousel.
 *
 * The 3D read is an illusion built from four flat cues fired on one shared
 * 650ms curve — size, depth-of-field blur, height on the ground plane, and
 * stacking order. There is no WebGL and nothing rotates in Z.
 *
 * Unlike the reference this is ported from, nothing animates `left` or
 * `height` (both trigger layout). All motion is transform/filter/opacity so
 * the whole thing stays on the compositor.
 */

type Blend = {
  slug: string;
  name: string;
  /** Cutout still: portrait, transparent alpha, pouch standing on the bottom edge. */
  src: string;
  /** Section backdrop for this blend. */
  bg: string;
};

// Stills are Kling renders (product lit on pure black) keyed to transparency and
// re-seated on one shared 2160x2880 canvas, so every blend shares a baseline and
// scale. Regenerate with scratchpad/kling/cutout.mjs if the artwork changes.
//
// Backdrops are dark, low-saturation tints built off the site's --color-ink
// (#05100a) rather than the product's own hue, so each slide reads as a
// near-black variant that stays inside the theme instead of a bright color
// block against it.
const BLENDS: Blend[] = [
  { slug: "green-vitality", name: "Green Vitality",  src: "/images/carousel/green-vitality.png",  bg: "#0a180f" },
  { slug: "green-detox",    name: "Green Detox",     src: "/images/carousel/green-detox.png",     bg: "#0a1a15" },
  { slug: "mint-green",     name: "Mint Green",      src: "/images/carousel/mint-green.png",      bg: "#0a1b17" },
  { slug: "green-lemon",    name: "Green Lemon",     src: "/images/carousel/green-lemon.png",     bg: "#14190a" },
  { slug: "green-masala",   name: "Green Masala",    src: "/images/carousel/green-masala.png",    bg: "#180f09" },
];

const DURATION = 650;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Six slots, not four. The reference has exactly as many images as visible
 * positions; with eight blends the four that are off-ring need somewhere to
 * wait. `enter` parks them at the back slot (fade up from depth) and `exit`
 * holds the one that just left the left slot (fade out in place), so nothing
 * ever visibly teleports across the stage.
 */
type Role = "center" | "right" | "back" | "left" | "exit" | "enter";

type Slot = {
  /** Horizontal offset from centre, in vw. */
  dx: number;
  /** Vertical offset as a share of the item's own height — negative lifts it upstage. */
  dy: number;
  scale: number;
  blur: number;
  opacity: number;
  z: number;
};

const DESKTOP: Record<Role, Slot> = {
  center: { dx: 0, dy: 0, scale: 1, blur: 0, opacity: 1, z: 20 },
  right: { dx: 24, dy: -9, scale: 0.28, blur: 2, opacity: 0.85, z: 10 },
  back: { dx: 0, dy: -11, scale: 0.22, blur: 4, opacity: 1, z: 5 },
  left: { dx: -24, dy: -9, scale: 0.28, blur: 2, opacity: 0.85, z: 10 },
  exit: { dx: -24, dy: -9, scale: 0.28, blur: 2, opacity: 0, z: 1 },
  enter: { dx: 0, dy: -11, scale: 0.22, blur: 4, opacity: 0, z: 1 },
};

const MOBILE: Record<Role, Slot> = {
  center: { dx: 0, dy: -14, scale: 0.72, blur: 0, opacity: 1, z: 20 },
  right: { dx: 30, dy: -26, scale: 0.2, blur: 2, opacity: 0.85, z: 10 },
  back: { dx: 0, dy: -28, scale: 0.16, blur: 4, opacity: 1, z: 5 },
  left: { dx: -30, dy: -26, scale: 0.2, blur: 2, opacity: 0.85, z: 10 },
  exit: { dx: -30, dy: -26, scale: 0.2, blur: 2, opacity: 0, z: 1 },
  enter: { dx: 0, dy: -28, scale: 0.16, blur: 4, opacity: 0, z: 1 },
};

/** Ring order going forwards: enter → back → right → centre → left → exit. */
function roleFor(offset: number, total: number): Role {
  if (offset === 0) return "center";
  if (offset === 1) return "right";
  if (offset === 2) return "back";
  if (offset === total - 1) return "left";
  if (offset === total - 2) return "exit";
  return "enter";
}

/** Blend hex → rgba so the backdrop reads as a translucent tint instead of a flat block. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

export function TeaCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const animating = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const total = BLENDS.length;
  const active = BLENDS[activeIndex];
  const slots = isMobile ? MOBILE : DESKTOP;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(mq.matches);
    onMotion();
    mq.addEventListener("change", onMotion);

    return () => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMotion);
    };
  }, []);

  // Warm every still so a rotation never lands on a blank slot.
  useEffect(() => {
    BLENDS.forEach((blend) => {
      const img = new window.Image();
      img.src = blend.src;
    });
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      // Re-entering mid-flight desyncs the slots, so hold until the ring settles.
      if (animating.current) return;
      animating.current = true;
      setActiveIndex((prev) =>
        direction === "next" ? (prev + 1) % total : (prev + total - 1) % total,
      );
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => {
          animating.current = false;
        },
        reduced ? 0 : DURATION,
      );
    },
    [reduced, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate("prev");
      if (e.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const motion = reduced
    ? "none"
    : `transform ${DURATION}ms ${EASE}, filter ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`;

  return (
    <div className="relative w-full overflow-hidden">
      <section
        aria-roledescription="carousel"
        aria-label="Microgreen tea blends"
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Blend tint — a separate layer (not the whole section) so it can fade
            to nothing at the top/bottom edges via a mask, letting the fixed
            LeafDecor background underneath carry through and seam this section
            into whatever sits above/below it, while the color itself still
            cross-fades smoothly between blends. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 1,
            backgroundColor: hexToRgba(active.bg, 0.55),
            transition: reduced ? "none" : `background-color ${DURATION}ms ${EASE}`,
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, black 160px, black calc(100% - 200px), transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0, black 160px, black calc(100% - 200px), transparent 100%)",
          }}
        />

        {/* Grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 50, opacity: 0.4, backgroundImage: GRAIN, backgroundRepeat: "repeat", backgroundSize: "200px 200px" }}
        />

        {/* Ghost wordmark — swaps with the active blend. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 flex select-none items-center justify-center"
          style={{ zIndex: 2, top: "18%" }}
        >
          <span
            className="font-carousel uppercase text-white"
            style={{
              fontSize: "clamp(64px, 19vw, 300px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              opacity: 0.16,
              transition: reduced ? "none" : `opacity ${DURATION}ms ${EASE}`,
            }}
          >
            {active.name.replace(/^Green\s+/i, "") || active.name}
          </span>
        </div>

        {/* Ring */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {BLENDS.map((blend, i) => {
            const role = roleFor((i - activeIndex + total) % total, total);
            const slot = slots[role];
            const hidden = role === "enter" || role === "exit";

            return (
              <div
                key={blend.slug}
                aria-hidden={hidden}
                className="absolute bottom-0 left-1/2"
                style={{
                  height: "80%",
                  aspectRatio: "0.75 / 1",
                  transformOrigin: "bottom center",
                  transform: `translateX(calc(-50% + ${slot.dx}vw)) translateY(${slot.dy}%) scale(${slot.scale})`,
                  filter: slot.blur ? `blur(${slot.blur}px)` : "none",
                  opacity: slot.opacity,
                  zIndex: slot.z,
                  transition: motion,
                  willChange: "transform, filter, opacity",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blend.src}
                  alt={role === "center" ? `${blend.name} microgreen tea` : ""}
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center" }}
                />
              </div>
            );
          })}
        </div>

        {/* Copy + controls */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 260 }}
        >
          <p
            className="mb-2 text-base font-bold uppercase tracking-widest text-white sm:mb-3 sm:text-[22px]"
            style={{ opacity: 0.95, letterSpacing: "0.02em" }}
            aria-live="polite"
          >
            {active.name}
          </p>
          <p
            className="mb-4 hidden text-xs text-white sm:mb-5 sm:block sm:text-sm"
            style={{ opacity: 0.85, lineHeight: 1.6 }}
          >
            Whole microgreens, picked at the farm and sealed the same day.
            Naturally caffeine-free, plastic-free, and brewed in three minutes.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("prev")}
              aria-label="Previous blend"
              className="carousel-nav flex size-12 items-center justify-center rounded-full text-white sm:size-16"
            >
              <ArrowLeft size={26} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => navigate("next")}
              aria-label="Next blend"
              className="carousel-nav flex size-12 items-center justify-center rounded-full text-white sm:size-16"
            >
              <ArrowRight size={26} weight="bold" />
            </button>
          </div>
        </div>

        {/* Shop link */}
        <a
          href={`/shop/${active.slug}-bag`}
          className="carousel-link absolute bottom-6 right-4 flex items-center gap-2 uppercase text-white no-underline sm:bottom-20 sm:right-10"
          style={{ zIndex: 60, letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          <span className="font-carousel" style={{ fontSize: "clamp(20px, 4vw, 56px)", fontWeight: 400 }}>
            Discover It
          </span>
          <ArrowRight className="size-5 sm:size-8" weight="bold" />
        </a>
      </section>
    </div>
  );
}
