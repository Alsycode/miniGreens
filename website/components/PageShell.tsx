import { Leaf } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";

interface Props {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  children: React.ReactNode;
}

export function PageShell({ eyebrow, title, accent, intro, children }: Props) {
  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
          <Leaf size={16} weight="fill" />
          {eyebrow}
        </div>
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          {title}
          <br />
          <span className="text-(--color-sage)">{accent}</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-(--color-muted)">
          {intro}
        </p>

        <div className="mt-10">{children}</div>
      </main>

      <Footer />
    </div>
  );
}

export function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 md:p-8">
      {title && <h2 className="font-display text-2xl">{title}</h2>}
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-(--color-muted)">
        {children}
      </div>
    </section>
  );
}
