// ------------------------------------------------------------------
// Canário E2E — verifica que o contrato mínimo do api-server está
// honrado em produção. Roda contra a URL real (VITE_API_BASE_URL).
//
//   node --test tests/canary-login.spec.mjs
//
// Não bloqueia deploys — este é um sinal externo. Falhas indicam que
// o api-server divergiu do contrato em docs/api-contract/openapi.yaml.
// ------------------------------------------------------------------
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const API =
  process.env.CANARY_API_BASE_URL ||
  "https://workspaceapi-server-production-f5ec.up.railway.app";

function withTimeout(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
}

test("GET /api/health responde 2xx", async () => {
  const { signal, done } = withTimeout(8000);
  try {
    const res = await fetch(`${API}/api/health`, { signal });
    assert.ok(res.ok, `esperava 2xx, veio ${res.status}`);
  } finally {
    done();
  }
});

test("POST /api/collaborator/login sem body → 400", async () => {
  const { signal, done } = withTimeout(8000);
  try {
    const res = await fetch(`${API}/api/collaborator/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-Id": randomUUID() },
      body: JSON.stringify({}),
      signal,
    });
    assert.equal(res.status, 400, `esperava 400, veio ${res.status}`);
  } finally {
    done();
  }
});

test("POST /api/collaborator/login credenciais falsas → 401 com envelope de erro", async () => {
  const { signal, done } = withTimeout(8000);
  const reqId = randomUUID();
  try {
    const res = await fetch(`${API}/api/collaborator/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-Id": reqId },
      body: JSON.stringify({
        username: `canary-${Date.now()}`,
        password: "definitely-not-valid",
      }),
      signal,
    });
    assert.equal(res.status, 401, `esperava 401, veio ${res.status}`);
    const payload = await res.json().catch(() => null);
    assert.ok(payload && typeof payload.error === "string", "resposta 401 deve conter { error: string }");
    // Eco do X-Request-Id é fortemente recomendado — reportamos como warning se ausente.
    const echoed = res.headers.get("x-request-id");
    if (echoed !== reqId) {
      console.warn(`[canary] X-Request-Id não ecoado (enviado=${reqId}, recebido=${echoed})`);
    }
  } finally {
    done();
  }
});