import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import parxisSymbolAsset from "@/assets/parxis-symbol.png.asset.json";
import parxisWordmarkAsset from "@/assets/parxis-wordmark.png.asset.json";

const parxisSymbolUrl = parxisSymbolAsset.url;
const parxisWordmarkUrl = parxisWordmarkAsset.url;

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
      <Scarcity />
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
            Por Indicação
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-9 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <a href="#manifesto" className="hover:text-[color:var(--gold)] transition-colors">Manifesto</a>
          <a href="#recursos" className="hover:text-[color:var(--gold)] transition-colors">Recursos</a>
          <a href="#tecnologia" className="hover:text-[color:var(--gold)] transition-colors">Inteligência</a>
          <a href="#clinicas" className="hover:text-[color:var(--gold)] transition-colors">O Círculo</a>
          <a href="#ecossistema" className="hover:text-[color:var(--gold)] transition-colors">Ecossistema</a>
        </nav>
        <div className="flex items-center gap-3">
          <ContrastToggle />
          <MotionToggle />
          <a
            href="#contato"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.35)] px-4 py-2 rounded-full hover:bg-[rgba(242,184,23,0.08)] transition-colors"
          >
            Solicitar indicação
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
      <ParallaxPanels />
      {/* linhas decorativas de moldura */}
      <div className="absolute inset-x-8 top-24 parxis-gold-rule opacity-60" />
      <div className="absolute inset-x-8 bottom-8 parxis-gold-rule opacity-40" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center relative">
        {/* Texto */}
        <div className="parxis-reveal">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.42em] text-[color:var(--gold)] mb-8">
            Um produto PAWARDS MedCore® · Uma empresa PADCOM
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            O sistema clínico que trabalha{" "}
            <span className="parxis-gold-text italic">enquanto você cuida</span>.
          </h1>
          <div className="parxis-gold-rule w-32 my-10" />
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl font-light">
            Da primeira consulta ao arquivo definitivo — sem papel, sem retrabalho, sem risco jurídico. Um motor clínico reservado a um número restrito de médicos, admitidos apenas por indicação.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href="#contato"
              className="group inline-flex items-center gap-3 bg-[color:var(--gold)] text-[color:var(--obsidian)] px-8 py-4 rounded-full text-xs uppercase tracking-[0.28em] font-medium hover:bg-[color:var(--gold-light)] transition-colors"
            >
              Solicitar carta de indicação
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#clinicas"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.35)] hover:bg-[rgba(242,184,23,0.06)] transition-colors"
            >
              Sobre o licenciamento
            </a>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "Por", v: "indicação apenas" },
              { k: "12", v: "licenciados por safra" },
              { k: "1", v: "só médico decide" },
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

/* ————————————————— PAINÉIS PARALLAX —————————————————
   Camadas verticais que evocam couro, ferragens e arquivos
   de uma oficina de manufatura Hermès. Movem-se em velocidades
   distintas ao rolar, criando profundidade sem distrair. */
function ParallaxPanels() {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);
  const speeds = [0.22, -0.32, 0.42, -0.18, 0.1];

  useEffect(() => {
    if (document.documentElement.dataset.motion === "reduce") return;

    let targetY = 0;
    let currentY = 0;

    const onScroll = () => {
      targetY = window.scrollY;
    };

    const tick = () => {
      currentY += (targetY - currentY) * 0.12;
      panelRefs.current.forEach((el, i) => {
        if (el) {
          const y = currentY * speeds[i];
          el.style.transform = i === 4 ? `translate(-50%, ${y}px)` : `translateY(${y}px)`;
        }
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="parxis-panels" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={(el) => { panelRefs.current[i] = el; }}
          className={`parxis-panel parxis-panel-${i + 1}`}
        />
      ))}
    </div>
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
          Manifesto · Da PADCOM
        </p>
        <h2 className="font-serif text-3xl md:text-5xl leading-tight text-foreground">
          Construído por um médico que <em className="parxis-gold-text not-italic">cansou de esperar</em> que alguém construísse.
        </h2>
        <div className="parxis-gold-rule w-40 mx-auto my-10" />
        <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
          O PARXIS nasce dentro da PAWARDS MedCore® — a engenharia clínica da holding PADCOM, fundada por um médico endocrinologista que decidiu projetar os sistemas que o mercado nunca ofereceu. Não é um software adaptado à medicina. É medicina que se tornou sistema. E por isso não se replica: exige anos de prática clínica real somados a uma engenharia que poucos, no mundo, conseguem executar.
        </p>
      </div>
    </section>
  );
}

