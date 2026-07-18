#!/usr/bin/env node
/**
 * Regressão visual: garante que o fundo fixo (imagem "PADCON") nunca fique
 * embaçado por `backdrop-filter` ou `filter: blur(...)` nos painéis
 * `.parxis-glass`, `.parxis-glass-frame`, `.parxis-card`, `.parxis-fixed-bg`
 * e `.parxis-fixed-veil`, em vários breakpoints e posições de scroll.
 *
 * Uso:
 *   1) Rodar o dev server:   bun run dev
 *   2) Em outro terminal:    node tests/visual-regression-padcon.mjs
 *
 * Requer `playwright` (Node) instalado localmente. Em ambientes sem o pacote,
 * há a variante Python equivalente em /tmp/browser/verify/multi.py.
 *
 * Sai com código != 0 se algum elemento inspecionado apresentar blur.
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.PARXIS_URL ?? "http://localhost:8080";
const REPORT_DIR = process.env.PARXIS_REPORT_DIR ?? "tests/.report";
mkdirSync(REPORT_DIR, { recursive: true });
const failuresForReport = [];

const VIEWPORTS = [
  { name: "mobile-sm", width: 360, height: 780 },
  { name: "mobile", width: 375, height: 812 },
  { name: "mobile-lg", width: 430, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "tablet-lg", width: 1024, height: 1366 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-xl", width: 1920, height: 1080 },
];

const SELECTORS = [
  ".parxis-glass",
  ".parxis-glass-frame",
  ".parxis-card",
  ".parxis-fixed-bg",
  ".parxis-fixed-veil",
];

async function auditViewport(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const docHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollPositions = [0, 0.25, 0.5, 0.75, 0.95].map((r) =>
    Math.floor(docHeight * r),
  );

  const offenders = [];
  for (const y of scrollPositions) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(200);

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

  if (offenders.length) {
    const shot = join(REPORT_DIR, `smoke-${vp.name}.png`);
    try {
      await page.screenshot({ path: shot });
      failuresForReport.push({ scope: "smoke", viewport: vp.name, size: `${vp.width}x${vp.height}`, screenshot: shot, offenders });
    } catch {}
  }

  await context.close();
  return offenders;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  let failed = false;
  for (const vp of VIEWPORTS) {
    const offenders = await auditViewport(browser, vp);
    if (offenders.length === 0) {
      console.log(`ok  [${vp.name} ${vp.width}x${vp.height}]`);
    } else {
      failed = true;
      console.error(
        `FAIL [${vp.name} ${vp.width}x${vp.height}] — blur detectado:`,
      );
      console.error(JSON.stringify(offenders, null, 2));
    }
  }
  await browser.close();

  writeFileSync(
    join(REPORT_DIR, "smoke-report.json"),
    JSON.stringify({ failed, failures: failuresForReport }, null, 2),
  );

  if (failed) {
    console.error(
      "\nRegressão detectada: painéis não podem ter backdrop-filter nem filter: blur().",
    );
    process.exit(1);
  }
  console.log("\nTodos os breakpoints passaram — fundo PADCON permanece nítido.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});