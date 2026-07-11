"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { initialActionState, type ActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type CategoryData = { id: string; name: string; displayOrder: number };

export function CategoryDialog({
  category,
  trigger,
}: {
  category?: CategoryData;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  async function submit(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const action = category ? updateCategory : createCategory;
    const result = await action(_prev, formData);
    if (result.ok) {
      toast.success(category ? "Categoria atualizada!" : "Categoria criada!");
      setOpen(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    return result;
  }

  const [, formAction, pending] = useActionState(submit, initialActionState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{category ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            <DialogDescription>
              O slug (URL) é gerado automaticamente a partir do nome.
            </DialogDescription>
          </DialogHeader>

          {category && <input type="hidden" name="id" value={category.id} />}

          <div className="grid gap-2">
            <Label htmlFor="cat-name">Nome *</Label>
            <Input
              id="cat-name"
              name="name"
              defaultValue={category?.name ?? ""}
              placeholder="Ex: Blusas"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-order">Ordem de exibição</Label>
            <Input
              id="cat-order"
              name="displayOrder"
              type="number"
              min={0}
              defaultValue={category?.displayOrder ?? 0}
            />
            <p className="text-muted-foreground text-xs">
              Menor número aparece primeiro no filtro da vitrine.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
