import { Badge } from "@/components/ui/badge";

/**
 * Badges da vitrine (também reutilizados na listagem do admin se necessário).
 */

export function AvailabilityBadge({ availability }: { availability: "DISPONIVEL" | "ESGOTADO" }) {
  if (availability !== "ESGOTADO") return null;
  return <Badge variant="destructive">Esgotado</Badge>;
}

export function HighlightBadge({
  highlight,
}: {
  highlight: "NENHUM" | "NOVIDADE" | "MAIS_VENDIDA";
}) {
  if (highlight === "NOVIDADE") {
    return <Badge className="bg-primary text-primary-foreground">Novidade</Badge>;
  }
  if (highlight === "MAIS_VENDIDA") {
    return <Badge className="bg-amber-500 text-white">Mais vendida</Badge>;
  }
  return null;
}
