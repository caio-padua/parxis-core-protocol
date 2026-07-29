// ------------------------------------------------------------------
// Client-side lockout — mitiga brute-force ANTES de sair para a rede.
// Não substitui rate-limit no api-server; adiciona uma linha de
// defesa local, previsível para o usuário. Guardado em localStorage
// por username (case-insensitive), com janela deslizante.
// ------------------------------------------------------------------

const STORAGE_KEY = "padaxor.login.lockout";
const WINDOW_MS = 5 * 60_000;      // janela de contagem
const MAX_ATTEMPTS = 5;             // após isto, bloqueia
const LOCKOUT_MS = 15 * 60_000;     // 15 minutos

type Entry = { attempts: number[]; blockedUntil: number };
type Store = Record<string, Entry>;

function normalize(username: string): string {
  return username.trim().toLowerCase();
}

function read(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage indisponível */
  }
}

export type LockoutState = {
  locked: boolean;
  remainingMs: number;
  attemptsInWindow: number;
  attemptsRemaining: number;
};

export function checkLockout(username: string): LockoutState {
  const key = normalize(username);
  if (!key) return { locked: false, remainingMs: 0, attemptsInWindow: 0, attemptsRemaining: MAX_ATTEMPTS };
  const now = Date.now();
  const entry = read()[key];
  if (!entry) return { locked: false, remainingMs: 0, attemptsInWindow: 0, attemptsRemaining: MAX_ATTEMPTS };
  if (entry.blockedUntil > now) {
    return {
      locked: true,
      remainingMs: entry.blockedUntil - now,
      attemptsInWindow: entry.attempts.length,
      attemptsRemaining: 0,
    };
  }
  const recent = entry.attempts.filter((t) => now - t < WINDOW_MS);
  return {
    locked: false,
    remainingMs: 0,
    attemptsInWindow: recent.length,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - recent.length),
  };
}

export function recordFailure(username: string): LockoutState {
  const key = normalize(username);
  if (!key) return checkLockout(username);
  const now = Date.now();
  const store = read();
  const entry = store[key] ?? { attempts: [], blockedUntil: 0 };
  entry.attempts = entry.attempts.filter((t) => now - t < WINDOW_MS);
  entry.attempts.push(now);
  if (entry.attempts.length >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + LOCKOUT_MS;
  }
  store[key] = entry;
  write(store);
  return checkLockout(username);
}

export function clearLockout(username: string) {
  const key = normalize(username);
  if (!key) return;
  const store = read();
  delete store[key];
  write(store);
}

export function formatRemaining(ms: number, lang: "pt" | "en" = "pt"): string {
  const total = Math.ceil(ms / 1000);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return lang === "pt" ? `${pad(mm)}m ${pad(ss)}s` : `${pad(mm)}:${pad(ss)}`;
}

export const LOCKOUT_CONSTANTS = { WINDOW_MS, MAX_ATTEMPTS, LOCKOUT_MS };