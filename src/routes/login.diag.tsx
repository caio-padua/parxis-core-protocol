// ------------------------------------------------------------------
// /login/diag — triagem rápida para incidentes de autenticação.
// Não exige credenciais. Executa uma bateria mínima:
//   • VITE_API_BASE_URL configurada
//   • GET /api/health do api-server
//   • Presença de token / expiração local
//   • Estado do lockout local para um username
//   • Flags ativas
// Uso: cole o link para o suporte quando o CEO reportar falha.
// noindex — não é página pública.
// ------------------------------------------------------------------
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getStoredToken,
  isTokenExpired,
  newRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/auth-session";
import { checkLockout } from "@/lib/login-lockout";
import { getFlags } from "@/lib/feature-flags";

export const Route = createFileRoute("/login/diag")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de Login — Padaxor" },
      { name: "description", content: "Diagnóstico interno de autenticação Padaxor." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginDiagPage,
});

type Row = { name: string; ok: boolean; detail: string };

function LoginDiagPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [running, setRunning] = useState(false);
  const [username, setUsername] = useState("");

  async function run() {
    setRunning(true);
    const out: Row[] = [];
    const apiBase =
      (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
      (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
      "";
    out.push({
      name: "VITE_API_BASE_URL",
      ok: !!apiBase,
      detail: apiBase || "não configurada",
    });

    if (apiBase) {
      const requestId = newRequestId();
      const t0 = performance.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${apiBase}/api/health`, {
          headers: { Accept: "application/json", [REQUEST_ID_HEADER]: requestId },
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timer);
        const dur = Math.round(performance.now() - t0);
        out.push({
          name: "GET /api/health",
          ok: res.ok,
          detail: `HTTP ${res.status} · ${dur}ms · req=${requestId.slice(0, 8)}`,
        });
      } catch (err) {
        const dur = Math.round(performance.now() - t0);
        out.push({
          name: "GET /api/health",
          ok: false,
          detail: `${(err as Error)?.name === "AbortError" ? "timeout" : "erro de rede"} · ${dur}ms · req=${requestId.slice(0, 8)}`,
        });
      }
    }

    const token = getStoredToken();
    out.push({
      name: "Token local",
      ok: !!token && !isTokenExpired(token),
      detail: token ? (isTokenExpired(token) ? "expirado" : "válido") : "ausente",
    });

    if (username.trim()) {
      const st = checkLockout(username);
      out.push({
        name: `Lockout (${username.trim()})`,
        ok: !st.locked,
        detail: st.locked
          ? `bloqueado · ${Math.ceil(st.remainingMs / 1000)}s restantes`
          : `livre · ${st.attemptsRemaining} tentativas`,
      });
    }

    const flags = getFlags();
    out.push({
      name: "Flags",
      ok: true,
      detail: Object.entries(flags)
        .map(([k, v]) => `${k}=${v}`)
        .join(" · "),
    });

    out.push({
      name: "User-Agent",
      ok: true,
      detail: typeof navigator !== "undefined" ? navigator.userAgent : "n/a",
    });

    setRows(out);
    setRunning(false);
  }

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10 font-mono text-sm">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-baseline justify-between">
          <h1 className="text-lg tracking-widest text-amber-300">DIAGNÓSTICO · LOGIN</h1>
          <Link to="/login" className="text-xs text-neutral-400 hover:text-amber-300 underline">
            voltar ao login
          </Link>
        </header>

        <div className="flex items-center gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuário para checar lockout (opcional)"
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
          />
          <button
            onClick={() => void run()}
            disabled={running}
            className="px-4 py-2 rounded bg-amber-500/20 border border-amber-500/60 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
          >
            {running ? "executando…" : "re-executar"}
          </button>
        </div>

        <section className="border border-neutral-800 rounded divide-y divide-neutral-800">
          {(rows ?? []).map((r) => (
            <div key={r.name} className="flex items-start gap-4 px-4 py-3">
              <span
                className={`mt-0.5 inline-block w-2 h-2 rounded-full ${r.ok ? "bg-emerald-400" : "bg-red-400"}`}
                aria-hidden
              />
              <div className="flex-1">
                <div className="text-neutral-200">{r.name}</div>
                <div className="text-neutral-400 text-xs break-all">{r.detail}</div>
              </div>
            </div>
          ))}
          {rows === null && (
            <div className="px-4 py-3 text-neutral-500">Aguardando primeira verificação…</div>
          )}
        </section>

        <p className="text-xs text-neutral-500">
          Página interna — não indexada. Compartilhe o print inteiro com o suporte
          citando o requestId (8 chars) exibido em toasts de erro.
        </p>
      </div>
    </main>
  );
}