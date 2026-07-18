#!/usr/bin/env node
/**
 * Regressão visual expandida: garante que o fundo fixo (incluindo o notebook
 * "PADCON" no hero e as demais telas inferiores) permaneça nítido em todas
 * as rotas e variantes de UI (idioma PT/EN, contraste normal/alto), em
 * múltiplos breakpoints e posições de scroll.
 *
 * Regra travada: nenhum `.parxis-glass`, `.parxis-glass-frame`,
 * `.parxis-card`, `.parxis-fixed-bg` ou `.parxis-fixed-veil` pode ter
 * `backdrop-filter` nem `filter: blur(...)`. Também confere que o fundo
 * fixo (`.parxis-fixed-bg`) está montado e com imagem carregada em cada
 * variante — se sumir, o "PADCON" também some.
 *
 * Uso:
 *   1) bun run dev
 *   2) node tests/visual-regression-suite.mjs
 *
 * Sai != 0 se qualquer variante quebrar a regra.
 */

import { chromium } from "playwright";

const BASE_URL = process.env.PARXIS_URL ?? "http://localhost:8080";
const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

const ROUTES = ["/", "/admin"];

const VIEWPORTS = [
  { name: "mobile-sm", width: 360, height: 780 },
  { name: "mobile", width: 375, height: 812 },
  { name: "mobile-lg", width: 430, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "tablet-lg", width: 1024, height: 1366 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-xl", width: 1920, height: 1080 },
];

const VARIANTS = [
  { name: "pt-normal", lang: "pt", contrast: "normal" },
  { name: "pt-high", lang: "pt", contrast: "high" },
  { name: "en-normal", lang: "en", contrast: "normal" },
  { name: "en-high", lang: "en", contrast: "high" },
];

const SELECTORS = [
  ".parxis-glass",
  ".parxis-glass-frame",
  ".parxis-card",
  ".parxis-fixed-bg",
  ".parxis-fixed-veil",
];

async function auditPage(browser, { route, viewport, variant }) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();

  // Semear preferências antes do bundle rodar.
  await context.addInitScript(
    ({ lang, contrast }) => {
      try {
        localStorage.setItem("parxis-lang", lang);
        localStorage.setItem("parxis-contrast", contrast);
      } catch {}
    },
    { lang: variant.lang, contrast: variant.contrast },
  );

  const url = new URL(route, BASE_URL).toString();
  await page.goto(url, { waitUntil: "networkidle" });

  // Confirma que o idioma/contraste foram aplicados.
  const applied = await page.evaluate(() => ({
    lang: localStorage.getItem("parxis-lang"),
    contrast: document.documentElement.dataset.contrast ?? null,
  }));

  // Confere o fundo fixo apenas na home (a única rota que o monta).
  const checkFixedBg = route === "/";
  const fixedBgStatus = checkFixedBg
    ? await page.evaluate(() => {
        const el = document.querySelector(".parxis-fixed-bg");
        if (!el) return { present: false };
        const cs = getComputedStyle(el);
        return {
          present: true,
          hasImage:
            !!cs.backgroundImage && cs.backgroundImage !== "none",
          backgroundImage: cs.backgroundImage.slice(0, 120),
        };
      })
    : { present: true, hasImage: true };

  const docHeight = await page.evaluate(() => document.body.scrollHeight);
  const ratios = [0, 0.25, 0.5, 0.75, 0.95];
  const scrollPositions = ratios.map((r) => Math.floor(docHeight * r));

  const offenders = [];
  for (const y of scrollPositions) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(150);

    const found = await page.evaluate((selectors) => {
      const bad = [];
      const nodes = document.querySelectorAll(selectors.join(","));
      nodes.forEach((el) => {
        const cs = getComputedStyle(el);
        const bf = cs.backdropFilter || cs.webkitBackdropFilter || "";
        const filter = cs.filter || "";
        const backdropBlur = bf !== "" && bf !== "none";
        const filterBlur = /blur\(/.test(filter);
        if (backdropBlur || filterBlur) {
          bad.push({
            cls: (el.className || "").toString().slice(0, 100),
            backdropFilter: bf,
            filter,
          });
        }
      });
      return bad;
    }, SELECTORS);

    if (found.length) offenders.push({ y, found });
  }

  await context.close();
  return { offenders, applied, fixedBgStatus, checkFixedBg };
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {}),
  });
  let failed = false;
  let totalCases = 0;

  for (const route of ROUTES) {
    for (const variant of VARIANTS) {
      for (const viewport of VIEWPORTS) {
        totalCases += 1;
        const label = `${route} · ${variant.name} · ${viewport.name} ${viewport.width}x${viewport.height}`;
        const { offenders, applied, fixedBgStatus, checkFixedBg } =
          await auditPage(browser, { route, viewport, variant });

        const langOk = applied.lang === variant.lang;
        const contrastOk = applied.contrast === variant.contrast;
        const bgOk = !checkFixedBg || (fixedBgStatus.present && fixedBgStatus.hasImage);

        if (offenders.length === 0 && langOk && contrastOk && bgOk) {
          console.log(`ok   [${label}]`);
        } else {
          failed = true;
          console.error(`FAIL [${label}]`);
          if (offenders.length) {
            console.error("  blur detectado:");
            console.error(JSON.stringify(offenders, null, 2));
          }
          if (!langOk) console.error(`  lang esperado=${variant.lang} recebido=${applied.lang}`);
          if (!contrastOk) console.error(`  contrast esperado=${variant.contrast} recebido=${applied.contrast}`);
          if (!bgOk) console.error(`  .parxis-fixed-bg ausente/sem imagem:`, fixedBgStatus);
        }
      }
    }
  }

  await browser.close();
  console.log(`\n${totalCases} cenários auditados.`);
  if (failed) {
    console.error(
      "Regressão detectada: nitidez do fundo comprometida em uma ou mais variantes.",
    );
    process.exit(1);
  }
  console.log("Todas as rotas e variantes passaram — o fundo permanece nítido.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});