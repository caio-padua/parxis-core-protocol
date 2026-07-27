import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, tr } from "@/contexts/LanguageContext";
import { content } from "@/content/parxis";

export const Route = createFileRoute("/demonstracao/")({
  component: DemonstracaoIndexPage,
});

function DemonstracaoIndexPage() {
  const { lang } = useLang();
  const c = content.vitrine.gate;

  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-16 pb-20 pt-4 sm:pt-8">
      <div className="parxis-login-card rounded-xl p-6 sm:p-10 md:p-12 relative w-full max-w-[720px] mx-auto">
        <p className="text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)] text-center">
          {tr(c.eyebrow, lang)}
        </p>
        <h1 className="mt-4 font-serif text-[32px] md:text-[42px] text-center leading-tight">
          {tr(c.titlePre, lang)}
          <em className="parxis-gold-text not-italic">{tr(c.titleGold, lang)}</em>
          {tr(c.titlePost, lang)}
        </h1>
        <div className="parxis-gold-rule w-20 mx-auto my-6" />
        <p className="text-center text-base md:text-lg text-foreground/90 font-light leading-relaxed max-w-xl mx-auto">
          {tr(c.lead, lang)}
        </p>

        <h2 className="mt-10 mb-6 text-center text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
          {tr(c.chooseTitle, lang)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/demonstracao/paciente"
            className="parxis-btn parxis-btn-ghost group flex-col items-start text-left h-auto py-8 px-7"
          >
            <span className="parxis-btn-inner flex-col items-start gap-3">
              <span className="font-serif text-[22px] not-italic tracking-normal normal-case">
                {tr(c.patientCard, lang)}
              </span>
              <span className="text-[12px] leading-relaxed text-muted-foreground font-light normal-case tracking-normal">
                {tr(c.patientLead, lang)}
              </span>
              <span aria-hidden className="mt-1 transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>

          <Link
            to="/demonstracao/clinica"
            className="parxis-btn parxis-btn-primary group flex-col items-start text-left h-auto py-8 px-7"
          >
            <span className="parxis-btn-inner flex-col items-start gap-3">
              <span className="font-serif text-[22px] not-italic tracking-normal normal-case">
                {tr(c.clinicCard, lang)}
              </span>
              <span className="text-[12px] leading-relaxed text-foreground/85 font-light normal-case tracking-normal">
                {tr(c.clinicLead, lang)}
              </span>
              <span aria-hidden className="mt-1 transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
