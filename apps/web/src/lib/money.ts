/** "49,90" | "1.234,5" → centavos (null se vazio/inválido). */
export function parseBRL(v: string): number | null {
  const s = v.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

export function centsToInput(c: number | null | undefined): string {
  return c == null ? "" : (c / 100).toFixed(2).replace(".", ",");
}
