import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";
import { PhotosManager } from "../photos-manager";
import { ColorsManager } from "../colors-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Editar Peça",
};

export default async function EditarPecaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criada?: string }>;
}) {
  const { id } = await params;
  const { criada } = await searchParams;

  const [produto, categorias] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        colors: { orderBy: { name: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!produto || produto.deletedAt) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar para peças">
          <Link href="/admin/produtos">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{produto.name}</h1>
          <p className="text-muted-foreground text-sm">Peças &gt; Editar</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/produtos/${produto.slug}`} target="_blank">
            Ver na vitrine
            <ExternalLink />
          </Link>
        </Button>
      </div>

      {criada && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="font-medium">Peça criada! 🎉</p>
          <p className="text-muted-foreground">
            Agora adicione as fotos (obrigatório para a vitrine) e as cores disponíveis abaixo.
          </p>
        </div>
      )}

      <ProductForm
        product={{
          id: produto.id,
          name: produto.name,
          code: produto.code,
          description: produto.description,
          price: produto.price,
          categoryId: produto.categoryId,
          availableSizes: produto.availableSizes,
          availability: produto.availability,
          highlight: produto.highlight,
          isActive: produto.isActive,
        }}
        categories={categorias}
      />

      <PhotosManager
        productId={produto.id}
        images={produto.images.map((img) => ({
          id: img.id,
          url: img.url,
          displayOrder: img.displayOrder,
        }))}
      />

      <ColorsManager
        productId={produto.id}
        colors={produto.colors.map((cor) => ({ id: cor.id, name: cor.name, hex: cor.hex }))}
      />
    </div>
  );
}
