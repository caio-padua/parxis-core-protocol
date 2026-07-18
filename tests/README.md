# Regressão visual — nitidez do fundo "PADCON"

[![main](https://github.com/caio-padua/site-parxis/actions/workflows/visual-regression.yml/badge.svg?branch=main&event=push)](https://github.com/caio-padua/site-parxis/actions/workflows/visual-regression.yml?query=branch%3Amain+event%3Apush)
[![pull requests](https://github.com/caio-padua/site-parxis/actions/workflows/visual-regression.yml/badge.svg?event=pull_request)](https://github.com/caio-padua/site-parxis/actions/workflows/visual-regression.yml?query=event%3Apull_request)

A primeira badge mostra o status do último run em `main` (push). A segunda
mostra o status do último run em Pull Request. Verde = fundo "PADCON"
nítido; vermelha = blur/backdrop-filter reintroduzido — abra o run para o
comentário do PR e o artifact `visual-regression-report`.

## CI (GitHub Actions)


O workflow `.github/workflows/visual-regression.yml` roda em cada `push` na
`main` e em cada Pull Request. Ele:

1. Instala dependências com `bun install --frozen-lockfile`.
2. Instala o Chromium do Playwright (`bunx playwright install --with-deps chromium`).
3. Executa `bun run build` e serve o app com `bun run preview` em `127.0.0.1:8080`.
4. Roda `tests/visual-regression-padcon.mjs` (smoke) e depois
   `tests/visual-regression-suite.mjs` (rotas × idiomas × contraste × 7 breakpoints).

Se qualquer `.parxis-glass`, `.parxis-glass-frame`, `.parxis-card`,
`.parxis-fixed-bg` ou `.parxis-fixed-veil` voltar a receber
`backdrop-filter` ou `filter: blur(...)`, o job falha e o merge é bloqueado.
Marque o job "Blur / backdrop-filter guard" como *required check* nas
branch protection rules para bloquear PRs automaticamente.

### Comentário automático no PR

Em cada PR o workflow publica um comentário fixo (header `visual-regression`,
via [`marocchino/sticky-pull-request-comment`](https://github.com/marocchino/sticky-pull-request-comment))
com o resumo do run: ✅ quando tudo passa, ou uma tabela dos cenários que
falharam (rota × variante × viewport × classes afetadas). Os screenshots
de cada cenário com falha e os JSONs (`smoke-report.json`,
`suite-report.json`) são publicados como o artifact
**`visual-regression-report`** do run — baixe pela aba *Summary → Artifacts*
para inspecionar os diffs visuais. O comentário é sobrescrito a cada push,
então sempre reflete o último run.

Este projeto usa uma imagem de fundo fixa com o notebook gravado "PADCON".
Regra do projeto: **nenhum painel** (`.parxis-glass`, `.parxis-glass-frame`,
`.parxis-card`, `.parxis-fixed-bg`, `.parxis-fixed-veil`) pode aplicar
`backdrop-filter` ou `filter: blur(...)` — do contrário, o texto e a imagem
do fundo aparecem embaçados atrás das seções durante o scroll.

## Como rodar

```bash
# 1) suba o dev server
bun run dev

# 2) em outro terminal, execute a suíte
node tests/visual-regression-padcon.mjs
```

Sai com código 0 quando todos os breakpoints (`360`, `375`, `430`, `768`,
`1024`, `1440`, `1920`) e 5 posições de scroll estão limpos. Sai com
código diferente de 0 listando cada elemento infrator.

Requer `playwright` instalado no ambiente Node (`bun add -d playwright &&
npx playwright install chromium`).

Alternativa Python equivalente (útil em CI/sandbox com Playwright Python
já disponível):

```bash
python3 tests/visual-regression-padcon.py
```

## Quando atualizar

- Ao adicionar um novo tipo de painel sobre o fundo fixo, inclua o seletor
  no array `SELECTORS` do script.
- Ao introduzir um novo breakpoint crítico, adicione a entrada em
  `VIEWPORTS`.
- **Não** relaxe a checagem para permitir blur — a decisão do projeto é
  contrastar por opacidade/tintura, nunca por desfoque.