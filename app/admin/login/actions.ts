"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "E-mail ou senha inválidos" };
  }

  // Sessão válida não basta: o usuário precisa existir na tabela `admins`.
  const admin = await prisma.admin.findFirst({
    where: { authId: data.user.id, deletedAt: null },
  });

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Acesso negado: este usuário não é administrador" };
  }

  redirect("/admin");
}
