const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatPrice(cents: number | null | undefined, aPartir = false): string {
  if (cents == null) return 'Sob consulta';
  return `${aPartir ? 'a partir de ' : ''}${brl.format(cents / 100)}`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return '';
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatRating(nota: number | string | null | undefined): string {
  return Number(nota ?? 0).toFixed(1).replace('.', ',');
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso) : iso;
  return d.toLocaleDateString('pt-BR');
}

export function initials(nome: string): string {
  return nome
    .replace(/&/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÀ-Ú]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function onlyDigits(v: string | null | undefined): string {
  return (v ?? '').replace(/\D/g, '');
}

export function formatPhone(v: string | null | undefined): string {
  const d = onlyDigits(v);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return v ?? '';
}
