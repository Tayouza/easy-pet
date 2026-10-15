// Publica os logos das lojas no Storage e preenche stores.logo_url.
//
// Uso (na raiz do repositório; instale as deps uma vez com `npm install --prefix scripts`):
//   node scripts/upload-store-logos.mjs [--dir <pasta>] [--public-url <url>] [--dry-run]
//
//   --dir         pasta com manifest.json + PNGs (padrão: packages/brand/store-logos)
//   --public-url  origem usada na URL gravada em logo_url (padrão: a própria SUPABASE_URL).
//                 Local + celular: use o IP da LAN, ex. http://192.168.0.10:54321
//   --dry-run     só mostra o que faria
//
// Credenciais: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (Supabase Cloud). Sem elas, usa o
// Supabase local via `npx supabase status -o json`.
//
// manifest.json: [{ "nome": "...", "slug": "...", "categoria_id": "...", "file": "<slug>.png" }]
// Cada PNG vai para store-images/seed/logos/<slug>.png (upsert) e o logo_url das lojas cujo nome
// normalizado casa com o do manifest recebe a URL pública (+ ?v=<hash> para furar cache quando o
// arquivo mudar). Idempotente: rodar de novo não duplica nada e só atualiza o que mudou.
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUCKET = 'store-images';
const PREFIX = 'seed/logos';

// ---------------------------------------------------------------------
// Argumentos e credenciais
// ---------------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dir = resolve(opt('--dir') ?? join(root, 'packages/brand/store-logos'));
const dryRun = args.includes('--dry-run');

function credentials() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, origem: 'env' };
  }
  let out;
  try {
    out = execSync('npx supabase status -o json', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, ou suba o Supabase local (npx supabase start).');
  }
  const status = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1));
  const key = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
  if (!status.API_URL || !key) throw new Error('`supabase status` não retornou API_URL/SERVICE_ROLE_KEY.');
  return { url: status.API_URL, key, origem: 'supabase local' };
}

// ---------------------------------------------------------------------
// Normalização de nomes: "Patas & Cia Pet Shop", "patas-cia-pet-shop" e
// "patas-e-cia-pet-shop" viram a mesma chave.
// ---------------------------------------------------------------------
const chave = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((w) => w && w !== 'e')
    .join('');

// ---------------------------------------------------------------------
async function main() {
  const manifestPath = join(dir, 'manifest.json');
  if (!existsSync(manifestPath)) throw new Error(`manifest não encontrado: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('manifest.json deve ser um array');

  const { url, key, origem } = credentials();
  const publicOrigin = (opt('--public-url') ?? url).replace(/\/+$/, '');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  console.log(`Supabase: ${url} (${origem})${dryRun ? ' — DRY RUN' : ''}`);
  console.log(`Logos: ${dir} (${manifest.length} no manifest)`);

  const { data: stores, error } = await supabase.from('stores').select('id, nome, logo_url').range(0, 9999);
  if (error) throw new Error(`erro lendo stores: ${error.message}`);
  const porChave = new Map();
  for (const s of stores) {
    const k = chave(s.nome);
    porChave.set(k, [...(porChave.get(k) ?? []), s]);
  }

  let enviados = 0;
  let atualizadas = 0;
  let jaOk = 0;
  const semLoja = [];
  const semArquivo = [];
  const lojasComLogo = new Set();

  for (const item of manifest) {
    const slug = item.slug;
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      semArquivo.push(`${item.nome ?? '?'} (slug inválido: ${slug})`);
      continue;
    }
    const alvo = porChave.get(chave(item.nome)) ?? porChave.get(chave(slug)) ?? [];
    if (!alvo.length) {
      semLoja.push(item.nome ?? slug);
      continue;
    }
    const file = join(dir, item.file ?? `${slug}.png`);
    if (!existsSync(file)) {
      semArquivo.push(`${item.nome} (${file})`);
      continue;
    }
    const bytes = readFileSync(file);
    const path = `${PREFIX}/${slug}.png`;
    const versao = createHash('sha1').update(bytes).digest('hex').slice(0, 10);
    const logoUrl = `${publicOrigin}/storage/v1/object/public/${BUCKET}/${path}?v=${versao}`;

    if (!dryRun) {
      const up = await supabase.storage.from(BUCKET).upload(path, bytes, {
        upsert: true,
        contentType: 'image/png',
        cacheControl: '31536000',
      });
      if (up.error) throw new Error(`upload ${path}: ${up.error.message}`);
    }
    enviados++;

    for (const s of alvo) {
      lojasComLogo.add(s.id);
      if (s.logo_url === logoUrl) {
        jaOk++;
        continue;
      }
      if (!dryRun) {
        const { error: e } = await supabase.from('stores').update({ logo_url: logoUrl }).eq('id', s.id);
        if (e) throw new Error(`update ${s.nome}: ${e.message}`);
      }
      atualizadas++;
    }
  }

  const semLogo = stores.filter((s) => !lojasComLogo.has(s.id)).map((s) => s.nome);
  console.log(`\nPNGs enviados: ${enviados}`);
  console.log(`Lojas atualizadas: ${atualizadas}${jaOk ? ` (+${jaOk} já estavam com o logo atual)` : ''}`);
  if (semLoja.length) console.log(`\nNão casaram com nenhuma loja (${semLoja.length}):\n  - ${semLoja.join('\n  - ')}`);
  if (semArquivo.length) console.log(`\nIgnorados por arquivo/slug (${semArquivo.length}):\n  - ${semArquivo.join('\n  - ')}`);
  if (semLogo.length) console.log(`\nLojas sem logo no manifest (${semLogo.length}):\n  - ${semLogo.join('\n  - ')}`);
}

main().catch((err) => {
  console.error(`✖ ${err.message}`);
  process.exit(1);
});
