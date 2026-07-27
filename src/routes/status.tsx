import { createFileRoute, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — Parxis" },
      { name: "description", content: "Página de status do site de vendas Parxis." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Status — Parxis" },
      { property: "og:description", content: "Verificação de disponibilidade do site Parxis." },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const timestamp = new Date().toLocaleString("pt-BR");

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl rounded-lg border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <h1 className="text-2xl font-serif text-foreground">Site de vendas ativo</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Todos os serviços operando normalmente.
        </p>

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-emerald-500">Online</dd>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Rota carregada</dt>
            <dd className="font-mono text-foreground">{pathname}</dd>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Ambiente</dt>
            <dd className="font-mono text-foreground">{import.meta.env.MODE}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Verificado em</dt>
            <dd className="font-mono text-foreground">{timestamp}</dd>
          </div>
        </dl>

        <div className="mt-8 flex gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o site
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Acessar login
          </a>
        </div>
      </div>
    </main>
  );
}