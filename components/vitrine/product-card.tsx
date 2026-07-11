import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import { AvailabilityBadge, HighlightBadge } from "./badges";
import { WhatsAppButton } from "./whatsapp-button";
import { ImageOff } from "lucide-react";

type ProductCardData = {
  name: string;
  slug: string;
  code: string | null;
  price: number;
  availability: "DISPONIVEL" | "ESGOTADO";
  highlight: "NENHUM" | "NOVIDADE" | "MAIS_VENDIDA";
  images: { url: string; alt?: string | null }[];
};

type StoreInfo = {
  whatsappNumber?: string | null;
  whatsappGreeting?: string | null;
} | null;

export function ProductCard({ product, store }: { product: ProductCardData; store: StoreInfo }) {
  const capa = product.images[0];
  const esgotado = product.availability === "ESGOTADO";

  return (
    <div className="group bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        {capa ? (
          <Image
            src={capa.url}
            alt={capa.alt ?? product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              esgotado ? "opacity-60 grayscale-[35%]" : ""
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="text-muted-foreground flex h-full items-center justify-center">
            <ImageOff className="size-8" />
          </span>
        )}
        <span className="absolute top-2 left-2 flex flex-col items-start gap-1">
          <HighlightBadge highlight={product.highlight} />
          <AvailabilityBadge availability={product.availability} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/produtos/${product.slug}`} className="min-w-0">
          <h3 className="truncate text-sm font-medium" title={product.name}>
            {product.name}
          </h3>
          <p className="text-primary text-lg font-semibold">{formatPrice(product.price)}</p>
        </Link>
        <div className="mt-auto">
          <WhatsAppButton product={product} store={store} size="sm" />
        </div>
      </div>
    </div>
  );
}
