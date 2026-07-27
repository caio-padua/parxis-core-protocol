// ------------------------------------------------------------------
// Portão de acesso da vitrine Parxis — validação e envio de leads.
// Contrato: POST <VITE_API_BASE_URL>/api/vitrine-leads
// Campos: tipo, nome, cpf, telefone (cnpj obrigatório quando clinica).
// Resposta: { ok: true } ou { error: string }.
// Liberação: chave por portão no localStorage.
// ------------------------------------------------------------------

const VITRINE_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") || "";

export const VITRINE_LEAD_ENDPOINT = VITRINE_API_BASE_URL
  ? `${VITRINE_API_BASE_URL}/api/vitrine-leads`
  : "";

export function cleanDigits(v: string): string {
  return v.replace(/\D/g, "");
}

export function formatCpf(v: string): string {
  const d = cleanDigits(v).slice(0, 11);
  return d.replace(/(\d{3})(\d{1,3})?(\d{1,3})?(\d{1,2})?/, (_, a, b, c, e) => {
    let out = a;
    if (b) out += `.${b}`;
    if (c) out += `.${c}`;
    if (e) out += `-${e}`;
    return out;
  });
}

export function formatCnpj(v: string): string {
  const d = cleanDigits(v).slice(0, 14);
  return d.replace(
    /(\d{2})(\d{1,3})?(\d{1,3})?(\d{1,4})?(\d{1,2})?/,
    (_, a, b, c, d, e) => {
      let out = a;
      if (b) out += `.${b}`;
      if (c) out += `.${c}`;
      if (d) out += `/${d}`;
      if (e) out += `-${e}`;
      return out;
    },
  );
}

export function formatPhone(v: string): string {
  const d = cleanDigits(v).slice(0, 11);
  if (d.length > 10) {
    return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

function calcDvCpf(digits: number[]): boolean {
  const check = (arr: number[], factor: number) => {
    let total = 0;
    for (let i = 0; i < arr.length; i++) total += arr[i] * (factor - i);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = check(digits.slice(0, 9), 10);
  const d2 = check([...digits.slice(0, 9), d1], 11);
  return digits[9] === d1 && digits[10] === d2;
}

export function validateCpf(v: string): boolean {
  const d = cleanDigits(v);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  return calcDvCpf(Array.from(d).map(Number));
}

function calcDvCnpj(digits: number[]): boolean {
  const check = (arr: number[], weights: number[]) => {
    let total = 0;
    for (let i = 0; i < arr.length; i++) total += arr[i] * weights[i];
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = check(digits.slice(0, 12), w1);
  const d2 = check([...digits.slice(0, 12), d1], w2);
  return digits[12] === d1 && digits[13] === d2;
}

export function validateCnpj(v: string): boolean {
  const d = cleanDigits(v);
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;
  return calcDvCnpj(Array.from(d).map(Number));
}

export function validatePhone(v: string): boolean {
  const d = cleanDigits(v);
  return d.length === 10 || d.length === 11;
}

export function getAccessKey(tipo: "paciente" | "clinica"): string {
  return `parxis.vitrine.acesso.${tipo}`;
}

export function isAccessGranted(tipo: "paciente" | "clinica"): boolean {
  try {
    return localStorage.getItem(getAccessKey(tipo)) === "ok";
  } catch {
    return false;
  }
}

export function grantAccess(tipo: "paciente" | "clinica"): void {
  try {
    localStorage.setItem(getAccessKey(tipo), "ok");
  } catch {
    /* noop */
  }
}

export function revokeAccess(tipo: "paciente" | "clinica"): void {
  try {
    localStorage.removeItem(getAccessKey(tipo));
  } catch {
    /* noop */
  }
}

export interface VitrinePayload {
  tipo: "paciente" | "clinica";
  nome: string;
  cpf: string;
  cnpj?: string;
  telefone: string;
  source?: string;
  rotaOrigem?: string;
  utm?: Record<string, string>;
}

export async function submitVitrineLead(
  payload: VitrinePayload,
): Promise<{ ok: true } | { error: string; code?: "rate_limited" | "config" | "http" | "network" }> {
  if (!VITRINE_LEAD_ENDPOINT) {
    return { error: "A demonstração ainda não está configurada.", code: "config" };
  }
  try {
    const res = await fetch(VITRINE_LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      /* não-JSON */
    }
    if (res.status === 429) {
      return {
        error: data?.error || "Muitas tentativas. Aguarde 1 minuto.",
        code: "rate_limited",
      };
    }
    if (!res.ok) {
      return { error: data?.error || `Erro ${res.status}`, code: "http" };
    }
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha na conexão.", code: "network" };
  }
}
