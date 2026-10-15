# EasyPet — Especificação do MVP (fonte da verdade)

> Documento compartilhado por toda a equipe. Mudanças de contrato (schema, rotas, tokens) passam pelo Maestro (terminal "Claude Code").

## 1. Produto

Vitrine geolocalizada de estabelecimentos pet em **Porto Alegre‑RS**. App mobile (Android/iOS via Expo) + site (Next.js). Demo **funcional** — nada de mockups: tudo lê/escreve no Supabase. Pagamentos são **simulados** (checkout fake que aprova na hora e grava em `payments`).

### Perfis
| Perfil | Onde | O que faz |
|---|---|---|
| Cliente (free/premium) | app + site | mapa, busca, página da loja, favoritos, avaliações, cupons, carteirinha do pet, assinar Premium |
| Lojista | app + site | cadastra loja, escolhe plano, edita perfil/horários/fotos, produtos e serviços, cupons, estatísticas |
| Admin | site | dashboard KPIs, aprovar/suspender lojas, usuários, assinaturas |

### Premium do cliente — R$ 9,90/mês
Sem anúncios (free vê cards "Patrocinado" = lojas plano Destaque) · cupons exclusivos (free vê cupom bloqueado) · favoritos ilimitados (free: 5) · filtros avançados (aberto agora, melhor avaliadas) · carteirinha digital do pet (pets + vacinas) · selo Premium.

### Planos de loja
| id | Nome | Preço | Regras |
|---|---|---|---|
| basico | Básico | R$ 49,90 | perfil + pin, até 10 itens |
| profissional | Profissional | R$ 99,90 | itens ilimitados, cupons, estatísticas |
| destaque | Destaque | R$ 199,90 | tudo + topo das buscas, pin destacado, "Patrocinado" |

### Categorias (`categories.id`)
| id | nome | cor | ícone (Ionicons / Lucide) |
|---|---|---|---|
| pet-shop | Pet Shop | #FF6B35 | storefront / Store |
| agropecuaria | Agropecuária | #7A9E3B | leaf / Wheat |
| veterinario | Veterinário | #2B7FFF | medkit / Stethoscope |
| clinica | Clínica e Hospital Vet | #D64545 | medical / Hospital |
| banho-tosa | Banho e Tosa | #3BB3C4 | water / Bath |
| hotel-creche | Hotel e Creche | #8E5CD9 | bed / Hotel |
| adestrador | Adestrador | #E0A100 | ribbon / Award |
| dog-walker | Dog Walker e Pet Sitter | #2E9E5B | walk / Footprints |
| farmacia | Farmácia Veterinária | #E85D9A | bandage / Pill |
| laboratorio | Laboratório e Exames | #5468D4 | flask / FlaskConical |
| aquarismo | Aquarismo | #1E88C7 | fish / Fish |
| petiscaria | Petiscaria Artesanal | #B5651D | nutrition / Cookie |
| fotografo | Fotógrafo Pet | #6D6875 | camera / Camera |
| ong-adocao | ONG e Adoção | #F25C78 | heart / HeartHandshake |
| funeraria | Crematório e Memorial | #4A4E69 | flower / Flower2 |

## 2. Identidade visual

- **Nome:** EasyPet — wordmark `easy` (tinta) + `pet` (laranja), minúsculo, Nunito ExtraBold.
- **Símbolo:** pin de localização com uma pegada de pata dentro (pin laranja, pata branca).
- **Tom:** acolhedor, simples, confiável. Português do Brasil, "você".
- **Fonte:** **Nunito** (400/600/700/800) em web e mobile.
- **Tema:** somente claro no MVP.

### Tokens de cor
| token | hex | uso |
|---|---|---|
| primary | #FF6B35 | botões, destaques, pin |
| primary-600 | #E4541F | hover/pressed |
| primary-50 | #FFF1EB | fundos suaves |
| secondary | #127475 | links, chips ativos, Premium secundário |
| secondary-50 | #E6F3F3 | |
| accent | #FFC857 | selo Premium, estrelas |
| bg | #FFF8F0 | fundo da página/tela |
| surface | #FFFFFF | cards |
| ink | #1E1B18 | texto principal |
| muted | #6B6460 | texto secundário |
| border | #EEE4DA | divisórias |
| success | #2E9E5B | aberto agora |
| danger | #D64545 | fechado / erros |

Raio: cards 16px, inputs 12px, botões pill (999px). Sombra suave: `0 4px 20px rgba(30,27,24,.06)`. Espaçamento base 4px.

Assets oficiais em `packages/brand/` (logo SVG, ícone, splash, tokens em JSON/TS/CSS).

