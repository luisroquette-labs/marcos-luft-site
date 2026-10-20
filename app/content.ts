// Conteúdo do site pessoal de Marcos Luft — toda frase aqui é rastreável a
// people/marcos-luft/source/profile-extraction.md. Nenhum cliente, prêmio ou
// métrica não presente na fonte foi inventado; campos marcados [SEM DADO] na
// fonte permanecem ausentes ou como placeholder explícito (ver `person.whatsapp`).

/**
 * Identidade e contato de Marcos Luft.
 * `whatsapp` é um placeholder — o perfil-fonte não traz um número literal
 * ([SEM DADO]); nunca inventar um número que pareça real.
 */
export const person = {
  name: "Marcos Luft",
  legalName: "Marcos André Blodow Luft",
  role: "Assessor de Imprensa",
  thesis:
    "26 anos unindo jornalismo de rede nacional (Rede Globo/RBS TV) e comunicação institucional pública a serviço de quem precisa que a história certa chegue até a imprensa certa.",
  location: "Santo Ângelo, RS",
  // TODO: Marcos to supply real WhatsApp number — profile has no literal phone ([SEM DADO]).
  whatsapp: "https://wa.me/55XXXXXXXXXXX",
  whatsappLabel: "Falar no WhatsApp",
  year: 2026,
};

/** Seção hero — lidera com o ângulo 1 do perfil (§2) e o cargo atual em destaque (CK-2). */
export const hero = {
  eyebrow: "Assessoria de Imprensa & Comunicação Institucional",
  headline: "26 anos contando histórias que a Rede Globo levou ao Brasil inteiro",
  sub: "hoje a serviço de quem precisa que a história certa chegue até a imprensa certa.",
  currentRoleBadge:
    "Especialista em Comunicação de Marketing — Câmara de Vereadores de Santo Ângelo · ago/2026–atual",
  ctas: [
    { label: "Solicitar diagnóstico", href: "#contato" },
    { label: "Ver trajetória", href: "#trajetoria" },
  ],
};

/** Faixa de estatísticas — números de carreira do perfil §4/§5. */
export const stats = [
  { n: 26, suffix: "+", label: "anos de carreira" },
  { n: 14, suffix: "", label: "anos na RBS TV / Rede Globo" },
  { n: 9, suffix: "+", label: "anos na Câmara de Vereadores" },
  { n: 4, suffix: "", label: "frentes de atuação" },
];

/**
 * As 4 linhas de serviço (perfil §3.1-3.4). Cada item tem CTA e benefício
 * próprios — nunca um link/rótulo genérico compartilhado (CK-1).
 */
export const servicos = {
  eyebrow: "Serviços",
  title: "Quatro frentes, um profissional formado dentro da redação nacional",
  lead: "Assessoria de imprensa, gestão de imagem, produção de conteúdo e cobertura de eventos — cada frente apoiada em 14 anos do outro lado da câmera na Rede Globo/RBS TV e 9 anos tocando a comunicação de uma Câmara de Vereadores.",
  items: [
    {
      title: "Assessoria de Imprensa",
      forWhom:
        "Prefeituras, câmaras de vereadores, secretarias, partidos, candidatos, associações e empresas de porte médio na região das Missões/RS que precisam de porta-voz técnico entre a gestão e a imprensa.",
      benefit:
        "Reduz o risco de uma pauta mal colocada virar crise — e aumenta a chance real de aparecer na pauta certa, porque quem assessora já esteve do lado de quem decide o que vai ao ar.",
      scope: [
        "Relacionamento contínuo com veículos locais/regionais (rádio, jornal impresso/digital, TV afiliada) e gestão de lista de contatos de imprensa",
        "Redação e distribuição de releases e notas oficiais",
        "Media training básico para porta-vozes — como falar, o que não falar, postura em frente à câmera",
        "Monitoramento de menções e clipping do que saiu sobre o cliente",
        "Gestão de crise de imagem em primeiro atendimento, com orientação imediata",
      ],
      cta: "Solicitar diagnóstico",
      href: "#contato",
    },
    {
      title: "Gestão de Imagem",
      forWhom:
        "Figuras públicas, políticos eleitos ou em campanha, executivos e lideranças institucionais que precisam de uma narrativa pública coerente ao longo do tempo, não só de um evento isolado.",
      benefit:
        "Presença pública construída com o critério de quem decide pauta editorial, não só de quem posta — menos ruído, mais recall da mensagem certa.",
      scope: [
        "Curadoria de narrativa — o que comunicar e quando",
        "Consistência entre fala institucional e redes sociais",
        "Preparo para entrevistas e aparições públicas",
        "Antecipação de perguntas sensíveis",
      ],
      cta: "Agendar consultoria de imagem",
      href: "#contato",
    },
    {
      title: "Produção de Conteúdo Multiformato",
      forWhom:
        "Instituições e marcas que precisam de conteúdo em texto, foto e vídeo com padrão de televisão aberta, não de post amador.",
      benefit:
        "Um único profissional entrega o pacote completo — capta, edita, locuciona e publica — sem o custo e a fricção de coordenar freelancers separados para cada etapa.",
      scope: [
        "Captação de imagem e som",
        "Edição de vídeo",
        "Fotografia de evento e institucional",
        "Locução off",
        "Adaptação do mesmo conteúdo para redes sociais e canais institucionais",
      ],
      cta: "Pedir orçamento de conteúdo",
      href: "#contato",
    },
    {
      title: "Cobertura de Eventos",
      forWhom:
        "Sessões públicas, inaugurações, convenções, eventos políticos e institucionais que precisam de registro profissional e pauta de imprensa no mesmo movimento.",
      benefit:
        "Cobertura que já nasce pensando no que vira matéria, no que vira post e no que vira material de arquivo — a mesma rotina coberta desde 2017 nas sessões da Câmara.",
      scope: [
        "Cobertura fotográfica e em vídeo ao vivo/sob deadline",
        "Condução de entrevistas no local",
        "Produção de material editado em prazo curto (mesmo dia/próximo dia)",
        "Entrega pronta para redes e imprensa",
      ],
      cta: "Reservar cobertura",
      href: "#contato",
    },
  ],
};

