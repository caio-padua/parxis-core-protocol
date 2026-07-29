// ------------------------------------------------------------------
// Feature flags — sinal simples para ligar/desligar comportamentos
// sem redeploy. Ordem de precedência:
//   1. localStorage "padaxor.flags" (JSON parcial) — override manual.
//   2. window.__PADAXOR_FLAGS__ (injeção via <script> no HTML) — permite
//      operação forçar um estado sem tocar no código.
//   3. Defaults abaixo.
// Server-side (SSR): sempre retorna defaults.
// ------------------------------------------------------------------

export type FeatureFlags = {
  /** Exibe o banner de degradação do api-server. */
  apiHealthBanner: boolean;
  /** Aplica lockout local após tentativas falhadas de login. */
  clientLockout: boolean;
  /** Habilita a rota /login/diag para triagem rápida. */
  loginDiag: boolean;
  /** Ecoa o requestId nos toasts de erro do login. */
  requestIdInToast: boolean;
};

export const DEFAULT_FLAGS: FeatureFlags = {
  apiHealthBanner: true,
  clientLockout: true,
  loginDiag: true,
  requestIdInToast: true,
};

const STORAGE_KEY = "padaxor.flags";

declare global {
  interface Window {
    __PADAXOR_FLAGS__?: Partial<FeatureFlags>;
  }
}

export function getFlags(): FeatureFlags {
  if (typeof window === "undefined") return DEFAULT_FLAGS;
  let stored: Partial<FeatureFlags> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<FeatureFlags>;
  } catch {
    /* noop */
  }
  const injected = window.__PADAXOR_FLAGS__ ?? {};
  return { ...DEFAULT_FLAGS, ...injected, ...stored };
}

export function setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) {
  if (typeof window === "undefined") return;
  const current = getFlags();
  const next = { ...current, [key]: value };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function resetFlags() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}