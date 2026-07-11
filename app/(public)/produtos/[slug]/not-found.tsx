import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageX } from "lucide-react";

/**
 * 404 amigável — links compartilhados podem apontar para peças removidas.
 */
export default function ProdutoNaoEncontrado() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <PackageX className="text-muted-foreground size-12" />
      <h1 className="text-xl font-semibold">Peça não encontrada</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Esta peça pode ter sido removida do catálogo ou o link está incorreto. Veja as peças
        disponíveis agora:
      </p>
      <Button asChild>
        <Link href="/">Ver catálogo</Link>
      </Button>
    </div>
  );
}
