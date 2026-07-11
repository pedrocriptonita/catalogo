import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFilters } from "./product-filters";
import {
  ActiveSwitch,
  AvailabilityToggle,
  DeleteProductButton,
  HighlightSelect,
} from "./product-row-controls";
import { ImageOff, Pencil, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Peças",
};

const POR_PAGINA = 20;

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : undefined;
  const disponibilidade =
    params.disponibilidade === "DISPONIVEL" || params.disponibilidade === "ESGOTADO"
      ? params.disponibilidade
      : undefined;
  const status = params.status === "ativa" ? true : params.status === "inativa" ? false : undefined;
  const q = typeof params.q === "string" && params.q.trim() ? params.q.trim() : undefined;
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(categoria ? { categoryId: categoria } : {}),
    ...(disponibilidade ? { availability: disponibilidade } : {}),
    ...(status !== undefined ? { isActive: status } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const [produtos, total, categorias] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  function linkPagina(p: number) {
    const sp = new URLSearchParams();
    if (categoria) sp.set("categoria", categoria);
    if (disponibilidade) sp.set("disponibilidade", disponibilidade);
    if (params.status === "ativa" || params.status === "inativa")
      sp.set("status", String(params.status));
    if (q) sp.set("q", q);
    if (p > 1) sp.set("pagina", String(p));
    const query = sp.toString();
    return query ? `/admin/produtos?${query}` : "/admin/produtos";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Peças</h1>
          <p className="text-muted-foreground text-sm">
            {total} peça{total === 1 ? "" : "s"} no catálogo
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus />
            Nova peça
          </Link>
        </Button>
      </div>

      <ProductFilters categories={categorias} />

      <Card className="py-0">
        <CardContent className="px-0">
          {produtos.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">
              Nenhuma peça encontrada com esses filtros.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Peça</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead>Destaque</TableHead>
                  <TableHead className="text-center">Publicada</TableHead>
                  <TableHead className="pr-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        {produto.images[0] ? (
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <Image
                              src={produto.images[0].url}
                              alt={produto.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ) : (
                          <div className="text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-md border bg-muted">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{produto.name}</p>
                          {produto.code && (
                            <p className="text-muted-foreground font-mono text-xs">
                              {produto.code}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{produto.category.name}</TableCell>
                    <TableCell className="font-medium">{formatPrice(produto.price)}</TableCell>
                    <TableCell>
                      <AvailabilityToggle
                        productId={produto.id}
                        availability={produto.availability}
                      />
                    </TableCell>
                    <TableCell>
                      <HighlightSelect productId={produto.id} highlight={produto.highlight} />
                    </TableCell>
                    <TableCell className="text-center">
                      <ActiveSwitch productId={produto.id} isActive={produto.isActive} />
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${produto.name}`}
                        >
                          <Link href={`/admin/produtos/${produto.id}`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <DeleteProductButton productId={produto.id} productName={produto.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          {pagina > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={linkPagina(pagina - 1)}>Anterior</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
          )}
          <span className="text-muted-foreground text-sm">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <Button asChild variant="outline" size="sm">
              <Link href={linkPagina(pagina + 1)}>Próxima</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Próxima
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