/**
 * Competências técnicas (perfil §1/§3) — o que o profissional efetivamente
 * executa em campo, condensado a partir das 4 linhas de serviço e da
 * passagem por RBS TV/Rádio Novos Horizontes/Câmara. Nenhuma lista literal
 * assim existe no LinkedIn — é framing meu sobre fatos do perfil, mesma
 * natureza de inferência das seções `forWhom`/`benefit`/`scope` acima (ver
 * profile-extraction.md `_inferred` #2/#3).
 */
export const competencias = [
  "Produção jornalística multiplataforma — TV, rádio e digital",
  "Locução e edição de vídeo",
  "Fotografia e videografia de evento",
  "Gestão de comunicação institucional e redes públicas",
  "Relacionamento e assessoria com veículos de imprensa",
  "Cobertura ao vivo sob deadline",
];

/**
 * Trajetória de carreira (perfil §5), ordem cronológica ascendente por
 * `startDate`. Apenas o item da Câmara tem `current: true` (CK-2/CK-3) — a
 * sobreposição 2010-2017/2001-2015 é dado real do LinkedIn e é preservada.
 */
export const trajetoria = {
  eyebrow: "Trajetória",
  title: "26 anos de carreira, três capítulos",
  items: [
    {
      employer: "RBS TV (afiliada Rede Globo)",
      role: "Repórter Cinematográfico e Locutor Off",
      startDate: "2001",
      endDate: "2015",
      current: false,
      body: "14 anos operando câmera e locução para programas de alcance nacional — Jornal Nacional, Globo Repórter, Jornal do Almoço e RBS Notícias — vivendo na prática o que faz uma pauta ser aceita, recusada ou engavetada por uma emissora afiliada à Rede Globo.",
    },
    {
      employer: "Rádio Novos Horizontes, Santo Ângelo/RS",
      role: "Locutor e Produtor de Conteúdo",
      startDate: "2010",
      endDate: "2017",
      current: false,
      body: "Sete anos à frente do microfone e da produção de conteúdo na Rádio Novos Horizontes, em Santo Ângelo/RS — rotina diária de locução e pauta local, em parte simultânea à passagem pela RBS TV.",
    },
    {
      employer: "Câmara de Vereadores de Santo Ângelo",
      role: "Assessor de Imprensa → Especialista em Comunicação de Marketing",
      startDate: "2017",
      endDate: "atual",
      current: true,
      body: "Desde 2017, assessor de imprensa e, a partir de agosto de 2026, Especialista em Comunicação de Marketing em tempo integral na Câmara de Vereadores de Santo Ângelo — comunicação institucional sob pressão real: sessão pública, deadline inegociável e múltiplos interesses políticos simultâneos, não teoria de agência.",
    },
  ],
};

/**
 * Prova de credibilidade (perfil §4) — programas de rede nacional nomeados.
 * Nunca framear como autoria de matéria específica (sem crédito nominal
 * público encontrado) — a frase honesta é "contribuiu com reportagens
 * para…" (CK-11).
 */
