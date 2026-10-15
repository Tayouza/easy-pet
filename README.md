# 🐾 EasyPet

**Vitrine geolocalizada de estabelecimentos pet em Porto Alegre‑RS.**

O EasyPet conecta tutores a pet shops, veterinários, banho e tosa, hotéis, adestradores e
muito mais. O cliente explora um mapa, filtra por categoria, fala no WhatsApp ou traça a rota
direto para a loja. O lojista cadastra a loja, escolhe um plano e acompanha métricas. O admin
modera lojas e enxerga o MRR no dashboard.

O projeto é uma **demo funcional** — nada de mockups: web e app leem e escrevem no Supabase de
verdade. Os **pagamentos são simulados** (checkout fake que aprova na hora e grava em `payments`).

> 📄 A fonte da verdade do produto é [`docs/SPEC.md`](docs/SPEC.md). Contratos (schema, rotas,
> tokens) mudam por lá.

---

## 🧱 Stack e estrutura

| Camada | Tecnologia | Onde |
|---|---|---|
| Site | Next.js 16 + Tailwind 4 + TypeScript | `apps/web` |
| App | Expo SDK 57 + Expo Router + React Native | `apps/mobile` |
| Backend | Supabase local (Postgres + PostGIS + Auth + Studio) | `supabase` |
| Compartilhado | Tipos do banco e helpers puros | `packages/shared` |
| Marca | Logo, ícones, splash e tokens de cor | `packages/brand` |

```
easypet/
├─ apps/
│  ├─ web/          # Next.js (site: cliente, lojista e admin)  — porta 3000
│  └─ mobile/       # Expo (app do cliente e do lojista)        — porta 8081
├─ packages/
│  ├─ shared/       # tipos do banco + helpers puros (fonte da verdade)
│  └─ brand/        # logo SVG, ícone, splash, tokens (JSON/TS/CSS)
├─ scripts/
│  ├─ sync-shared.mjs          # copia packages/shared/src para os apps
│  ├─ generate-seed.mjs        # gera supabase/seed.sql
│  └─ upload-store-logos.mjs   # publica os logos das lojas no Storage
├─ supabase/        # migrations, seed.sql, config.toml
└─ docs/            # SPEC, roteiro da demo, deploy
```

**Sem npm workspaces.** Cada app tem o próprio `node_modules` (as versões de React diferem entre
web e mobile). Instale e rode cada app separadamente.

---

## ✅ Requisitos

- **Node.js 22** (LTS) — `node -v`
- **Docker** em execução (Docker Desktop ou Engine) — o Supabase local roda em containers
- **Supabase CLI** via `npx supabase` (não precisa instalar global)
- **Celular com o app Expo Go** (Android/iOS) na **mesma rede Wi‑Fi** do computador — para rodar o app
- Portas livres: **3000** (site), **8081** (Expo), **54321** (API), **54322** (Postgres), **54323** (Studio)

---

## 🚀 Subindo o backend (Supabase local)

Na raiz do repositório:

```bash
# Sobe os containers (API, DB, Auth, Studio, etc.). Na primeira vez baixa as imagens.
npx supabase start

# Aplica migrations + seed.sql (recria o banco do zero com dados e contas de demonstração)
npx supabase db reset
```

O `db reset` é o comando que você vai rodar sempre que quiser **voltar ao estado inicial da demo**
(lojas, avaliações, cupons e contas de exemplo). Ele apaga e recria o banco local — seguro, é local.

### 🌱 Seed e logos das lojas

O `supabase/seed.sql` é **gerado** — não edite à mão. Para mudar os dados de demonstração, edite
`scripts/generate-seed.mjs` e rode `node scripts/generate-seed.mjs` (determinístico: mesma saída
sempre).

Os logos das lojas (`packages/brand/store-logos/*.png` + `manifest.json`) ficam no Storage, que o
`db reset` não repovoa. Depois de **todo** `db reset`, publique-os de novo:

```bash
npm install --prefix scripts            # só na primeira vez (instala @supabase/supabase-js)
npx supabase db reset
node scripts/upload-store-logos.mjs     # sobe os PNGs e preenche stores.logo_url
```

O script envia cada PNG para `store-images/seed/logos/<slug>.png` (upsert), casa com a loja pelo
nome e grava a URL pública em `stores.logo_url`. É idempotente e, no fim, lista os nomes que não
casaram com nenhuma loja.

- **Local:** sem variáveis de ambiente, ele pega URL e service role do `npx supabase status`.
- **Celular no Supabase local:** a URL gravada usa `127.0.0.1`, que o celular não enxerga. Use
  `node scripts/upload-store-logos.mjs --public-url http://<SEU_IP_LOCAL>:54321` (funciona também
  no site, no mesmo computador).
