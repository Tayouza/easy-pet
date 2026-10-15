# 🚢 Deploy — EasyPet

Como publicar o EasyPet para a apresentação. São três peças independentes:

1. **Backend** no **Supabase Cloud** (banco + auth + API na nuvem)
2. **Site** (`apps/web`) na **Vercel**
3. **App** (`apps/mobile`) via **Expo Go**, **EAS Update** ou **EAS Build** (APK Android)

Ordem sugerida: **backend → site → app**. O site e o app só funcionam apontando para o backend
já publicado.

> Os pagamentos são simulados no próprio banco (RPCs gravam em `payments`), então **não há
> gateway** para configurar.

---

## 1. Backend — Supabase Cloud

### 1.1 Criar o projeto

1. Crie uma conta/organização em <https://supabase.com> e um **New project**.
2. Anote a **senha do banco** e a **região** (ex.: `South America (São Paulo)`).
3. Guarde o **Project ref** (está na URL do dashboard, `.../project/<ref>`).

### 1.2 Autenticar e vincular o CLI

Na raiz do repositório:

```bash
npx supabase login
npx supabase link --project-ref <SEU_PROJECT_REF>
```

O `link` pede a senha do banco.

### 1.3 Aplicar o schema (migrations)

```bash
npx supabase db push
```

Isso envia e aplica `supabase/migrations/*.sql` no projeto remoto (cria tipos, tabelas, triggers,
RPCs, RLS e os dados fixos da `logic`).

> **PostGIS:** as migrations fazem `create extension if not exists postgis`. No plano gratuito do
> Supabase, se o `db push` reclamar da extensão, habilite em **Dashboard → Database → Extensions →
> postgis** e rode `npx supabase db push` de novo.

### 1.4 Carregar o seed (dados + contas demo)

O `db push` aplica **apenas migrations** — o `supabase/seed.sql` (lojas, cupons, avaliações e as
contas de demonstração) precisa ser rodado à parte, **uma vez**:

**Opção A — psql (recomendada):**

```bash
# Pegue a connection string em Dashboard → Settings → Database → Connection string (URI)
psql "postgresql://postgres:<SENHA>@db.<REF>.supabase.co:5432/postgres" -f supabase/seed.sql
```

**Opção B — SQL Editor:** abra **Dashboard → SQL Editor**, cole o conteúdo de `supabase/seed.sql` e
clique em **Run**.

> Se preferir um banco limpo do zero, o SQL Editor também aceita recriar via `npx supabase db reset
> --linked` — atenção: isso **apaga** os dados remotos.

Confira no **Table Editor** se `stores`, `categories` e `store_plans` estão populados e se os
usuários de demo existem em **Authentication → Users**. As senhas precisam ser criadas via Auth
(ver observação abaixo).

> **Contas de demo no Auth:** o `seed.sql` cria os perfis e os dados. Se os usuários de login
> (`admin@easypet.com`, etc.) não estiverem em **Authentication → Users**, crie cada um pelo
> **Dashboard → Authentication → Users → Add user** (e‑mail + senha `easypet123`, marque
> *Auto Confirm*). O trigger `handle_new_user` cria o `profiles` correspondente; depois ajuste
> `role`/`plano` conforme a §4 do SPEC.

### 1.5 Publicar os logos das lojas no Storage

O `seed.sql` já grava `stores.logo_url`, mas os **arquivos** dos logos precisam existir no Storage.
Depois de carregar o seed, envie os PNGs e confirme as URLs (é idempotente — pode rodar quantas
vezes quiser):

```bash
# instala as dependências dos scripts (uma vez) — o script usa @supabase/supabase-js
npm install --prefix scripts

SUPABASE_URL=https://<REF>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service role key> \
node scripts/upload-store-logos.mjs
```

- A **service role key** está em **Dashboard → Settings → API → `service_role`** — **nunca** comite.
- O script sobe os PNGs para `store-images/seed/logos/<slug>.png`, casa cada arquivo pelo **nome da
  loja** e atualiza `stores.logo_url` com a URL pública (`?v=<hash>` para furar cache quando o
  arquivo mudar). Ao final, lista lojas sem logo no manifest e nomes que não casaram.
- Sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, o script usa o Supabase **local**
  (`npx supabase status`) — útil em desenvolvimento.
- Para o app no celular, se quiser que as URLs usem o IP da LAN em vez de `127.0.0.1`, passe
  `--public-url http://<IP-LAN>:54321`.

> ⚠️ Depois de **cada `npx supabase db reset`** local os logos somem do Storage e precisam ser
> reenviados: `node scripts/upload-store-logos.mjs`.

### 1.6 Coletar URL e chave

Em **Dashboard → Settings → API** copie:

- **Project URL** → `https://<REF>.supabase.co`
- **anon public key** → usada por web e mobile

Você vai colar esses dois valores nas envs do site e do app.

---

## 2. Site — Vercel (`apps/web`)

### 2.1 Importar o projeto

1. Suba o repositório para o GitHub (o Maestro faz o commit).
2. Em <https://vercel.com> → **Add New → Project** → importe o repositório.
3. **Root Directory:** `apps/web` (é um monorepo sem npm workspaces — cada app tem o próprio
   `package.json`).
4. **Framework Preset:** Next.js (detectado). Build `next build`, output padrão.
5. Instale o *Root Directory* corretamente e deixe o *Install Command* padrão (`npm install`).

### 2.2 Variáveis de ambiente (Production e Preview)

Em **Settings → Environment Variables**, adicione com os valores **do Supabase Cloud**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

