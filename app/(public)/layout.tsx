import Image from "next/image";
import Link from "next/link";
import { getStore } from "@/lib/queries/catalog";
import { MapPin, Store } from "lucide-react";
import { InstagramIcon } from "@/components/vitrine/instagram-icon";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();
  const nomeLoja = store?.name ?? "Catálogo de Atacado";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-card/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-3">
            {store?.logoUrl ? (
              <span className="relative block size-10 overflow-hidden rounded-full border bg-muted">
                <Image
                  src={store.logoUrl}
                  alt={`Logo ${nomeLoja}`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </span>
            ) : (
              <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                <Store className="size-5" />
              </span>
            )}
            <span className="text-lg font-semibold tracking-tight">{nomeLoja}</span>
          </Link>
          <span className="text-muted-foreground ml-auto hidden text-xs sm:block">
            Vendas no atacado · Atendimento pelo WhatsApp
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t bg-card">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm">
          <p className="text-foreground font-semibold">{nomeLoja}</p>
          {store?.address && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              {store.address}
            </p>
          )}
          {store?.instagramUrl && (
            <a
              href={store.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <InstagramIcon className="size-4 shrink-0" />
              Instagram
            </a>
          )}
          <p className="mt-2 text-xs">
            Vitrine de exposição — pedidos e negociação direto no WhatsApp.
          </p>
          <p className="text-xs">
            Desenvolvido por <span className="font-medium">BarvoxIA</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
