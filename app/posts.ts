export type Block =
  | { t: "p"; v: string }
  | { t: "h2"; v: string }
  | { t: "h3"; v: string }
  | { t: "ul"; v: string[] };

export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  readMin: number;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "pauta-tv-aberta",
    title: "O que uma pauta precisa ter para passar no crivo de um editor de TV aberta",
    category: "Assessoria de Imprensa",
    excerpt:
      "Catorze anos operando câmera e locução no Jornal Nacional, no Globo Repórter, no Jornal do Almoço e no RBS Notícias ensinam que aceitar, recusar ou engavetar uma pauta leva segundos, não minutos. Veja os critérios reais por trás dessa decisão.",
    date: "2026-10-19",
    readMin: 8,
    body: [
      {
        t: "p",
        v: "Catorze anos operando câmera e fazendo locução off para o Jornal Nacional, o Globo Repórter, o Jornal do Almoço e o RBS Notícias me ensinaram uma coisa que nenhum manual de assessoria resume bem: a decisão de colocar uma pauta no ar, recusar ou engavetar leva segundos, não minutos. Quem envia uma sugestão de pauta para uma redação de TV aberta está competindo por um espaço editorial finito, decidido por critérios bem mais objetivos do que parece de fora.",
      },
      { t: "h2", v: "O primeiro filtro: atualidade, não importância institucional" },
      {
        t: "p",
        v: "Muita gente que escreve uma pauta parte do princípio de que a importância do assunto para a instituição basta. Não basta. O primeiro filtro de um editor de TV aberta é temporal: isso está acontecendo agora, nesta semana, com um gancho claro de \"hoje\" ou \"a partir de hoje\"? Uma pauta que descreve algo encerrado há semanas, ou uma intenção futura sem data, cai para o fim da pilha independentemente do peso institucional do assunto.",
      },
      { t: "h2", v: "O segundo filtro: existe imagem, ou só existe discurso?" },
      {
        t: "p",
        v: "TV vive de imagem. Uma pauta que promete apenas \"fala institucional\" — uma autoridade falando ao microfone, sem nada acontecendo ao redor — compete mal contra uma pauta com imagem forte: uma vistoria em andamento, uma obra, um resgate, um trabalho de campo. Reunião formal com gente sentada atrás de uma mesa raramente sobrevive ao crivo editorial, porque não dá imagem; entrega de equipamento, vistoria técnica ou qualquer ação com movimento quase sempre entra, porque dá.",
      },
      { t: "h2", v: "O terceiro filtro: existe um personagem?" },
      {
        t: "p",
        v: "Editor de TV aberta procura alguém que o público consiga acompanhar ao longo da matéria, não uma instituição abstrata. Uma pauta que fala só em \"a prefeitura\" ou \"o órgão\", sem um personagem concreto afetado pela situação, compete pior do que uma pauta que já chega com um protagonista real cuja história ilustra o ponto maior. Não é sensacionalismo: é a forma como a narrativa televisiva sempre funcionou, e qualquer editor aprende isso nos primeiros meses de redação.",
      },
      { t: "h3", v: "A lista de checagem que usei por catorze anos antes de aceitar ou recusar uma sugestão de pauta" },
      {
        t: "ul",
        v: [
          "Isso está acontecendo agora, ou é uma declaração de intenção sem data marcada?",
          "Existe uma imagem concreta para captar, ou só existe um discurso?",
          "Existe um personagem real, alguém que o público consiga acompanhar?",
          "Isso afeta diretamente a vida de quem vai assistir, ou interessa só a quem está dentro da instituição?",
          "A informação é exclusiva, ou a mesma pauta já chegou em outros releases que a redação recebeu essa semana?",
        ],
      },
      { t: "h2", v: "A diferença entre pauta e nota oficial" },
      {
        t: "p",
        v: "Um erro comum de quem vem da comunicação institucional é enviar uma nota oficial inteira — linguagem protocolar, título longo, adjetivos redundantes sobre a própria gestão — quando o que a redação precisa é uma pauta curta, apontando um fato noticiável e uma imagem possível, deixando a análise para depois. O editor lê a sugestão, não a matéria pronta. Uma nota que já chega redigida como peça final de autopromoção é lida como isso mesmo: autopromoção, o que reduz a credibilidade do remetente para a próxima vez que ele enviar algo.",
      },
      { t: "h2", v: "Por que isso importa fora da TV também" },
      {
        t: "p",
        v: "Mesmo enviando para um portal local, uma rádio ou um jornal impresso, a mesma lógica editorial de tempo, imagem, personagem e exclusividade se aplica em escala reduzida. Quem aprende a passar pelo filtro historicamente mais exigente da TV aberta escreve uma pauta melhor para qualquer canal, porque esse filtro é, na prática, o mais seletivo do ecossistema de imprensa local e regional no Brasil.",
      },
      { t: "h2", v: "O que aplicar na prática, hoje" },
      {
        t: "p",
        v: "Antes de enviar a próxima sugestão de pauta, responda com honestidade às cinco perguntas da lista acima. Se não conseguir responder \"sim\" para pelo menos três delas, a pauta ainda não está pronta — vale a pena repensar o ângulo antes de disparar. E sempre que possível, anexe uma sugestão concreta de imagem (mesmo uma foto estática), uma frase indicando o personagem afetado e uma data clara. É esse conjunto, não o tamanho do release, que decide se uma pauta sai do e-mail e vai para a pauta do dia.",
      },
    ],
  },
  {
    slug: "comunicacao-institucional-nao-e-marketing",
    title: "Comunicação institucional não é marketing: a diferença que evita crise",
    category: "Comunicação Institucional",
    excerpt:
      "Nove anos à frente da comunicação de imprensa de uma Câmara de Vereadores mostram que a crise raramente nasce da falta de comunicação — nasce do tipo errado de comunicação. Veja onde está a linha entre prestar contas e promover uma pessoa.",
    date: "2026-10-19",
    readMin: 8,
    body: [
      {
        t: "p",
        v: "Nos últimos nove anos à frente da comunicação de imprensa da Câmara de Vereadores de Santo Ângelo, aprendi a distinguir rápido duas coisas que soam parecidas, mas não são: comunicação institucional e marketing. Na minha experiência, essa confusão é a origem mais comum de crise de imagem dentro do poder público — não a falta de comunicação, mas o tipo errado de comunicação saindo pelo canal errado.",
      },
      { t: "h2", v: "Quem é o sujeito da mensagem" },
      {
        t: "p",
        v: "Comunicação institucional fala em nome de uma instituição — a Câmara, a prefeitura, o órgão — e serve a um público difuso que tem direito de saber o que aconteceu. Marketing fala em nome de uma pessoa ou de uma marca, com o objetivo de construir preferência individual. Quando um canal oficial, financiado com recurso público, passa a girar em torno de exaltar uma pessoa em vez de relatar um ato institucional, a linha já foi cruzada — mesmo que o conteúdo pareça inofensivo.",
      },
      { t: "h2", v: "De onde vem o dinheiro, para onde vai a prestação de contas" },
      {
        t: "p",
        v: "Comunicação institucional é financiada com recurso público, e sua obrigação primária é transparência e prestação de contas ao contribuinte, não persuasão. Marketing é financiado por quem quer ser escolhido, e sua obrigação é convencer. Misturar os dois significa usar estrutura e orçamento público para construir imagem pessoal — exatamente o que órgãos de controle, oposição política e imprensa examinam primeiro quando uma crise começa a se formar.",
      },
      { t: "h3", v: "Cinco diferenças práticas entre comunicação institucional e marketing pessoal" },
      {
        t: "ul",
        v: [
          "Sujeito: a instituição fala pela instituição, não uma pessoa usa a estrutura da instituição para falar de si mesma.",
          "Financiamento: recurso público sustenta prestação de contas, não promoção de imagem individual.",
          "Público: o cidadão tem direito à informação, independentemente de ser eleitor ou simpatizante de alguém.",
          "Tom: informativo e verificável, não persuasivo e elogioso.",
          "Medida de sucesso: se a informação foi entendida por quem precisava dela, não quantas curtidas ela recebeu.",
        ],
      },
      { t: "h2", v: "Os sinais de que a comunicação institucional escorregou para marketing pessoal" },
      {
        t: "p",
        v: "Alguns sinais aparecem com frequência em rotinas de comunicação pública: publicações que atribuem a uma única pessoa uma decisão que foi colegiada; intensidade do canal oficial que sobe de forma visível em período eleitoral; releases que usam adjetivos sobre as qualidades de alguém em vez de descrever o ato institucional; fotos e vídeos que enquadram o indivíduo, e não o conteúdo da sessão ou da decisão tomada. Nenhum desses sinais, isolado, é grave — mas quando se acumulam, o canal institucional deixou de cumprir sua função.",
      },
      { t: "h2", v: "A rotina que uso para manter a linha" },
      {
        t: "p",
        v: "No dia a dia da Câmara, o conteúdo principal de qualquer publicação institucional é a pauta da sessão e o resultado: o que foi votado, o que foi aprovado ou rejeitado, em que fase está um projeto. Autoria e proponentes são citados de forma factual, sem adjetivo elogioso. O canal oficial se mantém distinto de qualquer perfil pessoal de vereador. E todo material institucional é tratado como algo que um cidadão sem qualquer afinidade política precisa conseguir ler e confiar, sem precisar filtrar o que é informação e o que é promoção.",
      },
      { t: "h2", v: "Por que essa linha evita crise, não só desconforto estético" },
      {
        t: "p",
        v: "Quando um canal institucional é percebido como ferramenta de campanha, ele passa a atrair escrutínio de oposição, de imprensa e de órgãos de controle — e a resposta a essa crise consome muito mais recurso e energia do que a disciplina de manter a linha clara desde o início teria custado. Uma crise de credibilidade, uma vez instalada, não se resolve com mais comunicação persuasiva. Ela se resolve com mais transparência — que é exatamente o que deveria ter estado ali desde o primeiro dia.",
      },
      { t: "h2", v: "O teste rápido para qualquer peça de comunicação institucional" },
      {
        t: "p",
        v: "Antes de publicar qualquer peça, vale uma pergunta simples: essa informação chegaria do mesmo jeito a um cidadão contrário ao governo e a um cidadão favorável a ele? Se a resposta muda dependendo da simpatia política de quem lê, o texto é marketing disfarçado de comunicação institucional — e precisa ser reescrito antes de sair.",
      },
    ],
  },
  {
    slug: "cobertura-sob-deadline",
    title: "Cobertura sob deadline: texto, foto e vídeo do mesmo evento, no mesmo dia, sem equipe",
    category: "Produção de Conteúdo",
    excerpt:
      "Cobrir uma sessão pública sozinho e entregar texto, foto e vídeo editados no mesmo dia não é talento especial: é organização antes do evento, prioridade durante e disciplina depois. Veja a rotina por trás disso.",
    date: "2026-10-19",
    readMin: 7,
    body: [
      {
        t: "p",
        v: "Cobrir uma sessão pública sozinho — sem fotógrafo, sem cinegrafista, sem redator de apoio — e ainda assim entregar texto, foto e vídeo editados no mesmo dia é uma rotina que se aprende, não um talento especial. É, na prática, uma questão de organização antes do evento, prioridade durante o evento e disciplina depois dele.",
      },
      { t: "h2", v: "O problema real: três formatos, uma pessoa, um relógio" },
      {
        t: "p",
        v: "Quando uma única pessoa precisa produzir texto, foto e vídeo de um evento institucional com prazo de entrega no mesmo dia, o primeiro instinto, tentar fazer os três formatos ao mesmo tempo durante o evento, é o primeiro erro. O resultado quase sempre é mediano nos três ao mesmo tempo. A solução não é multitarefa: é sequenciar o trabalho em etapas claras, com cada etapa tendo um objetivo único.",
      },
      { t: "h2", v: "Antes do evento: o trabalho que elimina decisões de última hora" },
      {
        t: "p",
        v: "Boa parte do tempo que parece faltar durante a cobertura, na verdade, é tempo que não foi reservado antes. Conhecer a pauta do evento com antecedência permite prever qual momento provavelmente vai virar a notícia principal, e planejar o enquadramento de vídeo e o ângulo de foto para esse momento específico, em vez de descobrir isso em tempo real.",
      },
      { t: "h3", v: "O que decidir antes de saber como o evento termina" },
      {
        t: "ul",
        v: [
          "Qual é o momento da pauta que provavelmente vai virar a notícia principal.",
          "Qual enquadramento de vídeo e qual ângulo de foto cobrem esse momento sem exigir deslocamento no meio da cena.",
          "O que já pode ser escrito do texto antes do evento terminar: contexto, histórico, participantes, pauta formal.",
          "Qual formato sai primeiro depois do evento, e qual pode esperar algumas horas sem perder relevância.",
        ],
      },
      { t: "h2", v: "Durante o evento: a ordem de prioridade que evita perder o essencial" },
      {
        t: "p",
        v: "A prioridade número um durante o evento é a captação, porque imagem e som perdidos não podem ser recriados depois. Isso significa manter o vídeo rolando e a câmera pronta nos momentos-chave antes de qualquer outra tarefa. Anotar o horário exato de uma fala relevante, em vez de tentar escrever a frase completa em tempo real, economiza tempo de edição depois: a transcrição fiel sai do próprio arquivo gravado, não da memória.",
      },
      { t: "h2", v: "Depois do evento: a corrida contra o relógio que realmente decide o resultado" },
      {
        t: "p",
        v: "A edição sob deadline exige triagem rápida: escolher as poucas fotos que realmente carregam a história visualmente, em vez de revisar cada imagem captada. No vídeo, priorizar o corte dos um ou dois momentos decisivos em vez de tentar montar uma peça completa. No texto, partir do esqueleto já escrito antes do evento e completar apenas o resultado. A ordem de publicação também importa: foto e texto curto normalmente saem primeiro, porque pedem menos tempo de produção, e o vídeo editado segue depois — esperar o formato mais lento ficar pronto para publicar tudo junto atrasa os outros dois sem necessidade.",
      },
      { t: "h2", v: "O limite honesto desse método" },
      {
        t: "p",
        v: "Esse método funciona bem para cobertura institucional recorrente, com estrutura previsível, como sessões legislativas ou eventos locais de rotina. Um evento grande, com várias frentes simultâneas e imprevisíveis, de fato exige mais de um profissional — fingir que uma pessoa sozinha resolve tudo nesse cenário só produz material pior nos três formatos. Saber reconhecer quando pedir apoio faz parte do trabalho, não é um fracasso do método.",
      },
      { t: "h2", v: "O que levar dessa rotina para qualquer cobertura sob deadline" },
      {
        t: "p",
        v: "Decidir com antecedência o que realmente importa, proteger o momento de captação acima de qualquer outra tarefa porque ele não pode ser refeito depois, e sequenciar a entrega em vez de tentar terminar tudo de uma vez. É essa disciplina, repetida evento após evento, que torna possível cobrir sozinho o que normalmente levaria uma equipe inteira.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