- **Supabase Cloud:** `SUPABASE_URL=https://<REF>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<service role key> node scripts/upload-store-logos.mjs`
  (a service role key fica em *Project Settings → API*; nunca a coloque nos apps).
- `--dry-run` mostra o que seria feito sem enviar nada.

Locais úteis depois de subir:

| Serviço | URL |
|---|---|
| API | `http://127.0.0.1:54321` |
| Studio (gerenciar dados/usuários) | `http://127.0.0.1:54323` |
| Banco (Postgres) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

Para parar: `npx supabase stop` (use `npx supabase stop --no-backup` se quiser descartar o estado).

---

## 🔑 Variáveis de ambiente

Cada app lê o próprio arquivo de env (não comitado). Se ele não existir, crie com os valores abaixo.
A **anon key** é a mesma em qualquer máquina para o Supabase local — pegue com `npx supabase status`
se estiver em dúvida.

### `apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do supabase local>
```

O site roda no próprio computador, então usa `127.0.0.1`.

### `apps/mobile/.env`

```env
# O celular NÃO enxerga 127.0.0.1 — use o IP da sua máquina na rede local (LAN).
EXPO_PUBLIC_SUPABASE_URL=http://<SEU_IP_LOCAL>:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key do supabase local>
```

Descubra o IP local (ex.: `192.168.x.x` ou `10.x.x.x`):

```bash
# Linux
hostname -I | awk '{print $1}'
# macOS
ipconfig getifaddr en0
# Windows (PowerShell)
ipconfig   # procure o IPv4 do adaptador Wi‑Fi
```

> ⚠️ Se o IP da máquina mudar (trocar de rede, reiniciar o roteador), atualize o `.env` do mobile.
> Emulador Android pode usar `10.0.2.2` no lugar do IP da LAN; simulador iOS aceita `127.0.0.1`.

---

## 🔄 Sincronizar o pacote compartilhado

`packages/shared/src` é a **fonte da verdade** e é copiado para dentro de cada app. Toda vez que
alguém mexer nos tipos/helpers compartilhados, rode na raiz:

```bash
node scripts/sync-shared.mjs
```

Isso regenera `apps/web/src/shared` e `apps/mobile/src/shared`. **Nunca edite as cópias** — edite em
`packages/shared` e rode o sync (o arquivo gerado avisa isso no topo).

Se o schema do banco mudou, regenere os tipos antes do sync:

```bash
npx supabase gen types typescript --local > packages/shared/src/database.types.ts
node scripts/sync-shared.mjs
```

---

## 💻 Rodando o site (web)

```bash
cd apps/web
npm install
npm run dev
```

Abre em **http://127.0.0.1:3000** (landing, explorar, página da loja, premium, cupons, favoritos,
meus pets, conta, área do lojista e dashboard admin).

Outros comandos: `npm run build` · `npm start` · `npm run lint`.

---

## 📱 Rodando o app (mobile)

```bash
cd apps/mobile
npm install
npx expo start
```

Um **QR code** aparece no terminal. Abra o **Expo Go** no celular e escaneie (Android: pelo app
Expo Go; iOS: pela câmera). O celular precisa estar no **mesmo Wi‑Fi** do computador.

- Se o QR não conectar, tente o modo túnel: `npx expo start --tunnel`.
- Porta do Metro/Expo: **8081**.
- Atalhos úteis do terminal Expo: `a` (Android), `i` (iOS), `w` (navegador), `r` (recarregar).

---

## 👤 Contas de demonstração

Todas as contas usam a senha **`easypet123`** (ver [`docs/SPEC.md`](docs/SPEC.md) §4).

| E-mail | Perfil |
|---|---|
| `admin@easypet.com` | admin (site) |
| `lojista@easypet.com` | lojista — dono da "Patas & Cia Pet Shop" (plano Profissional, ativa) |
| `cliente@easypet.com` | cliente **free** (já com 4 favoritos) |
| `premium@easypet.com` | cliente **premium** (com 2 pets na carteirinha) |

---

## 🗄️ Studio

O **Supabase Studio** fica em **http://127.0.0.1:54323** — é o painel para inspecionar tabelas,
rodar SQL, ver usuários do Auth e conferir os dados que web e app estão gravando. Ótimo para
depurar durante a demo.

---

## 📚 Documentação

- [`docs/SPEC.md`](docs/SPEC.md) — especificação do produto (fonte da verdade)
- [`docs/ROTEIRO-DEMO.md`](docs/ROTEIRO-DEMO.md) — roteiro da apresentação (~5–7 min)
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — como publicar (Supabase Cloud, Vercel, EAS)
