import Link from "next/link";
import { cn } from "@/lib/utils";

type CategoryChip = { id: string; name: string; slug: string };

/**
 * Chips de categoria com scroll horizontal no mobile.
 * O filtro vive na URL (?categoria=slug) — link compartilhável.
 */
export function CategoryFilter({
  categories,
  active,
}: {
  categories: CategoryChip[];
  active?: string;
}) {
  if (categories.length === 0) return null;

  const chipClass = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
      isActive ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
    );

  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link href="/" className={chipClass(!active)}>
        Todas
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/?categoria=${cat.slug}`}
          className={chipClass(active === cat.slug)}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
