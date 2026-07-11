import { createSupabaseServerClient } from "@/lib/supabase/server";

export const BUCKET = "products";
export const MAX_PHOTOS = 5; // máximo de fotos por peça
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}": formato inválido (use JPG, PNG ou WEBP)`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}": arquivo maior que 5MB`;
  }
  return null;
}

/**
 * Envia um arquivo para o bucket `products` e retorna URL pública + caminho.
 * Requer sessão de admin (as policies do Storage bloqueiam anônimos).
 */
export async function uploadToBucket(
  file: File,
  pathPrefix: string
): Promise<{ url: string; path: string }> {
  const supabase = await createSupabaseServerClient();
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) {
    throw new Error(`Falha no upload de "${file.name}": ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * Remove um objeto do bucket. Falha silenciosamente (ex: caminho de seed
 * que não existe no Storage) — a linha no banco é a fonte de verdade.
 */
export async function deleteFromBucket(path: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
