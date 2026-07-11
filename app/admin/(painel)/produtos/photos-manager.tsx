"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  deleteProductImage,
  moveProductImage,
  uploadProductImages,
} from "@/lib/actions/product-images";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";

type ImageData = { id: string; url: string; displayOrder: number };

const MAX_PHOTOS = 5;

export function PhotosManager({ productId, images }: { productId: string; images: ImageData[] }) {
  const [state, formAction, uploading] = useActionState(uploadProductImages, initialActionState);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Fotos enviadas!");
      formRef.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  const ordenadas = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const restantes = MAX_PHOTOS - images.length;

  function mover(imageId: string, direction: -1 | 1) {
    startTransition(async () => {
      const r = await moveProductImage(imageId, direction);
      if (r.error) toast.error(r.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Fotos ({images.length}/{MAX_PHOTOS})
        </CardTitle>
        <CardDescription>
          A primeira foto é a capa exibida na grade da vitrine. JPG, PNG ou WEBP até 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {ordenadas.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ordenadas.map((img, i) => (
              <div key={img.id} className="group relative overflow-hidden rounded-lg border">
                <div className="relative aspect-[4/5] bg-muted">
                  <Image
                    src={img.url}
                    alt={`Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                </div>
                {i === 0 && <Badge className="absolute top-2 left-2">Capa</Badge>}
                <div className="flex items-center justify-between gap-1 border-t bg-card p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === 0 || pending}
                    aria-label="Mover para a esquerda"
                    onClick={() => mover(img.id, -1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <ConfirmDialog
                    title="Remover foto?"
                    description="A foto será excluída do armazenamento. Essa ação não pode ser desfeita."
                    confirmLabel="Remover"
                    onConfirm={() => deleteProductImage(img.id)}
                    onDone={(r) => {
                      if (r.ok) toast.success("Foto removida");
                      else if (r.error) toast.error(r.error);
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive size-7"
                        aria-label="Remover foto"
                      >
                        <Trash2 />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === ordenadas.length - 1 || pending}
                    aria-label="Mover para a direita"
                    onClick={() => mover(img.id, 1)}
                  >
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {restantes > 0 ? (
          <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="productId" value={productId} />
            <input
              ref={inputRef}
              type="file"
              name="files"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="text-sm file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
              required
            />
            <Button type="submit" disabled={uploading} size="sm">
              {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              Enviar fotos
            </Button>
            <span className="text-muted-foreground text-xs">
              Você ainda pode adicionar {restantes} foto{restantes === 1 ? "" : "s"}.
            </span>
          </form>
        ) : (
          <p className="text-muted-foreground text-sm">
            Limite de {MAX_PHOTOS} fotos atingido. Remova uma para adicionar outra.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
