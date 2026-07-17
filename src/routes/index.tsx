import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import parxisSymbolUrl from "@/assets/parxis-symbol.svg?url";
import parxisWordmarkUrl from "@/assets/parxis-wordmark.svg?url";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{
        ["--parxis-symbol-url" as string]: `url(${parxisSymbolUrl})`,
        ["--parxis-wordmark-url" as string]: `url(${parxisWordmarkUrl})`,
      }}
    >
      <Nav />
      <Hero />
      <Manifesto />
      <Features />
      <Technology />
      <ForClinics />
      <Testimonial />
      <Ecosystem />
      <CTA />
      <Footer />
    </main>
  );
}

/* ————————————————— NAV ————————————————— */
function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[rgba(5,5,5,0.55)] border-b border-[rgba(242,184,23,0.12)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <span className="text-[color:var(--gold)] font-serif tracking-[0.28em] text-sm uppercase">
            Parxis
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Motor Clínico
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-9 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <a href="#manifesto" className="hover:text-[color:var(--gold)] transition-colors">Manifesto</a>
          <a href="#recursos" className="hover:text-[color:var(--gold)] transition-colors">Recursos</a>
          <a href="#tecnologia" className="hover:text-[color:var(--gold)] transition-colors">Tecnologia</a>
          <a href="#clinicas" className="hover:text-[color:var(--gold)] transition-colors">Para Clínicas</a>
        </nav>
        <div className="flex items-center gap-3">
          <MotionToggle />
          <a
            href="#contato"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.35)] px-4 py-2 rounded-full hover:bg-[rgba(242,184,23,0.08)] transition-colors"
          >
            Agendar demonstração
          </a>
        </div>
      </div>
    </header>
  );
}

/* ————————————————— MOTION TOGGLE ————————————————— */
type MotionMode = "full" | "reduce";

function MotionToggle() {
  const [mode, setMode] = useState<MotionMode | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("parxis-motion") as MotionMode | null;
    const systemReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial: MotionMode = stored ?? (systemReduce ? "reduce" : "full");
    document.documentElement.dataset.motion = initial;
    setMode(initial);
  }, []);

  const toggle = () => {
    const next: MotionMode = mode === "reduce" ? "full" : "reduce";
    document.documentElement.dataset.motion = next;
    localStorage.setItem("parxis-motion", next);
    setMode(next);
  };

  if (mode === null) return null;
  const reduced = mode === "reduce";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reduced}
      aria-label={reduced ? "Ativar animações do site" : "Reduzir animações do site"}
      title={reduced ? "Animações reduzidas — clique para ativar" : "Animações ativas — clique para reduzir"}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(242,184,23,0.3)] text-[color:var(--gold)] hover:bg-[rgba(242,184,23,0.08)] transition-colors"
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {reduced ? (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8" />
          </>
        ) : (
          <>
            <path d="M12 3v3" />
            <path d="M12 18v3" />
            <path d="M5.6 5.6l2.1 2.1" />
            <path d="M16.3 16.3l2.1 2.1" />
            <path d="M3 12h3" />
            <path d="M18 12h3" />
            <path d="M5.6 18.4l2.1-2.1" />
            <path d="M16.3 7.7l2.1-2.1" />
            <circle cx="12" cy="12" r="3.5" />
          </>
        )}
      </svg>
    </button>
  );
}

