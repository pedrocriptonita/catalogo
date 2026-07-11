"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "./types";

const colorSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2, "Nome da cor deve ter pelo menos 2 caracteres").max(50),
  hex: z
    .union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex inválido (ex: #1B2A4A)")])
    .optional(),
});

async function revalidateProduct(productId: string) {
  const produto = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  if (produto) revalidatePath(`/produtos/${produto.slug}`);
}

export async function createProductColor(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = colorSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    hex: formData.get("hex") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.productColor.create({
      data: {
        productId: parsed.data.productId,
        name: parsed.data.name,
        hex: parsed.data.hex || null,
      },
    });
  } catch (e) {
    // P2002 = violação da unique (productId, name)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Esta cor já está cadastrada nesta peça" };
    }
    throw e;
  }

  await revalidateProduct(parsed.data.productId);
  return { ok: true };
}

export async function deleteProductColor(colorId: string): Promise<ActionState> {
  await requireAdmin();

  const cor = await prisma.productColor.findUnique({ where: { id: colorId } });
  if (!cor) return { ok: false, error: "Cor não encontrada" };

  await prisma.productColor.delete({ where: { id: colorId } });

  await revalidateProduct(cor.productId);
  return { ok: true };
}
