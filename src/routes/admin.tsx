import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Parxis · Painel de Leads" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Lead = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  clinica: string;
  especialidade: string;
  necessidade: string;
  volume_protocolos: string | null;
  created_at: string;
};

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {session ? <LeadsPanel onSignOut={() => supabase.auth.signOut()} /> : <SignIn />}
    </main>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const emailRedirectTo = `${window.location.origin}/admin`;
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo } });
      if (error) toast.error(error.message);
      else toast.success("Conta criada. Se pedido, confirme por email.");
    }
    setLoading(false);
  }

  return (
    <section className="parxis-hero-bg min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md parxis-card rounded-lg p-10">
        <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-4 text-center">
          Parxis · Painel
        </p>
        <h1 className="font-serif text-3xl text-center mb-2">Acesso privado</h1>
        <div className="parxis-gold-rule w-24 mx-auto my-6" />
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">Email</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--gold)]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2">Senha</label>
            <input
              type="password" required minLength={8}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-[rgba(242,184,23,0.35)] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--gold)]"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--gold)] text-[color:var(--obsidian)] px-6 py-3 rounded-full text-xs uppercase tracking-[0.28em] font-medium hover:bg-[color:var(--gold-light)] transition-colors disabled:opacity-60"
          >
            {loading ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-6 w-full text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-[color:var(--gold)] transition-colors"
        >
          {mode === "in" ? "Primeiro acesso · criar conta" : "Já tenho conta · entrar"}
        </button>
      </div>
    </section>
  );
}

function LeadsPanel({ onSignOut }: { onSignOut: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((l) =>
      [l.nome, l.email, l.clinica, l.especialidade, l.necessidade]
        .join(" ").toLowerCase().includes(term)
    );
  }, [q, leads]);

  function exportCsv() {
    const cols = ["created_at","nome","email","telefone","clinica","especialidade","volume_protocolos","necessidade"] as const;
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [cols.join(","), ...filtered.map(l => cols.map(c => escape((l as any)[c])).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `parxis-leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)] mb-3">Parxis · Painel</p>
          <h1 className="font-serif text-4xl md:text-5xl">Leads recebidos</h1>
          <div className="parxis-gold-rule w-24 mt-6" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, clínica, especialidade…"
            className="bg-transparent border border-[rgba(242,184,23,0.35)] rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-[color:var(--gold)] min-w-[280px]"
          />
          <button onClick={exportCsv}
            className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.35)] hover:bg-[rgba(242,184,23,0.06)] transition-colors">
            Exportar CSV
          </button>
          <button onClick={load}
            className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)] border border-[rgba(242,184,23,0.35)] hover:bg-[rgba(242,184,23,0.06)] transition-colors">
            Atualizar
          </button>
          <button onClick={onSignOut}
            className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.28em] text-muted-foreground border border-[rgba(255,255,255,0.15)] hover:text-[color:var(--gold)] transition-colors">
            Sair
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando leads…</p>
      ) : filtered.length === 0 ? (
        <div className="parxis-card rounded-lg p-16 text-center">
          <p className="font-serif text-2xl mb-2">Nenhum lead ainda.</p>
          <p className="text-sm text-muted-foreground">
            Assim que uma clínica solicitar acesso pelo site, ela aparece aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((l) => (
            <article key={l.id} className="parxis-card rounded-lg p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl">{l.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {l.clinica} · <span className="text-[color:var(--gold)]">{l.especialidade}</span>
                  </p>
                </div>
                <div className="text-right text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                  {l.volume_protocolos && (
                    <div className="mt-1 text-[color:var(--gold)]">{l.volume_protocolos} protocolos/mês</div>
                  )}
                </div>
              </div>
              <div className="parxis-gold-rule w-12 my-4 opacity-60" />
              <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">
                {l.necessidade}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <a href={`mailto:${l.email}`} className="hover:text-[color:var(--gold)] transition-colors">
                  ✉ {l.email}
                </a>
                {l.telefone && (
                  <a href={`https://wa.me/${l.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="hover:text-[color:var(--gold)] transition-colors">
                    ☎ {l.telefone}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}