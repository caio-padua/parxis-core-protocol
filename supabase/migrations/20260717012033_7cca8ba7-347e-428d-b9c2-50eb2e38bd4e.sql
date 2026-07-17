
-- Tabela de leads capturados no formulário
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  clinica TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  necessidade TEXT NOT NULL,
  volume_protocolos TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data API grants
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode SUBMETER um lead (INSERT anon)
CREATE POLICY "Qualquer um pode enviar um lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(nome) BETWEEN 2 AND 120
    AND length(email) BETWEEN 5 AND 200
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(clinica) BETWEEN 2 AND 200
    AND length(especialidade) BETWEEN 2 AND 120
    AND length(necessidade) BETWEEN 5 AND 2000
  );

-- Apenas usuários autenticados (você, no /admin) leem os leads
CREATE POLICY "Autenticados podem ver leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