> São variáveis `NEXT_PUBLIC_*`: ficam embutidas no bundle do cliente em build time. Depois de
> alterá-las, **refaça o deploy** (Redeploy) para valerem.

### 2.3 Deploy e domínio

Clique em **Deploy**. A Vercel gera uma URL `https://<projeto>.vercel.app`. Em
**Settings → Domains** você pode ligar um domínio próprio.

> **Auth:** em produção, o Supabase precisa aceitar a URL do site. Em **Dashboard →
> Authentication → URL Configuration**, ajuste **Site URL** para a URL da Vercel e adicione-a em
> **Redirect URLs** (ex.: `https://<projeto>.vercel.app/**`). O `config.toml` local usa
> `127.0.0.1:3000` — isso é só para o ambiente local.

---

## 3. App — Expo (`apps/mobile`)

O backend do app é o mesmo Supabase Cloud. Aponte `apps/mobile/.env` para a nuvem **antes** de
gerar o build/atualização:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<REF>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

> Diferente do local, aqui **não** se usa o IP da LAN — a URL é pública na internet, então o
> celular pode estar em qualquer rede (4G incluso). Ótimo para a apresentação.

Há três formas de levar o app ao celular, da mais simples para a mais “de produção”:

### 3.1 Expo Go (mais rápido, para ensaio)

```bash
cd apps/mobile
npm install
npx expo start
```

Escaneie o QR no **Expo Go** (mesmo Wi‑Fi, ou `npx expo start --tunnel`).

- ✅ Zero configuração de build; ótimo para testar o fluxo completo.
- ⚠️ Exige o **computador ligado e servindo** durante a apresentação; o QR pode falhar em redes
  corporativas (prefira `--tunnel`).

### 3.2 EAS Update (over‑the‑air, sem loja)

O EAS Update entrega novas versões do JS **para um build já instalado** (não funciona no Expo Go).
Depois de ter um build (item 3.3), publique atualizações sem reinstalar:

```bash
npx eas-cli update --branch preview --message "demo"
```

Útil para corrigir a demo minutos antes de apresentar, sem gerar novo APK.

### 3.3 EAS Build — APK Android (recomendado para a demo)

Gera um **APK instalável direto** no Android, sem depender do notebook ligado.

1. Configure a identidade do projeto em `apps/mobile/app.json`:
   - `expo.name`, `expo.slug`, `expo.owner`
   - `android.package` (ex.: `com.easypet.app`) e `ios.bundleIdentifier`
   - `expo.extra.eas.projectId` (criado no `eas init`)
2. Faça login e inicialize:

   ```bash
   npx eas-cli login
   npx eas-cli init          # cria/associa o projectId
   ```

3. Perfil **preview** com APK — em `apps/mobile/eas.json`:

   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "android": { "buildType": "apk" }
       },
       "production": { "autoIncrement": true }
     }
   }
   ```

4. Gere o build Android:

   ```bash
   npx eas-cli build --profile preview --platform android
   ```

5. Ao final, a EAS imprime um **link de download** do APK. Baixe no celular Android, permita
   “instalar de fontes desconhecidas” e instale. Abra o **EasyPet** e faça a demo offline do
   notebook.

> Assinatura: a EAS cuida do keystore. O APK fica válido para instalação direta (não precisa de
> Play Store).

### 3.4 iOS — atenção

- **Expo Go** cobre o ensaio no iPhone sem conta Apple.
- **EAS Build para iOS** exige uma **conta Apple Developer** (US$ 99/ano) para assinar o app. Para
  distribuição interna, é preciso registrar os **UDIDs** dos dispositivos (opção *ad hoc*) ou
  publicar na App Store / TestFlight.
- Sem conta Apple, a alternativa no iPhone é rodar via **Expo Go** durante a apresentação (ou usar
  um Android com o APK do item 3.3).
- Para o **TestFlight**, é necessário ainda revisão da Apple — planeje com antecedência; **não**
  deixe para a véspera.

---

## 🧭 Resumo dos envs

| Onde | Variável | Valor |
|---|---|---|
| Vercel (`apps/web`) | `NEXT_PUBLIC_SUPABASE_URL` | `https://<REF>.supabase.co` |
| Vercel (`apps/web`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| Mobile (`.env`) | `EXPO_PUBLIC_SUPABASE_URL` | `https://<REF>.supabase.co` |
| Mobile (`.env`) | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | anon public key |

> **Local x Nuvem:** em desenvolvimento, web usa `http://127.0.0.1:54321` e mobile usa
> `http://<IP_DA_LAN>:54321`. Em produção, **ambos** apontam para `https://<REF>.supabase.co`.
> Nunca comite as chaves de produção em arquivos versionados.

---

## ✅ Checklist de deploy

- [ ] Projeto no Supabase Cloud criado; `supabase link` + `db push` aplicados
- [ ] `seed.sql` carregado (lojas, cupons, avaliações, planos)
- [ ] Logos das lojas enviados (`node scripts/upload-store-logos.mjs`) — `stores.logo_url` abrindo
- [ ] Usuários demo existindo em **Authentication → Users** (senha `easypet123`)
- [ ] URL do site cadastrada em **Authentication → URL Configuration**
- [ ] Vercel com **Root Directory = `apps/web`** e as duas envs `NEXT_PUBLIC_*`
- [ ] Site abrindo e logando com as contas demo
- [ ] `apps/mobile/.env` apontando para a URL pública do Supabase
- [ ] APK (EAS Build) instalado **ou** Expo Go validado antes da apresentação
- [ ] `docs/ROTEIRO-DEMO.md` ensaiado contra o ambiente de produção
