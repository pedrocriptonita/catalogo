"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ensureUniqueSlug } from "@/lib/utils/slug";
import type { ActionState } from "./types";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  displayOrder: z.coerce.number().int().min(0, "Ordem deve ser 0 ou maior").default(0),
});

function revalidate() {
  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout");
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const slug = await ensureUniqueSlug(parsed.data.name, async (s) =>
    Boolean(await prisma.category.findUnique({ where: { slug: s }, select: { id: true } }))
  );

  await prisma.category.create({
    data: { name: parsed.data.name, slug, displayOrder: parsed.data.displayOrder },
  });

  revalidate();
  return { ok: true };
}

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Categoria não informada" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const atual = await prisma.category.findUnique({ where: { id } });
  if (!atual || atual.deletedAt) return { ok: false, error: "Categoria não encontrada" };

  // Regenera o slug apenas se o nome mudou
  let slug = atual.slug;
  if (atual.name !== parsed.data.name) {
    slug = await ensureUniqueSlug(parsed.data.name, async (s) => {
      const existente = await prisma.category.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return Boolean(existente && existente.id !== id);
    });
  }

  await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, slug, displayOrder: parsed.data.displayOrder },
  });

  revalidate();
  return { ok: true };
}

export async function softDeleteCategory(id: string): Promise<ActionState> {
  await requireAdmin();

  const pecasVinculadas = await prisma.product.count({
    where: { categoryId: id, deletedAt: null },
  });
  if (pecasVinculadas > 0) {
    return {
      ok: false,
      error: `Esta categoria tem ${pecasVinculadas} peça(s) vinculada(s). Mova-as para outra categoria antes de desativar.`,
    };
  }

  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });

  revalidate();
  return { ok: true };
}
