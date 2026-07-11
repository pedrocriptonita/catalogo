import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Nova Peça",
};

export default async function NovaPecaPage() {
  const categorias = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar para peças">
          <Link href="/admin/produtos">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nova peça</h1>
          <p className="text-muted-foreground text-sm">Peças &gt; Nova</p>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">Crie uma categoria primeiro</p>
          <p className="text-muted-foreground mt-1 text-sm">Toda peça precisa de uma categoria.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/categorias">Ir para categorias</Link>
          </Button>
        </div>
      ) : (
        <ProductForm categories={categorias} />
      )}
    </div>
  );
}
