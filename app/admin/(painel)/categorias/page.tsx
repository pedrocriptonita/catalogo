import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryDialog } from "./category-dialog";
import { CategoryRowActions } from "./category-row-actions";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Categorias",
};

export default async function CategoriasPage() {
  const categorias = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm">Agrupam as peças no filtro da vitrine</p>
        </div>
        <CategoryDialog
          trigger={
            <Button>
              <Plus />
              Nova categoria
            </Button>
          }
        />
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          {categorias.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">
              Nenhuma categoria ainda. Crie a primeira para poder cadastrar peças.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Ordem</TableHead>
                  <TableHead className="text-center">Peças</TableHead>
                  <TableHead className="pr-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="pl-6 font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="text-center">{cat.displayOrder}</TableCell>
                    <TableCell className="text-center">{cat._count.products}</TableCell>
                    <TableCell className="pr-6">
                      <CategoryRowActions
                        category={{
                          id: cat.id,
                          name: cat.name,
                          displayOrder: cat.displayOrder,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
