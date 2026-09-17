import { HeadCircuit, ShieldCheck, ArrowsClockwise, Truck } from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  { icon: Truck, title: "Free Delivery", subtitle: "On orders above ₹499" },
  { icon: ShieldCheck, title: "Secure Payment", subtitle: "100% safe & secure" },
  { icon: ArrowsClockwise, title: "Easy Returns", subtitle: "Hassle-free returns" },
  { icon: HeadCircuit, title: "24/7 Support", subtitle: "We're here to help" },
];

export function FeatureStrip() {
  return (
    <section id="how-it-works" className="border-y border-(--color-border) bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--color-navy)/10 text-(--color-navy)">
                <Icon size={20} weight="bold" />
              </span>
              <div>
                <p className="text-sm font-semibold text-(--color-ink)">{title}</p>
                <p className="text-xs text-(--color-muted)">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
