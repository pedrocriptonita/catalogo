import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Retorna o Admin logado (sessão Supabase válida + registro em `admins`),
 * ou null se não autenticado/autorizado.
 */
export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = await prisma.admin.findFirst({
    where: { authId: user.id, deletedAt: null },
  });

  return admin;
}

/**
 * Guarda de rota para páginas do admin: redireciona para o login se a
 * sessão não existir ou o usuário não estiver na tabela `admins`.
 */
export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}
