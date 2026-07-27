import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, tr } from "@/contexts/LanguageContext";
import { content } from "@/content/parxis";
import { VitrineGate } from "@/components/VitrineGate";

export const Route = createFileRoute("/demonstracao/paciente")({
  head: () => ({
    meta: [
      { title: "Parxis · Demonstração para Pacientes" },
      {
        name: "description",
        content:
          "Demonstração privada do Parxis para pacientes. Veja como a jornada clínica fica mais simples e segura.",
      },
      { property: "og:title", content: "Parxis · Demonstração para Pacientes" },
      {
        property: "og:description",
        content: "Demonstração privada do Parxis para pacientes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemonstracaoPacientePage,
});

function DemonstracaoPacientePage() {
  const { lang } = useLang();
  const c = content.vitrine.content;
  const p = content.vitrine.content.patient;

  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-16 pb-20 pt-4 sm:pt-8">
      <VitrineGate tipo="paciente">
        <VitrineContent eyebrow={tr(c.eyebrow, lang)} title={tr(c.title, lang)}>
          <p className="text-base md:text-lg text-foreground/90 font-light leading-relaxed max-w-2xl mx-auto">
            {tr(p.body, lang)}
          </p>
          <div className="mt-10">
            <Link to="/#contato" className="parxis-btn parxis-btn-primary group">
              <span className="parxis-btn-inner">
                {tr(p.cta, lang)}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </div>
        </VitrineContent>
      </VitrineGate>
    </section>
  );
}

function VitrineContent({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="parxis-login-card rounded-xl p-6 sm:p-10 md:p-14 relative w-full max-w-[760px] mx-auto text-center">
      <p className="text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)]">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-[32px] md:text-[44px] leading-tight">{title}</h1>
      <div className="parxis-gold-rule w-20 mx-auto my-6" />
      {children}
    </div>
  );
}
