import { useLang } from "@/contexts/LanguageContext";

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language selector"
      className="fixed top-4 right-4 z-[60] flex items-center gap-1 rounded-full border border-[rgba(242,184,23,0.35)] bg-[rgba(5,5,5,0.72)] backdrop-blur-md px-1 py-1"
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
      className={
        "px-3 py-1.5 rounded-full text-[10px] tracking-[0.32em] uppercase font-medium transition-colors " +
        (active
          ? "text-[#0a0505] bg-[color:var(--gold)] shadow-[0_0_18px_rgba(242,184,23,0.4)]"
          : "text-[color:var(--gold)] hover:bg-[rgba(242,184,23,0.1)]")
      }
    >
      {children}
    </button>
  );
}