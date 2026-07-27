// ---------------------------------------------------------------------------
// Teste E2E do portão da vitrine (/demonstracao/paciente).
// Intercepta POST /api/vitrine-leads e verifica:
//   1. Submit com dados válidos libera o conteúdo demo.
//   2. Resposta 429 exibe a mensagem de rate limit, sem liberar a porta.
//
// Execução: node tests/vitrine-gate.spec.mjs (dev-server em :8080).
// ---------------------------------------------------------------------------

import { chromium } from "playwright";

const CHROMIUM_EXECUTABLE =
  process.env.PARXIS_CHROMIUM || "/chromium-1194/chrome-linux/chrome";
const BASE_URL = process.env.PARXIS_BASE_URL || "http://localhost:8080";
const URL_PACIENTE = `${BASE_URL}/demonstracao/paciente`;
const LEAD_ROUTE_RE = /\/api\/vitrine-leads$/;

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? " — " + detail : ""}`);
}

async function fillGate(page) {
  await page.getByPlaceholder(/nome completo/i).fill("Dra. Ana Teste Silva");
  await page.getByPlaceholder("000.000.000-00").fill("39053344705"); // CPF válido de teste
  await page.getByPlaceholder("(00) 00000-0000").fill("11987654321");
  await page.locator('input[type="checkbox"]').check();
  // Anti-spam time-trap: garante >2.5s desde o mount antes do submit.
  await page.waitForTimeout(2800);
}

async function scenarioSuccess() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_EXECUTABLE, headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(LEAD_ROUTE_RE, (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
  await page.goto(URL_PACIENTE, { waitUntil: "domcontentloaded" });
  await fillGate(page);
  await page.getByRole("button", { name: /abrir a porta/i }).click();
  // Após liberar, o portão some e o conteúdo da demo aparece.
  await page.waitForSelector('text=/O Círculo|The Circle/i', { timeout: 5000 });
  record("Vitrine paciente — submit 200 libera o conteúdo", true);
  await browser.close();
}

async function scenarioRateLimit() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_EXECUTABLE, headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(LEAD_ROUTE_RE, (r) =>
    r.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "Rate limit exceeded" }),
    }),
  );
  await page.goto(URL_PACIENTE, { waitUntil: "domcontentloaded" });
  await fillGate(page);
  await page.getByRole("button", { name: /abrir a porta/i }).click();
  const toast = await page.waitForSelector("text=/Muitas tentativas/i", { timeout: 5000 });
  const stillGate = await page.getByRole("button", { name: /abrir a porta/i }).isVisible();
  record(
    "Vitrine paciente — 429 mostra rate limit e mantém portão",
    Boolean(toast) && stillGate,
  );
  await browser.close();
}

(async () => {
  try {
    await scenarioSuccess();
    await scenarioRateLimit();
  } catch (err) {
    record("Erro inesperado", false, err?.message || String(err));
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} testes passaram.`);
  process.exit(failed ? 1 : 0);
})();