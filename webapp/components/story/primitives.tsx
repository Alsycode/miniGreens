import type { CSSProperties } from "react";
import Image from "next/image";
import { Nothing_You_Could_Do, Roboto_Serif } from "next/font/google";
import { roughMaskUrl, tornEdgePath } from "@/lib/roughEdges";

// Shared visual language of the "story" pages (About, Subscriptions): warm paper,
// condensed Roboto Serif, handwritten notes, torn edges and rough-cut photos.

export const serif = Roboto_Serif({ subsets: ["latin"], axes: ["wdth", "opsz"] });
export const script = Nothing_You_Could_Do({ subsets: ["latin"], weight: "400" });

export const PAPER = "#f1eee4";
export const FOREST = "#1d3a1b";
export const condensed: CSSProperties = { fontVariationSettings: "'wdth' 54, 'opsz' 72" };

export function TornEdge({ seed, flip = false, className = "" }: { seed: number; flip?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 z-10 h-14 w-full lg:h-20 ${flip ? "-scale-y-100" : ""} ${className}`}
    >
      <path d={tornEdgePath(seed + 100, 30, 20)} fill="#faf8f0" />
      <path d={tornEdgePath(seed)} fill={PAPER} />
    </svg>
  );
}

export function Note({ lines, className, desktopOnly = false }: { lines: string[]; className: string; desktopOnly?: boolean }) {
  return (
    <p
      className={`${script.className} pointer-events-none absolute hidden text-[1.45rem] leading-[1.2] ${
        desktopOnly ? "lg:block" : "md:block"
      } ${className}`}
    >
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}

/** Rough-cut paper mask; the seed fixes the edge shape so it doesn't shift between renders. */
export function roughMaskStyle(seed: number): CSSProperties {
  const mask = roughMaskUrl(seed);
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
}

export function TornPhoto({
  src,
  alt,
  seed,
  tilt,
  sizes = "(min-width: 1024px) 38vw, 92vw",
  aspect = "aspect-[4/3]",
}: {
  src: string;
  alt: string;
  seed: number;
  tilt: number;
  sizes?: string;
  aspect?: string;
}) {
  return (
    <div
      className="relative drop-shadow-[0_12px_18px_rgba(34,44,24,0.22)]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className={`relative w-full ${aspect}`} style={roughMaskStyle(seed)}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}