/* ————————————————— FEATURES ————————————————— */
const FEATURES = [
  {
    n: "01",
    title: "Cockpit unificado do médico",
    body: "Uma única tela por cliente: prescrição de injetáveis, fórmulas manipuladas, pedidos de exames, evolução laboratorial e emissão de documentos. Você decide sem sair, sem abrir outro sistema, sem quebrar a linha do raciocínio.",
  },
  {
    n: "02",
    title: "Lançador guiado de protocolos",
    body: "Você define substâncias, frequências e datas. Em um único comando, o protocolo é criado, as sessões validadas e o formulário de auditoria da enfermagem é gerado — pronto para uma fiscalização sanitária a qualquer momento.",
  },
  {
    n: "03",
    title: "Documento com validade jurídica nacional",
    body: "Cada aplicação gera um documento clínico oficial assinado digitalmente no padrão jurídico brasileiro — equivalente ao reconhecimento de firma em cartório, sem papel. Arquivado, entregue por e-mail e disponível no app do cliente.",
  },
  {
    n: "04",
    title: "Leitura de laudos por inteligência clínica",
    body: "Envie o PDF do laudo. O motor extrai cada analito automaticamente e o compara com faixas próprias da medicina integrativa — não com o padrão populacional. Você mostra ao cliente onde ele está no espectro real de saúde.",
  },
  {
    n: "05",
    title: "Mensageria cronobiológica",
    body: "O sistema conhece o momento biologicamente correto de cada medicamento e envia o lembrete na hora certa. Adesão do cliente sobe, retrabalho da secretária cai, resultado clínico aparece.",
  },
  {
    n: "06",
    title: "Console de orçamento com três cenários",
    body: "À vista, entrada com parcelas e parcelado — taxas já calculadas, escada de desconto por volume. A secretária apresenta. O cliente escolhe. Você fecha sem intermediar planilhas.",
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
            Um sistema para operar. Um motor para pensar. Uma plataforma para <em className="parxis-gold-text not-italic">crescer</em>.
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
  { term: "Questionário clínico por sistemas", desc: "anamnese progressiva — só o que é relevante para aquele cliente. Alertas críticos nunca são suprimidos." },
  { term: "Motor de regras clínicas", desc: "biblioteca de raciocínio construída sobre décadas de prática. O motor lembra por você. A decisão final é sempre sua." },
  { term: "Caminhos clínicos por queixa", desc: "você informa a queixa em foco. O sistema sugere quais exames pedir e quais tratamentos considerar — antes de você abrir a boca." },
  { term: "Faixas de referência integrativas", desc: "excelente, ótimo, aceitável — pela ótica da medicina integrativa, não pelo padrão laboratorial convencional." },
  { term: "Posologia cronobiológica", desc: "o motor conhece o momento certo de cada medicamento no dia — o esquema de uso e os lembretes saem prontos." },
  { term: "Evolução clínica longitudinal", desc: "a cada consulta, o histórico cresce. Com o tempo, o banco de dados da sua clínica se torna um ativo estratégico real." },
  { term: "Isolamento total entre clínicas", desc: "cada licenciado opera em cofre próprio. Nenhum concorrente enxerga, cruza ou toca seus dados." },
  { term: "Assinatura com validade jurídica nacional", desc: "documentos clínicos com o padrão brasileiro de reconhecimento — equivalente a firma em cartório, sem papel." },
];

function Technology() {
  return (
    <section id="tecnologia" className="relative py-28 lg:py-36 bg-background">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="text-center mb-20">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            Inteligência · Chapitre II
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight max-w-3xl mx-auto">
            O motor <em className="parxis-gold-text not-italic">PAWARDS MedCore®</em> — que trabalha enquanto você atende.
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
  const steps = [
    {
      title: "I · O Indicado",
      lead: "A porta se abre por quem já pertence ao Círculo.",
      body: "O Parxis não é vendido. É concedido. Receber uma carta de indicação significa que um médico licenciado reconheceu em sua clínica o mesmo padrão que a maison exige: discrição, excelência clínica e vontade de operar como uma casa, não como um consultório. A partir daí, sua candidatura entra para análise privada da PAWARDS MedCore®. Sem fila. Sem comercial. Apenas uma decisão cuidadosa.",
    },
    {
      title: "II · O Licenciado",
      lead: "Admitido, você recebe um território protegido.",
      body: "Cada licenciado ocupa uma micro-região exclusiva: seus clientes, seus protocolos, sua marca em cada documento assinado digitalmente. O acesso é vitalício às evoluções do motor PAWARDS MedCore®, sem taxas de upgrade. O sistema aprende com sua prática, mas seus dados permanecem inacessíveis a qualquer outra clínica — inclusive às do próprio Círculo.",
    },
    {
      title: "III · O Sublicenciante",
      lead: "A admissão abre um privilégio raro: o poder de indicar.",
      body: "Um licenciado Parxis pode sublicenciar outras clínicas, desde que aprovadas pela PAWARDS MedCore®. Cada nova indicação que você patrocina amplia a rede e gera uma participação recorrente sobre a licença daquela clínica. Sua reputação clínica deixa de ser apenas reputação: torna-se patrimônio, rendimento e legado dentro da maison.",
    },
  ];

  return (
    <section id="clinicas" className="relative py-28 lg:py-36 bg-[color:var(--bordo)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl mb-20">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            O Círculo · Chapitre III
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Três degraus, uma <em className="parxis-gold-text not-italic">só maison</em> — e um número limitado de assentos.
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl">
            O PARXIS não é vendido em massa. É concedido, por licença, a uma pequena safra de médicos por vez. Você não escolhe entrar — é convidado. E, uma vez admitido, adquire o direito raro de decidir quem mais terá acesso.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s) => (
            <article key={s.title} className="parxis-card rounded-lg p-10 flex flex-col">
              <h3 className="font-serif text-2xl mb-3">{s.title}</h3>
              <p className="text-sm text-[color:var(--gold)] leading-relaxed mb-4">
                {s.lead}
              </p>
              <div className="parxis-gold-rule w-16 mb-6 opacity-60" />
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {s.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 parxis-card rounded-lg p-10 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h4 className="font-serif text-2xl md:text-3xl mb-3">
              O Círculo é pequeno por escolha — não por limitação.
            </h4>
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
              Limitamos cada safra a doze licenciados para que cada admissão receba a atenção da engenharia, do suporte e da curadoria que o padrão exige. A escassez não é marketing. É a única forma de manter o que torna o Parxis valioso: ser raro.
            </p>
          </div>
          <div className="shrink-0 text-center md:text-right">
            <div className="font-serif text-5xl text-[color:var(--gold)]">12</div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-1">
              licenciados por safra
            </div>
          </div>
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
          Fui indicado. Recebi o acesso em uma quarta-feira. Na sexta, entreguei o primeiro documento assinado com validade jurídica ao meu cliente. Ele me olhou de forma diferente. O Parxis não é software — é o que separa uma clínica de uma maison clínica.
        </p>
        <div className="parxis-gold-rule w-24 mx-auto my-10" />
        <div className="text-sm uppercase tracking-[0.32em] text-[color:var(--gold)]">
          Dr. Ricardo Almeida Ferreira
        </div>
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground mt-2">
          Licenciado Parxis · Medicina Integrativa · Anti-Aging
        </div>
      </div>
    </section>
  );
}

/* ————————————————— CTA ————————————————— */
function Ecosystem() {
  return (
    <section id="ecossistema" className="relative py-28 lg:py-36 bg-background">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="parxis-card rounded-lg p-10 md:p-14 text-center">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            Ecossistema · PADCOM
          </p>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight">
            Estes produtos fazem parte de um <em className="parxis-gold-text not-italic">ecossistema maior</em>.
          </h2>
          <div className="parxis-gold-rule w-24 mx-auto my-8" />
          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            A <span className="parxis-gold-text">PADCON Platform®</span> é a arquitetura corporativa que sustenta a PAWARDS MedCore® e o PARXIS — identidade unificada, segurança por cargo, trilhas de auditoria permanentes. Quatro setores. Dezoito sistemas em desenvolvimento. Três em produção real. Uma fundação só.
          </p>
          <div className="mt-10">
            <a
              href="https://padcon.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.45)] hover:bg-[color:var(--gold)] hover:text-[color:var(--obsidian)] transition-colors"
            >
              Conheça a PADCON Platform®
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————————————————— SCARCITY ————————————————— */
function Scarcity() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    deadline.setHours(23, 59, 59, 0);

    const calc = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const slots = [
    { label: "dias", value: timeLeft.days },
    { label: "horas", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "seg", value: timeLeft.seconds },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-[color:var(--gold)] opacity-[0.03] blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-10 relative">
        <div className="parxis-card rounded-2xl p-10 md:p-14 text-center border-[rgba(242,184,23,0.28)]">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-6">
            Safra atual · Portas fechadas em breve
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="font-serif text-6xl md:text-7xl text-[color:var(--gold)]">12</div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-2">
                licenciados por safra
              </div>
            </div>

            <div className="hidden md:block w-px h-20 bg-[rgba(242,184,23,0.25)]" />

            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-muted-foreground mb-4">
                Fechamento da candidatura
              </div>
              {mounted ? (
                <div className="grid grid-cols-4 gap-3">
                  {slots.map((s) => (
                    <div
                      key={s.label}
                      className="min-w-[64px] px-3 py-4 rounded-lg bg-[rgba(242,184,23,0.08)] border border-[rgba(242,184,23,0.2)]"
                    >
                      <div className="font-serif text-2xl md:text-3xl text-[color:var(--gold)]">
                        {String(s.value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[88px] flex items-center justify-center text-muted-foreground text-sm">
                  Calculando prazo…
                </div>
              )}
            </div>
          </div>

          <div className="parxis-gold-rule w-40 mx-auto my-10 opacity-70" />

          <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            As candidaturas recebidas após o fechamento são avaliadas apenas para a próxima safra. A escassez não é estratégia de vendas — é a única maneira de preservar a experiência e a integridade do Círculo.
          </p>

          <div className="mt-10">
            <a
              href="#contato"
              className="group inline-flex items-center gap-3 bg-[color:var(--gold)] text-[color:var(--obsidian)] px-8 py-4 rounded-full text-xs uppercase tracking-[0.28em] font-medium hover:bg-[color:var(--gold-light)] transition-colors"
            >
              Solicitar carta de indicação
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————————————————— CTA ————————————————— */
function CTA() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

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
    if (!consent) {
      toast.error("É necessário aceitar os termos de elegibilidade e consentimento LGPD.");
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
          Candidatura por Indicação
        </p>
        <h2 className="font-serif text-4xl md:text-6xl leading-tight">
          Uma conversa <em className="parxis-gold-text not-italic">à porta fechada</em>.
        </h2>
        <div className="parxis-gold-rule w-40 mx-auto my-10" />
        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
          Recebemos até doze licenciados por safra. Se você foi indicado — ou acredita que o padrão da sua clínica justifica uma indicação — envie seu pedido. A PAWARDS MedCore® analisa cada candidatura pessoalmente.
        </p>
       </div>

        {submitted ? (
          <div className="mt-14 parxis-card rounded-lg p-10 text-center">
            <div className="font-serif text-[color:var(--gold)] text-5xl mb-6 opacity-70">✦</div>
            <h3 className="font-serif text-2xl md:text-3xl mb-4">Sua candidatura foi recebida.</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
              Um responsável da PAWARDS MedCore® entrará em contato em até 48 horas, em caráter privado, apenas se sua candidatura avançar para a próxima etapa. O silêncio, se ocorrer, também é uma resposta respeitosa.
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
                  Quem o indicou · e por quê
                </label>
                <textarea
                  name="necessidade"
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Se foi indicado, informe o nome do médico. Se não, descreva por que sua clínica se enquadra no padrão do Círculo Parxis — protocolos, volume mensal, o que a diferencia."
                  className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[color:var(--gold)] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Análise confidencial · Sigilo profissional garantido
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 bg-[color:var(--gold)] text-[color:var(--obsidian)] px-9 py-4 rounded-full text-xs uppercase tracking-[0.28em] font-medium hover:bg-[color:var(--gold-light)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando…" : "Enviar candidatura"}
                {!loading && <span aria-hidden>→</span>}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          Resposta em até 48 horas · Apenas às candidaturas selecionadas
        </p>

        <div className="mt-10 parxis-card rounded-lg p-8 md:p-10 text-left">
          <h3 className="font-serif text-xl mb-5">
            Termos de elegibilidade e consentimento
          </h3>
          <div className="parxis-gold-rule w-16 mb-6 opacity-60" />

          <ul className="space-y-3 text-xs md:text-sm text-muted-foreground font-light leading-relaxed mb-6">
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--gold)] mt-0.5">✦</span>
              <span>Declaro ser médico responsável técnico por uma clínica em atividade, com CPF/CNPJ e registro profissional ativos.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--gold)] mt-0.5">✦</span>
              <span>Confirmo que a candidatura é analisada de forma privada e que o acesso ao Parxis depende de indicação aprovada pela PAWARDS MedCore®.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--gold)] mt-0.5">✦</span>
              <span>Entendo que o número de licenciados é limitado a 12 por safra e que o não recebimento de resposta também significa manutenção do padrão do Círculo.</span>
            </li>
          </ul>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[color:var(--gold)] rounded border border-[rgba(242,184,23,0.45)] bg-transparent cursor-pointer"
            />
            <span className="text-xs text-muted-foreground font-light leading-relaxed">
              Li e concordo com o uso dos dados acima para análise de elegibilidade, contato sobre minha candidatura e, se aprovado, ativação da licença Parxis, conforme a LGPD. Seus dados são tratados em sigilo, não são comercializados e podem ser solicitados para exclusão a qualquer momento pelo email <span className="text-[color:var(--gold)]">contato@parxis.com.br</span>.
            </span>
          </label>
        </div>
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
              Um produto PAWARDS MedCore® — uma empresa PADCOM. Concedido por indicação, mantido pelo padrão.
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
