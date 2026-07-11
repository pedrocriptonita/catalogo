import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

// Rebusca as peças a cada hora — peças novas entram no sitemap sem redeploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const entradas: MetadataRoute.Sitemap = [{ url: base, changeFrequency: "daily", priority: 1 }];

  try {
    const produtos = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const produto of produtos) {
      entradas.push({
        url: `${base}/produtos/${produto.slug}`,
        lastModified: produto.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Banco indisponível (ex: build de CI) — devolve só a home.
  }

  return entradas;
}