/* ————————————————— HERO ————————————————— */
function Hero() {
  return (
    <section id="top" className="relative parxis-hero-bg pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* linhas decorativas de moldura */}
      <div className="absolute inset-x-8 top-24 parxis-gold-rule opacity-60" />
      <div className="absolute inset-x-8 bottom-8 parxis-gold-rule opacity-40" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center relative">
        {/* Texto */}
        <div className="parxis-reveal">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.42em] text-[color:var(--gold)] mb-8">
            Haute Médecine · Établi 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            O motor clínico das{" "}
            <span className="parxis-gold-text italic">clínicas integrativas</span>{" "}
            de alto padrão.
          </h1>
          <div className="parxis-gold-rule w-32 my-10" />
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl font-light">
            Parxis conduz o protocolo injetável do primeiro sinal clínico à assinatura eletrônica do RAS — com o rigor de um relojoeiro suíço e a elegância de um atendimento em maison.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href="#contato"
              className="group inline-flex items-center gap-3 bg-[color:var(--gold)] text-[color:var(--obsidian)] px-8 py-4 rounded-full text-xs uppercase tracking-[0.28em] font-medium hover:bg-[color:var(--gold-light)] transition-colors"
            >
              Solicitar acesso privado
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#recursos"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.35)] hover:bg-[rgba(242,184,23,0.06)] transition-colors"
            >
              Explorar o sistema
            </a>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "14", v: "etapas de anamnese" },
              { k: "100%", v: "RAS auditável" },
              { k: "1", v: "clique · assinatura" },
            ].map((it) => (
              <div key={it.v}>
                <div className="font-serif text-3xl text-[color:var(--gold)]">{it.k}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 leading-snug">{it.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Símbolo flutuante */}
        <ParxisMonogram />
      </div>
    </section>
  );
}

/* ————————————————— MONOGRAMA VIVO —————————————————
   Wordmark PARXIS estático em primeiro plano.
   Símbolo respira atrás — se aproxima e se afasta —
   com múltiplas auras em ritmos distintos, halo cônico
   rotativo, luz-sweep prismática e parallax 3D no mouse. */
function ParxisMonogram() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf = 0;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { targetX = 0; targetY = 0; };
    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      el.style.setProperty("--mx", curX.toFixed(3));
      el.style.setProperty("--my", curY.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="parxis-stage relative flex items-center justify-center min-h-[560px] lg:min-h-[640px]"
      aria-label="Parxis"
    >
      {/* Halo cônico rotativo — iridescência dourada */}
      <div className="parxis-halo-conic" aria-hidden />
      {/* Auras respirando em ritmos independentes */}
      <div className="parxis-aura parxis-aura-1" aria-hidden />
      <div className="parxis-aura parxis-aura-2" aria-hidden />
      {/* Anel dourado etéreo */}
      <div className="parxis-ring" aria-hidden />
      {/* Partículas de ouro à deriva */}
      <div className="parxis-particles" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: i }} />
        ))}
      </div>

      {/* Símbolo — respira, gira suavemente, atrás do wordmark */}
      <div className="parxis-symbol-wrap" aria-hidden>
        <div className="parxis-symbol-tilt">
          <div className="parxis-symbol-levitate">
            <div className="parxis-symbol-img" role="img" aria-label="Símbolo Parxis" />
            {/* Luz-sweep prismática por cima do símbolo */}
            <div className="parxis-symbol-sheen" aria-hidden />
          </div>
          {/* Sombra projetada na superfície */}
          <div className="parxis-shadow" aria-hidden />
          {/* Superfície onde o símbolo levita */}
          <div className="parxis-surface" aria-hidden />
        </div>
      </div>

      {/* Wordmark PARXIS — estático, em primeiro plano, íntegro */}
      <div className="parxis-wordmark" role="img" aria-label="PARXIS" />
    </div>
  );
}

/* ————————————————— MANIFESTO ————————————————— */
function Manifesto() {
  return (
    <section id="manifesto" className="relative py-28 lg:py-40 bg-background">
      <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-8">
          Manifesto
        </p>
        <h2 className="font-serif text-3xl md:text-5xl leading-tight text-foreground">
          Cada protocolo é uma <em className="parxis-gold-text not-italic">assinatura</em> — do médico, da clínica, do cuidado.
        </h2>
        <div className="parxis-gold-rule w-40 mx-auto my-10" />
        <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
          Nascemos do desejo de conduzir a medicina integrativa com o mesmo padrão das maisons que atravessam gerações. Um sistema não deve apenas registrar — deve elevar. Parxis existe para transformar cada consulta, cada RAS, cada apresentação de protocolo em um objeto de valor duradouro.
        </p>
      </div>
    </section>
  );
}

