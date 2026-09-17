import { Leaf, Star } from "@phosphor-icons/react/dist/ssr";

type Review = {
  quote: string;
  name: string;
  city: string;
  rating: number;
};

const REVIEWS: Review[] = [
  {
    quote:
      "The Green Masala blend has replaced my evening chai. Same warmth, no caffeine, and I actually sleep now.",
    name: "Ananya Rao",
    city: "Bengaluru",
    rating: 5,
  },
  {
    quote:
      "Microgreens arrive the same day they're cut — you can tell. They last a full week in the fridge and taste alive.",
    name: "Karthik Menon",
    city: "Kochi",
    rating: 5,
  },
  {
    quote:
      "Started the tea box for my parents. Green Vitality in the morning, Mint Green after dinner. They're hooked.",
    name: "Priya Sharma",
    city: "Pune",
    rating: 5,
  },
  {
    quote:
      "Clean label, real ingredients, and the hibiscus one is genuinely delicious. Rare for a wellness product.",
    name: "Rohan Das",
    city: "Kolkata",
    rating: 4,
  },
];

const AVATAR_TINTS = [
  "bg-[#6f8f4a]/25 text-(--color-sage)",
  "bg-[#a8c97a]/20 text-(--color-sage-light)",
  "bg-[#c3dd9c]/15 text-(--color-sage-light)",
  "bg-[#5a7539]/30 text-(--color-sage)",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-10">
      <div className="mb-8 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
        <Leaf size={16} weight="fill" />
        The Voice of Our Customers
      </div>
      <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">
        Loved Across
        <br />
        <span className="text-(--color-sage)">30,000+ Kitchens</span>
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REVIEWS.map((r, i) => (
          <figure
            key={r.name}
            className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
          >
            <div className="flex gap-0.5 text-(--color-sage)">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  size={14}
                  weight={s < r.rating ? "fill" : "regular"}
                />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-(--color-muted)">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span
                className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_TINTS[i % AVATAR_TINTS.length]}`}
              >
                {initials(r.name)}
              </span>
              <span className="text-sm">
                <span className="block font-medium text-(--color-cream)">
                  {r.name}
                </span>
                <span className="block text-xs text-(--color-muted)">
                  {r.city}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
