import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageCircle, PackageX, Shirt, Tags } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [ativas, esgotadas, categorias, store] = await Promise.all([
    prisma.product.count({ where: { isActive: true, deletedAt: null } }),
    prisma.product.count({
      where: { availability: "ESGOTADO", isActive: true, deletedAt: null },
    }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.store.findFirst(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do catálogo</p>
      </div>

      {/* Aviso: WhatsApp não configurado — sem ele o botão de compra fica oculto */}
      {!store?.whatsappNumber && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className="text-destructive size-5 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium">WhatsApp da loja não configurado</p>
              <p className="text-muted-foreground">
                Sem o número, o botão &quot;Comprar no WhatsApp&quot; não aparece na vitrine.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/loja">Configurar</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Shirt className="size-4" /> Peças publicadas
            </CardDescription>
            <CardTitle className="text-3xl">{ativas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <PackageX className="size-4" /> Esgotadas
            </CardDescription>
            <CardTitle className="text-3xl">{esgotadas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Tags className="size-4" /> Categorias
            </CardDescription>
            <CardTitle className="text-3xl">{categorias}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <MessageCircle className="size-4" /> WhatsApp
            </CardDescription>
            <CardTitle className="text-lg">
              {store?.whatsappNumber ? (
                <span className="font-mono">{store.whatsappNumber}</span>
              ) : (
                <Badge variant="destructive">Não configurado</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/produtos/novo">Cadastrar nova peça</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/categorias">Gerenciar categorias</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/loja">Configurações da loja</Link>
        </Button>
      </div>
    </div>
  );
}
