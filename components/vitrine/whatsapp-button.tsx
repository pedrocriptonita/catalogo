import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "./whatsapp-icon";
import { buildWaLink } from "@/lib/whatsapp";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

type ProductInfo = {
  name: string;
  code?: string | null;
  slug: string;
  availability: "DISPONIVEL" | "ESGOTADO";
};

type StoreInfo = {
  whatsappNumber?: string | null;
  whatsappGreeting?: string | null;
} | null;

/**
 * Botão "Comprar no WhatsApp" — usado no card da grade E no detalhe.
 * Se o número não estiver configurado, não renderiza nada (evita wa.me/undefined).
 * Peça esgotada mantém o botão ativo com mensagem adaptada (pergunta reposição).
 */
export function WhatsAppButton({
  product,
  store,
  size = "default",
  className,
}: {
  product: ProductInfo;
  store: StoreInfo;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  if (!store) return null;
  const waLink = buildWaLink(product, store, env.NEXT_PUBLIC_SITE_URL);
  if (!waLink) return null;

  const esgotado = product.availability === "ESGOTADO";

  return (
    <Button asChild variant="whatsapp" size={size} className={cn("w-full", className)}>
      <a href={waLink} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
        {esgotado ? "Perguntar reposição" : "Comprar no WhatsApp"}
      </a>
    </Button>
  );
}
