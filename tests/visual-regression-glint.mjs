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
    // Geometria: para cada path único, medir extremos, comprimento total
    // e a distância entre o primeiro e o último ponto amostrado. Um traço
    // "escrito" ao longo do símbolo é aberto (endpoints distantes) e possui
    // razão diâmetro/comprimento baixa (< ~0.9). Uma órbita circular fecha
    // sobre si mesma (endpoints coincidentes) e tem essa razão alta.
    const SVG_NS = "http://www.w3.org/2000/svg";
    const geom = uniquePaths.map((d) => {
      const tmp = document.createElementNS(SVG_NS, "path");
      tmp.setAttribute("d", d);
      const total = tmp.getTotalLength();
      const samples = 48;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const pts = [];
      for (let i = 0; i <= samples; i++) {
        const p = tmp.getPointAtLength((i / samples) * total);
        pts.push(p);
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const start = pts[0], end = pts[pts.length - 1];
      const endpointDist = Math.hypot(end.x - start.x, end.y - start.y);
      const bboxDiag = Math.hypot(maxX - minX, maxY - minY);
      // Detecta traço com curvatura constante ao redor de um centróide
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
      const rMean = radii.reduce((a, b) => a + b, 0) / radii.length;
      const rVar =
        radii.reduce((a, b) => a + (b - rMean) ** 2, 0) / radii.length;
      const radialCV = rMean > 0 ? Math.sqrt(rVar) / rMean : 0;
      return {
        d,
        length: total,
        bboxDiag,
        endpointDist,
        endpointRatio: bboxDiag > 0 ? endpointDist / bboxDiag : 0,
        radialCV,
      };
    });
    return {
      flashCount: flashes.length,
      sweepCount: sweeps.length,
      delays,
      uniquePathCount: uniquePaths.length,
      hasArcOrbitPath,
      geom,
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

  // Checagem geométrica: cada traço precisa ser um segmento aberto que
  // percorre parte do símbolo (endpoints distantes) e NÃO uma curva
  // fechada com raio quase constante (órbita).
  for (const [i, g] of (report.geom ?? []).entries()) {
    if (!Number.isFinite(g.length) || g.length < 40) {
      errors.push(`path #${i} muito curto (len=${g.length?.toFixed?.(1)}); glint precisa cobrir o traço real`);
      continue;
    }
    // Traço aberto: endpoints distantes em relação ao bounding-box.
    if (g.endpointRatio < 0.35) {
      errors.push(
        `path #${i} tem endpoints quase coincidentes (ratio=${g.endpointRatio.toFixed(2)}); parece órbita fechada, não linha do símbolo`,
      );
    }
    // Raio quase constante em torno do centróide == círculo/orbital.
    if (g.radialCV < 0.08) {
      errors.push(
        `path #${i} tem curvatura radial quase constante (CV=${g.radialCV.toFixed(3)}); interpolação circular detectada`,
      );
    }
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