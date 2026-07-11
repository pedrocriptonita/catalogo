"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createProductColor, deleteProductColor } from "@/lib/actions/product-colors";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Loader2, Plus, X } from "lucide-react";

type ColorData = { id: string; name: string; hex: string | null };

export function ColorsManager({ productId, colors }: { productId: string; colors: ColorData[] }) {
  const [state, formAction, pending] = useActionState(createProductColor, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [usarHex, setUsarHex] = useState(true);

  useEffect(() => {
    if (state.ok) {
      toast.success("Cor adicionada!");
      formRef.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cores disponíveis</CardTitle>
        <CardDescription>
          Lista informativa exibida na página da peça — o comprador não seleciona, apenas visualiza.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {colors.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {colors.map((cor) => (
              <li
                key={cor.id}
                className="flex items-center gap-2 rounded-full border py-1 pr-1 pl-3 text-sm"
              >
                {cor.hex && (
                  <span
                    aria-hidden
                    className="inline-block size-4 rounded-full border"
                    style={{ backgroundColor: cor.hex }}
                  />
                )}
                {cor.name}
                <ConfirmDialog
                  title="Remover cor?"
                  description={`A cor "${cor.name}" será removida desta peça.`}
                  confirmLabel="Remover"
                  onConfirm={() => deleteProductColor(cor.id)}
                  onDone={(r) => {
                    if (r.ok) toast.success("Cor removida");
                    else if (r.error) toast.error(r.error);
                  }}
                  trigger={
                    <button
                      type="button"
                      aria-label={`Remover ${cor.name}`}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 cursor-pointer items-center justify-center rounded-full"
                    >
                      <X className="size-3.5" />
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="productId" value={productId} />
          <div className="grid gap-1.5">
            <Label htmlFor="color-name">Nome da cor</Label>
            <Input
              id="color-name"
              name="name"
              placeholder="Ex: Azul-marinho"
              className="w-44"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="color-hex">Cor do swatch</Label>
            <div className="flex h-9 items-center gap-2">
              <input
                type="checkbox"
                id="usar-hex"
                checked={usarHex}
                onChange={(e) => setUsarHex(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              {usarHex ? (
                <input
                  id="color-hex"
                  type="color"
                  name="hex"
                  defaultValue="#1B2A4A"
                  className="h-8 w-12 cursor-pointer rounded border"
                />
              ) : (
                <>
                  <input type="hidden" name="hex" value="" />
                  <span className="text-muted-foreground text-xs">sem bolinha de cor</span>
                </>
              )}
            </div>
          </div>
          <Button type="submit" disabled={pending} size="sm">
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            Adicionar cor
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
