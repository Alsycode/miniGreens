import type { Metadata } from "next";
import { PageShell, Panel } from "@/components/PageShell";

export const metadata: Metadata = { title: "Terms & Conditions | Mini Greens Company" };

const SECTIONS = [
  {
    title: "1. Using This Site",
    body: [
      "By browsing this site or placing an order you agree to these terms. If you don't agree with them, please don't use the service.",
      "You must be at least 18 years old to place an order, and the details you give us must be accurate enough for us to actually find your door.",
    ],
  },
  {
    title: "2. Orders And Pricing",
    body: [
      "An order is a request, not a contract, until we confirm it. We confirm every order by phone or message before we harvest.",
      "Prices are shown in Indian Rupees and include applicable taxes. We may change prices at any time, but never after an order has been confirmed.",
      "If a crop fails or a variety is unavailable, we'll offer you a substitute of equal value or cancel that line at no charge.",
    ],
  },
  {
    title: "3. Subscriptions",
    body: [
      "Subscription plans renew automatically each week until you cancel. You can skip a week or cancel entirely at any time, with no notice period.",
      "Changes made before the evening prior to your delivery day apply to the next box. Changes made later apply to the box after that.",
    ],
  },
  {
    title: "4. Produce And Allergens",
    body: [
      "Our greens are grown and packed in a facility that also handles a range of seeds including mustard and sunflower. If you have a severe allergy, contact us before ordering.",
      "Nothing on this site is medical advice. Nutritional information is provided as a general guide only.",
    ],
  },
  {
    title: "5. Liability",
    body: [
      "We take responsibility for the quality and condition of produce at the point of delivery. Beyond that, our liability is limited to the value of the order concerned.",
      "Nothing in these terms limits any rights you have under applicable consumer protection law.",
    ],
  },
  {
    title: "6. Your Data",
    body: [
      "We collect only what we need to grow, pack, and deliver your order, and to contact you about it. We don't sell your details to anyone.",
      "You can ask us to delete your account and associated data at any time by writing to hello@minigreenscompany.com.",
    ],
  },
  {
    title: "7. Changes To These Terms",
    body: [
      "We may update these terms from time to time. The version published here is always the one that applies.",
      "Last updated 1 July 2026.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Customer Care"
      title="Terms &"
      accent="Conditions"
      intro="The plain-language version: grow honestly, deliver on time, fix what we get wrong. The longer version is below."
    >
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <Panel key={section.title} title={section.title}>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
