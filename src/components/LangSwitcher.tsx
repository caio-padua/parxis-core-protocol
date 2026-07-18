import { useLang } from "@/contexts/LanguageContext";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language selector"
      className={
        "inline-flex items-center gap-1 rounded-full border border-[rgba(242,184,23,0.35)] bg-[rgba(5,5,5,0.72)] px-1 py-1 " +
        className
      }
    >
      <LangBtn active={lang === "en"} onClick={() => setLang("en")}>EN</LangBtn>
      <span aria-hidden className="text-[color:var(--gold)]/40 text-[10px]">·</span>
      <LangBtn active={lang === "pt"} onClick={() => setLang("pt")}>PT</LangBtn>
    </div>
  );
}

function LangBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={typeof children === "string" ? `Idioma ${children}` : undefined}
      className={
        "inline-flex items-center justify-center min-h-11 min-w-11 px-3 py-2 rounded-full text-[10px] tracking-[0.28em] uppercase font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-black " +
        (active
          ? "text-[#0a0505] bg-[color:var(--gold)] shadow-[0_0_18px_rgba(242,184,23,0.4)]"
          : "text-[color:var(--gold)] hover:bg-[rgba(242,184,23,0.1)]")
      }
    >
      {children}
    </button>
  );
}