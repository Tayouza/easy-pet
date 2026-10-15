# Documentação da qualidade — EasyPet

Pacote essencial de referência à ABNT NBR ISO 9001:2015. Emissão 15/10/2026, revisão 00. Documentos emitidos para aprovação: preencher os responsáveis e registrar a decisão antes de estabelecer vigência. Não há declaração de certificação.

## Regenerar

Com Node.js 22 e Chromium disponível:

```sh
cd /home/tayouza/Documents/easypet/docs/qualidade
npm ci
npm run build
```

O script usa Playwright headless e procura o Chromium em `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`. Pode-se definir `CHROMIUM_PATH` para outro executável. Se não houver navegador, execute `npx playwright install chromium`. `node_modules/` não deve ser versionado. O CSS usa a fonte Nunito local em `packages/brand/scripts/fonts/Nunito.ttf`.

Fontes em `src/`; PDFs em `pdf/`. Cabeçalho e rodapé com numeração são inseridos pelo build. A matriz de riscos usa A4 paisagem. O HTML apresenta o conteúdo; a numeração final é exclusiva do PDF. Ao alterar revisão/data, atualizar metadados, histórico, templates do build e LM-001 de forma coerente.

## Conferir

```sh
python3 verificar.py
```

Requer `pdfinfo`, `pdftotext`, `pdftoppm` (Poppler) e Pillow. Renderiza todas as páginas em PNG a 90 dpi, verifica numeração e aviso por página, e gera `evidencias/verificacao-pdfs.json` e `evidencias/contato-paginas.png`. Abrir a imagem de contato e os PNGs para conferir tabelas, quebras e ausência de páginas vazias. A extração textual automatizada complementa a inspeção visual.

Fatos e resultados de QA se baseiam nos documentos técnicos, migrations, histórico git e `_insumos/registro-verificacoes-maestro.md`. Metas, pontuações de risco e disposições gerenciais propostas estão identificadas. Não foram refeitos testes do produto. Screenshots históricos do QA e scripts E2E não foram versionados; a lacuna está registrada na MRO-001 e no PRO-001. Não foi realizado commit.
