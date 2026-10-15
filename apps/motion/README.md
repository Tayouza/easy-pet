# EasyPet · motion graphics

Apresentação curta em português: 46,27 segundos, Full HD, 30 fps. Nove cenas com entradas de texto em sequência, aproximações suaves e transições sobrepostas de 14 frames (círculo, varredura horizontal e diagonal). Abertura e encerramento tipográficos; cenas alternam posição do texto e ilustração.

## Assistir e editar

```sh
cd /home/tayouza/Documents/easypet/apps/motion
npm install
npm start
npm run render
```

Studio: http://localhost:3002. Exportação: `out/easypet-apresentacao.mp4`. A versão anterior foi preservada em `out/easypet-apresentacao-longa.mp4`.

## Conteúdo

- Proposta de valor e Porto Alegre
- Mapa, busca e categorias
- Perfil, avaliações, favoritos, WhatsApp e rota
- Premium: preço, cupons, filtros e favoritos ilimitados
- Carteirinha e vacinas
- Vitrine e planos para lojistas
- Métricas de interesse pela loja
- Administração e moderação
- Encerramento: app e site

Nunito e SVGs oficiais carregados localmente. Sem locução ou trilha; textos em tela. Interfaces e gráficos ilustrativos. Fonte editorial: `docs/SPEC.md` e `docs/ROTEIRO-DEMO.md`; preços do MVP, cujo checkout é simulado.

Edite `scenes`, suas durações e `TRANSITION` em `src/video.tsx`. Não há dependências do backend ou recursos remotos durante a renderização.

Validação: `npm run lint` e `npm run typecheck`.

Referência de exportação: https://www.remotion.dev/docs/render

## Versão vertical para celular

Composição `EasyPet-Vertical`: 1080 × 1920 (9:16), com os mesmos 46,27s. Layout próprio com título acima da ilustração, fontes maiores e margens superiores/inferiores para leitura no celular. Compartilha conteúdo, assets e ritmo da horizontal.

```sh
npm run render:vertical
npm run still:vertical
```

Vídeo: `out/easypet-vertical.mp4`. Capa: `out/capa-vertical.png`.

### MP4 para reprodução em celulares

Use `out/easypet-vertical-mobile.mp4`: H.264 Baseline nível 4.0, yuv420p, BT.709, faststart e faixa AAC silenciosa. O comando `npm run render:vertical` também gera essa cópia. Para apenas converter uma exportação existente, rode `npm run compat:vertical`. O script usa o FFmpeg do Remotion no Linux x64; em outros sistemas, usa `ffmpeg` no PATH ou `FFMPEG_PATH`.
