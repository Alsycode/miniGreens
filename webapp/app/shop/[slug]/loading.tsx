import { Skeleton } from "@/components/skeletons/Skeleton";

export default function ProductLoading() {
  return (
    <div className="bg-[#f1eee4]">
    <main className="mx-auto max-w-7xl px-6 py-8 pb-24 md:px-10 lg:pb-8">
      <Skeleton className="mb-8 h-4 w-64" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-16 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-9 w-3/4" />
          <Skeleton className="mt-3 h-4 w-40" />
          <Skeleton className="mt-5 h-8 w-32" />
          <Skeleton className="mt-6 h-16 w-full" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-2/3" />
            ))}
          </div>
          <Skeleton className="mt-6 h-12 w-full rounded-full" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}
