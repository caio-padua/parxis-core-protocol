import { createFileRoute } from "@tanstack/react-router";
type Check = { name: string; ok: boolean; ms: number; detail: string };

async function timed(name: string, fn: () => Promise<{ ok: boolean; detail: string }>): Promise<Check> {
  const start = Date.now();
  try {
    const r = await fn();
    return { name, ok: r.ok, ms: Date.now() - start, detail: r.detail };
  } catch (e) {
    return { name, ok: false, ms: Date.now() - start, detail: (e as Error).message };
  }
}

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin;

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

        const checks: Check[] = [];

        // API/env presence
        checks.push({
          name: "API env",
          ok: Boolean(supabaseUrl && supabaseKey),
          ms: 0,
          detail: supabaseUrl && supabaseKey ? "SUPABASE_URL + PUBLISHABLE_KEY presentes" : "variáveis ausentes",
        });

        // Database ping via publishable key
        checks.push(
          await timed("Banco de dados", async () => {
            if (!supabaseUrl || !supabaseKey) return { ok: false, detail: "sem credenciais" };
            const res = await fetch(`${supabaseUrl}/rest/v1/`, {
              headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
              cache: "no-store",
            });
            // Any HTTP response < 500 means PostgREST + DB are reachable.
            const reachable = res.status > 0 && res.status < 500;
            return { ok: reachable, detail: `PostgREST HTTP ${res.status}` };
          }),
        );

        // Static assets (favicon)
        checks.push(
          await timed("Assets estáticos", async () => {
            const res = await fetch(`${origin}/favicon.ico`, { cache: "no-store" });
            return { ok: res.ok, detail: `HTTP ${res.status}` };
          }),
        );

        const allOk = checks.every((c) => c.ok);
        return Response.json(
          { ok: allOk, checkedAt: new Date().toISOString(), checks },
          { status: allOk ? 200 : 503, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});