import { Skeleton } from "@/components/skeletons/Skeleton";
import { ProductGridSkeleton } from "@/components/skeletons/ProductCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="bg-[#f1eee4]">
      <div className="min-h-[520px] lg:min-h-[600px]">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-9 w-72" />
          <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="mt-8">
          <ProductGridSkeleton count={8} />
        </div>
      </main>
    </div>
  );
}
