"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromBucket, uploadToBucket, validateImageFile, MAX_PHOTOS } from "@/lib/storage";
import type { ActionState } from "./types";

async function revalidateProduct(productId: string) {
  const produto = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  if (produto) revalidatePath(`/produtos/${produto.slug}`);
  revalidatePath("/", "layout");
}

export async function uploadProductImages(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return { ok: false, error: "Peça não informada" };

  const arquivos = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (arquivos.length === 0) return { ok: false, error: "Selecione pelo menos uma foto" };

  // Valida formato/tamanho de cada arquivo
  for (const arquivo of arquivos) {
    const erro = validateImageFile(arquivo);
    if (erro) return { ok: false, error: erro };
  }

  // Limite total de 5 fotos por peça
  const existentes = await prisma.productImage.count({ where: { productId } });
  if (existentes + arquivos.length > MAX_PHOTOS) {
    return {
      ok: false,
      error: `Limite de ${MAX_PHOTOS} fotos por peça (você tem ${existentes} e tentou adicionar ${arquivos.length})`,
    };
  }

  const produto = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });
  if (!produto) return { ok: false, error: "Peça não encontrada" };

  try {
    let ordem = existentes;
    for (const arquivo of arquivos) {
      const { url, path } = await uploadToBucket(arquivo, `products/${productId}`);
      await prisma.productImage.create({
        data: {
          productId,
          url,
          storagePath: path,
          alt: produto.name,
          displayOrder: ordem++,
        },
      });
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha no upload" };
  }

  await revalidateProduct(productId);
  return { ok: true };
}

export async function deleteProductImage(imageId: string): Promise<ActionState> {
  await requireAdmin();

  const imagem = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!imagem) return { ok: false, error: "Foto não encontrada" };

  await deleteFromBucket(imagem.storagePath);
  await prisma.productImage.delete({ where: { id: imageId } });

  // Renormaliza a ordem (0 = capa)
  const restantes = await prisma.productImage.findMany({
    where: { productId: imagem.productId },
    orderBy: { displayOrder: "asc" },
  });
  await Promise.all(
    restantes.map((img, i) =>
      img.displayOrder === i
        ? Promise.resolve()
        : prisma.productImage.update({ where: { id: img.id }, data: { displayOrder: i } })
    )
  );

  await revalidateProduct(imagem.productId);
  return { ok: true };
}

/** Move a foto uma posição para cima (-1) ou para baixo (+1) na galeria. */
export async function moveProductImage(imageId: string, direction: -1 | 1): Promise<ActionState> {
  await requireAdmin();

  const imagem = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!imagem) return { ok: false, error: "Foto não encontrada" };

  const vizinha = await prisma.productImage.findFirst({
    where: {
      productId: imagem.productId,
      displayOrder: direction === -1 ? { lt: imagem.displayOrder } : { gt: imagem.displayOrder },
    },
    orderBy: { displayOrder: direction === -1 ? "desc" : "asc" },
  });
  if (!vizinha) return { ok: true }; // já está na ponta

  await prisma.$transaction([
    prisma.productImage.update({
      where: { id: imagem.id },
      data: { displayOrder: vizinha.displayOrder },
    }),
    prisma.productImage.update({
      where: { id: vizinha.id },
      data: { displayOrder: imagem.displayOrder },
    }),
  ]);

  await revalidateProduct(imagem.productId);
  return { ok: true };
}
