import type { Metadata } from "next";
import { PageShell, Panel } from "@/components/PageShell";

export const metadata: Metadata = { title: "Shipping Policy | Mini Greens Company" };

const SLOTS = ["08:00 – 10:00", "10:00 – 12:00", "12:00 – 14:00", "14:00 – 16:00"];

export default function ShippingPolicyPage() {
  return (
    <PageShell
      eyebrow="Customer Care"
      title="How Your Greens"
      accent="Get To You"
      intro="We deliver with our own vans across the city, six days a week. Nothing is handed to a courier, because nothing survives a courier."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Delivery Slots">
          <p>
            Choose one of four windows when you place an order. We text you a
            narrower estimate on the morning of delivery.
          </p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {SLOTS.map((slot) => (
              <li
                key={slot}
                className="rounded-full border border-(--color-border) px-3 py-1.5 text-xs text-(--color-cream)"
              >
                {slot}
              </li>
            ))}
          </ul>
          <p>
            We deliver Monday to Saturday. Orders placed after 18:00 are cut
            for the following day at the earliest.
          </p>
        </Panel>

        <Panel title="Charges">
          <p>
            Delivery is free on orders above ₹499 and on every subscription
            plan. Below that, a flat fee of ₹35 applies within the city limits.
          </p>
          <p>
            We currently deliver within a 25 km radius of the farm. If you&apos;re
            just outside it, message us — we sometimes add stops when there&apos;s
            enough demand on a route.
          </p>
        </Panel>

        <Panel title="Packaging">
          <p>
            Greens travel in ventilated punnets inside an insulated crate with
            a chilled gel pack. Everything except the gel pack is home
            compostable.
          </p>
          <p>
            Leave the crate out on your next delivery day and we&apos;ll take it
            back for reuse.
          </p>
        </Panel>

        <Panel title="If You're Not Home">
          <p>
            Tell us a safe shaded spot in your delivery notes and we&apos;ll leave
            the crate there. Without a note, our driver will call, wait five
            minutes, and then bring it back to the farm.
          </p>
          <p>
            A failed delivery can be rescheduled once at no cost. After that we
            charge the standard delivery fee.
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}
