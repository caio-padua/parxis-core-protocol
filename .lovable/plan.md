## Plano de implementação

Vou aplicar as três camadas da carta técnica do PADCON ao Parxis, preservando a identidade atual (dourado neutro, wordmark, hero com o quadro/notebook).

### 1. Painéis deslizando sobre fundo fixo

O Hero continua com a imagem do atelier (notebook + quadro). A partir do Manifesto para baixo, o site recebe a técnica exata do item 3 da carta:

- **Camada base fixa**: a imagem `parxis-ampoules-wide` (mármore + nogueira + couro bordô + ampolas) fica travada no viewport com `background-attachment: fixed`, `background-size: cover`.
- **Véu global**: overlay preto ~45% + vinheta suave para garantir legibilidade uniforme.
- **Painéis como vidro fumê**: cada seção (Manifesto, Círculo, Recursos, Tecnologia, Clínicas, Depoimentos, CTA) passa a ter fundo semi-transparente (`bg-black/55`) + `backdrop-blur-md` + moldura dourada de costura. O fundo fixo aparece por baixo enquanto os painéis rolam.
- Substitui o parallax JS atual (que estava competindo com o fundo) por essa camada CSS pura — mais leve e mais nítida.

### 2. Sistema bilíngue EN / PT

- Novo arquivo `src/content/parxis.ts` com toda a copy do site em formato `{ en, pt }`. Todos os textos hoje inline no `index.tsx` migram para lá.
- Novo `src/contexts/LanguageContext.tsx` com `useLang()` retornando `{ lang, setLang }`, persistido em `localStorage` (`parxis-lang`), default = `pt`.
- Novo componente `LangSwitcher` — botão fixo no topo direito (`fixed top-6 right-6 z-50`) alternando EN ⇄ PT com o mesmo bevel dourado dos outros botões.
- Formatação numérica localizada: `1.342,50` em PT, `1,342.50` em EN (útil no contador de licenciados/safra).
- Provider registrado no `__root.tsx` para envolver toda a árvore.

### 3. Animações de entrada + cantos pulsantes

- Novos keyframes em `styles.css`:
  - `fadeSlideUp` (opacity 0 + translateY 28px → 0) — aplicado em cascata nos blocos do Hero com delays 0/200/400/600ms via classes utilitárias `.parxis-enter-1..4`.
  - `cornerPulse` (opacity 0.6 ↔ 1.0, 3s ease-in-out infinite) — classe `.parxis-corner-pulse`.
- Novo componente `GoldCorners` renderizando 4 cantos em L dourados no painel do Hero (e opcionalmente no painel de CTA final), com 24px de comprimento, borda de 2px em `--parxis-gold`.

### Detalhes técnicos

- **Tailwind v4**: novas cores/animações via `@theme` em `src/styles.css`, sem tocar em `tailwind.config`.
- **Rota**: nenhuma nova rota. Alterações concentradas em `src/routes/index.tsx`, `src/styles.css`, `src/routes/__root.tsx` + 3 arquivos novos (`content/parxis.ts`, `contexts/LanguageContext.tsx`, `components/LangSwitcher.tsx`, `components/GoldCorners.tsx`).
- **Compat com o que já existe**: mantenho `parxis-btn` (bevel + neon discreto já ajustado), `parxis-hero`, monograma flutuante e o CTA de "Solicitar Carta de Indicação".
- **Modo de alto contraste**: continua funcionando — o `ContrastToggle` agora regula a opacidade do véu preto sobre o couro/atelier, não a visibilidade da imagem.

### O que NÃO vai mudar

- Wordmark PARXIS original (imagem protegida) — intocado.
- Copy de neurolinguística e gatilhos do Círculo — só migra de local, sem reescrita (a versão EN é uma tradução fiel).
- Hero com o atelier notebook/quadro — permanece.
- Paleta atual de dourado neutro — permanece; adiciono apenas as variáveis extras que o PADCON usa (E8C874, B8902F) para o bevel dos novos botões.
