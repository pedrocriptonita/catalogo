"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";

type CategoryOption = { id: string; name: string };

export type ProductFormData = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  price: number; // centavos
  categoryId: string;
  availableSizes: string[];
  availability: "DISPONIVEL" | "ESGOTADO";
  highlight: "NENHUM" | "NOVIDADE" | "MAIS_VENDIDA";
  isActive: boolean;
};

const TAMANHOS_COMUNS = ["P", "M", "G", "GG", "G1", "G2", "G3", "Único"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductFormData;
  categories: CategoryOption[];
}) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [tamanhos, setTamanhos] = useState<string[]>(product?.availableSizes ?? []);
  const [novoTamanho, setNovoTamanho] = useState("");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  useEffect(() => {
    if (state.ok) toast.success("Peça salva!");
    if (state.error) toast.error(state.error);
  }, [state]);

  const erros = state.fieldErrors ?? {};

  function adicionaTamanho(t: string) {
    const limpo = t.trim();
    if (!limpo) return;
    if (!tamanhos.includes(limpo)) setTamanhos([...tamanhos, limpo]);
    setNovoTamanho("");
  }

  return (
    <form action={formAction}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="sizes" value={JSON.stringify(tamanhos)} />
      <input type="hidden" name="isActive" value={isActive ? "on" : ""} />

      <Card>
        <CardHeader>
          <CardTitle>{product ? "Dados da peça" : "Nova peça"}</CardTitle>
          <CardDescription>
            {product
              ? "Altere os dados e salve"
              : "Depois de salvar, você poderá adicionar fotos e cores"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name ?? ""}
                placeholder="Ex: Blusa Cropped Canelada"
                required
              />
              <FieldError message={erros.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Código (REF)</Label>
              <Input
                id="code"
                name="code"
                defaultValue={product?.code ?? ""}
                placeholder="Ex: REF-1024"
              />
              <FieldError message={erros.code} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              placeholder="Material, modelagem, diferenciais para revenda..."
            />
            <FieldError message={erros.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Preço de atacado (R$) *</Label>
              <Input
                id="price"
                name="price"
                inputMode="decimal"
                placeholder="29,90"
                defaultValue={product ? (product.price / 100).toFixed(2).replace(".", ",") : ""}
                required
              />
              <FieldError message={erros.price} />
            </div>
            <div className="grid gap-2">
              <Label>Categoria *</Label>
              <Select name="categoryId" defaultValue={product?.categoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={erros.categoryId} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tamanhos disponíveis (informativo)</Label>
            <div className="flex flex-wrap gap-1.5">
              {TAMANHOS_COMUNS.map((t) => {
                const ativo = tamanhos.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      ativo ? setTamanhos(tamanhos.filter((x) => x !== t)) : adicionaTamanho(t)
                    }
                    className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      ativo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={novoTamanho}
                onChange={(e) => setNovoTamanho(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionaTamanho(novoTamanho);
                  }
                }}
                placeholder="Outro tamanho (ex: 38)"
                className="w-44"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adicionaTamanho(novoTamanho)}
              >
                <Plus />
              </Button>
            </div>
            {tamanhos.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tamanhos.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button
                      type="button"
                      aria-label={`Remover ${t}`}
                      className="cursor-pointer opacity-60 hover:opacity-100"
                      onClick={() => setTamanhos(tamanhos.filter((x) => x !== t))}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Disponibilidade</Label>
              <Select name="availability" defaultValue={product?.availability ?? "DISPONIVEL"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                  <SelectItem value="ESGOTADO">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Destaque</Label>
              <Select name="highlight" defaultValue={product?.highlight ?? "NENHUM"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NENHUM">Sem destaque</SelectItem>
                  <SelectItem value="NOVIDADE">Novidade</SelectItem>
                  <SelectItem value="MAIS_VENDIDA">Mais vendida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="isActiveSwitch">Publicada na vitrine</Label>
              <div className="flex h-9 items-center gap-2">
                <Switch id="isActiveSwitch" checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-muted-foreground text-sm">
                  {isActive ? "Visível" : "Rascunho"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {product ? "Salvar alterações" : "Criar peça"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