/* ————————————————— FEATURES ————————————————— */
const FEATURES = [
  {
    n: "01",
    title: "Anamnese guiada em 14 etapas",
    body: "Linha do tempo clínica com vídeos de ajuda por pergunta. Nada escapa, nada se perde — do primeiro sintoma à hipótese diagnóstica.",
  },
  {
    n: "02",
    title: "Protocolos injetáveis auditáveis",
    body: "Da prescrição ao RAS assinado com rubrica de paciente e enfermagem. Datas dd/mm/aa, células coloridas, controlados isolados.",
  },
  {
    n: "03",
    title: "Apresentação premium do protocolo",
    body: "Documento em acabamento creme/dourado entregue ao paciente. Torna o protocolo tão elegante quanto o resultado clínico proposto.",
  },
  {
    n: "04",
    title: "Receituário e solicitação de exames",
    body: "Emissão com marca da clínica, assinatura eletrônica, controle de vias e histórico completo por paciente.",
  },
  {
    n: "05",
    title: "RAS FAP — folha de auditoria",
    body: "Rastro completo do injetável, resistente a estresse de auditoria: 15 substâncias, 19 páginas, sem página em branco.",
  },
  {
    n: "06",
    title: "Portal do paciente e da clínica",
    body: "Dois ambientes distintos: sério para paciente e equipe, e sofisticado para gestão. Cada perfil vê o que precisa ver.",
  },
];