export const prova = {
  eyebrow: "Prova",
  title: "Credenciais que vêm de dentro da redação nacional",
  framing: "contribuiu com reportagens para…",
  items: [
    { program: "Jornal Nacional", network: "Rede Globo / RBS TV", years: "2001–2015" },
    { program: "Globo Repórter", network: "Rede Globo / RBS TV", years: "2001–2015" },
    { program: "Jornal do Almoço", network: "RBS TV", years: "2001–2015" },
    { program: "RBS Notícias", network: "RBS TV", years: "2001–2015" },
  ],
};

/**
 * Formação acadêmica (perfil §1 — UNIJUÍ). `status` é sempre "em andamento",
 * nunca "concluído" (CK-12): a graduação em Jornalismo está em curso.
 */
export const formacao = {
  eyebrow: "Formação",
  title: "Formação acadêmica",
  items: [{ course: "Jornalismo", institution: "UNIJUÍ", status: "em andamento" }],
};

/**
 * FAQ — perguntas reais de cliente do perfil §6 (8 seeds; todas incluídas
 * para profundidade de conteúdo). Respostas se apoiam apenas em fatos do
 * perfil, sem prometer números não verificáveis ("X releases/mês").
 */
export const faq = {
  items: [
    {
      q: "Minha prefeitura/câmara/empresa já tem assessoria de imprensa — por que trocar?",
      a: "Porque a diferença não está em ter assessoria, está em quem já esteve do outro lado da câmera decidindo o que vai ao ar. 14 anos na RBS TV (afiliada Rede Globo) mostram exatamente o que faz uma pauta ser aceita, recusada ou engavetada — e isso muda a forma como uma nota ou um release é escrito.",
    },
    {
      q: "Como funciona o primeiro contato numa crise de imagem — quanto tempo até uma resposta?",
      a: "A orientação é imediata, no primeiro atendimento — sem terceirizar a crise para uma agência externa. A rotina de 9 anos tocando a comunicação de uma Câmara de Vereadores, com sessão pública e deadline político constante, é a base aplicada aqui.",
    },
    {
      q: "Você atende só na região das Missões/RS ou cobre eventos em outras cidades/estados?",
      a: "A base de atuação é Santo Ângelo e a região das Missões/RS, com disponibilidade para viagens (CNH categoria B) quando a cobertura exigir deslocamento.",
    },
    {
      q: "O pacote inclui cobertura fotográfica E em vídeo no mesmo evento, ou são contratados separados?",
      a: "As duas frentes saem do mesmo profissional, no mesmo evento — captação de imagem, som, fotografia e locução off integradas, sem precisar coordenar freelancers separados para cada etapa.",
    },
    {
      q: "Como funciona o relacionamento com a imprensa local — você já tem contato direto com os veículos da região?",
      a: "Sim — o relacionamento com veículos locais e regionais (rádio, jornal impresso/digital, TV afiliada) e a gestão da lista de contatos de imprensa fazem parte da rotina contínua do trabalho, não de uma ação pontual.",
    },
    {
      q: "Preciso de media training antes de uma entrevista importante — isso está incluso ou é à parte?",
      a: "Media training básico para porta-vozes — como falar, o que não falar, postura em frente à câmera — faz parte do escopo de assessoria de imprensa, combinado conforme a necessidade de cada cliente.",
    },
    {
      q: "Qual o prazo de entrega de um vídeo/matéria depois da cobertura de um evento?",
      a: "O material editado é entregue em prazo curto — mesmo dia ou dia seguinte — pronto para redes e imprensa, a mesma rotina aplicada à cobertura de sessões públicas desde 2017.",
    },
    {
      q: "Você trabalha com contrato mensal fixo ou por evento/demanda pontual?",
      a: "Os dois formatos são possíveis — relacionamento contínuo mensal ou contratação por evento/demanda pontual — o formato é definido conforme a necessidade levantada no diagnóstico inicial.",
    },
  ],
};

/**
 * Navegação do header. Sem rota de projetos — removida em
 * 05-route-cleanup-and-skeleton. "Serviços" aponta para a página dedicada
 * `/servicos` (não mais para a âncora `#servicos` da home) — a home ainda
 * tem a seção `#servicos` como teaser, com link próprio "Ver todos os
 * serviços →" para a mesma rota.
 */
export const nav = [
  { href: "/servicos", label: "Serviços" },
  { href: "/#trajetoria", label: "Trajetória" },
  { href: "/#prova", label: "Prova" },
  { href: "/sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/#contato", label: "Contato" },
];
