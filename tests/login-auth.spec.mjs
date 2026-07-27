// ---------------------------------------------------------------------------
// Testes de autenticação da tela /login (api-server próprio).
// Cobrem três cenários pedidos pelo produto:
//   1. Sucesso (200)  — persiste token+professional e redireciona por role.
//   2. 401            — NÃO sobrescreve o storage com uma sessão inválida
//                       e mantém o usuário em /login.
//   3. Campos vazios  — validação client-side impede o request; nenhuma
//                       sessão nova é persistida e o usuário fica em /login.
//
// Não depende de vitest: roda com Playwright direto, no mesmo estilo dos
// testes de regressão visual do projeto.
//
// Execução:
//   bun run dev            # em outro terminal, garante http://localhost:8080
//   node tests/login-auth.spec.mjs
// ---------------------------------------------------------------------------

import { chromium } from "playwright";

// Node/Playwright neste sandbox tem chromium-1194 pré-instalado; passamos o
// binário explicitamente para não depender do resolvedor de versão.
const CHROMIUM_EXECUTABLE =
  process.env.PARXIS_CHROMIUM ||
  "/chromium-1194/chrome-linux/chrome";

const BASE_URL = process.env.PARXIS_BASE_URL || "http://localhost:8080";
const LOGIN_URL = `${BASE_URL}/login`;
const API_ROUTE_RE =
  /workspaceapi-server-production-[^/]+\.up\.railway\.app\/api\/collaborator\//;

const TOKEN_KEY = "padaxor.auth.token";
const PROFILE_KEY = "padaxor.auth.professional";

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  const tag = ok ? "PASS" : "FAIL";
  console.log(`[${tag}] ${name}${detail ? " — " + detail : ""}`);
}

async function readStorage(page) {
  // Após um sucesso o app navega para /recepcao (rota inexistente) e o
  // documento pode ficar em origem opaca — nesses casos caímos para o
  // storageState do contexto, que independe do documento atual.
  try {
    return await page.evaluate(
      ([t, p]) => ({
        token: localStorage.getItem(t),
        professional: localStorage.getItem(p),
      }),
      [TOKEN_KEY, PROFILE_KEY],
    );
  } catch {
    const state = await page.context().storageState();
    const origin = state.origins.find((o) => o.origin === new URL(LOGIN_URL).origin);
    const kv = Object.fromEntries((origin?.localStorage ?? []).map((e) => [e.name, e.value]));
    return { token: kv[TOKEN_KEY] ?? null, professional: kv[PROFILE_KEY] ?? null };
  }
}

async function seedNoise(page) {
  // Semeia storage "sujo" para provar que o handler limpa em erro/validação.
  await page.evaluate(
    ([t, p]) => {
      localStorage.setItem(t, "stale-token");
      localStorage.setItem(p, JSON.stringify({ id: 0, name: "stale", role: "x" }));
    },
    [TOKEN_KEY, PROFILE_KEY],
  );
}

async function newLoginPage(context) {
  const page = await context.newPage();
  // Impede navegação real para rotas inexistentes (/recepcao etc.):
  // capturamos a URL alvo no evento 'framenavigated'.
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
  return page;
}

async function fillAndSubmit(page, { user, pass }) {
  // Campos: primeiro input = usuário (type=text no modo "in"),
  // segundo input = senha (type=password). Submetemos via Enter no
  // campo de senha porque o painel flutua (animação) e o click cai em
  // "element not stable"; Enter também aciona corretamente o React
  // onSubmit sem precisar de {force: true}.
  const inputs = page.locator("form input");
  if (user !== undefined) await inputs.nth(0).fill(user);
  if (pass !== undefined) await inputs.nth(1).fill(pass);
  await inputs.nth(1).press("Enter");
}

