"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { updateStore } from "@/lib/actions/store";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type StoreData = {
  name: string;
  whatsappNumber: string;
  whatsappGreeting: string | null;
  logoUrl: string | null;
  instagramUrl: string | null;
  address: string | null;
} | null;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function StoreForm({ store }: { store: StoreData }) {
  const [state, formAction, pending] = useActionState(updateStore, initialActionState);
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logoUrl ?? null);

  useEffect(() => {
    if (state.ok) toast.success("Configurações salvas!");
    if (state.error) toast.error(state.error);
  }, [state]);

  const erros = state.fieldErrors ?? {};

  return (
    <form action={formAction}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configurações da Loja</CardTitle>
          <CardDescription>
            Esses dados aparecem na vitrine e montam a mensagem do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da loja *</Label>
            <Input id="name" name="name" defaultValue={store?.name ?? ""} required />
            <FieldError message={erros.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsappNumber">WhatsApp (E.164, só dígitos) *</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              inputMode="numeric"
              placeholder="5511999999999"
              defaultValue={store?.whatsappNumber ?? ""}
              required
            />
            <p className="text-muted-foreground text-xs">
              Código do país (55) + DDD + número, sem espaços ou símbolos. É para onde os
              compradores serão direcionados.
            </p>
            <FieldError message={erros.whatsappNumber} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsappGreeting">Saudação da mensagem</Label>
            <Textarea
              id="whatsappGreeting"
              name="whatsappGreeting"
              placeholder="Olá! Vim pelo catálogo online."
              defaultValue={store?.whatsappGreeting ?? ""}
              rows={2}
            />
            <p className="text-muted-foreground text-xs">
              Primeira frase da mensagem pré-formatada que o comprador envia.
            </p>
            <FieldError message={erros.whatsappGreeting} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logo">Logo</Label>
            {logoPreview && (
              <div className="relative size-20 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={logoPreview}
                  alt="Logo da loja"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
            )}
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
            />
            <p className="text-muted-foreground text-xs">JPG, PNG ou WEBP até 5MB.</p>
            <FieldError message={erros.logo} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              placeholder="https://instagram.com/sualoja"
              defaultValue={store?.instagramUrl ?? ""}
            />
            <FieldError message={erros.instagramUrl} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              placeholder="Rua do Atacado, 123 — Brás, São Paulo/SP"
              defaultValue={store?.address ?? ""}
            />
            <FieldError message={erros.address} />
          </div>

          <div>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Salvar configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
