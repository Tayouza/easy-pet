# EasyPet mobile

Aplicativo Android e iOS com Expo SDK 57, Expo Router e Supabase local.

## Executar no Expo Go

```sh
cd /home/tayouza/Documents/easypet/apps/mobile
npm ci
npx expo start --port 8081 --lan
```

Abra o QR no Expo Go compatível com SDK 57. Celular e computador devem estar na mesma rede. O arquivo `.env` contém `EXPO_PUBLIC_SUPABASE_URL` com IP da LAN e a chave pública anon. Mantenha o Supabase local ativo na porta 54321.

Contas demo, todas com senha `easypet123`:

- `cliente@easypet.com`: gratuito, quatro favoritos.
- `premium@easypet.com`: Premium, pets Thor e Mia.
- `lojista@easypet.com`: Patas & Cia, plano Profissional.

O admin utiliza o site; ao entrar no mobile vê a experiência de exploração.

## Fluxos

- Tutor: mapa/lista, localização com fallback Praça da Matriz, busca por nome/produto/tag, categorias e raio 1–20 km; filtros Premium; loja com contatos, rotas, horários, catálogo, galeria, avaliações e favoritos.
- Cupons protegidos por RPC e códigos copiáveis para Premium.
- Perfil editável, checkout simulado Pix/cartão, ativação/cancelamento via RPC, pets e vacinas.
- Lojista: status, métricas/gráfico de 30 dias, formulário da loja, horários com intervalos, pin arrastável, upload para `store-images`, CRUD de itens/cupons e assinatura dos três planos.

O checkout é simulado; não utiliza dados de pagamento reais. Sessões persistem com `expo-sqlite/localStorage/install` conforme o guia atual do Expo.

## Verificações

```sh
npx expo lint
npx tsc --noEmit
npx expo export --platform android
npx expo export --platform ios
node scripts/check-backend.mjs
node scripts/check-backend.mjs --write
```

O script de backend autentica as quatro contas demo e verifica leitura real, RPCs, cupons protegidos, favoritos, pets, assinatura e estatísticas. Por padrão não modifica o seed. Com `--write`, verifica também o limite free de favoritos e CRUD de pets, vacinas, itens e cupons com registros temporários removidos ao final. A validação visual, permissões de galeria/localização, mapas nativos e links externos devem ser exercitados em aparelho com Expo Go.

A fonte dos tipos e helpers é `packages/shared/src`, sincronizada pelo script da raiz. Não edite `src/shared`. Os tokens são importados diretamente de `packages/brand/tokens.ts`.
