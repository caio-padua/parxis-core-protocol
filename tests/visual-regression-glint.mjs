#!/usr/bin/env node
/**
 * Regressão visual do glint do medalhão Paxter.
 *
 * Regra travada: o glint (`PaxterMedalhao`) não pode orbitar/circular por
 * fora do símbolo. Ele precisa percorrer a estrutura real do monograma como
 * uma caneta: moldura superior, bojo interno, diagonais e gancho lateral.
 * A cobertura é definida por 6 traços reais, cada um renderizado em 2 camadas
 * (`tf-flash` halo + núcleo), totalizando 12 traços animados.
 *
 * O teste também bloqueia a volta do antigo `tf-sweep`, que era uma varredura
 * linear mascarada e fazia o efeito parecer circular/envolvente, não escrito.
 *
 * Uso:
 *   1) bun run dev
 *   2) node tests/visual-regression-glint.mjs
 *
 * Sai != 0 quando qualquer componente do monograma some, quando o
 * escalonamento dos delays quebra, ou quando um sweep orbital volta.
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.PARXIS_URL ?? "http://localhost:8080";
const REPORT_DIR = process.env.PARXIS_REPORT_DIR ?? "tests/.report";
mkdirSync(REPORT_DIR, { recursive: true });

const EXPECTED_MONOGRAM_PATHS = 6; // traços reais do símbolo, não anéis orbitais
const EXPECTED_FLASH_NODES = EXPECTED_MONOGRAM_PATHS * 2; // halo + núcleo
const FLASH_DELAY_STEP_MS = 1450;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const medallion = page.locator(".pax-med").first();
  await medallion.waitFor({ state: "visible", timeout: 10_000 });

  const report = await medallion.evaluate((root) => {
    const svg = root.querySelector("svg");
    if (!svg) return { error: "svg-missing" };
    const flashes = Array.from(svg.querySelectorAll(".tf-flash"));
    const sweeps = Array.from(svg.querySelectorAll(".tf-sweep"));
    const delays = flashes
      .map((el) => {
        const v =
          el.style.getPropertyValue("--tf-flash-delay").trim() ||
          getComputedStyle(el).getPropertyValue("--tf-flash-delay").trim();
        const m = v.match(/-?\d+(?:\.\d+)?/);
        return m ? Number(m[0]) : null;
      })
      .filter((n) => n !== null);
    const dValues = flashes.map((el) => el.getAttribute("d"));
    const uniquePaths = Array.from(new Set(dValues.filter(Boolean)));
    const hasArcOrbitPath = uniquePaths.some((d) => /\ba\s*\d|\bA\s*\d/.test(d));
    return {
      flashCount: flashes.length,
      sweepCount: sweeps.length,
      delays,
      uniquePathCount: uniquePaths.length,
      hasArcOrbitPath,
    };
  });

  const errors = [];
  if (report.error) errors.push(report.error);
  if (report.flashCount !== EXPECTED_FLASH_NODES) {
    errors.push(
      `flash nodes esperado=${EXPECTED_FLASH_NODES} recebido=${report.flashCount}`,
    );
  }
  if (report.uniquePathCount !== EXPECTED_MONOGRAM_PATHS) {
    errors.push(
      `paths únicos esperado=${EXPECTED_MONOGRAM_PATHS} recebido=${report.uniquePathCount} — cobertura do monograma incompleta`,
    );
  }
  if (report.sweepCount !== 0) {
    errors.push(`tf-sweep não pode voltar: recebido=${report.sweepCount}`);
  }
  if (report.hasArcOrbitPath) {
    errors.push("paths orbitais/circulares detectados; o glint deve seguir a estrutura do símbolo");
  }

  // Verifica escalonamento: para cada índice de path (0..N-1) deve
  // existir pelo menos uma camada com delay == i * 120ms. Se qualquer
  // índice faltar, a faísca "pula" aquele componente do monograma.
  const delaySet = new Set(report.delays ?? []);
  const missingIdx = [];
  for (let i = 0; i < EXPECTED_MONOGRAM_PATHS; i++) {
    if (!delaySet.has(i * FLASH_DELAY_STEP_MS)) missingIdx.push(i);
  }
  if (missingIdx.length) {
    errors.push(
      `escalonamento quebrado: faltam delays para índices ${missingIdx.join(",")} (esperado múltiplos de ${FLASH_DELAY_STEP_MS}ms)`,
    );
  }

  const shot = join(REPORT_DIR, "glint-medallion.png");
  try {
    await medallion.screenshot({ path: shot });
  } catch {}

  writeFileSync(
    join(REPORT_DIR, "glint-report.json"),
    JSON.stringify({ report, errors, screenshot: shot }, null, 2),
  );

  await browser.close();

  if (errors.length) {
    console.error("FAIL glint regression:");
    for (const e of errors) console.error("  -", e);
    process.exit(1);
  }
  console.log(
    `ok glint — ${report.flashCount} traços animados escrevendo ${report.uniquePathCount} componentes reais do monograma, sem sweep orbital.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});