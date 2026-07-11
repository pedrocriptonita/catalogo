"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ensureUniqueSlug } from "@/lib/utils/slug";
import { parsePriceToCents } from "@/lib/utils/format";
import type { ActionState } from "./types";

const productSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  code: z.string().trim().max(50).optional(),
  description: z.string().trim().max(2000).optional(),
  price: z.string().trim().min(1, "Informe o preço"),
  categoryId: z.string().min(1, "Escolha uma categoria"),
  sizes: z.string().optional(), // JSON: ["P","M","G"]
  availability: z.enum(["DISPONIVEL", "ESGOTADO"]).default("DISPONIVEL"),
  highlight: z.enum(["NENHUM", "NOVIDADE", "MAIS_VENDIDA"]).default("NENHUM"),
  isActive: z.string().optional(), // checkbox: "on" | undefined
});

type ParsedProduct = {
  name: string;
  code: string | null;
  description: string | null;
  price: number;
  categoryId: string;
  availableSizes: string[];
  availability: "DISPONIVEL" | "ESGOTADO";
  highlight: "NENHUM" | "NOVIDADE" | "MAIS_VENDIDA";
  isActive: boolean;
};

function parseForm(formData: FormData): {
  data?: ParsedProduct;
  fieldErrors?: Record<string, string>;
} {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") ?? undefined,
    description: formData.get("description") ?? undefined,
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    sizes: formData.get("sizes") ?? undefined,
    availability: formData.get("availability") ?? "DISPONIVEL",
    highlight: formData.get("highlight") ?? "NENHUM",
    isActive: formData.get("isActive") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "");
      if (campo && !fieldErrors[campo]) fieldErrors[campo] = issue.message;
    }
    return { fieldErrors };
  }

  const cents = parsePriceToCents(parsed.data.price);
  if (!cents) {
    return { fieldErrors: { price: "Preço inválido — use por ex. 29,90" } };
  }

  let sizes: string[] = [];
  if (parsed.data.sizes) {
    try {
      const arr: unknown = JSON.parse(parsed.data.sizes);
      if (Array.isArray(arr)) {
        sizes = arr.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      sizes = [];
    }
  }

  return {
    data: {
      name: parsed.data.name,
      code: parsed.data.code || null,
      description: parsed.data.description || null,
      price: cents,
      categoryId: parsed.data.categoryId,
      availableSizes: sizes,
      availability: parsed.data.availability,
      highlight: parsed.data.highlight,
      isActive: parsed.data.isActive === "on",
    },
  };
}

/** Código (REF) já usado por outra peça? */
async function codeInUse(code: string, ignoreId?: string): Promise<boolean> {
  const existente = await prisma.product.findUnique({ where: { code }, select: { id: true } });
  return Boolean(existente && existente.id !== ignoreId);
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const { data, fieldErrors } = parseForm(formData);
  if (!data) return { ok: false, fieldErrors };

  if (data.code && (await codeInUse(data.code))) {
    return { ok: false, fieldErrors: { code: "Este código já é usado por outra peça" } };
  }

  const slug = await ensureUniqueSlug(data.name, async (s) =>
    Boolean(await prisma.product.findUnique({ where: { slug: s }, select: { id: true } }))
  );

  const produto = await prisma.product.create({ data: { ...data, slug } });

  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
  // Segue para a edição, onde ficam as abas de Fotos e Cores
  redirect(`/admin/produtos/${produto.id}?criada=1`);
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Peça não informada" };

  const atual = await prisma.product.findUnique({ where: { id } });
  if (!atual || atual.deletedAt) return { ok: false, error: "Peça não encontrada" };

  const { data, fieldErrors } = parseForm(formData);
  if (!data) return { ok: false, fieldErrors };

  if (data.code && (await codeInUse(data.code, id))) {
    return { ok: false, fieldErrors: { code: "Este código já é usado por outra peça" } };
  }

  // Regenera o slug apenas se o nome mudou
  let slug = atual.slug;
  if (atual.name !== data.name) {
    slug = await ensureUniqueSlug(data.name, async (s) => {
      const existente = await prisma.product.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return Boolean(existente && existente.id !== id);
    });
  }

  await prisma.product.update({ where: { id }, data: { ...data, slug } });

  revalidatePath("/admin/produtos");
  revalidatePath(`/produtos/${slug}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function softDeleteProduct(id: string): Promise<ActionState> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleProductActive(id: string): Promise<ActionState> {
  await requireAdmin();
  const produto = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!produto) return { ok: false, error: "Peça não encontrada" };
  await prisma.product.update({ where: { id }, data: { isActive: !produto.isActive } });
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleAvailability(id: string): Promise<ActionState> {
  await requireAdmin();
  const produto = await prisma.product.findUnique({
    where: { id },
    select: { availability: true, slug: true },
  });
  if (!produto) return { ok: false, error: "Peça não encontrada" };
  await prisma.product.update({
    where: { id },
    data: { availability: produto.availability === "DISPONIVEL" ? "ESGOTADO" : "DISPONIVEL" },
  });
  revalidatePath("/admin/produtos");
  revalidatePath(`/produtos/${produto.slug}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setHighlight(
  id: string,
  highlight: "NENHUM" | "NOVIDADE" | "MAIS_VENDIDA"
): Promise<ActionState> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { highlight } });
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
  return { ok: true };
}
