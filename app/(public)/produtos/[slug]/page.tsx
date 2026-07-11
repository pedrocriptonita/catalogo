import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getStore } from "@/lib/queries/catalog";
import { formatPrice } from "@/lib/utils/format";
import { env } from "@/lib/env";
import { Gallery } from "@/components/vitrine/gallery";
import { ColorSwatch } from "@/components/vitrine/color-swatch";
import { ShareButton } from "@/components/vitrine/share-button";
import { WhatsAppButton } from "@/components/vitrine/whatsapp-button";
import { AvailabilityBadge, HighlightBadge } from "@/components/vitrine/badges";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProductBySlug(slug);
  if (!produto) return { title: "Peça não encontrada" };

  const titulo = `${produto.name} — ${formatPrice(produto.price)} no atacado`;
  const descricao =
    produto.description?.slice(0, 160) ??
    `${produto.name} por ${formatPrice(produto.price)} no atacado. Veja fotos e fale direto com a loja pelo WhatsApp.`;
  const capa = produto.images[0]?.url;
  const url = `${env.NEXT_PUBLIC_SITE_URL}/produtos/${produto.slug}`;

  return {
    title: produto.name,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      type: "website",
      ...(capa ? { images: [{ url: capa, width: 800, height: 1000, alt: produto.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      ...(capa ? { images: [capa] } : {}),
    },
  };
}

export default async function ProdutoPage({ params }: PageParams) {
  const { slug } = await params;

  const [produto, store] = await Promise.all([getProductBySlug(slug), getStore()]);
  if (!produto) notFound();

  const url = `${env.NEXT_PUBLIC_SITE_URL}/produtos/${produto.slug}`;
  const esgotado = produto.availability === "ESGOTADO";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" />
        Voltar ao catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <Gallery
          images={produto.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
          productName={produto.name}
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <HighlightBadge highlight={produto.highlight} />
            <AvailabilityBadge availability={produto.availability} />
            <Badge variant="outline">{produto.category.name}</Badge>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{produto.name}</h1>
            {produto.code && (
              <p className="text-muted-foreground mt-1 font-mono text-sm">REF {produto.code}</p>
            )}
          </div>

          <p className="text-primary text-3xl font-bold">
            {formatPrice(produto.price)}
            <span className="text-muted-foreground ml-2 text-sm font-normal">no atacado</span>
          </p>

          {produto.description && (
            <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
              {produto.description}
            </p>
          )}

          {produto.availableSizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Tamanhos disponíveis</h2>
              <div className="flex flex-wrap gap-1.5">
                {produto.availableSizes.map((tamanho) => (
                  <Badge key={tamanho} variant="secondary" className="px-3 py-1 text-sm">
                    {tamanho}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {produto.colors.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Cores disponíveis</h2>
              <div className="flex flex-wrap gap-1.5">
                {produto.colors.map((cor) => (
                  <ColorSwatch key={cor.id} name={cor.name} hex={cor.hex} />
                ))}
              </div>
            </div>
          )}

          {esgotado && (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
              Esta peça está esgotada no momento — mas você pode perguntar sobre a próxima reposição
              direto com a loja. 👇
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <WhatsAppButton product={produto} store={store} size="lg" className="sm:flex-1" />
            <ShareButton title={produto.name} url={url} />
          </div>

          <p className="text-muted-foreground text-xs">
            Tamanhos e cores são informativos — quantidade, grade e condições você combina na
            conversa.
          </p>
        </div>
      </div>
    </div>
  );
}
