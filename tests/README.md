# Regressão visual — nitidez do fundo "PADCON"

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