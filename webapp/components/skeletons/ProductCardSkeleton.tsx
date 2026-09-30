import { Skeleton } from "@/components/skeletons/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-3">
      <Skeleton className="mb-3 aspect-square w-full rounded-xl" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-3/5" />
      <Skeleton className="mt-3 h-5 w-1/3" />
      <Skeleton className="mt-3 h-10 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
