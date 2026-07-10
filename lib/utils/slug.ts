/**
 * Gera um slug URL-friendly a partir de um nome.
 * Ex: "Blusa Cropped Canelada" → "blusa-cropped-canelada"
 */
export function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (diacríticos combinantes)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Garante slug único: se já existir, adiciona sufixo -2, -3...
 * `exists` consulta o banco (ignorando o próprio registro em edições).
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const slugBase = generateSlug(base) || "item";
  let slug = slugBase;
  let sufixo = 2;
  while (await exists(slug)) {
    slug = `${slugBase}-${sufixo}`;
    sufixo++;
  }
  return slug;
}
