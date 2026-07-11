// Seed de desenvolvimento: 1 loja, 5 categorias e 4 peças de exemplo.
// Idempotente (upsert por slug/nome) — pode rodar mais de uma vez.
// Uso: npx prisma db seed  (ou npm run prisma:seed)
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

async function main() {
  // ---------- Loja ----------
  const store = await prisma.store.findFirst();
  if (!store) {
    await prisma.store.create({
      data: {
        name: "Loja K12 Atacado",
        whatsappNumber: "5511999999999", // TROQUE pelo número real em /admin/loja
        whatsappGreeting: "Olá! Vim pelo catálogo online da Loja K12.",
        instagramUrl: "https://instagram.com/lojak12",
        address: "Rua do Atacado, 123 — Brás, São Paulo/SP",
      },
    });
    console.log("✅ Loja criada");
  } else {
    console.log("↷ Loja já existe, mantida");
  }

  // ---------- Categorias ----------
  const categorias = [
    { name: "Blusas", slug: "blusas", displayOrder: 1 },
    { name: "Calças", slug: "calcas", displayOrder: 2 },
    { name: "Vestidos", slug: "vestidos", displayOrder: 3 },
    { name: "Conjuntos", slug: "conjuntos", displayOrder: 4 },
    { name: "Acessórios", slug: "acessorios", displayOrder: 5 },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of categorias) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, displayOrder: cat.displayOrder, deletedAt: null },
      create: cat,
    });
    catIds[cat.slug] = row.id;
  }
  console.log(`✅ ${categorias.length} categorias`);

  // ---------- Peças ----------
  const pecas = [
    {
      name: "Blusa Cropped Canelada",
      slug: "blusa-cropped-canelada",
      code: "REF-1001",
      description:
        "Blusa cropped em malha canelada de alta qualidade. Modelagem ajustada ao corpo, ideal para revenda — gira muito no verão.",
      price: 2490,
      priceNote: "A partir de 6 peças: R$ 21,99 a und.",
      availableSizes: ["P", "M", "G"],
      availability: "DISPONIVEL" as const,
      highlight: "NOVIDADE" as const,
      categorySlug: "blusas",
      colors: [
        { name: "Preto", hex: "#111111" },
        { name: "Off-white", hex: "#F5F0E8" },
        { name: "Rosa-chá", hex: "#D9A5A0" },
      ],
      images: [
        "https://picsum.photos/seed/blusa-cropped-1/800/1000",
        "https://picsum.photos/seed/blusa-cropped-2/800/1000",
        "https://picsum.photos/seed/blusa-cropped-3/800/1000",
      ],
    },
    {
      name: "Calça Wide Leg Alfaiataria",
      slug: "calca-wide-leg-alfaiataria",
      code: "REF-1002",
      description:
        "Calça wide leg em alfaiataria premium com caimento impecável. Cós alto, fechamento em zíper invisível.",
      price: 5990,
      availableSizes: ["36", "38", "40", "42", "44"],
      availability: "DISPONIVEL" as const,
      highlight: "MAIS_VENDIDA" as const,
      categorySlug: "calcas",
      colors: [
        { name: "Preto", hex: "#111111" },
        { name: "Bege", hex: "#D8C7A8" },
      ],
      images: [
        "https://picsum.photos/seed/calca-wide-1/800/1000",
        "https://picsum.photos/seed/calca-wide-2/800/1000",
      ],
    },
    {
      name: "Vestido Midi Floral",
      slug: "vestido-midi-floral",
      code: "REF-1003",
      description:
        "Vestido midi com estampa floral exclusiva, tecido leve com forro. Perfeito para lojas com público jovem.",
      price: 7490,
      availableSizes: ["P", "M", "G", "GG"],
      availability: "ESGOTADO" as const,
      highlight: "NENHUM" as const,
      categorySlug: "vestidos",
      colors: [{ name: "Estampado", hex: null }],
      images: ["https://picsum.photos/seed/vestido-midi-1/800/1000"],
    },
    {
      name: "Conjunto Moletom Peluciado",
      slug: "conjunto-moletom-peluciado",
      code: "REF-1004",
      description:
        "Conjunto de moletom peluciado (blusa + calça jogger). Interior felpudo, alta durabilidade. Campeão de vendas no inverno.",
      price: 8990,
      availableSizes: ["M", "G", "GG"],
      availability: "DISPONIVEL" as const,
      highlight: "NENHUM" as const,
      categorySlug: "conjuntos",
      colors: [
        { name: "Cinza-mescla", hex: "#9E9E9E" },
        { name: "Rosa-bebê", hex: "#F4C2C2" },
        { name: "Preto", hex: "#111111" },
      ],
      images: [
        "https://picsum.photos/seed/conjunto-moletom-1/800/1000",
        "https://picsum.photos/seed/conjunto-moletom-2/800/1000",
      ],
    },
  ];

  for (const peca of pecas) {
    const { categorySlug, colors, images, ...dados } = peca;
    const produto = await prisma.product.upsert({
      where: { slug: peca.slug },
      update: { ...dados, categoryId: catIds[categorySlug], deletedAt: null },
      create: { ...dados, categoryId: catIds[categorySlug] },
    });

    // Fotos: recria apenas se a peça ainda não tem nenhuma
    const fotosExistentes = await prisma.productImage.count({ where: { productId: produto.id } });
    if (fotosExistentes === 0) {
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({
          productId: produto.id,
          url,
          storagePath: `seed/${peca.slug}-${i}`,
          alt: peca.name,
          displayOrder: i,
        })),
      });
    }

    // Cores: upsert pela unique (productId, name)
    for (const cor of colors) {
      await prisma.productColor.upsert({
        where: { productId_name: { productId: produto.id, name: cor.name } },
        update: { hex: cor.hex },
        create: { productId: produto.id, name: cor.name, hex: cor.hex },
      });
    }
  }
  console.log(`✅ ${pecas.length} peças com fotos e cores`);
}

main()
  .then(() => console.log("🌱 Seed concluído"))
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
