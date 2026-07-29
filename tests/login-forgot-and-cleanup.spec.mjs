// ---------------------------------------------------------------------------
// Testes de regressão para a limpeza de código morto no /login.
//
// Cobrem:
//   1. onForgot (email inválido)  — toast de erro; nenhum request ao Supabase.
//   2. onForgot (email válido)    — chama supabase.auth.resetPasswordForEmail
//                                   e mostra o toast de confirmação (resetSent).
//   3. UI limpa                    — sem botão Google, sem toggle de cadastro,
//                                    sem medidor de força de senha.
//
// Estilo idêntico ao tests/login-auth.spec.mjs (Playwright direto, sem vitest).
//
// Execução:
//   node tests/login-forgot-and-cleanup.spec.mjs
// ---------------------------------------------------------------------------

import { chromium } from "playwright";

const CHROMIUM_EXECUTABLE =
  process.env.PARXIS_CHROMIUM || "/chromium-1194/chrome-linux/chrome";
const BASE_URL = process.env.PARXIS_BASE_URL || "http://localhost:8080";
const LOGIN_URL = `${BASE_URL}/login`;

// A rota do Supabase para recuperação é POST /auth/v1/recover.
const SUPABASE_RECOVER_RE = /\/auth\/v1\/recover(\?|$)/;

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? " — " + detail : ""}`);
}

async function newLoginPage(context) {
  const page = await context.newPage();
  await page.goto(LOGIN_URL, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => {
      const f = document.querySelector("form");
      if (!f) return false;
      const k = Object.keys(f).find((x) => x.startsWith("__reactProps"));
      return !!(k && typeof f[k].onSubmit === "function");
    },
    null,
    { timeout: 8000 },
  );
  return page;
}

// --- CENÁRIO 1: onForgot com email inválido -------------------------------
async function testForgotInvalidEmail(context) {
  const page = await newLoginPage(context);

  let recoverCalled = false;
  await page.route(SUPABASE_RECOVER_RE, async (route) => {
    recoverCalled = true;
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  // Preenche usuário com algo que NÃO é email (fluxo real: usuário do api-server).
  await page.locator("form input").nth(0).fill("dra.padua");
  await page.getByRole("button", { name: /Esqueci minha senha|I forgot my password/i }).click();

  await page
    .getByText(/Informe o email|Enter the email/i)
    .waitFor({ timeout: 3000 })
    .catch(() => {});

  record("forgot inválido: toast de erro exibido",
    await page.getByText(/Informe o email|Enter the email/i).count() > 0);
  record("forgot inválido: não chamou o Supabase", !recoverCalled);
  await page.close();
}

// --- CENÁRIO 2: onForgot com email válido --------------------------------
async function testForgotValidEmail(context) {
  const page = await newLoginPage(context);

  let recoverCalled = false;
  let recoverBody = null;
  await page.route(SUPABASE_RECOVER_RE, async (route) => {
    recoverCalled = true;
    try { recoverBody = JSON.parse(route.request().postData() || "{}"); } catch {}
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.locator("form input").nth(0).fill("dra.padua@parxis.com.br");
  await page.getByRole("button", { name: /Esqueci minha senha|I forgot my password/i }).click();

  // Aguarda o toast de confirmação (COPY.resetSent).
  await page
    .getByText(/link seguro|secure link/i)
    .waitFor({ timeout: 5000 })
    .catch(() => {});

  record("forgot válido: chamou supabase.auth.resetPasswordForEmail", recoverCalled);
  record(
    "forgot válido: enviou o email digitado",
    !!recoverBody && recoverBody.email === "dra.padua@parxis.com.br",
    JSON.stringify(recoverBody),
  );
  record(
    "forgot válido: toast de confirmação exibido",
    await page.getByText(/link seguro|secure link/i).count() > 0,
  );
  await page.close();
}

// --- CENÁRIO 3: UI limpa (regressão da limpeza de código morto) -----------
async function testCleanUI(context) {
  const page = await newLoginPage(context);

  // Sem botão "Continuar com Google" / "Continue with Google".
  const googleBtn = await page
    .getByRole("button", { name: /Continuar com Google|Continue with Google/i })
    .count();
  record("cleanup: sem botão Google", googleBtn === 0);

  // Sem toggle "Primeiro acesso · ativar" / "First access · activate".
  const upToggle = await page
    .getByText(/Primeiro acesso · ativar|First access · activate/i)
    .count();
  record("cleanup: sem toggle de cadastro", upToggle === 0);

  // Sem hint de força de senha (medidor pertencia ao modo up).
  const pwHint = await page
    .getByText(/Mínimo 12 caracteres|At least 12 characters/i)
    .count();
  record("cleanup: sem medidor de força de senha", pwHint === 0);

  // Campo usuário deve ser type="text" (não "email") — comportamento do modo in.
  const type = await page.locator("form input").nth(0).getAttribute("type");
  record('cleanup: input de usuário type="text"', type === "text", type ?? "<null>");

  // Botão submit fixo em "Acessar Padaxor" / "Enter Padaxor".
  const submit = await page
    .getByRole("button", { name: /Acessar Padaxor|Enter Padaxor/i })
    .count();
  record("cleanup: submit fixo em 'Acessar Padaxor'", submit > 0);

  await page.close();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_EXECUTABLE,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
  });
  try {
    await testCleanUI(context);
    await testForgotInvalidEmail(context);
    await testForgotValidEmail(context);
  } finally {
    await browser.close();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.error("Failing checks:");
    for (const f of failed) console.error(" - " + f.name + (f.detail ? ` [${f.detail}]` : ""));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});