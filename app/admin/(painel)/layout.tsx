import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { MobileNav } from "@/components/admin/mobile-nav";
import { Button } from "@/components/ui/button";
import { LogOut, Store } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex items-center gap-2 border-b p-4">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Store className="size-4" />
          </div>
          <span className="font-semibold">Painel da Loja</span>
        </div>
        <div className="flex-1 p-3">
          <AdminNav />
        </div>
        <div className="border-t p-3">
          <form action={logoutAction}>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b bg-card px-4">
          <MobileNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{admin.name ?? admin.email}</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank">
                Ver vitrine
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
