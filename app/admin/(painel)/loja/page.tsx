import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StoreForm } from "./store-form";

export const metadata: Metadata = {
  title: "Configurações da Loja",
};

export default async function LojaPage() {
  const store = await prisma.store.findFirst();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loja</h1>
        <p className="text-muted-foreground text-sm">
          Identidade da loja e destino das conversas do WhatsApp
        </p>
      </div>
      <StoreForm store={store} />
    </div>
  );
}
