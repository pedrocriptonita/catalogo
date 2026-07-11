import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton do detalhe da peça: galeria + informações.
 */
export default function ProdutoLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/5] rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-16 rounded-md sm:w-20" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
