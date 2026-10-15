# 🎤 Roteiro da demo — EasyPet

Roteiro de apresentação de **~5 a 7 minutos** cobrindo a jornada completa: cliente, lojista e
admin. Cada bloco traz **o que fazer**, **o que falar** e **onde** (tela/conta).

> Comece pelo [checklist pré-apresentação](#-checklist-pré-apresentação) — 10 minutos antes.

---

## ✅ Checklist pré-apresentação

Faça tudo isto **antes** de o público chegar:

- [ ] **Docker rodando** (Docker Desktop aberto / `docker ps` responde).
- [ ] **Backend no estado inicial:** na raiz, `npx supabase start` e depois **`npx supabase db reset`**
      (restaura lojas, cupons, avaliações e contas limpas). Espere terminar.
- [ ] **Studio abrindo:** `http://127.0.0.1:54323` responde.
- [ ] **Celular no mesmo Wi‑Fi do notebook** e com o **Expo Go** aberto no EasyPet.
- [ ] **`apps/mobile/.env` com o IP da LAN atual** (`EXPO_PUBLIC_SUPABASE_URL=http://<SEU_IP>:54321`).
      Se o IP mudou, edite e recarregue o app (`r` no terminal do Expo).
- [ ] **Site de pé:** `cd apps/web && npm run dev`, abrindo `http://127.0.0.1:3000`.
- [ ] **App de pé:** `cd apps/mobile && npx expo start`, QR escaneado e telas navegando.
- [ ] **Contas logadas / senhas à mão** (todas usam `easypet123`):
      - App como `cliente@easypet.com` (free, com 4 favoritos)
      - App como `lojista@easypet.com` (Patas & Cia, Profissional)
      - Site como `admin@easypet.com` (admin)
- [ ] **Bateria e tela:** celular carregado, brilho alto, notificações em silêncio / modo “não perturbe”.
- [ ] **Aba anônima** no navegador para o site (evita sessões antigas atrapalhando).
- [ ] **Zoom do navegador** em 100% e uma janela só para a demo.

### 🅱️ Plano B (se o app ou o Wi‑Fi falhar)

O **site** cobre o mesmo fluxo do cliente. Abra `http://127.0.0.1:3000` no navegador e use o
**modo dispositivo do DevTools** (F12 → ícone de celular, largura ~390px) para simular o app.
Todas as telas do cliente (explorar/mapa, loja, favoritos, cupons, premium, meus pets) existem no
site. Se precisar, o próprio Supabase Studio (`:54323`) serve de prova de que os dados são reais.

> Dica: tenha uma **segunda janela** já no site do admin antes de começar, para o corte da etapa 5
> ser imediato.

---

## 🎬 Roteiro

### 1. O problema e a solução — ~40s

**Tela:** site na landing `http://127.0.0.1:3000` (hero). Celular na mão, ainda bloqueado.

> **Fala:** “Quem tem pet em Porto Alegre conhece o problema: pra achar um pet shop aberto, um vet
> de confiança ou um banho e tosa perto de casa, a gente pula entre grupos de WhatsApp, indicações
> e o Google Maps. O **EasyPet** junta tudo num mapa só — a loja certa, perto de você, com horário,
> contato e cupom. O tutor acha em segundos e chama no WhatsApp. E o lojista ganha um canal pra ser
> encontrado. Vou mostrar a jornada completa: cliente, lojista e a visão do negócio.”

---

### 2. Cliente free explorando Porto Alegre — ~75s

**Tela:** app no celular, desbloqueie e **faça login como `cliente@easypet.com` (free)**.
**Conta:** cliente free (já começa com 4 favoritos).

> **Fala:** “Sou a Ana, tutora, usando a versão gratuita. Já caio no **mapa de Porto Alegre**,
> centrado na Praça da Matriz.”

**Ações:**
1. Mostre os **pins** no mapa e os cards de loja.
2. **Filtre por categoria “Veterinário”** (chips/lista).
3. **Abra a loja** (toque no card ou no pin) — mostre capa, avaliações e horários.
4. Toque em **WhatsApp** (abre conversa pronta) e/ou **Rota** (abre a rota no Google Maps).

> **Fala:** “Filtrei por veterinário e achei opções perto. Abro a loja, vejo horário e avaliações,
> e em um toque falo no WhatsApp — ou traço a rota. Tudo com dados reais.”

---

### 3. Bate no limite → vira Premium — ~80s

**Tela:** ainda no app como `cliente@easypet.com`.

**Ações:**
1. Volte e **favorite uma 5ª loja** → aparece o **modal de limite** (“Seja Premium para favoritos
   ilimitados”).
2. Abra uma loja com **cupom** → o cupom aparece **bloqueado** (você vê o desconto, não o código).
3. Toque em **“Assinar Premium”** e conclua o **checkout simulado** (R$ 9,90/mês, PIX/cartão —
   aprova na hora).
4. Volte ao mapa: **cards “Patrocinado” somem**.
5. Abra **Cupons**: agora os **códigos aparecem**.
6. Abra **Meus Pets → carteirinha**: mostre pet, vacinas e **próximas doses**.

> **Fala:** “Na versão gratuita são 5 favoritos — bati no limite e apareceu o convite. Os cupons
> apareciam bloqueados. Assinei o Premium por R$ 9,90 no mês, pagamento simulado: os anúncios de
> lojas patrocinadas somem, os cupons liberam e eu ganho a **carteirinha digital do pet**, com
> vacinas e próximas doses. Pronto — o cliente pagante.”

---

### 4. Lojista novo se cadastra — ~60s

**Tela:** app (ou site). **Faça logout** e escolha **“Sou lojista” / criar conta de lojista**.

> **Fala:** “Agora o outro lado. Sou um pet shop novo e quero aparecer nesse mapa.”

**Ações:**
1. **Cadastre um lojista novo** (nome, e‑mail, senha).
2. **Crie a loja**: nome, categoria, endereço (escolha um ponto central), contato/WhatsApp, horários.
3. **Escolha um plano** (ex.: **Profissional**, R$ 99,90) e conclua o **checkout simulado**.

> **Fala:** “Cadastrei minha loja e escolhi o plano Profissional, com cupons e estatísticas. Mas
> repara: a loja **não aparece no mapa ainda** — ela entrou como **pendente**. Ninguém entra na
> vitrine sem passar pela moderação.”

**Deixe claro:** a loja está com status **pendente** (aprovada só pelo admin).

---

### 5. Admin aprova → aparece no mapa ao vivo — ~50s

**Tela:** site (`http://127.0.0.1:3000`), **logado como `admin@easypet.com`**.
**Conta:** admin.

**Ações:**
1. Abra o **dashboard admin** → seção de **lojas / moderação**.
2. Encontre a **loja pendente** que você acabou de criar.
3. Clique em **Aprovar**.
4. **Pegue o celular** (ou o navegador em modo mobile) → **atualize o mapa**: a nova loja **aparece
   e já está buscável**.

> **Fala:** “No painel do admin, a loja pendente está aqui. Aprovo com um clique — e, ao atualizar
> o mapa no app, ela **já está no ar**, com o pin na cor da categoria. Esse é o controle de
> qualidade da plataforma.”

---

### 6. Painel do lojista com métricas — ~40s

**Tela:** app ou site, **logado com o lojista aprovado** (ou `lojista@easypet.com`, dono da
“Patas & Cia Pet Shop”).

**Ações:**
1. Abra **Estatísticas / Painel do lojista**.
2. Mostre os números: **visualizações, cliques em WhatsApp, rotas, favoritos** e o gráfico da série.
3. Se der tempo, mostre **produtos/serviços** e **cupons**.

> **Fala:** “O lojista enxerga o que importa: quantas pessoas viram a loja, quantas clicaram no
> WhatsApp, quantas pediram rota. São métricas que mostram o retorno do plano — nada de ‘achismo’.”

---

### 7. Dashboard admin e o modelo de negócio — ~40s

**Tela:** site, **admin** (`admin@easypet.com`) → **dashboard**.

**Ações:**
1. Mostre os **KPIs**: lojas ativas, pendentes, clientes, lojistas, assinantes Premium.
2. Mostre **MRR**: receita de planos de loja + receita de Premium do cliente
   (R$ 9,90 × assinantes) e o gráfico dos últimos meses.
3. Se quiser, mostre **lojas por categoria** e **assinaturas por plano**.

> **Fala:** “E aqui está o negócio: de um lado, planos de loja (Básico, Profissional e Destaque);
> do outro, o Premium do tutor a R$ 9,90/mês. O dashboard soma tudo no **MRR**. O EasyPet se paga:
> o tutor encontra o que precisa e o lojista paga para ser encontrado.”

---

## ⏱️ Divisão do tempo

| Bloco | Tema | Tempo |
|---|---|---|
| 1 | Problema e solução | ~40s |
| 2 | Cliente free no mapa (filtro, loja, WhatsApp/rota) | ~75s |
| 3 | Limite → Premium (anúncios, cupons, carteirinha) | ~80s |
| 4 | Lojista se cadastra e assina plano → pendente | ~60s |
| 5 | Admin aprova → loja no mapa ao vivo | ~50s |
| 6 | Painel do lojista com métricas | ~40s |
| 7 | Dashboard admin / MRR / modelo de negócio | ~40s |
| | **Total** | **~7 min** |

Cortes rápidos se o tempo apertar: reduzir a etapa 6 (métricas) e o passo de cupons da etapa 3.

---

## 🆘 Se algo der errado

| Problema | O que fazer |
|---|---|
| App não conecta ao backend | Confira o **IP da LAN** no `apps/mobile/.env` vs. `hostname -I`; celular no mesmo Wi‑Fi; recarregue o app (`r`). |
| Mapa vazio | Faltou `npx supabase db reset`; rode e recarregue. |
| Login falha | Rode `npx supabase db reset` (recria as contas demo) e use `easypet123`. |
| App travou | Feche e reabra no Expo Go; se persistir, **migre para o Plano B** (site em modo mobile). |
| Tempo estourando | Pule a etapa 6 e vá direto ao MRR (etapa 7) — é o fechamento. |

> Combine com o narrador um **sinal** (ex.: “vamos ver o negócio”) para pular blocos sem quebrar o
> fluxo.
