"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadToBucket, validateImageFile } from "@/lib/storage";
import type { ActionState } from "./types";

const storeSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja"),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{12,13}$/, "Use o formato E.164 sem símbolos: 5511999999999 (12-13 dígitos)"),
  whatsappGreeting: z.string().trim().max(300, "Saudação muito longa").optional(),
  instagramUrl: z
    .union([z.literal(""), z.url("Informe uma URL válida (https://instagram.com/...)")])
    .optional(),
  address: z.string().trim().max(300).optional(),
});

export async function updateStore(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappGreeting: formData.get("whatsappGreeting"),
    instagramUrl: formData.get("instagramUrl"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "");
      if (campo && !fieldErrors[campo]) fieldErrors[campo] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  // Logo (opcional)
  let logoUrl: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const erro = validateImageFile(logo);
    if (erro) return { ok: false, fieldErrors: { logo: erro } };
    try {
      const enviado = await uploadToBucket(logo, "logo");
      logoUrl = enviado.url;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Falha no upload do logo" };
    }
  }

  const dados = {
    name: parsed.data.name,
    whatsappNumber: parsed.data.whatsappNumber,
    whatsappGreeting: parsed.data.whatsappGreeting || null,
    instagramUrl: parsed.data.instagramUrl || null,
    address: parsed.data.address || null,
    ...(logoUrl ? { logoUrl } : {}),
  };

  const store = await prisma.store.findFirst();
  if (store) {
    await prisma.store.update({ where: { id: store.id }, data: dados });
  } else {
    await prisma.store.create({ data: dados });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/loja");
  return { ok: true };
}
