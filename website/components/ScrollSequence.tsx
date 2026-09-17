"use client";

import { useEffect, useRef } from "react";

const FRAME_COUNT = 492;
const FRAME_SRC = (i: number) =>
  `/hero-sequence/f${String(i + 1).padStart(4, "0")}.webp`;

const CAPTIONS = [
  { from: 0.02, to: 0.2, title: "A single bag.", sub: "Microgreens inside." },
  { from: 0.26, to: 0.46, title: "Whole ingredients.", sub: "Grown, never synthesised." },
  { from: 0.52, to: 0.72, title: "Pour. Wait. Breathe.", sub: "The ritual begins." },
  { from: 0.78, to: 0.97, title: "Three minutes.", sub: "That is all it takes." },
];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function ScrollSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const drawn = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      drawn.current = -1;
      render();
    };

    const paint = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      // Cover when the aspect gap is small, otherwise contain: on portrait screens
      // cover would crop the frame down to its middle third and lose the action.
      const cover = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const contain = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const scale = cover / contain <= 1.25 ? cover : contain;
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const nearestLoaded = (index: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        const before = images.current[index - d];
        if (before?.complete && before.naturalWidth) return before;
        const after = images.current[index + d];
        if (after?.complete && after.naturalWidth) return after;
      }
      return null;
    };

    const render = () => {
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(distance, 1), 0, 1);
      const index = Math.round(progress * (FRAME_COUNT - 1));

      if (index !== drawn.current) {
        const img = nearestLoaded(index);
        if (img) {
          paint(img);
          drawn.current = index;
        }
      }

      CAPTIONS.forEach((caption, i) => {
        const el = captionRefs.current[i];
        if (!el) return;
        const fade = (caption.to - caption.from) * 0.28;
        const opacity =
          progress < caption.from || progress > caption.to
            ? 0
            : Math.min(
                (progress - caption.from) / fade,
                (caption.to - progress) / fade,
                1,
              );
        el.style.opacity = String(clamp(opacity, 0, 1));
        el.style.transform = `translateY(${(1 - clamp(opacity, 0, 1)) * 14}px)`;
      });

      if (hintRef.current) {
        hintRef.current.style.opacity = String(clamp(1 - progress * 14, 0, 1));
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    // First frames eagerly so the section is never blank, the rest once idle.
    const load = (start: number, end: number) => {
      for (let i = start; i < end; i++) {
        const img = new window.Image();
        img.src = FRAME_SRC(i);
        img.onload = () => {
          if (drawn.current === -1 || i === drawn.current) render();
        };
        images.current[i] = img;
      }
    };

    images.current = new Array(FRAME_COUNT);
    load(0, 40);
    const idle = window.setTimeout(() => load(40, FRAME_COUNT), 600);

    resize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="How a Mini Greens cup is made"
      className="relative z-10 h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Fades the frame into the page background so the section below has no visible seam. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-(--color-ink)"
        />

        {CAPTIONS.map((caption, i) => (
          <div
            key={caption.title}
            ref={(el) => {
              captionRefs.current[i] = el;
            }}
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-16 px-6 text-center transition-none md:bottom-24"
          >
            <p className="font-display text-3xl text-(--color-cream) drop-shadow-[0_2px_18px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl">
              {caption.title}
            </p>
            <p className="mt-3 text-sm tracking-[0.18em] text-(--color-sage) uppercase sm:text-base">
              {caption.sub}
            </p>
          </div>
        ))}

        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs tracking-[0.3em] text-(--color-muted) uppercase"
        >
          Scroll
        </div>
      </div>
    </section>
  );
}
