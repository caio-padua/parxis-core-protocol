// ---------------------------------------------------------------------------
// Teste dedicado: após submit bem-sucedido no portão da vitrine, o botão de
// "Limpar acesso neste dispositivo" aparece. Ao clicá-lo:
//   1. O flag do localStorage some (não fica marcado).
//   2. O formulário volta a ficar visível.
//   3. Um novo submit funciona (fluxo re-habilitado).
// Além disso, valida que um 429 NÃO deixa o lead marcado no localStorage e
// NÃO exibe o botão de reset (porque acesso não foi concedido).
//
// Execução: node tests/vitrine-gate-reset.spec.mjs (dev-server em :8080).
// ---------------------------------------------------------------------------

import { chromium } from "playwright";

const CHROMIUM_EXECUTABLE =
  process.env.PARXIS_CHROMIUM || "/chromium-1194/chrome-linux/chrome";
const BASE_URL = process.env.PARXIS_BASE_URL || "http://localhost:8080";
const URL_PACIENTE = `${BASE_URL}/demonstracao/paciente`;
const LEAD_ROUTE_RE = /\/api\/vitrine-leads$/;
const STORAGE_KEY = "parxis.vitrine.acesso.paciente";
const RESET_LABEL = /Limpar acesso neste dispositivo/i;

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? " — " + detail : ""}`);
}

async function fillGate(page) {
  await page.getByPlaceholder(/nome completo/i).fill("Dra. Ana Teste Silva");
  await page.getByPlaceholder("000.000.000-00").fill("39053344705");
  await page.getByPlaceholder("(00) 00000-0000").fill("11987654321");
  await page.locator('input[type="checkbox"]').check({ force: true });
  // Time-trap anti-spam: >2.5s desde o mount.
  await page.waitForTimeout(2800);
}

async function submitGate(page) {
  // Clique real no botão de submit (scroll + click nativo via JS para escapar
  // de qualquer overlay/animação). React captura o submit em bubble.
  await page.evaluate(() => {
    const btn = document.querySelector('form button[type="submit"]');
    if (btn) {
      btn.scrollIntoView({ block: "center" });
      btn.click();
    }
  });
  await Promise.all([
    page.waitForResponse((r) => LEAD_ROUTE_RE.test(r.url()), { timeout: 10000 }),
    Promise.resolve(),
  ]);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_EXECUTABLE,
    headless: true,
  });
  const context = await browser.newContext({
    reducedMotion: "reduce",
  });
  // Força idioma PT antes de qualquer navegação para casar com placeholders/toasts.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("parxis-lang", "pt");
    } catch {}
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      console.log(`[page.${msg.type()}]`, msg.text().slice(0, 200));
    }
  });
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));

  let hits = 0;
  // Modo controlado pelo teste: primeiro 200, depois 429 (para o cenário 2),
  // depois volta a 200 para provar que reset re-habilita o envio.
  let mode = "ok";
  await page.route(LEAD_ROUTE_RE, (route) => {
    hits += 1;
    if (mode === "ratelimit") {
      return route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "Rate limit exceeded" }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  // --- Cenário A: 200 → granted → reset visível → clicar reset limpa tudo.
  await page.goto(URL_PACIENTE, { waitUntil: "domcontentloaded" });
  await fillGate(page);
  await submitGate(page);
  await page.waitForSelector("text=/Círculo está aberto|Circle is open/i", { timeout: 8000 });
  const flagAfterGrant = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  record("Após 200, localStorage marcado como 'ok'", flagAfterGrant === "ok", `valor=${flagAfterGrant}`);

  // Botão de reset deve estar visível.
  const resetBtn = page.getByRole("button", { name: RESET_LABEL });
  const resetVisible = await resetBtn.isVisible().catch(() => false);
  record("Botão de reset visível após acesso concedido", resetVisible);

  // Clicar no reset limpa o flag e reexibe o formulário.
  await resetBtn.click();
  const flagAfterReset = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  record("Clique no reset limpa o flag do localStorage", flagAfterReset === null, `valor=${flagAfterReset}`);

  const gateBack = await page
    .getByRole("button", { name: /abrir a porta/i })
    .isVisible()
    .catch(() => false);
  record("Formulário do portão volta a aparecer após reset", gateBack);

  // --- Cenário B: novo submit funciona (fluxo re-habilitado).
  await fillGate(page);
  await submitGate(page);
  let resubmitOk = false;
  try {
    await page.waitForSelector("text=/Círculo está aberto|Circle is open/i", { timeout: 5000 });
    resubmitOk = true;
  } catch {
    resubmitOk = false;
  }
  record("Após reset, novo submit re-abre o acesso", resubmitOk);

  // --- Cenário C: 429 NÃO marca localStorage e NÃO exibe botão de reset.
  // Limpa storage e volta ao portão para simular um novo visitante.
  await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
  mode = "ratelimit";
  await page.goto(URL_PACIENTE, { waitUntil: "domcontentloaded" });
  await fillGate(page);
  await submitGate(page);
  await page.waitForSelector("text=/Muitas tentativas/i", { timeout: 5000 });

  const flagAfter429 = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  record("429 não marca lead no localStorage", flagAfter429 !== "ok", `valor=${flagAfter429}`);

  const resetAfter429 = await page
    .getByRole("button", { name: RESET_LABEL })
    .isVisible()
    .catch(() => false);
  record("Botão de reset NÃO aparece após 429 (acesso não concedido)", !resetAfter429);

  record("API chamada exatamente 3x (submit ok + resubmit ok + 429)", hits === 3, `hits=${hits}`);

  await browser.close();
}

(async () => {
  try {
    await run();
  } catch (err) {
    record("Erro inesperado", false, err?.message || String(err));
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} testes passaram.`);
  process.exit(failed ? 1 : 0);
})();