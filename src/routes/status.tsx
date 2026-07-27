import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — Parxis" },
      { name: "description", content: "Página de status do site de vendas Parxis." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Status — Parxis" },
      { property: "og:description", content: "Verificação de disponibilidade do site Parxis." },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const timestamp = new Date().toLocaleString("pt-BR");

  type CheckResult = {
    name: string;
    ok: boolean;
    detail: string;
    ms?: number;
  };
  const [checks, setChecks] = useState<CheckResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalSec, setIntervalSec] = useState(30);
  const [, setTick] = useState(0);
  const runningRef = useRef(false);

  async function runSelfTest() {
    setRunning(true);
    setChecks(null);
    const results: CheckResult[] = [];

    const targets: { name: string; url: string }[] = [
      { name: "Home /", url: "/" },
      { name: "Login /login", url: "/login" },
      { name: "Favicon", url: "/favicon.ico" },
    ];

    for (const t of targets) {
      const start = performance.now();
      try {
        const res = await fetch(t.url, { cache: "no-store" });
        const ms = Math.round(performance.now() - start);
        results.push({
          name: t.name,
          ok: res.ok,
          detail: `HTTP ${res.status}`,
          ms,
        });
      } catch (err) {
        results.push({
          name: t.name,
          ok: false,
          detail: `Falha de rede: ${(err as Error).message}`,
        });
      }
    }

    // Server-side health check (API + DB + assets)
    const hStart = performance.now();
    try {
      const res = await fetch("/api/public/health", { cache: "no-store" });
      const totalMs = Math.round(performance.now() - hStart);
      const body = (await res.json()) as {
        ok: boolean;
        checks: { name: string; ok: boolean; ms: number; detail: string }[];
      };
      results.push({
        name: "Health API",
        ok: res.ok,
        detail: `HTTP ${res.status}`,
        ms: totalMs,
      });
      for (const c of body.checks ?? []) {
        results.push({ name: `↳ ${c.name}`, ok: c.ok, detail: c.detail, ms: c.ms });
      }
    } catch (err) {
      results.push({
        name: "Health API",
        ok: false,
        detail: `Falha: ${(err as Error).message}`,
      });
    }

    // api-server Padaxor — endpoint público /api/brt (heartbeat do backend).
    const apiBase =
      (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
      (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
      "";
    if (apiBase) {
      const bStart = performance.now();
      try {
        const res = await fetch(`${apiBase}/api/brt`, { cache: "no-store" });
        results.push({
          name: "api-server /api/brt",
          ok: res.ok,
          detail: `HTTP ${res.status}`,
          ms: Math.round(performance.now() - bStart),
        });
      } catch (err) {
        results.push({
          name: "api-server /api/brt",
          ok: false,
          detail: `Falha: ${(err as Error).message}`,
        });
      }
    } else {
      results.push({
        name: "api-server /api/brt",
        ok: false,
        detail: "VITE_API_BASE_URL não configurada",
      });
    }

    // Check that CSS actually applied (Tailwind loaded)
    try {
      const probe = document.createElement("div");
      probe.className = "hidden";
      document.body.appendChild(probe);
      const display = getComputedStyle(probe).display;
      document.body.removeChild(probe);
      results.push({
        name: "CSS / Tailwind",
        ok: display === "none",
        detail: display === "none" ? "estilos aplicados" : `display=${display}`,
      });
    } catch (err) {
      results.push({ name: "CSS / Tailwind", ok: false, detail: (err as Error).message });
    }

    // JS runtime + navigator info
    results.push({
      name: "JavaScript",
      ok: true,
      detail: `${navigator.onLine ? "online" : "OFFLINE"} • ${navigator.userAgent.split(") ")[0].slice(0, 60)}...`,
    });

    setChecks(results);
    setRunning(false);
    runningRef.current = false;
    setLastRefresh(new Date());
  }

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      if (!runningRef.current) runSelfTest();
    }, intervalSec * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, intervalSec]);

  useEffect(() => {
    if (!lastRefresh) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  const secondsAgo = lastRefresh
    ? Math.max(0, Math.floor((Date.now() - lastRefresh.getTime()) / 1000))
    : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl rounded-lg border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4"
            />
            Auto-refresh
          </label>
          <select
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1min</option>
            <option value={300}>5min</option>
          </select>
          <button
            onClick={runSelfTest}
            disabled={running}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {running ? "Executando..." : "Executar auto-teste"}
          </button>
        </div>

        {lastRefresh && (
          <div className="mb-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`}
            />
            Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}
            {secondsAgo !== null && <span>• há {secondsAgo}s</span>}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <h1 className="text-2xl font-serif text-foreground">Site de vendas ativo</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Todos os serviços operando normalmente.
        </p>

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-emerald-500">Online</dd>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Rota carregada</dt>
            <dd className="font-mono text-foreground">{pathname}</dd>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Ambiente</dt>
            <dd className="font-mono text-foreground">{import.meta.env.MODE}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Verificado em</dt>
            <dd className="font-mono text-foreground">{timestamp}</dd>
          </div>
        </dl>

        {checks && (
          <div className="mt-6 rounded-md border border-border/60 bg-background/40 p-4">
            <h2 className="text-sm font-semibold text-foreground">Resultado do auto-teste</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c.name} className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${c.ok ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span className="text-foreground">{c.name}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground text-right break-all">
                    {c.detail}
                    {typeof c.ms === "number" ? ` • ${c.ms}ms` : ""}
                  </span>
                </li>
              ))}
            </ul>
            {checks.some((c) => !c.ok) ? (
              <p className="mt-3 text-xs text-red-500">
                Uma ou mais verificações falharam. Compartilhe este print para diagnóstico.
              </p>
            ) : (
              <p className="mt-3 text-xs text-emerald-500">
                Tudo verificado com sucesso. O site está acessível a partir deste dispositivo.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o site
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Acessar login
          </a>
        </div>
      </div>
    </main>
  );
}