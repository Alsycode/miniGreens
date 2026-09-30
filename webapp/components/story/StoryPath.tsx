"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

// How far each connecting curve bows out: right loop after 01, gentle wiggle to 03, left sweep into 04.
const SWINGS = [300, -110, -170];

function buildPath(nodes: Point[]) {
  if (nodes.length === 0) return "";
  const first = nodes[0];
  let d = `M${first.x - 70},0 C${first.x - 90},${first.y * 0.45} ${first.x - 10},${first.y * 0.55} ${first.x},${first.y}`;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    const dy = b.y - a.y;
    const swing = SWINGS[(i - 1) % SWINGS.length];
    const pivot = swing > 0 ? Math.max(a.x, b.x) : Math.min(a.x, b.x);
    d += ` C${pivot + swing},${a.y + dy * 0.55} ${b.x + swing * 0.7},${b.y - dy * 0.3} ${b.x},${b.y}`;
  }
  return d;
}

/** Decorative dashed trail that connects every `[data-story-node]` inside its parent. */
export function StoryPath() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState({ d: "", w: 0, h: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    const container = svg?.parentElement;
    if (!svg || !container) return;

    const measure = () => {
      const box = container.getBoundingClientRect();
      const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-story-node]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      setState({ d: buildPath(nodes), w: box.width, h: box.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox={`0 0 ${state.w || 1} ${state.h || 1}`}
      preserveAspectRatio="none"
    >
      {state.d && (
        <path
          d={state.d}
          fill="none"
          stroke="#2c4a26"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
