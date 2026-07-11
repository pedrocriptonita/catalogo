import { prisma } from "@/lib/prisma";

/**
 * Consultas da vitrine pública. Apenas peças ativas e não deletadas.
 */

export async function getStore() {
  return prisma.store.findFirst();
}

export async function listCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}

export async function listActiveProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      ...(categorySlug ? { category: { slug: categorySlug, deletedAt: null } } : {}),
    },
    orderBy: [
      // Destaques primeiro, depois mais recentes
      { highlight: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      images: { orderBy: { displayOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      colors: { orderBy: { name: "asc" } },
      category: { select: { name: true, slug: true } },
    },
  });
}
