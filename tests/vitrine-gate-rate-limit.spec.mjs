// ---------------------------------------------------------------------------
// Teste dedicado: portão da vitrine deve exibir a mensagem exata
// "Muitas tentativas. Aguarde 1 minuto." quando o servidor responde 429,
// mantendo o formulário visível (acesso NÃO liberado).
//
// Execução: node tests/vitrine-gate-rate-limit.spec.mjs (dev-server em :8080).
// ---------------------------------------------------------------------------

import { chromium } from "playwright";

const CHROMIUM_EXECUTABLE =
  process.env.PARXIS_CHROMIUM || "/chromium-1194/chrome-linux/chrome";
const BASE_URL = process.env.PARXIS_BASE_URL || "http://localhost:8080";
const URL_PACIENTE = `${BASE_URL}/demonstracao/paciente`;
const LEAD_ROUTE_RE = /\/api\/vitrine-leads$/;
const RATE_LIMIT_MSG = "Muitas tentativas. Aguarde 1 minuto.";

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? " — " + detail : ""}`);
}

async function fillGate(page) {
  await page.getByPlaceholder(/nome completo/i).fill("Dra. Ana Teste Silva");
  await page.getByPlaceholder("000.000.000-00").fill("39053344705");
  await page.getByPlaceholder("(00) 00000-0000").fill("11987654321");
  await page.locator('input[type="checkbox"]').check();
  // Time-trap anti-spam: aguardar >2.5s desde o mount.
  await page.waitForTimeout(2800);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_EXECUTABLE,
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  let hits = 0;
  await page.route(LEAD_ROUTE_RE, (route) => {
    hits += 1;
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "Rate limit exceeded" }),
    });
  });

  await page.goto(URL_PACIENTE, { waitUntil: "domcontentloaded" });
  await fillGate(page);
  await page.getByRole("button", { name: /abrir a porta/i }).click();

  // 1) A mensagem exata (PT) deve aparecer no toast.
  let toastOk = false;
  try {
    await page.waitForSelector(`text="${RATE_LIMIT_MSG}"`, { timeout: 5000 });
    toastOk = true;
  } catch (err) {
    toastOk = false;
  }
  record("Toast exibe mensagem exata de rate limit (PT)", toastOk);

  // 2) O portão continua visível — acesso NÃO foi liberado.
  const gateVisible = await page
    .getByRole("button", { name: /abrir a porta/i })
    .isVisible();
  record("Portão permanece visível após 429", gateVisible);

  // 3) O flag de acesso NÃO foi gravado no localStorage.
  const flag = await page.evaluate(() =>
    localStorage.getItem("parxis.vitrine.acesso.paciente"),
  );
  record("localStorage não recebeu 'ok' após 429", flag !== "ok", `valor=${flag}`);

  // 4) A API foi chamada exatamente uma vez.
  record("API /api/vitrine-leads foi chamada uma vez", hits === 1, `hits=${hits}`);

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