## 3. Arquitetura

```
easypet/
├─ supabase/            # migrations, seed.sql, config  (dono: Alicerce)
├─ scripts/             # gerador do seed etc.          (dono: Alicerce)
├─ packages/brand/      # logo, ícones, tokens          (dono: Tinta)
├─ packages/shared/     # tipos do banco + helpers puros (dono: Alicerce; helpers: Maestro)
├─ apps/web/            # Next.js 16 + Tailwind 4       (dono: Vitral)
├─ apps/mobile/         # Expo SDK 57 + Expo Router     (dono: Atlas)
└─ docs/                # SPEC, roteiro da demo, README (dono: Sentinela)
```

- **Sem npm workspaces** (React difere entre web e mobile). Cada app tem seu próprio `node_modules`.
- `packages/shared/src` é copiado para `apps/*/src/shared/` com `node scripts/sync-shared.mjs`. **Nunca edite a cópia** — edite em `packages/shared` e rode o sync.
- Tipos do banco: `npx supabase gen types typescript --local > packages/shared/src/database.types.ts`.

### Backend (Supabase local via Docker)
- API: `http://127.0.0.1:54321` · Studio: `http://127.0.0.1:54323` · DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Para o celular acessar: usar o IP da LAN no `EXPO_PUBLIC_SUPABASE_URL`.
- Env web: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`apps/web/.env.local`).
- Env mobile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (`apps/mobile/.env`).
- Schema: `supabase/migrations/*.sql`. Leia antes de codar.

### RPCs disponíveis (chamar via `supabase.rpc`)
| função | uso |
|---|---|
| `nearby_stores(p_lat, p_lng, p_raio_m, p_categoria?, p_busca?)` | lista/mapa; já ordena destaque → distância; retorna `distancia_m` |
| `store_coupons(p_store_id)` | cupons da loja; `codigo` null + `bloqueado=true` se não‑premium |
| `all_coupons()` | tela de cupons |
| `assinar_premium(p_metodo)` / `cancelar_premium()` | checkout simulado do cliente |
| `assinar_plano_loja(p_store_id, p_plan_id, p_metodo)` / `cancelar_plano_loja(p_store_id)` | checkout simulado lojista |
| `moderar_loja(p_store_id, p_status, p_motivo?)` | admin |
| `registrar_evento(p_store_id, p_tipo)` | `view` ao abrir loja; `whatsapp`/`rota`/`telefone` ao clicar |
| `store_stats(p_store_id, p_dias?)` | dashboard lojista |
| `admin_stats()` | dashboard admin |

Erros de regra de negócio vêm com prefixo na mensagem: `LIMITE_FAVORITOS`, `LIMITE_ITENS`, `PLANO_NECESSARIO`, `PLANO_SEM_CUPONS` → mostrar um modal amigável (ex.: "Seja Premium para favoritos ilimitados").

### Regras de UX comuns
- Localização padrão (permissão negada / web sem geo): **Praça da Matriz, POA** `-30.0331, -51.2300`. Raio padrão 5 km (slider 1–20 km).
- "Aberto agora": calcular com `horarios` (`{"0":[["09:00","13:00"]],...}`, 0=domingo) no fuso `America/Sao_Paulo`; `aberto_24h` sempre aberto. Helper `isOpenNow` em `packages/shared`.
- WhatsApp: `https://wa.me/55<numero só dígitos>?text=Olá! Vi sua loja no EasyPet 🐾`.
- Rota: `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`.
- Preço: `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`.
- Sem imagem: capa com gradiente da cor da categoria + ícone; logo = iniciais em círculo colorido.

## 4. Contas de demonstração (senha de todas: `easypet123`)
| e‑mail | perfil |
|---|---|
| admin@easypet.com | admin |
| lojista@easypet.com | lojista — dono da "Patas & Cia Pet Shop" (Profissional, ativa) |
| cliente@easypet.com | cliente free (já com 4 favoritos) |
| premium@easypet.com | cliente premium (com 2 pets) |

## 5. Convenções da equipe
- Cada agente só edita a própria área (seção 3). Precisa de algo fora dela? `maestri ask` ao dono ou ao Maestro.
- **Não faça `git commit`** — o Maestro commita.
- Portas fixas: web `3000`, Expo `8081`. Só o dono do app sobe o dev server dele.
- Antes de reportar "pronto": lint + typecheck do seu app passando.
- Ao terminar uma tarefa, reporte ao Maestro: `maestri ask "Claude Code" "<resumo do que fez, arquivos, pendências>"`.
