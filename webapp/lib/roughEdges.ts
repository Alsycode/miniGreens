function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Torn paper strip in a 1440×100 box, filled below a jagged line near the top. */
export function tornEdgePath(seed: number, base = 40, amp = 22) {
  const rand = seeded(seed);
  const pts: string[] = [];
  let x = 0;
  let drift = 0;
  while (x <= 1440) {
    drift = Math.max(-amp, Math.min(amp, drift + (rand() - 0.5) * amp * 0.9));
    const y = base + drift + (rand() - 0.5) * 7;
    pts.push(`${r1(x)},${r1(y)}`);
    x += 6 + rand() * 14;
  }
  pts.push(`1440,${base}`);
  return `M0,100 L${pts.join(" L")} L1440,100 Z`;
}

/** Rough-edged rectangle in a 100×100 box, used as a CSS mask for photos. */
function roughRectPath(seed: number, inset = 2.4) {
  const rand = seeded(seed);
  const pts: string[] = [];
  const side = (from: [number, number], to: [number, number], inward: [number, number]) => {
    const steps = 70;
    let wave = rand() * inset;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      wave = Math.max(0.2, Math.min(inset, wave + (rand() - 0.5) * 0.9));
      const j = wave + rand() * 0.7;
      pts.push(
        `${r1(from[0] + (to[0] - from[0]) * t + inward[0] * j)},${r1(from[1] + (to[1] - from[1]) * t + inward[1] * j)}`,
      );
    }
  };
  side([0, 0], [100, 0], [0, 1]);
  side([100, 0], [100, 100], [-1, 0]);
  side([100, 100], [0, 100], [0, -1]);
  side([0, 100], [0, 0], [1, 0]);
  return `M${pts.join(" L")} Z`;
}

export function roughMaskUrl(seed: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${roughRectPath(seed)}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
