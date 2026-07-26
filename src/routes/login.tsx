import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang, tr } from "@/contexts/LanguageContext";
import { LangSwitcher } from "@/components/LangSwitcher";
import { cn } from "@/lib/utils";
import parxisWordmark from "@/assets/parxis-wordmark.png";
import atelierAsset from "@/assets/parxis-padcon-v8-fhd.webp.asset.json";
const atelierUrl = atelierAsset.url;
import { PaxterMedalhao } from "@/components/PaxterMedalhao";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Parxis · Acesso Clínico Reservado" },
      {
        name: "description",
        content:
          "Entrada privada ao motor clínico Parxis. Acesso reservado a médicos licenciados — autenticação com verificação forte e Sign in with Google.",
      },
      { property: "og:title", content: "Parxis · Acesso Clínico Reservado" },
      {
        property: "og:description",
        content: "Entrada privada dos médicos licenciados no Parxis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

const COPY = {
  eyebrow: { pt: "Acesso reservado", en: "Reserved access" },
  brand: { pt: "Círculo Parxis", en: "Parxis Circle" },
  headline: {
    pt: "Entre no motor clínico.",
    en: "Enter the clinical engine.",
  },
  lead: {
    pt: "Autenticação privada dos médicos licenciados. Verificação em dupla camada, senhas cruzadas contra vazamentos globais e Sign in with Google com credenciais de mais alto nível.",
    en: "Private authentication for licensed physicians. Two-layer verification, passwords cross-checked against global breach corpora, and Sign in with Google at the highest available assurance.",
  },
  tabIn: { pt: "Entrar", en: "Sign in" },
  tabUp: { pt: "Ativar acesso", en: "Activate access" },
  email: { pt: "Email institucional", en: "Institutional email" },
  password: { pt: "Senha", en: "Password" },
  passwordHint: {
    pt: "Mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo.",
    en: "At least 12 characters, with upper, lower, number and symbol.",
  },
  submitIn: { pt: "Acessar Parxis", en: "Enter Parxis" },
  submitUp: { pt: "Ativar meu acesso", en: "Activate my access" },
  google: { pt: "Continuar com Google", en: "Continue with Google" },
  divider: { pt: "ou credenciais Parxis", en: "or Parxis credentials" },
  forgot: { pt: "Esqueci minha senha", en: "I forgot my password" },
  loading: { pt: "Aguarde…", en: "Please wait…" },
  toIn: { pt: "Já possuo credenciais · entrar", en: "I already have credentials · sign in" },
  toUp: { pt: "Primeiro acesso · ativar", en: "First access · activate" },
  success: {
    pt: "Sessão iniciada. Redirecionando para o motor clínico…",
    en: "Session started. Redirecting to the clinical engine…",
  },
  signupSuccess: {
    pt: "Verifique seu email para confirmar o acesso.",
    en: "Please verify your email to confirm access.",
  },
  resetSent: {
    pt: "Enviamos um link seguro para o email informado.",
    en: "We sent a secure link to that email.",
  },
  emailRequired: {
    pt: "Informe o email para redefinir a senha.",
    en: "Enter the email to reset the password.",
  },
  footerLegal: {
    pt: "Sessão protegida · HIBP · TLS 1.3 · OAuth 2.1",
    en: "Protected session · HIBP · TLS 1.3 · OAuth 2.1",
  },
  back: { pt: "Voltar ao site", en: "Back to site" },
} as const;

type Cert = {
  id: string;
  code: string;
  title: { pt: string; en: string };
  summary: { pt: string; en: string };
  detail: { pt: string; en: string };
};

const CERTS: Cert[] = [
  {
    id: "oauth",
    code: "OAuth 2.1",
    title: { pt: "OAuth 2.1 · Sign in with Google", en: "OAuth 2.1 · Sign in with Google" },
    summary: {
      pt: "Autenticação delegada de mais alto nível — sem senha em trânsito.",
      en: "Highest-assurance delegated authentication — no password in transit.",
    },
    detail: {
      pt: "O acesso pode ser feito pelo protocolo OAuth 2.1 com Sign in with Google, o padrão de mais alto nível disponível hoje. A Parxis nunca recebe sua senha do Google — apenas um token efêmero, assinado, com escopo mínimo e rotação automática. PKCE obrigatório em todos os fluxos.",
      en: "Access is delegated via OAuth 2.1 with Sign in with Google — today's highest-assurance standard. Parxis never receives your Google password, only a signed ephemeral token with minimum scope and automatic rotation. PKCE is enforced on every flow.",
    },
  },
  {
    id: "hibp",
    code: "HIBP",
    title: { pt: "HIBP · verificação de vazamentos", en: "HIBP · breach screening" },
    summary: {
      pt: "Senhas cruzadas contra bilhões de credenciais vazadas globalmente.",
      en: "Passwords cross-checked against billions of leaked credentials worldwide.",
    },
    detail: {
      pt: "Toda senha cadastrada é conferida contra o corpus HIBP (Have I Been Pwned) — um banco mundial de bilhões de credenciais expostas em vazamentos. Se sua senha aparecer em qualquer incidente conhecido, a Parxis bloqueia o cadastro antes que o risco chegue à sua clínica. A verificação é feita com hashing parcial (k-anonymity): sua senha nunca sai do dispositivo em texto claro.",
      en: "Every submitted password is checked against the HIBP (Have I Been Pwned) corpus — a global database of billions of credentials exposed in breaches. If your password appears in any known incident, Parxis blocks the registration before the risk touches your clinic. The check uses k-anonymity partial hashing: your password never leaves your device in clear text.",
    },
  },
  {
    id: "tls",
    code: "TLS 1.3",
    title: { pt: "TLS 1.3 · canal cifrado moderno", en: "TLS 1.3 · modern encrypted channel" },
    summary: {
      pt: "Toda a comunicação viaja em canal cifrado de última geração.",
      en: "All traffic travels in a modern end-to-end encrypted channel.",
    },
    detail: {
      pt: "Todo o tráfego entre o seu navegador e o motor clínico Parxis viaja sobre TLS 1.3 — a geração mais atual do protocolo, com handshake reduzido, forward secrecy obrigatório e ciphers legados desativados. Isso impede que redes intermediárias, provedores ou terceiros consigam ler ou alterar as requisições em trânsito.",
      en: "All traffic between your browser and the Parxis clinical engine flows over TLS 1.3 — the most current generation of the protocol, with reduced handshake, mandatory forward secrecy and legacy ciphers disabled. This prevents intermediary networks, providers or third parties from reading or tampering with requests in transit.",
    },
  },
  {
    id: "lgpd",
    code: "LGPD · RLS",
    title: { pt: "LGPD · isolamento por Row-Level Security", en: "LGPD · Row-Level Security isolation" },
    summary: {
      pt: "Dados clínicos isolados por linha — cada clínica só enxerga o que é seu.",
      en: "Clinical data isolated at the row level — each clinic sees only its own.",
    },
    detail: {
      pt: "A Parxis opera em conformidade com a LGPD e usa Row-Level Security (RLS) no banco de dados: cada registro clínico carrega o vínculo da clínica proprietária, e o motor bloqueia no núcleo qualquer leitura fora desse escopo. Nenhum médico, operador ou administrador cruza dados de clínicas diferentes — o isolamento é técnico, não apenas contratual.",
      en: "Parxis is LGPD-compliant and uses Row-Level Security (RLS) at the database layer: every clinical record carries its owning clinic, and the engine blocks any read outside that scope at the core. No physician, operator or administrator can cross data between clinics — the isolation is technical, not merely contractual.",
    },
  },
];

const CERTS_COPY = {
  eyebrow: { pt: "Credenciais de segurança", en: "Security credentials" },
  title: { pt: "Certificação e proteção", en: "Certification & protection" },
  hint: { pt: "Toque em cada selo para entender o que ele representa.", en: "Tap each badge to see what it represents." },
  close: { pt: "Fechar", en: "Close" },
} as const;

const APP_URL = "https://app.parxis.com.br";

function passwordSchema(lang: "pt" | "en") {
  const m = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return z
    .string()
    .min(12, m("Mínimo de 12 caracteres.", "At least 12 characters."))
    .max(128, m("No máximo 128 caracteres.", "At most 128 characters."))
    .regex(/[A-Z]/, m("Inclua ao menos uma maiúscula.", "Include at least one uppercase letter."))
    .regex(/[a-z]/, m("Inclua ao menos uma minúscula.", "Include at least one lowercase letter."))
    .regex(/[0-9]/, m("Inclua ao menos um número.", "Include at least one number."))
    .regex(/[^A-Za-z0-9]/, m("Inclua ao menos um símbolo.", "Include at least one symbol."));
}

function scorePassword(pw: string): number {
  let s = 0;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

function LoginPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Se já autenticado, salta direto ao app.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.assign(APP_URL);
    });
  }, []);

  const pwScore = useMemo(() => scorePassword(password), [password]);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function onGoogle() {
    setOauthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/login`,
      });
      if (result.error) {
        toast.error(result.error.message ?? "OAuth error");
        setOauthLoading(false);
        return;
      }
      if (result.redirected) return; // browser will redirect
      // Session set — go to app
      toast.success(tr(COPY.success, lang));
      window.location.assign(APP_URL);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
      setOauthLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!emailValid) {
      toast.error(lang === "pt" ? "Email inválido." : "Invalid email.");
      return;
    }
    if (mode === "up") {
      const parsed = passwordSchema(lang).safeParse(password);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Password too weak");
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(tr(COPY.success, lang));
        window.location.assign(APP_URL);
      } else {
        const emailRedirectTo = `${window.location.origin}/login`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(tr(COPY.signupSuccess, lang));
        setMode("in");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onForgot() {
    if (!emailValid) {
      toast.error(tr(COPY.emailRequired, lang));
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success(tr(COPY.resetSent, lang));
  }

  return (
    <main
      className="parxis-app parxis-login-page min-h-screen text-foreground relative overflow-hidden"
      style={{
        ["--parxis-fixed-url" as string]: `url(${atelierUrl})`,
        ["--parxis-atelier-url" as string]: `url(${atelierUrl})`,
      }}
    >
      {/* Fundo atelier nítido — mesmo do site institucional */}
      <div className="parxis-fixed-bg" aria-hidden />
      <div className="parxis-fixed-veil" aria-hidden />
      {/* Véu extra bem sutil para deixar a tela mais clara e o fundo visível */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(0,0,0,0.10) 0%, transparent 55%), radial-gradient(120% 90% at 50% 100%, rgba(0,0,0,0.18) 0%, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.14))",
        }}
      />

      <header className="relative z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 md:px-10 py-5 sm:py-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3 group">
          <PaxterMedalhao size={44} className="shrink-0" />
          <img
            src={parxisWordmark}
            alt="Parxis"
            className="h-6 sm:h-7 md:h-8 w-auto opacity-95 group-hover:opacity-100 transition-opacity"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden md:inline-flex text-[11px] uppercase tracking-[0.32em] text-foreground/80 hover:text-[color:var(--gold)] transition-colors"
          >
            ← {tr(COPY.back, lang)}
          </Link>
          <LangSwitcher />
        </div>
      </header>

      <section className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center px-4 sm:px-6 md:px-10 lg:px-16 pb-16 sm:pb-20 pt-2 lg:pt-6">
        {/* Coluna esquerda — narrativa com fundo de leitura */}
        <div className="hidden lg:block">
          <div className="max-w-xl rounded-2xl p-8 lg:p-10" style={{ background: "rgba(5, 3, 3, 0.28)" }}>
            <p className="text-[12px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-5">
              {tr(COPY.eyebrow, lang)} · {tr(COPY.brand, lang)}
            </p>
            <h1
              className="font-serif text-[44px] xl:text-[54px] leading-[1.05] mb-5"
              style={{
                background: "linear-gradient(180deg, #FBEBAA 0%, #C9B070 55%, #8A6A20 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {tr(COPY.headline, lang)}
            </h1>
            <div className="parxis-gold-rule w-24 mb-5" />
            <p className="text-[17px] text-foreground/95 font-light leading-relaxed">
              {tr(COPY.lead, lang)}
            </p>

            <ul className="mt-10 space-y-4 text-[15px] text-foreground/90">
              <TrustRow label={lang === "pt" ? "OAuth 2.1 · Sign in with Google" : "OAuth 2.1 · Sign in with Google"} />
              <TrustRow label={lang === "pt" ? "Senhas verificadas contra HIBP (bilhões de vazamentos)" : "Passwords screened against HIBP (billions of breaches)"} />
              <TrustRow label={lang === "pt" ? "TLS 1.3 · sessões efêmeras · rotação automática" : "TLS 1.3 · ephemeral sessions · auto-rotation"} />
              <TrustRow label={lang === "pt" ? "Conformidade LGPD · dados clínicos isolados por RLS" : "LGPD-compliant · clinical data isolated by row-level security"} />
            </ul>
          </div>
        </div>

        {/* Coluna direita — cartão de acesso flutuante */}
        <div className="relative w-full max-w-[460px] mx-auto lg:ml-auto">
          <div className="parxis-login-card rounded-xl p-5 sm:p-8 md:p-10 relative">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)] text-center">
              {tr(COPY.brand, lang)}
            </p>
            <h2 className="mt-3 font-serif text-[28px] md:text-[32px] text-center leading-tight">
              {mode === "in" ? tr(COPY.tabIn, lang) : tr(COPY.tabUp, lang)}
            </h2>
            <div className="parxis-gold-rule w-16 mx-auto my-5" />

            <button
              type="button"
              onClick={onGoogle}
              disabled={oauthLoading}
              className="parxis-login-google w-full"
            >
              <GoogleIcon />
              <span>
                {oauthLoading ? tr(COPY.loading, lang) : tr(COPY.google, lang)}
              </span>
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[rgba(242,184,23,0.18)]" />
              <span className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
                {tr(COPY.divider, lang)}
              </span>
              <div className="h-px flex-1 bg-[rgba(242,184,23,0.18)]" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <label className="block">
                <span className="block text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
                  {tr(COPY.email, lang)}
                </span>
                <div className="parxis-login-field">
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@clinica.com.br"
                  />
                </div>
              </label>

              <label className="block">
                <span className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                    {tr(COPY.password, lang)}
                  </span>
                  {mode === "in" && (
                    <button
                      type="button"
                      onClick={onForgot}
                      className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-[color:var(--gold)] transition-colors"
                    >
                      {tr(COPY.forgot, lang)}
                    </button>
                  )}
                </span>
                <div className="parxis-login-field relative">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete={mode === "in" ? "current-password" : "new-password"}
                    required
                    minLength={mode === "up" ? 12 : 8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ paddingRight: "4.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-[color:var(--gold)] transition-colors"
                  >
                    {showPw ? (lang === "pt" ? "Ocultar" : "Hide") : (lang === "pt" ? "Ver" : "Show")}
                  </button>
                </div>
                {mode === "up" && (
                  <div className="mt-3">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-[4px] flex-1 rounded-full transition-colors"
                          style={{
                            background:
                              i < pwScore
                                ? "linear-gradient(90deg, #C9B070, #FBEBAA)"
                                : "rgba(242,184,23,0.12)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/90">
                      {tr(COPY.passwordHint, lang)}
                    </p>
                  </div>
                )}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="parxis-btn parxis-btn-primary w-full mt-2"
              >
                <span>
                  {loading
                    ? tr(COPY.loading, lang)
                    : mode === "in"
                    ? tr(COPY.submitIn, lang)
                    : tr(COPY.submitUp, lang)}
                </span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
              className="mt-6 w-full text-[11px] uppercase tracking-[0.32em] text-muted-foreground hover:text-[color:var(--gold)] transition-colors"
            >
              {mode === "in" ? tr(COPY.toUp, lang) : tr(COPY.toIn, lang)}
            </button>
          </div>

          <CertificationsPanel lang={lang} />

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.36em] text-foreground/80">
            {tr(COPY.footerLegal, lang)}
          </p>
        </div>
      </section>
    </main>
  );
}

function TrustRow({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-[6px] h-[6px] w-[6px] rounded-full"
        style={{ background: "linear-gradient(180deg, #FBEBAA, #8A6A20)" }}
      />
      <span className="leading-relaxed">{label}</span>
    </li>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13-5l-6-5.1c-2 1.4-4.4 2.1-7 2.1-5.3 0-9.8-3.1-11.3-7.5l-6.6 5.1C9.5 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 4.9l6 5.1c-.4.4 6.9-5 6.9-14 0-1.2-.1-2.3-.3-3.5z" />
    </svg>
  );
}

function CertificationsPanel({ lang }: { lang: "pt" | "en" }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tipId, setTipId] = useState<string | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusChip(i: number) {
    const n = CERTS.length;
    const idx = ((i % n) + n) % n;
    chipRefs.current[idx]?.focus();
  }

  function onChipKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusChip(i + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusChip(i - 1);
        break;
      case "Home":
        e.preventDefault();
        focusChip(0);
        break;
      case "End":
        e.preventDefault();
        focusChip(CERTS.length - 1);
        break;
      case "Escape":
        if (openId) {
          e.preventDefault();
          setOpenId(null);
        }
        break;
    }
  }

  const hintKb =
    lang === "pt"
      ? "Use Tab para navegar, ← → para percorrer os selos, Enter para abrir, Esc para fechar."
      : "Use Tab to navigate, ← → to move between badges, Enter to open, Esc to close.";
  return (
    <div className="parxis-login-card parxis-cert-card rounded-xl p-5 sm:p-7 md:p-8 mt-6 relative">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
          {tr(CERTS_COPY.eyebrow, lang)}
        </p>
        <h3 className="mt-2 font-serif text-[20px] md:text-[22px] leading-tight">
          {tr(CERTS_COPY.title, lang)}
        </h3>
        <div className="parxis-gold-rule w-12 mx-auto my-3" />
        <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
          {tr(CERTS_COPY.hint, lang)}
        </p>
        <p className="sr-only" aria-live="polite">
          {hintKb}
        </p>
      </div>

      <ul
        className="mt-6 grid grid-cols-2 gap-4 sm:gap-5"
        role="group"
        aria-label={tr(CERTS_COPY.title, lang)}
      >
        {CERTS.map((c, i) => {
          const active = openId === c.id;
          const tipOpen = tipId === c.id;
          const descId = `${c.id}-tip-desc`;
          return (
            <li key={c.id} className="relative">
              <span id={descId} className="sr-only">
                {tr(c.summary, lang)}
              </span>
              <button
                type="button"
                onClick={() => setOpenId(active ? null : c.id)}
                onKeyDown={(e) => onChipKeyDown(e, i)}
                onMouseEnter={() => setTipId(c.id)}
                onMouseLeave={() =>
                  setTipId((current) => (current === c.id ? null : current))
                }
                onFocus={() => setTipId(c.id)}
                onBlur={() =>
                  setTipId((current) => (current === c.id ? null : current))
                }
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                aria-expanded={active}
                aria-controls={`cert-panel-${c.id}`}
                aria-describedby={descId}
                aria-label={`${c.code} — ${tr(c.title, lang)}`}
                className={cn(
                  "parxis-cert-chip w-full text-left",
                  active ? "parxis-cert-chip--active" : ""
                )}
              >
                <span className="parxis-cert-chip__code">{c.code}</span>
                <span className="parxis-cert-chip__label">{tr(c.title, lang)}</span>
              </button>
              <span
                className={cn(
                  "parxis-cert-tip",
                  tipOpen ? "parxis-cert-tip--open" : ""
                )}
                aria-hidden="true"
              >
                <span className="parxis-cert-tip__text">{tr(c.summary, lang)}</span>
                <span className="parxis-cert-tip__arrow" aria-hidden="true" />
              </span>
            </li>
          );
        })}
      </ul>

      {openId && (() => {
        const c = CERTS.find((x) => x.id === openId)!;
        return (
          <div
            id={`cert-panel-${c.id}`}
            role="region"
            aria-label={tr(c.title, lang)}
            className="parxis-cert-detail mt-4 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.36em] text-[color:var(--gold)]">
                  {c.code}
                </p>
                <p className="font-serif text-[15px] leading-tight mt-1">{tr(c.title, lang)}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-[color:var(--gold)] transition-colors shrink-0"
              >
                {tr(CERTS_COPY.close, lang)} ✕
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {tr(c.detail, lang)}
            </p>
          </div>
        );
      })()}
    </div>
  );
}

