// ------------------------------------------------------------------
// Sessão do api-server Padaxor — helpers compartilhados.
// Centraliza leitura/limpeza do token, verificação de expiração
// (claim `exp` do JWT) e um `authFetch` que trata 401 de forma segura,
// redirecionando para /login?expired=1 quando o token expira.
// ------------------------------------------------------------------

export const TOKEN_STORAGE_KEY = "padaxor.auth.token";
export const PROFILE_STORAGE_KEY = "padaxor.auth.professional";

// ------------------------------------------------------------------
// Correlation-ID — cada chamada ao api-server carrega um X-Request-Id.
// Formato: UUID v4. O servidor deve ecoar o mesmo header na resposta;
// se ecoar, preferimos o valor do servidor (autoritativo). Exibimos os
// 8 primeiros caracteres nos toasts de erro para que o usuário consiga
// citar um ID rastreável ao suporte / Dr. Code.
// ------------------------------------------------------------------
export const REQUEST_ID_HEADER = "X-Request-Id";

export function newRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* noop */
  }
  // Fallback RFC4122-ish (não-cripto, mas único o bastante para correlação).
  const rnd = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `${rnd()}-${rnd().slice(0, 4)}-4${rnd().slice(0, 3)}-a${rnd().slice(0, 3)}-${rnd()}${rnd().slice(0, 4)}`;
}

export function shortRequestId(id: string | null | undefined): string {
  if (!id) return "";
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
}

export type StoredProfessional = {
  id: number;
  name: string;
  role: string;
  category?: string;
  isPrimaryDoctor?: boolean;
};

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getStoredProfessional(): StoredProfessional | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfessional;
  } catch {
    return null;
  }
}

export function persistSession(token: string, professional: StoredProfessional) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(professional));
  } catch {
    /* storage indisponível */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** Decodifica o claim `exp` (segundos) sem validar assinatura. */
function decodeJwtExp(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as { exp?: number };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

/**
 * `true` se o token tiver claim `exp` e já estiver expirado
 * (com margem de 5s). Tokens sem claim `exp` são tratados como
 * potencialmente válidos — a validação forte é feita no servidor.
 */
export function isTokenExpired(token: string, skewSeconds = 5): boolean {
  const exp = decodeJwtExp(token);
  if (exp == null) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec + skewSeconds;
}

export type LogoutReason = "manual" | "expired" | "unauthorized";

/**
 * Encerra a sessão e leva o usuário à tela /login com um marcador
 * (`?logout=1` ou `?expired=1`) que a página usa para exibir um toast.
 * Segurança: usa `window.location.assign` para forçar navegação
 * completa (limpa qualquer estado in-memory sensível).
 */
export function logout(reason: LogoutReason = "manual") {
  clearSession();
  if (typeof window === "undefined") return;
  const marker = reason === "manual" ? "logout=1" : "expired=1";
  const target = `/login?${marker}`;
  // Se já estamos em /login, apenas atualiza a URL sem recarregar loop.
  if (window.location.pathname === "/login") {
    const url = new URL(window.location.href);
    url.searchParams.set(reason === "manual" ? "logout" : "expired", "1");
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new CustomEvent("padaxor:session-cleared", { detail: { reason } }));
    return;
  }
  window.location.assign(target);
}

/**
 * `fetch` com Authorization automático. Se o servidor devolver 401
 * (ou o token já estiver expirado localmente), limpa a sessão e
 * redireciona para /login?expired=1. Use este helper em qualquer
 * chamada autenticada ao api-server para tratamento uniforme.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = getStoredToken();
  if (!token) {
    logout("unauthorized");
    throw new Error("Sessão ausente.");
  }
  if (isTokenExpired(token)) {
    logout("expired");
    throw new Error("Sessão expirada.");
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has(REQUEST_ID_HEADER)) headers.set(REQUEST_ID_HEADER, newRequestId());
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    logout("expired");
    throw new Error("Sessão expirada.");
  }
  return res;
}