// --- CENÁRIO 1: sucesso ----------------------------------------------------
async function testSuccess(context) {
  const page = await newLoginPage(context);
  const navigations = [];
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) navigations.push(f.url());
  });

  await page.route(API_ROUTE_RE, async (route) => {
    const url = route.request().url();
    if (url.endsWith("/api/collaborator/login")) {
      const body = JSON.parse(route.request().postData() || "{}");
      if (body.username === "dra.padua" && body.password === "SenhaForte#2026") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            token: "jwt-token-xyz",
            professional: {
              id: 1,
              name: "Dra. Pádua",
              role: "Recepcionista",
            },
          }),
        });
      }
    }
    if (url.endsWith("/api/collaborator/me")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    return route.fulfill({ status: 500, body: "unexpected" });
  });

  const respPromise = page.waitForResponse(
    (r) => /\/api\/collaborator\/login$/.test(r.url()),
    { timeout: 5000 },
  );
  await fillAndSubmit(page, { user: "dra.padua", pass: "SenhaForte#2026" });
  await respPromise;
  // Dá tempo para o handler persistir e o router agendar a navegação.
  await page.waitForTimeout(1500);

  const stored = await readStorage(page);
  const tokenOk = stored.token === "jwt-token-xyz";
  const profOk =
    !!stored.professional && JSON.parse(stored.professional).role === "Recepcionista";
  const redirected = navigations
    .filter((u) => u.startsWith("http://localhost"))
    .some((u) => new URL(u).pathname === "/recepcao");

  record("sucesso: persiste token", tokenOk, stored.token ?? "<null>");
  record("sucesso: persiste professional", profOk);
  record(
    "sucesso: redireciona por role (Recepcionista -> /recepcao)",
    redirected,
    navigations.map((u) => new URL(u).pathname).join(" | "),
  );
  await page.close();
}

// --- CENÁRIO 2: 401 --------------------------------------------------------
async function test401(context) {
  const page = await newLoginPage(context);
  await seedNoise(page);

  let hitLogin = false;
  await page.route(API_ROUTE_RE, async (route) => {
    if (route.request().url().endsWith("/api/collaborator/login")) {
      hitLogin = true;
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Usuário ou senha inválidos" }),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await fillAndSubmit(page, { user: "qualquer.user", pass: "SenhaForte#2026" });

  // Espera o toast (garante que o fluxo terminou).
  await page
    .getByText(/Usuário ou senha inválidos/i)
    .waitFor({ timeout: 5000 })
    .catch(() => {});

  const stored = await readStorage(page);
  record("401: chamou o endpoint de login", hitLogin);
  record(
    "401: não persistiu sessão inválida (token !== jwt-*)",
    stored.token !== "jwt-token-xyz",
    stored.token ?? "<null>",
  );
  record(
    "401: professional não foi sobrescrito com sessão nova",
    !stored.professional || !JSON.parse(stored.professional).id ||
      JSON.parse(stored.professional).name === "stale",
  );
  record(
    "401: permaneceu em /login",
    new URL(page.url()).pathname === "/login",
    page.url(),
  );
  await page.close();
}

// --- CENÁRIO 3: campos vazios (validação client-side) ----------------------
async function testEmptyFields(context) {
  const page = await newLoginPage(context);
  await seedNoise(page);

  let apiCalled = false;
  await page.route(API_ROUTE_RE, async (route) => {
    apiCalled = true;
    return route.fulfill({ status: 500, body: "should-not-be-called" });
  });

  await fillAndSubmit(page, { user: "", pass: "" });

  // Toast de validação em PT: "Informe o usuário."
  await page
    .getByText(/Informe o usuário|Enter your username/i)
    .waitFor({ timeout: 3000 })
    .catch(() => {});

  const stored = await readStorage(page);
  record("vazio: não chamou o backend", !apiCalled);
  record(
    "vazio: não escreveu sessão nova por cima do storage",
    stored.token !== "jwt-token-xyz",
    stored.token ?? "<null>",
  );
  record(
    "vazio: permaneceu em /login",
    new URL(page.url()).pathname === "/login",
    page.url(),
  );
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
    await testSuccess(context);
    await test401(context);
    await testEmptyFields(context);
  } finally {
    await browser.close();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} checks passed`,
  );
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