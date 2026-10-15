# Registro de verificações e validações — EasyPet MVP (insumo para o SGQ)

Fonte: registros da coordenação (Maestro) durante o desenvolvimento, 14–15/10/2026. Fatos observados; commits citados estão no histórico git.

## 1. Backend (Supabase) — verificação
| Data | Verificação | Resultado | Evidência |
|---|---|---|---|
| 14/10 | `supabase db reset` + seed | 61 lojas (56 ativas, 4 pendentes, 1 suspensa), 289 itens, 60 cupons, 150 avaliações, 46 usuários | consulta SQL; relatório do agente backend |
| 14/10 | RPC `nearby_stores(-30.0331,-51.23,5000)` | 35 lojas, destaque primeiro | consulta SQL |
| 14/10 | RLS habilitado | todas as tabelas `public` com RLS (consulta `pg_tables` sem retorno) | consulta SQL |
| 14/10 | Login das 4 contas demo via API Auth | HTTP 200 | curl |
| 14/10 | Cliente tenta alterar o próprio plano/role | bloqueado: "Operação não permitida" | curl PATCH |
| 14/10 | 6º favorito na conta free | bloqueado: `LIMITE_FAVORITOS` | curl |
| 14/10 | Anônimo lê cupons / chama `admin_stats` | cupons diretos `[]`; código nulo via RPC; `permission denied` | curl |
| 14/10 | Upload no Storage | próprio prefixo OK; prefixo alheio/anônimo → 403 | curl |
| 15/10 | `registrar_evento` em loja não ativa | ignora sem erro (migration 000004) | curl |

## 2. Site (Next.js) — verificação
| Data | Verificação | Resultado |
|---|---|---|
| 14/10 | `npm run lint`, `tsc --noEmit`, `next build` | 0 avisos, OK, 23 rotas |
| 15/10 | Revisão visual por screenshot headless (desktop 1440px) | aprovado |
| 15/10 | Revisão em 390px | **NC-01**: `/explorar` quebrava com "Invalid LatLng (NaN, NaN)" (mapa oculto com tamanho 0) → corrigido; 22 telas revisadas em 390px, ajustes de layout, sem rolagem horizontal |

## 3. QA funcional do site (Playwright headless, roteiro docs/ROTEIRO-DEMO.md)
| Bloco | Resultado |
|---|---|
| Visitante: busca, filtro Veterinário, loja, links WhatsApp/rota | PASS |
| Cliente free: limite de 5 favoritos, cupom bloqueado | PASS |
| Cliente novo assina Premium (checkout simulado), sem anúncios, cupons liberados, pet + vacina | PASS |
| Lojista novo, plano Básico: limite de 10 itens e bloqueio de cupom | **FALHOU → NC-02** → corrigido → PASS no reteste (UI e API: HTTP 400 P0001) |
| Admin aprova loja → aparece no mapa; dashboard KPIs/gráficos | PASS |

- **NC-02**: triggers `enforce_item_limit`/`enforce_coupon_plan` (migration 000002) usavam `current_user` dentro de `SECURITY DEFINER` (sempre `postgres`) e nunca validavam. Causa raiz identificada; correção na migration `20261014000005_fix_plan_limits.sql` (uso de `auth.role()`), mais checagem antecipada no painel web. Reteste via API pelo agente web e pelo QA: PASS. Commit `7ccf4e3`.
- Observação (não é defeito): instabilidade de login durante a bateria causada pelo rate limit do Supabase Auth local (30 logins / 5 min).
- Screenshots do QA foram gerados em diretório temporário (/tmp/opencode/qa/shots/), **não versionados**.

## 4. App mobile (Expo SDK 57) — verificação
| Data | Verificação | Resultado |
|---|---|---|
| 15/10 | `npx expo lint`, `tsc --noEmit`, `expo export` Android e iOS | OK em todas as entregas |
| 15/10 | Script `apps/mobile/scripts/check-backend.mjs` | 4 contas demo autenticadas; limites e CRUD validados com limpeza |
| 15/10 | Testes de integração de autenticação (`npm run test:auth`, Jest) | 5 testes PASS (login/logout cliente e lojista, cadastro, resposta tardia após logout) |
| 15/10 | Regra "fora de POA" (>40 km da Praça da Matriz) | checagem numérica: POA aceita, São Paulo cai na praça, bordas 39,9/40,1 km corretas |

## 5. Validação em aparelhos reais (usuária)
| Data | Aparelho | Ocorrência | Tratamento | Resultado |
|---|---|---|---|---|
| 15/10 | Android, Expo Go | **NC-03**: mapa em branco (bug conhecido do Expo Go SDK 57, expo/expo#49323) | mapa Leaflet/OpenStreetMap em WebView no Android (commit `7ccf4e3`) | mapa funcionando, centralizado na localização, pins em POA — confirmado pela usuária |
| 15/10 | iPhone, Expo Go | exigência de login Expo para abrir projeto em desenvolvimento | login na conta Expo + reinício do servidor | app aberto, mapa (Apple Maps) OK |
| 15/10 | iPhone | **NC-04**: "Maximum update depth exceeded" ao sair da conta (corrida de navegação) | `Stack.Protected` no layout raiz + ajuste do SessionProvider (commit `76f3a87`) | logout OK — confirmado pela usuária |

## 6. Implantação (cloud)
| Data | Verificação | Resultado |
|---|---|---|
| 15/10 | Supabase Cloud (sa-east-1): migrations + seed | aplicados (dry-run revisado antes) |
| 15/10 | Logins na nuvem | cliente/premium/lojista 200 com senha demo; admin com senha antiga 400 e nova 200 (senha do admin trocada para produção) |
| 15/10 | Vercel, 1º deploy | **NC-05**: 404 em todas as rotas (preset de framework "Other") → `apps/web/vercel.json` com `framework: nextjs` (commit `5463478`) → rotas 200 |
| 15/10 | Login rápido "Admin" em produção | ausente (só com `NEXT_PUBLIC_DEMO_ADMIN=1`) |
| 15/10 | Logos das lojas (61) | publicados local e nuvem; 35/35 pins carregando em `/explorar` |
| 15/10 | Troca de rede (IP de LAN mudou) quebrava imagens locais | **NC-06** → `resolveStorageUrl` no pacote shared (commit `aba3924`), 6 casos testados |

## 7. Pendências conhecidas
- Testes E2E do site rodaram com scripts temporários; não há suíte E2E versionada no repositório.
- CI de geração do APK (`.github/workflows/android-apk.yml`) criado, ainda não executado.
- Build iOS standalone não realizado (requer conta Apple Developer).
- Contas demo compartilhadas na nuvem: dados podem ser alterados pelo público durante a apresentação; restauração por re-seed.
- Contas/lojas de teste do QA presentes no banco local até o próximo `db reset`.
- Vídeo vertical: relato de reprodução preta em um player; quadros validados íntegros, causa no player não confirmada; versão de compatibilidade gerada.
