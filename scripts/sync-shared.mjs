// Copia packages/shared/src para apps/web/src/shared e apps/mobile/src/shared.
// Uso: node scripts/sync-shared.mjs
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'packages/shared/src');

for (const app of ['web', 'mobile']) {
  const dest = join(root, 'apps', app, 'src/shared');
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  writeFileSync(
    join(dest, 'README.md'),
    'Cópia gerada de packages/shared/src por scripts/sync-shared.mjs — NÃO EDITE AQUI.\n',
  );
  console.log(`shared → apps/${app}/src/shared`);
}