function Features() {
  return (
    <section id="recursos" className="relative py-28 lg:py-36 bg-[color:var(--bordo)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl mb-20">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            Recursos · Chapitre I
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Um sistema desenhado como se fosse um <em className="parxis-gold-text not-italic">instrumento cirúrgico</em>.
          </h2>
          <div className="parxis-gold-rule w-32 mt-8" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((f) => (
            <article key={f.n} className="parxis-card rounded-lg p-8 lg:p-10">
              <div className="font-serif text-[color:var(--gold)] text-sm tracking-[0.4em] mb-6">
                {f.n}
              </div>
              <h3 className="font-serif text-2xl leading-snug mb-4">{f.title}</h3>
              <div className="parxis-gold-rule w-12 mb-5 opacity-60" />
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ————————————————— TECHNOLOGY ————————————————— */
const TECH = [
  { term: "Arquitetura multi-inquilino", desc: "cada clínica opera em seu próprio cofre de dados, sem cruzamento." },
  { term: "Data binding em tempo real", desc: "o que a enfermagem registra aparece instantaneamente no prontuário do médico." },
  { term: "Controle de acesso por papéis", desc: "médico, enfermagem, gestão e paciente veem apenas o que lhes cabe." },
  { term: "Trilha de auditoria imutável", desc: "toda ação assinada, datada, resistente a estresse regulatório." },
  { term: "Mapeamento semântico clínico", desc: "sintomas, hipóteses e substâncias falam a mesma língua entre módulos." },
  { term: "Assinatura eletrônica com validade jurídica", desc: "RAS, receituário e solicitação em conformidade CFM." },
  { term: "Isolamento de controlados", desc: "portaria 344 respeitada em fluxo próprio, com dupla checagem." },
  { term: "API aberta", desc: "conecta o Parxis ao seu ERP, farmácia de manipulação e laboratório de exames." },
];

function Technology() {
  return (
    <section id="tecnologia" className="relative py-28 lg:py-36 bg-background">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="text-center mb-20">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            Tecnologia · Chapitre II
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight max-w-3xl mx-auto">
            A engenharia sob o verniz de <em className="parxis-gold-text not-italic">ouro</em>.
          </h2>
          <div className="parxis-gold-rule w-32 mx-auto mt-8" />
        </div>

        <dl className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {TECH.map((t) => (
            <div key={t.term} className="border-l border-[rgba(242,184,23,0.25)] pl-6">
              <dt className="font-serif text-lg text-[color:var(--gold)]">{t.term}</dt>
              <dd className="mt-2 text-sm text-muted-foreground leading-relaxed font-light">
                {t.desc}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ————————————————— FOR CLINICS ————————————————— */
function ForClinics() {
  const pillars = [
    {
      title: "Para o médico integrativo",
      lines: [
        "Anamnese profunda que respeita seu método clínico.",
        "Protocolo injetável desenhado nutriente a nutriente.",
        "RAS auditável — dorme tranquilo em qualquer fiscalização.",
      ],
    },
    {
      title: "Para o dono da clínica",
      lines: [
        "Marca fortalecida em cada documento entregue.",
        "Padrão único entre médicos, enfermagem e recepção.",
        "Dados clínicos e operacionais em uma só visão.",
      ],
    },
    {
      title: "Para outras especialidades",
      lines: [
        "Estética, longevidade, ortomolecular, endocrinologia.",
        "Protocolos parametrizáveis por especialidade.",
        "Fluxos por perfil profissional, sem fricção.",
      ],
    },
  ];

  return (
    <section id="clinicas" className="relative py-28 lg:py-36 bg-[color:var(--bordo)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl mb-20">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            Para Clínicas · Chapitre III
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Três olhares, uma <em className="parxis-gold-text not-italic">só maison</em>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((p) => (
            <div key={p.title} className="parxis-card rounded-lg p-10 flex flex-col">
              <h3 className="font-serif text-2xl mb-6">{p.title}</h3>
              <div className="parxis-gold-rule w-16 mb-6 opacity-60" />
              <ul className="space-y-4 text-sm text-muted-foreground font-light leading-relaxed">
                {p.lines.map((l) => (
                  <li key={l} className="flex gap-3">
                    <span aria-hidden className="text-[color:var(--gold)] mt-1">✦</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ————————————————— TESTIMONIAL ————————————————— */
function Testimonial() {
  return (
    <section className="relative py-32 lg:py-44 bg-background overflow-hidden">
      <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
        <div className="font-serif text-[color:var(--gold)] text-6xl mb-6 opacity-60">“</div>
        <p className="font-serif text-2xl md:text-3xl leading-relaxed italic text-foreground">
          Pela primeira vez, o documento entregue ao paciente carrega o mesmo cuidado que dedicamos à consulta. O Parxis não é software — é a extensão silenciosa da nossa clínica.
        </p>
        <div className="parxis-gold-rule w-24 mx-auto my-10" />
        <div className="text-sm uppercase tracking-[0.32em] text-[color:var(--gold)]">
          Dr. Ricardo Almeida Ferreira
        </div>
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground mt-2">
          Clínica de Medicina Integrativa · Anti-Aging
        </div>
      </div>
    </section>
  );
}

/* ————————————————— CTA ————————————————— */
function CTA() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      nome: String(fd.get("nome") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      telefone: String(fd.get("telefone") ?? "").trim() || null,
      clinica: String(fd.get("clinica") ?? "").trim(),
      especialidade: String(fd.get("especialidade") ?? "").trim(),
      volume_protocolos: String(fd.get("volume_protocolos") ?? "").trim() || null,
      necessidade: String(fd.get("necessidade") ?? "").trim(),
    };

    // Validação client-side espelhando o CHECK do banco
    if (payload.nome.length < 2 || payload.nome.length > 120) {
      toast.error("Informe seu nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      toast.error("Informe um email válido.");
      return;
    }
    if (payload.clinica.length < 2) {
      toast.error("Informe o nome da clínica.");
      return;
    }
    if (payload.especialidade.length < 2) {
      toast.error("Selecione ou informe a especialidade.");
      return;
    }
    if (payload.necessidade.length < 5) {
      toast.error("Descreva sua necessidade em protocolos.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("leads").insert(payload);
    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }

    toast.success("Solicitação recebida. Retornaremos em até 48 horas.");
    form.reset();
    setSubmitted(true);
  }

  return (
    <section id="contato" className="relative parxis-hero-bg py-32 lg:py-40 border-y border-[rgba(242,184,23,0.15)]">
      <div className="mx-auto max-w-3xl px-6 lg:px-10 relative">
       <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-8">
          Convite Privado
        </p>
        <h2 className="font-serif text-4xl md:text-6xl leading-tight">
          Uma demonstração <em className="parxis-gold-text not-italic">à porta fechada</em>.
        </h2>
        <div className="parxis-gold-rule w-40 mx-auto my-10" />
        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
          Recebemos um número limitado de clínicas por trimestre. Se a excelência clínica é a sua assinatura, conversemos.
        </p>
       </div>

        {submitted ? (
          <div className="mt-14 parxis-card rounded-lg p-10 text-center">
            <div className="font-serif text-[color:var(--gold)] text-5xl mb-6 opacity-70">✦</div>
            <h3 className="font-serif text-2xl md:text-3xl mb-4">Recebemos sua solicitação.</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
              Um consultor Parxis entrará em contato em até 48 horas, em caráter privado, com uma janela de demonstração reservada para sua clínica.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-14 parxis-card rounded-lg p-8 md:p-10 text-left">
            <div className="grid md:grid-cols-2 gap-5">
              <LeadField label="Nome completo" name="nome" required autoComplete="name" placeholder="Dr(a). Nome Sobrenome" />
              <LeadField label="Email profissional" name="email" type="email" required autoComplete="email" placeholder="voce@clinica.com.br" />
              <LeadField label="Telefone / WhatsApp" name="telefone" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" />
              <LeadField label="Nome da clínica" name="clinica" required placeholder="Maison Clínica Integrativa" />
              <div className="md:col-span-1">
                <label className="block text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
                  Especialidade
                </label>
                <select
                  name="especialidade"
                  required
                  defaultValue=""
                  className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[color:var(--gold)] transition-colors"
                >
                  <option value="" disabled className="bg-[#120505]">Selecione…</option>
                  {[
                    "Medicina Integrativa",
                    "Estética / Injetáveis",
                    "Longevidade / Anti-Aging",
                    "Ortomolecular",
                    "Endocrinologia",
                    "Nutrologia",
                    "Ginecologia Integrativa",
                    "Outra",
                  ].map((opt) => (
                    <option key={opt} value={opt} className="bg-[#120505]">{opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
                  Protocolos injetáveis / mês
                </label>
                <select
                  name="volume_protocolos"
                  defaultValue=""
                  className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[color:var(--gold)] transition-colors"
                >
                  <option value="" className="bg-[#120505]">Selecione (opcional)…</option>
                  {["1 a 10", "11 a 30", "31 a 80", "81 a 200", "Mais de 200"].map((opt) => (
                    <option key={opt} value={opt} className="bg-[#120505]">{opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
                  Necessidade em protocolos
                </label>
                <textarea
                  name="necessidade"
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Descreva brevemente os protocolos que sua clínica conduz, os desafios atuais (RAS, receituário, apresentação ao paciente) e o que espera do Parxis."
                  className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[color:var(--gold)] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Suas informações são tratadas em caráter confidencial.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 bg-[color:var(--gold)] text-[color:var(--obsidian)] px-9 py-4 rounded-full text-xs uppercase tracking-[0.28em] font-medium hover:bg-[color:var(--gold-light)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando…" : "Solicitar acesso privado"}
                {!loading && <span aria-hidden>→</span>}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          Resposta em até 48 horas · Contato pessoal
        </p>
      </div>
    </section>
  );
}

function LeadField({
  label, name, type = "text", required, placeholder, autoComplete,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">
        {label}{required && <span className="text-[color:var(--gold)]/60"> ·</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={200}
        className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[color:var(--gold)] transition-colors"
      />
    </div>
  );
}

/* ————————————————— FOOTER ————————————————— */
function Footer() {
  return (
    <footer className="bg-[color:var(--obsidian)] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="parxis-gold-rule mb-12" />
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div>
            <div className="parxis-gold-text font-serif text-2xl tracking-[0.35em] uppercase">
              Parxis
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed max-w-xs font-light">
              Motor clínico para clínicas de medicina integrativa. Protocolos injetáveis com o rigor de uma maison.
            </p>
          </div>
          <div className="text-xs text-muted-foreground space-y-3 uppercase tracking-[0.22em]">
            <div>parxis.com.br</div>
            <div>contato@parxis.com.br</div>
          </div>
          <div className="text-xs text-muted-foreground space-y-3 uppercase tracking-[0.22em] md:text-right">
            <div>Établi 2026</div>
            <div>São Paulo · Brasil</div>
          </div>
        </div>
        <div className="parxis-gold-rule mt-12 opacity-40" />
        <div className="mt-6 flex flex-col md:flex-row justify-between gap-4 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          <span>© 2026 Parxis · Todos os direitos reservados</span>
          <span>Feito com precisão</span>
        </div>
      </div>
    </footer>
  );
}
