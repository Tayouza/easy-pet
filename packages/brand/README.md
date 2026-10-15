# EasyPet — marca

Fonte: docs/SPEC.md, seção 2.

## Paleta

| Token | Cor |
| --- | --- |
| primary | #FF6B35 |
| primary-600 | #E4541F |
| primary-50 | #FFF1EB |
| secondary | #127475 |
| secondary-50 | #E6F3F3 |
| accent | #FFC857 |
| bg | #FFF8F0 |
| surface | #FFFFFF |
| ink | #1E1B18 |
| muted | #6B6460 |
| border | #EEE4DA |
| success | #2E9E5B |
| danger | #D64545 |

## Uso

- symbol.svg: pin laranja com quatro dedos e almofada branca, viewBox quadrado.
- logo.svg: fundos claros; logo-white.svg: fundos laranja/escuros. Wordmark Nunito ExtraBold (800) convertido em paths; não depende de fonte instalada.
- icon.png: 1024 × 1024, RGB opaco, fundo laranja contínuo; o iOS aplica os cantos arredondados.
- android-icon-foreground.png: 1024 × 1024, transparente e com margem segura; use com android-icon-background.png (laranja opaco).
- android-icon-monochrome.png: máscara branca com pata recortada/transparente para ícones temáticos.
- splash-icon.png: 512 × 512, transparente. favicon.png: 48 × 48.
- tokens.json e tokens.ts: cores, raios em px/unidades React Native, sombra CSS, fonte e espaçamento base 4.
- tokens.css: variáveis --ep-* e @theme inline para Tailwind 4 (bg-primary, text-ink, rounded-card, shadow-soft). Importe após Tailwind. Carregue Nunito 400/600/700/800.

Os PNGs são rasterizados dos mesmos elementos SVG com Sharp. Cópias: apps/mobile/assets/images/, apps/web/public/logo*.svg e apps/web/src/app/icon.svg.

Logos raster para expo-image: `logo.png` e `logo-white.png`, 1440 × 432, transparentes, também em `apps/mobile/assets/images/`. Use `contentFit="contain"` e proporção 10:3. A versão branca tem a pata vazada para funcionar em fundos laranja ou escuros.
