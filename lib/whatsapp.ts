/**
 * Montagem da mensagem pré-formatada e do link wa.me.
 * A conversão da vitrine acontece aqui: interesse → conversa no WhatsApp.
 */

type ProductInfo = {
  name: string;
  code?: string | null;
  slug: string;
  availability: "DISPONIVEL" | "ESGOTADO";
};

type StoreInfo = {
  whatsappNumber?: string | null;
  whatsappGreeting?: string | null;
};

const SAUDACAO_PADRAO = "Olá! Vim pelo catálogo online.";

export function buildWhatsAppMessage(product: ProductInfo, store: StoreInfo, siteUrl: string): string {
  const saudacao = store.whatsappGreeting?.trim() || SAUDACAO_PADRAO;
  const ref = product.code ? ` (REF ${product.code})` : "";
  const link = `${siteUrl.replace(/\/$/, "")}/produtos/${product.slug}`;

  if (product.availability === "ESGOTADO") {
    return `${saudacao}\nVi que a peça ${product.name}${ref} está esgotada.\nQuando terá reposição?\n${link}`;
  }
  return `${saudacao}\nTenho interesse na peça: ${product.name}${ref}\n${link}`;
}

/**
 * Monta o link wa.me com o texto codificado.
 * Retorna null se o número não estiver configurado — o botão deve ser
 * ocultado/desabilitado nesse caso (evita wa.me/undefined).
 */
export function buildWaLink(product: ProductInfo, store: StoreInfo, siteUrl: string): string | null {
  const numero = store.whatsappNumber?.replace(/\D/g, "");
  if (!numero) return null;
  const texto = buildWhatsAppMessage(product, store, siteUrl);
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
