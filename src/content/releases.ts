export type ReleaseEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
  commit?: string;
};

export const releases: ReleaseEntry[] = [
  {
    version: "v1.9.0",
    date: "2026-07-27",
    title: "Painel de Releases",
    changes: [
      "Nova rota /releases com histórico de versões e mudanças",
      "Link discreto no rodapé para consulta rápida",
    ],
  },
  {
    version: "v1.8.0",
    date: "2026-07-27",
    title: "Status com auto-refresh e health checks",
    changes: [
      "Auto-refresh configurável (10s/30s/1min/5min) em /status",
      "Endpoint /api/public/health validando env, banco e assets",
      "Indicador de último refresh com contagem em segundos",
    ],
  },
  {
    version: "v1.7.0",
    date: "2026-07-26",
    title: "Página /status e auto-teste",
    changes: [
      "Nova rota /status com verificação de rota, ambiente e timestamp",
      "Botão de auto-teste para Home, Login, favicon, CSS e runtime JS",
    ],
  },
  {
    version: "v1.6.0",
    date: "2026-07-25",
    title: "Atelier v15 com quadro do camelo",
    changes: [
      "Nova cena fotográfica com quadro bordado em ouro sobre camurça bordô",
      "Variantes desktop 16:9 e mobile 9:16 aplicadas ao /login",
      "Correção de distorções nas ampolas e no carimbo Dr. Pádua",
    ],
  },
  {
    version: "v1.5.0",
    date: "2026-07-24",
    title: "Rodapé PADAXOR + PADCON balanceado",
    changes: [
      "Símbolos PADAXOR (esquerda) e PADCON (direita) alinhados pelo ponto médio",
      "Nova identidade PADAXOR substituindo Parxis nos selos institucionais",
      "Bloco PADCON replicado na tela de login",
    ],
  },
  {
    version: "v1.4.0",
    date: "2026-07-22",
    title: "Tela de login clínica",
    changes: [
      "Rota /login com Google OAuth e triagem HIBP",
      "Painel de certificações (OAuth 2.1, HIBP, TLS 1.3, LGPD)",
      "Levitação sutil do cartão principal e bordas metálicas refinadas",
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-07-20",
    title: "Medalhão Paxter com glint",
    changes: [
      "Componente PaxterMedalhao com traçado sequencial no contorno",
      "Sincronização com o repositório Protocolo-Manager",
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-07-18",
    title: "Cabeçalho mobile e segurança de leads",
    changes: [
      "Header reorganizado em grid no mobile",
      "RLS refinada com tabela user_roles e revogação de SELECT em leads",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-07-16",
    title: "Private Medical Atelier",
    changes: [
      "Fundo cinematográfico em 5 resoluções responsivas",
      "Botão de contraste ajustando apenas o véu, sem ocultar a cena",
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-07-14",
    title: "Lançamento do Círculo Parxis",
    changes: [
      "Copy com gatilhos de exclusividade e Solicitação de Indicação",
      "Painéis parallax em couro cognac e lã diagonal",
      "Seção Vozes do Círculo com slider de depoimentos",
    ],
  },
];