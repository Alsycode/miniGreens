import { Star } from "@phosphor-icons/react/dist/ssr";

// Approximates a star-distribution from the aggregate rating — we only store
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
    <section className="mt-14 max-w-2xl border-t border-(--color-border) pt-10">
      <h2 className="font-display text-2xl font-semibold text-(--color-navy)">Customer Reviews</h2>
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl font-bold text-(--color-navy)">
            {rating.toFixed(1)}
          </span>
          <div>
            <div className="flex gap-0.5 text-(--color-accent-dark)">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} weight={rating >= i + 1 ? "fill" : "regular"} />
              ))}
            </div>
            <p className="mt-1 text-xs text-(--color-muted)">Based on {reviewCount} reviews</p>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, i) => {
            const count = dist[star - 1];
            const pct = reviewCount ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-(--color-muted)">
                <span className="flex w-8 items-center gap-0.5">
                  {star} <Star size={10} weight="fill" className="text-(--color-accent-dark)" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-bg-muted)">
                  <div
                    className="h-full rounded-full bg-(--color-accent-dark)"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
