import { createFileRoute, Link } from "@tanstack/react-router";
import { releases } from "@/content/releases";

export const Route = createFileRoute("/releases")({
  head: () => ({
    meta: [
      { title: "Releases — Parxis" },
      { name: "description", content: "Histórico de versões e mudanças da plataforma Parxis." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Releases — Parxis" },
      { property: "og:description", content: "Changelog interno da plataforma Parxis." },
    ],
  }),
  component: ReleasesPage,
});

function ReleasesPage() {
  const [latest, ...older] = releases;

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Changelog interno
          </p>
          <h1 className="mt-2 font-serif text-4xl text-foreground">Releases</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Histórico das últimas versões e o que mudou desde o commit anterior.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Ir para o site
            </Link>
            <Link
              to="/status"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Ver status
            </Link>
          </div>
        </header>

        {latest && (
          <section className="mb-10 rounded-lg border border-amber-500/40 bg-card/80 p-6 shadow-xl">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                  Atual
                </span>
                <h2 className="font-serif text-2xl text-foreground">{latest.version}</h2>
              </div>
              <time className="font-mono text-xs text-muted-foreground">{latest.date}</time>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{latest.title}</p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              {latest.changes.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ol className="relative space-y-6 border-l border-border/60 pl-6">
          {older.map((r) => (
            <li key={r.version} className="relative">
              <span className="absolute -left-[29px] top-2 inline-block h-2.5 w-2.5 rounded-full border border-border bg-background" />
              <div className="rounded-md border border-border/60 bg-card/50 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-lg text-foreground">{r.version}</h3>
                  <time className="font-mono text-xs text-muted-foreground">{r.date}</time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.title}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/90">
                  {r.changes.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}