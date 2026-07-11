"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

/**
 * Compartilhar peça: Web Share API no mobile, copiar link no desktop.
 */
export function ShareButton({ title, url }: { title: string; url: string }) {
  async function compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuário cancelou o share — não é erro
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  return (
    <Button type="button" variant="outline" onClick={compartilhar}>
      <Share2 />
      Compartilhar
    </Button>
  );
}
