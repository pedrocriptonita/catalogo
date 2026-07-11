import { getStore, listActiveProducts, listCategories } from "@/lib/queries/catalog";
import { CategoryFilter } from "@/components/vitrine/category-filter";
import { ProductCard } from "@/components/vitrine/product-card";
import { PackageSearch, Sparkles } from "lucide-react";

export default async function VitrinePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [store, categorias, produtos] = await Promise.all([
    getStore(),
    listCategories(),
    listActiveProducts(categoria),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <CategoryFilter categories={categorias} active={categoria} />

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          {categoria ? (
            <>
              <PackageSearch className="text-muted-foreground size-10" />
              <p className="font-medium">Nenhuma peça encontrada nesta categoria</p>
              <p className="text-muted-foreground text-sm">
                Escolha outra categoria ou veja todas as peças.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="text-muted-foreground size-10" />
              <p className="font-medium">Em breve novas peças</p>
              <p className="text-muted-foreground text-sm">
                Estamos preparando o catálogo. Volte em breve!
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {produtos.map((produto) => (
            <ProductCard
              key={produto.id}
              product={{
                name: produto.name,
                slug: produto.slug,
                code: produto.code,
                price: produto.price,
                priceNote: produto.priceNote,
                availability: produto.availability,
                highlight: produto.highlight,
                images: produto.images.map((img) => ({ url: img.url, alt: img.alt })),
              }}
              store={store}
            />
          ))}
        </div>
      )}
    </div>
  );
}
