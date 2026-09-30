type ScriptNoteProps = {
  lines: [string, string];
  className?: string;
  tone?: "dark" | "light";
  arrow?: "down-left" | "down";
};

/** Handwritten annotation with a sketched arrow, e.g. "Wellness in every cup". */
export function ScriptNote({ lines, className = "", tone = "dark", arrow = "down-left" }: ScriptNoteProps) {
  const color = tone === "light" ? "text-white/90" : "text-(--color-forest)/85";
  return (
    <div className={`pointer-events-none select-none ${color} ${className}`} aria-hidden="true">
      <p className="font-script -rotate-12 text-[26px] leading-[0.95]">
        {lines[0]}
        <br />
        <span className="pl-5">{lines[1]}</span>
      </p>
      <svg
        viewBox="0 0 60 44"
        className={`mt-1 h-9 w-12 ${arrow === "down" ? "ml-4" : "ml-6"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {arrow === "down-left" ? (
          <>
            <path d="M54 4c2 16-10 30-44 32" />
            <path d="M18 28l-9 8 10 5" />
          </>
        ) : (
          <>
            <path d="M20 4c-8 10-6 24 4 34" />
            <path d="M16 32l8 7 5-10" />
          </>
        )}
      </svg>
    </div>
  );
}
