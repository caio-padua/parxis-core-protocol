#!/usr/bin/env node
/**
 * Regressão visual do glint do medalhão Paxter.
 *
 * Regra travada: o motor de glint (`PaxterMedalhao`) precisa cobrir 100%
 * do monograma sem saltos. A cobertura é definida por 7 componentes
 * (três anéis + silhueta externa da letra P + contra-forma do bojo +
 * dois traços laterais), cada um renderizado em 2 camadas (`tf-flash`
 * halo + núcleo), totalizando 14 traços animados. Cada camada precisa
 * ter `--tf-flash-delay` escalonado em múltiplos de 120ms, para que a
 * faísca percorra os componentes em sequência sem pular nenhum.
 *
 * Também confere que a varredura de luz (`tf-sweep`) está montada com
 * duração > 0 — sem ela o brilho não atravessa o medalhão.
 *
 * Uso:
 *   1) bun run dev
 *   2) node tests/visual-regression-glint.mjs
 *
 * Sai != 0 quando qualquer componente do monograma some, quando o
 * escalonamento dos delays quebra, ou quando o sweep é removido.
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.PARXIS_URL ?? "http://localhost:8080";
const REPORT_DIR = process.env.PARXIS_REPORT_DIR ?? "tests/.report";
mkdirSync(REPORT_DIR, { recursive: true });

const EXPECTED_MONOGRAM_PATHS = 7; // anéis (3) + P externo + P interno + 2 ticks
const EXPECTED_FLASH_NODES = EXPECTED_MONOGRAM_PATHS * 2; // halo + núcleo
const FLASH_DELAY_STEP_MS = 120;

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
    const sweepMs = sweeps.map((el) => {
      const v =
        el.style.getPropertyValue("--tf-sweep").trim() ||
        getComputedStyle(el).getPropertyValue("--tf-sweep").trim();
      const m = v.match(/-?\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : null;
    });
    const dValues = flashes.map((el) => el.getAttribute("d"));
    const uniquePaths = Array.from(new Set(dValues.filter(Boolean)));
    return {
      flashCount: flashes.length,
      sweepCount: sweeps.length,
      sweepMs,
      delays,
      uniquePathCount: uniquePaths.length,
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
  if (report.sweepCount < 1) errors.push("tf-sweep ausente");
  if (!report.sweepMs?.every((n) => typeof n === "number" && n > 0)) {
    errors.push(`sweep duration inválida: ${JSON.stringify(report.sweepMs)}`);
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
    `ok glint — ${report.flashCount} traços animados sobre ${report.uniquePathCount} componentes do monograma, sweep ${report.sweepMs?.[0]}ms.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});