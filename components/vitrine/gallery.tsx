"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

type GalleryImage = { id: string; url: string; alt: string | null };

/**
 * Galeria da página de detalhe: foto principal + thumbnails clicáveis.
 */
export function Gallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [selecionada, setSelecionada] = useState(0);

  if (images.length === 0) {
    return (
      <div className="text-muted-foreground flex aspect-[4/5] items-center justify-center rounded-xl border bg-muted">
        <ImageOff className="size-10" />
      </div>
    );
  }

  const atual = images[Math.min(selecionada, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
        <Image
          src={atual.url}
          alt={atual.alt ?? productName}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelecionada(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={cn(
                "relative aspect-[4/5] w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-colors sm:w-20",
                i === selecionada ? "border-primary" : "border-transparent hover:border-border"
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
