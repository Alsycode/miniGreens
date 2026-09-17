import Link from "next/link";
import {
  ArrowRight,
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  MapPin,
  Phone,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const CUSTOMER_CARE = [
  { label: "My Orders", href: "/orders" },
  { label: "Returns", href: "/returns" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-(--color-navy) text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                MG
              </span>
              <span className="font-display text-lg font-bold text-white">MINI GREENS</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Handpicked microgreens grown with care, delivered fresh to your doorstep.
            </p>
            <form className="mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-(--color-navy)"
              >
                <ArrowRight size={16} weight="bold" />
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Policies</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              {CUSTOMER_CARE.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-(--color-accent)" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeSimple size={16} className="text-(--color-accent)" /> hello@minigreenscompany.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-(--color-accent)" />
                123 Green Farm Road, Bangalore, Karnataka 560001
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <p>© 2026 Mini Greens Company. All rights reserved.</p>
          <div className="flex gap-3">
            {[InstagramLogo, FacebookLogo, YoutubeLogo].map((Icon, i) => (
              <span
                key={i}
                className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
