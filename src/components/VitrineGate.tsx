import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLang, tr } from "@/contexts/LanguageContext";
import { content } from "@/content/parxis";
import {
  formatCpf,
  formatCnpj,
  formatPhone,
  validateCpf,
  validateCnpj,
  validatePhone,
  isAccessGranted,
  grantAccess,
  submitVitrineLead,
  type VitrinePayload,
} from "@/lib/vitrine-gate";

interface VitrineGateProps {
  tipo: "paciente" | "clinica";
  children: React.ReactNode;
}

export function VitrineGate({ tipo, children }: VitrineGateProps) {
  const { lang } = useLang();
  const c = content.vitrine.form;
  const [granted, setGranted] = useState(() => isAccessGranted(tipo));
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGranted(isAccessGranted(tipo));
  }, [tipo]);

  const title = useMemo(
    () => (tipo === "paciente" ? tr(c.patientTitle, lang) : tr(c.clinicTitle, lang)),
    [c, tipo, lang],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const nomeClean = nome.trim();
    if (nomeClean.length < 3 || nomeClean.length > 120) {
      toast.error(tr(c.toasts.nameShort, lang));
      return;
    }
    if (!validateCpf(cpf)) {
      toast.error(tr(c.toasts.cpfInvalid, lang));
      return;
    }
    if (tipo === "clinica" && !validateCnpj(cnpj)) {
      toast.error(tr(c.toasts.cnpjInvalid, lang));
      return;
    }
    if (!validatePhone(telefone)) {
      toast.error(tr(c.toasts.phoneInvalid, lang));
      return;
    }
    if (!consent) {
      toast.error(tr(c.toasts.consentRequired, lang));
      return;
    }

    const payload: VitrinePayload = {
      tipo,
      nome: nomeClean,
      cpf: formatCpf(cpf).replace(/\D/g, ""),
      telefone: formatPhone(telefone).replace(/\D/g, ""),
      source: "padaxor-vitrine",
    };
    if (tipo === "clinica") {
      payload.cnpj = formatCnpj(cnpj).replace(/\D/g, "");
    }

    // UTM da URL, se presente — apenas os 5 campos permitidos.
    try {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
      const utm: Record<string, string> = {};
      utmKeys.forEach((k) => {
        const v = params.get(k);
        if (v) utm[k] = v;
      });
      if (Object.keys(utm).length > 0) payload.utm = utm;
    } catch {
      /* noop */
    }

    setLoading(true);
    const result = await submitVitrineLead(payload);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    grantAccess(tipo);
    setGranted(true);
  };

  if (granted) return <>{children}</>;

  return (
    <div className="parxis-login-card rounded-xl p-5 sm:p-8 md:p-10 relative w-full max-w-[460px] mx-auto">
      <p className="text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)] text-center">
        {tr(content.vitrine.gate.eyebrow, lang)}
      </p>
      <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-center leading-tight">
        {title}
      </h2>
      <div className="parxis-gold-rule w-16 mx-auto my-5" />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
            {tr(c.nameLabel, lang)}
          </span>
          <div className="parxis-login-field">
            <input
              type="text"
              autoComplete="name"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={tr(c.namePh, lang)}
              maxLength={120}
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
            {tr(c.cpfLabel, lang)}
          </span>
          <div className="parxis-login-field">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              required
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder={tr(c.cpfPh, lang)}
              maxLength={14}
            />
          </div>
        </label>

        {tipo === "clinica" && (
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
              {tr(c.cnpjLabel, lang)}
            </span>
            <div className="parxis-login-field">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                value={cnpj}
                onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                placeholder={tr(c.cnpjPh, lang)}
                maxLength={18}
              />
            </div>
          </label>
        )}

        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
            {tr(c.phoneLabel, lang)}
          </span>
          <div className="parxis-login-field">
            <input
              type="text"
              inputMode="tel"
              autoComplete="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder={tr(c.phonePh, lang)}
              maxLength={15}
            />
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[color:var(--gold)] shrink-0"
          />
          <span className="text-[12px] leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">
            {tr(c.consent, lang)}
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="parxis-btn parxis-btn-primary w-full mt-2"
        >
          <span>{loading ? tr(c.submitting, lang) : tr(c.submit, lang)}</span>
        </button>
      </form>
    </div>
  );
}
