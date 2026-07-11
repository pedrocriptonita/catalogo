"use client";

import { toast } from "sonner";
import { softDeleteCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CategoryDialog } from "./category-dialog";
import { Pencil, Trash2 } from "lucide-react";

type CategoryData = { id: string; name: string; displayOrder: number };

export function CategoryRowActions({ category }: { category: CategoryData }) {
  return (
    <div className="flex justify-end gap-1">
      <CategoryDialog
        category={category}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Editar ${category.name}`}>
            <Pencil />
          </Button>
        }
      />
      <ConfirmDialog
        title="Desativar categoria?"
        description={`"${category.name}" deixará de aparecer na vitrine. As peças vinculadas não são excluídas, mas você precisa movê-las antes.`}
        confirmLabel="Desativar"
        onConfirm={() => softDeleteCategory(category.id)}
        onDone={(result) => {
          if (result.ok) toast.success("Categoria desativada");
          else if (result.error) toast.error(result.error);
        }}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Desativar ${category.name}`}
          >
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}
