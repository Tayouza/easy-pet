const STORAGE_PATH = '/storage/v1/object/public/';

/** 127.x, localhost, 0.0.0.0 e faixas privadas (10/8, 172.16/12, 192.168/16) — ambiente local/LAN. */
function isLocalHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname.startsWith('127.')) return true;
  if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return true;
  const m = /^172\.(\d+)\./.exec(hostname);
  return !!m && Number(m[1]) >= 16 && Number(m[1]) <= 31;
}

/**
 * URLs do Storage gravadas no banco local carregam a origem de quando foram geradas
 * (127.0.0.1 ou um IP de LAN que muda com a rede). Reescreve a origem para a do Supabase
 * configurado no app (`baseUrl`), mantendo path e query. URLs externas e da nuvem ficam intactas.
 */
export function resolveStorageUrl(url: string | null | undefined, baseUrl: string | null | undefined): string | null {
  if (!url) return null;
  if (!baseUrl) return url;
  try {
    const u = new URL(url);
    const b = new URL(baseUrl);
    if (u.origin !== b.origin && u.pathname.startsWith(STORAGE_PATH) && isLocalHost(u.hostname)) {
      return `${b.origin}${u.pathname}${u.search}`;
    }
  } catch {
    // URL relativa ou inválida: devolve como veio
  }
  return url;
}
