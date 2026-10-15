# Logos fictícios das lojas

61 identidades originais para as lojas de `supabase/seed.sql`, incluindo pendentes e suspensa. Não inclui registros QA do banco local. Símbolos geométricos próprios; nenhuma marca real usada como referência.

- `<slug>.svg`: vetor quadrado com tipografia Nunito 800 convertida em paths.
- `<slug>.png`: 512 × 512, RGB opaco. Elementos principais na área central para recorte circular.
- `manifest.json`: lista `{ nome, slug, categoria_id, file }`; `file` é o PNG relativo a esta pasta. O SVG usa o mesmo nome-base.
- `_preview.png`: todas as marcas em círculos com uma miniatura de 44 px ao lado; ordem igual ao manifest.

Slug: minúsculas, sem acentos, sequências de caracteres fora de `[a-z0-9]` substituídas por um hífen; sem hífens nas extremidades. Exemplo: `Patas & Cia Pet Shop` → `patas-cia-pet-shop`.

As cores derivam da paleta de categorias da SPEC, combinadas com creme, tons profundos e acentos quentes. Direções de arte por nome: monograma, selo, símbolo com nome curto, composição em placa e escudo. No mapa, use o símbolo/monograma como identificador; os nomes curtos complementam tamanhos maiores.

Para regenerar a partir da raiz:

```sh
npm ci --prefix packages/brand/scripts
node packages/brand/scripts/generate-store-logos.mjs
```

O gerador lê somente o SQL e a SPEC, sem executar o seed nem alterar o banco. Verifica 61 registros, cobertura das direções de arte, cores de categoria, nomes únicos, dimensões, opacidade e PNGs distintos. Dependências locais com lockfile; Nunito e licença OFL em `../scripts/fonts/`.
