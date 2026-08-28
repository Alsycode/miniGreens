import type { Metadata } from "next";
import { PageShell, Panel } from "@/components/PageShell";

export const metadata: Metadata = { title: "About Us | Mini Greens Company" };

const VALUES = [
  {
    title: "Grown Without Shortcuts",
    body: "Every tray is seeded by hand in a soil blend we mix ourselves. No pesticides, no growth accelerants, no compromises on the things you can't taste but your body notices.",
  },
  {
    title: "Harvested The Same Morning",
    body: "We cut to order. The greens in your box were still growing a few hours before they reached your kitchen, which is why they last longer and taste sharper than anything on a shelf.",
  },
  {
    title: "A Farm You Could Visit",
    body: "We're a small team on the edge of the city, not a distribution network. If you want to see where your food comes from, the door is open most Saturdays.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="Our Story"
      title="A Small Farm"
      accent="With Strong Opinions"
      intro="Mini Greens Company started in 2019 with four seed trays on a balcony and a stubborn belief that fresh should mean hours, not weeks."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {VALUES.map((value) => (
          <Panel key={value.title} title={value.title}>
            <p>{value.body}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-4">
        <Panel title="Where We're Headed">
          <p>
            We now deliver to more than two thousand kitchens across the city
            every week, and we still cut every order by hand. Growth has never
            been the point — consistency is. Our next step is a second growing
            room so we can add more seasonal varieties without stretching the
            harvest window that makes the greens worth eating.
          </p>
          <p>
            If you have a question about how something is grown, ask us. We
            answer every message ourselves.
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}
