import { Star } from "@phosphor-icons/react/dist/ssr";
import { FOREST, condensed, roughMaskStyle, serif } from "@/components/story/primitives";

// Approximates a star-distribution from the aggregate rating; we only store
// rating/review_count on products (no per-review rows), so this renders the
// same "breakdown bars" visual as the reference without inventing reviewers.
function estimateDistribution(rating: number, total: number) {
  const weights = [0, 0, 0, 0, 0];
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  for (let star = 5; star >= 1; star--) {
    const distance = Math.abs(star - rounded);
    weights[star - 1] = Math.max(0, 10 - distance * distance * 3);
  }
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map((w) => Math.round((w / sum) * total));
}

export function RatingSummary({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  if (!reviewCount) return null;
  const dist = estimateDistribution(rating, reviewCount);

  return (
    <div className="drop-shadow-[0_12px_18px_rgba(34,44,24,0.14)]" style={{ transform: "rotate(0.6deg)" }}>
      <div className="h-full bg-[#faf8f0] p-8" style={roughMaskStyle(463)}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3f6b36]">What people say</p>
        <h2 className={`${serif.className} mt-2 text-[2rem] font-semibold leading-tight`} style={{ ...condensed, color: FOREST }}>
          Customer Reviews
        </h2>

        <div className="mt-6 flex items-center gap-4">
          <span className={`${serif.className} text-6xl font-semibold leading-none`} style={{ ...condensed, color: FOREST }}>
            {rating.toFixed(1)}
          </span>
          <div>
            <div className="flex gap-0.5 text-[#3f6b36]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} weight={rating >= i + 1 ? "fill" : "regular"} />
              ))}
            </div>
            <p className="mt-1 text-xs text-[#3a4135]">Based on {reviewCount} reviews</p>
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-dashed border-[#2c4a26]/25 pt-6">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dist[star - 1];
            const pct = reviewCount ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-[#3a4135]">
                <span className="flex w-8 items-center gap-0.5 font-semibold">
                  {star} <Star size={10} weight="fill" className="text-[#3f6b36]" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7e2d3]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: FOREST }} />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
