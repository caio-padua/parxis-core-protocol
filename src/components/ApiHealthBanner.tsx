// ------------------------------------------------------------------
// ApiHealthBanner — sinal de degradação do api-server (Padaxor).
// Faz um GET /api/health silencioso a cada 30s. Após 2 falhas
// consecutivas (timeout de 5s, rede ou 5xx), mostra um banner
// discreto no topo. Volta ao normal em qualquer 2xx.
// Sem dependências externas; monta apenas no cliente.
// ------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { newRequestId, REQUEST_ID_HEADER } from "@/lib/auth-session";

const API_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://workspaceapi-server-production-f5ec.up.railway.app";

const POLL_MS = 30_000;
const TIMEOUT_MS = 5_000;
const FAILURE_THRESHOLD = 2;

type Status = "ok" | "degraded" | "unknown";

export function ApiHealthBanner({ lang = "pt" as "pt" | "en" }: { lang?: "pt" | "en" }) {
  const [status, setStatus] = useState<Status>("unknown");
  const failureCountRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function probe() {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(`${API_URL}/api/health`, {
          method: "GET",
          headers: { Accept: "application/json", [REQUEST_ID_HEADER]: newRequestId() },
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timer);
        if (cancelledRef.current) return;
        if (res.ok) {
          failureCountRef.current = 0;
          setStatus("ok");
        } else if (res.status >= 500) {
          failureCountRef.current += 1;
          if (failureCountRef.current >= FAILURE_THRESHOLD) setStatus("degraded");
        } else {
          // 4xx (inclusive 404 se endpoint ainda não existir): não é degradação
          // do servidor, é ausência de contrato. Fica "unknown" — sem banner.
          failureCountRef.current = 0;
          setStatus("unknown");
        }
      } catch {
        clearTimeout(timer);
        if (cancelledRef.current) return;
        failureCountRef.current += 1;
        if (failureCountRef.current >= FAILURE_THRESHOLD) setStatus("degraded");
      }
    }

    // Primeiro probe imediato; depois a cada POLL_MS.
    probe();
    const id = setInterval(probe, POLL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, []);

  if (status !== "degraded") return null;

  const copy = {
    pt: {
      title: "Serviço em manutenção",
      body: "O motor clínico está temporariamente instável. Tente novamente em instantes — se o problema persistir, contate o administrador do seu Círculo.",
    },
    en: {
      title: "Service in maintenance",
      body: "The clinical engine is temporarily unstable. Please try again shortly — if the issue persists, contact your Circle administrator.",
    },
  }[lang];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[60] border-b border-amber-500/40 bg-amber-500/10 backdrop-blur-md px-4 py-2 text-center text-[13px] leading-snug text-amber-100"
    >
      <strong className="font-semibold tracking-wide text-amber-200">{copy.title}</strong>
      <span className="mx-2 opacity-60">·</span>
      <span className="opacity-90">{copy.body}</span>
    </div>
  );
}