"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  setHighlight,
  softDeleteProduct,
  toggleAvailability,
  toggleProductActive,
} from "@/lib/actions/products";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Trash2 } from "lucide-react";

type Highlight = "NENHUM" | "NOVIDADE" | "MAIS_VENDIDA";

const HIGHLIGHT_LABEL: Record<Highlight, string> = {
  NENHUM: "Sem destaque",
  NOVIDADE: "Novidade",
  MAIS_VENDIDA: "Mais vendida",
};

export function AvailabilityToggle({
  productId,
  availability,
}: {
  productId: string;
  availability: "DISPONIVEL" | "ESGOTADO";
}) {
  const [pending, startTransition] = useTransition();
  const esgotado = availability === "ESGOTADO";

  return (
    <button
      type="button"
      disabled={pending}
      className="cursor-pointer disabled:opacity-50"
      title="Clique para alternar"
      onClick={() =>
        startTransition(async () => {
          const r = await toggleAvailability(productId);
          if (r.ok) toast.success(esgotado ? "Marcada como disponível" : "Marcada como esgotada");
          else if (r.error) toast.error(r.error);
        })
      }
    >
      {esgotado ? (
        <Badge variant="destructive">Esgotado</Badge>
      ) : (
        <Badge variant="success">Disponível</Badge>
      )}
    </button>
  );
}

export function ActiveSwitch({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={pending}
      aria-label="Publicada na vitrine"
      onCheckedChange={() =>
        startTransition(async () => {
          const r = await toggleProductActive(productId);
          if (r.ok) toast.success(isActive ? "Peça despublicada" : "Peça publicada na vitrine");
          else if (r.error) toast.error(r.error);
        })
      }
    />
  );
}

export function HighlightSelect({
  productId,
  highlight,
}: {
  productId: string;
  highlight: Highlight;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={highlight}
      disabled={pending}
      onValueChange={(v) =>
        startTransition(async () => {
          const r = await setHighlight(productId, v as Highlight);
          if (r.ok) toast.success("Destaque atualizado");
          else if (r.error) toast.error(r.error);
        })
      }
    >
      <SelectTrigger size="sm" className="w-36">
        <span className="truncate">{HIGHLIGHT_LABEL[highlight]}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NENHUM">Sem destaque</SelectItem>
        <SelectItem value="NOVIDADE">Novidade</SelectItem>
        <SelectItem value="MAIS_VENDIDA">Mais vendida</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <ConfirmDialog
      title="Excluir peça?"
      description={`"${productName}" será removida da vitrine e da listagem. Links compartilhados passam a mostrar um aviso de peça não encontrada.`}
      confirmLabel="Excluir"
      onConfirm={() => softDeleteProduct(productId)}
      onDone={(r) => {
        if (r.ok) toast.success("Peça excluída");
        else if (r.error) toast.error(r.error);
      }}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          aria-label={`Excluir ${productName}`}
        >
          <Trash2 />
        </Button>
      }
    />
  );
}
