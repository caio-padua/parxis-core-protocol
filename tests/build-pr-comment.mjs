#!/usr/bin/env node
/**
 * Builds a Markdown summary of the visual regression run for a PR comment.
 * Reads tests/.report/{smoke,suite}-report.json (produced by the runners)
 * and writes tests/.report/pr-comment.md.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = process.env.PARXIS_REPORT_DIR ?? "tests/.report";
const ARTIFACT = process.env.PARXIS_ARTIFACT_NAME ?? "visual-regression-report";

function load(name) {
  const p = join(DIR, name);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

const smoke = load("smoke-report.json");
const suite = load("suite-report.json");
const allFailures = [
  ...((smoke?.failures) ?? []),
  ...((suite?.failures) ?? []),
];
const ok = !smoke?.failed && !suite?.failed;

const lines = [];
lines.push("### 🎨 Visual Regression — Blur / backdrop-filter guard");
lines.push("");
if (ok) {
  lines.push(`✅ **Todos os cenários passaram.** Fundo (incluindo "PADCON") permanece nítido.`);
  if (suite) lines.push(`- Suíte: ${suite.totalCases} cenários auditados.`);
  if (smoke) lines.push(`- Smoke: 7 breakpoints × 5 posições de scroll.`);
} else {
  lines.push(`❌ **Regressão detectada** — ${allFailures.length} cenário(s) com \`backdrop-filter\` ou \`filter: blur(...)\` sobre os painéis.`);
  lines.push("");
  lines.push("| Rota | Variante | Viewport | Elementos afetados |");
  lines.push("|---|---|---|---|");
  for (const f of allFailures.slice(0, 30)) {
    const route = f.route ?? "/";
    const variant = f.variant ?? "smoke";
    const viewport = f.viewport ?? f.size ?? "-";
    const classes = (f.offenders ?? [])
      .flatMap((o) => (o.found ?? []).map((x) => `\`.${(x.cls || "").split(/\s+/)[0]}\``))
      .slice(0, 4)
      .join(", ") || "-";
    lines.push(`| \`${route}\` | ${variant} | ${viewport} | ${classes} |`);
  }
  if (allFailures.length > 30) lines.push(`| … | | | +${allFailures.length - 30} restantes |`);
  lines.push("");
  lines.push(`📎 Screenshots dos cenários com falha estão no artifact **\`${ARTIFACT}\`** deste run (aba *Summary* → *Artifacts*).`);
  lines.push("");
  lines.push("**Como corrigir:** remova qualquer `backdrop-filter` ou `filter: blur(...)` dos seletores `.parxis-glass`, `.parxis-glass-frame`, `.parxis-card`, `.parxis-fixed-bg`, `.parxis-fixed-veil` — a decisão do projeto é contrastar por opacidade/tintura, nunca por desfoque.");
}
lines.push("");
lines.push(`<sub>Gerado automaticamente por \`.github/workflows/visual-regression.yml\`.</sub>`);

writeFileSync(join(DIR, "pr-comment.md"), lines.join("\n"));
console.log(`PR comment written to ${join(DIR, "pr-comment.md")}`);