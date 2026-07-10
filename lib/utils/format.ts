/**
 * Formata preço em centavos para BRL. Ex: 2990 → "R$ 29,90"
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Converte input de preço ("29,90", "29.90", "R$ 29,90") para centavos.
 * Retorna null se não for um número válido.
 */
export function parsePriceToCents(input: string): number | null {
  const limpo = input.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  const valor = Number(limpo);
  if (!Number.isFinite(valor) || valor <= 0) return null;
  return Math.round(valor * 100);
}
