import { createFileRoute, Link } from "@tanstack/react-router";
import { releases } from "@/content/releases";
import generated from "@/content/releases.generated.json";

type GeneratedFile = { status: string; path: string };
type GeneratedRelease = {
  commit: string;
  date: string;
  title: string;
  messages: string[];
  files: GeneratedFile[];
};

const generatedReleases = (generated as { releases: GeneratedRelease[] }).releases.filter(
  (r) => !/^(changes|update|wip)\.?$/i.test(r.title.trim()),
);
const generatedAt = (generated as { generatedAt: string }).generatedAt;

const STATUS_LABEL: Record<string, string> = {
  A: "adicionado",
  M: "modificado",
  D: "removido",
  R: "renomeado",
  C: "copiado",
};
const STATUS_COLOR: Record<string, string> = {
  A: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  M: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  D: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  R: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  C: "text-sky-400 border-sky-400/30 bg-sky-400/10",
};

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

        <section className="mt-16">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl text-foreground">Changelog automático</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              gerado {new Date(generatedAt).toLocaleString("pt-BR")}
            </span>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Extraído do histórico de commits. Cada bloco lista as mensagens do agrupamento e os
            arquivos alterados desde a versão anterior.
          </p>
          <ol className="space-y-4">
            {generatedReleases.map((r) => (
              <li
                key={r.commit}
                className="rounded-md border border-border/60 bg-card/40 p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg text-foreground">{r.title}</h3>
                  <div className="flex items-baseline gap-3">
                    <code className="font-mono text-[11px] text-muted-foreground">{r.commit}</code>
                    <time className="font-mono text-xs text-muted-foreground">{r.date}</time>
                  </div>
                </div>
                {r.messages.length > 1 && (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {r.messages.slice(1).map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                )}
                {r.files.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Arquivos ({r.files.length})
                    </p>
                    <ul className="space-y-1">
                      {r.files.map((f) => {
                        const key = f.status[0] ?? "M";
                        return (
                          <li key={f.path} className="flex items-center gap-2 text-xs">
                            <span
                              className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${STATUS_COLOR[key] ?? STATUS_COLOR.M}`}
                              title={STATUS_LABEL[key] ?? "modificado"}
                            >
                              {key}
                            </span>
                            <code className="font-mono text-foreground/80">{f.path}</code>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}