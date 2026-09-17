interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}

export function PageShell({ eyebrow, title, intro, children }: Props) {
  return (
    <div>
      <div className="border-b border-(--color-border) bg-(--color-bg-muted)">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-(--color-navy)/60">
            {eyebrow}
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-(--color-navy) sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--color-muted)">{intro}</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-(--color-border) bg-white p-6 md:p-8">
      {title && <h2 className="font-display text-xl font-semibold text-(--color-navy)">{title}</h2>}
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-(--color-muted)">{children}</div>
    </section>
  );
}
