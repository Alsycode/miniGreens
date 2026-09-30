import { Skeleton } from "@/components/skeletons/Skeleton";

export default function OrdersLoading() {
  return (
    <div>
      <div className="border-b border-black/5 bg-(--color-cream)">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-80 max-w-full" />
          <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/[0.07] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="w-full max-w-sm">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-3 h-4 w-56" />
                  <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                </div>
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
