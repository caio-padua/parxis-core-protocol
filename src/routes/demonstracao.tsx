import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useLang } from "@/contexts/LanguageContext";
import { LangSwitcher } from "@/components/LangSwitcher";
import { PaxterMedalhao } from "@/components/PaxterMedalhao";
import parxisWordmark from "@/assets/parxis-wordmark.png";
import atelierAsset from "@/assets/parxis-atelier-v15-camelo-4k.webp.asset.json";
import atelierMobileAsset from "@/assets/parxis-atelier-v15-camelo-mobile.webp.asset.json";
const atelierUrl = atelierAsset.url;
const atelierMobileUrl = atelierMobileAsset.url;

export const Route = createFileRoute("/demonstracao")({
  head: () => ({
    meta: [
      { title: "Parxis · Demonstração Privada" },
      {
        name: "description",
        content:
          "Entrada privada para a demonstração do motor clínico Parxis. Por convite e identificação.",
      },
      { property: "og:title", content: "Parxis · Demonstração Privada" },
      {
        property: "og:description",
        content: "Entrada privada para a demonstração do motor clínico Parxis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemonstracaoLayout,
});

function DemonstracaoLayout() {
  const { lang } = useLang();
  const backLabel = lang === "pt" ? "Voltar ao site" : "Back to the site";

  return (
    <main
      className="parxis-app parxis-login-page min-h-screen text-foreground relative"
      style={{
        ["--parxis-fixed-url" as string]: `url(${atelierUrl})`,
        ["--parxis-fixed-url-mobile" as string]: `url(${atelierMobileUrl})`,
        ["--parxis-atelier-url" as string]: `url(${atelierUrl})`,
      }}
    >
      <div className="parxis-fixed-bg" aria-hidden />
      <div className="parxis-fixed-veil" aria-hidden />

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
            ← {backLabel}
          </Link>
          <LangSwitcher />
        </div>
      </header>

      <Outlet />
    </main>
  );
}
