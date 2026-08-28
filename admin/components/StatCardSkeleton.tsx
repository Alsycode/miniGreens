export default function StatCardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm ${wide ? "md:col-span-2" : ""}`}
    >
      {/* Icon + trend row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
        <div className="w-14 h-5 rounded-full skeleton-shimmer" />
      </div>
      {/* Value */}
      <div className="w-28 h-8 rounded-lg skeleton-shimmer mb-2" />
      {/* Label */}
      <div className="w-36 h-4 rounded-md skeleton-shimmer" />
    </div>
  );
}
