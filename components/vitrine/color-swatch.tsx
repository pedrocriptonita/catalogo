/**
 * Swatch de cor (bolinha + nome). Sem hex, exibe apenas o nome.
 */
export function ColorSwatch({ name, hex }: { name: string; hex: string | null }) {
  return (
    <span className="bg-card inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      {hex && (
        <span
          aria-hidden
          className="inline-block size-4 rounded-full border"
          style={{ backgroundColor: hex }}
        />
      )}
      {name}
    </span>
  );
}
