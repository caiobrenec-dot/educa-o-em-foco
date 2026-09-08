/**
 * DADOS DEMONSTRATIVOS
 * ------------------------------------------------------------------
 * Todo o conteúdo deste arquivo é FICTÍCIO e serve apenas para
 * demonstração do protótipo. Substitua por dados reais (ou conecte a
 * um backend) antes da publicação. Nenhum dado pessoal real deve ser
 * inserido aqui.
 */

import assembleia from "@/assets/assembleia.jpg";
import heroEducacao from "@/assets/hero-educacao.jpg";
import sedeLazer from "@/assets/sede-lazer.jpg";

export const imagens = { assembleia, heroEducacao, sedeLazer };

/* ------------------------------- Cidades ------------------------------- */
export const cidades = [
  "Londrina",
  "Cambé",
  "Ibiporã",
  "Rolândia",
  "Arapongas",
  "Apucarana",
  "Jataizinho",
  "Sertanópolis",
  "Bela Vista do Paraíso",
  "Cornélio Procópio",
  "Assaí",
  "Mandaguari",
];

/* ------------------------------ Notícias ------------------------------- */
export const categoriasNoticias = [
  "Negociação",
  "Direitos trabalhistas",
  "Educação",
  "Saúde",
  "Eventos",
  "Benefícios",
] as const;

export type Noticia = {
  slug: string;
  titulo: string;
  categoria: (typeof categoriasNoticias)[number];
  data: string;
  autor: string;
  resumo: string;
  imagem: string;
  conteudo: string[];
};

export const noticias: Noticia[] = [
  {
    slug: "campanha-salarial-2026-abre-negociacao",
    titulo: "Campanha salarial 2026 abre negociação com as mantenedoras",
    categoria: "Negociação",
    data: "2026-08-12",
    autor: "Equipe de Comunicação",
    resumo:
      "Primeira rodada de negociação define calendário de reuniões e apresenta a pauta aprovada em assembleia pela categoria.",
    imagem: assembleia,
    conteudo: [
      "A primeira rodada de negociação da campanha salarial reuniu representantes do sindicato e das mantenedoras de escolas particulares e filantrópicas da base territorial.",
      "A pauta aprovada em assembleia inclui reajuste do piso, valorização da hora-atividade, ampliação do auxílio-alimentação e regras claras para atividades realizadas fora do horário contratual.",
      "As próximas rodadas acontecem quinzenalmente. O sindicato publicará um comunicado após cada reunião, e a proposta final será submetida à assembleia da categoria.",
    ],
  },
  {
    slug: "hora-atividade-o-que-diz-a-convencao",
    titulo: "Hora-atividade: o que diz a convenção coletiva vigente",
    categoria: "Direitos trabalhistas",
    data: "2026-07-28",
    autor: "Departamento Jurídico",
    resumo:
      "Guia rápido para entender como a hora-atividade deve ser registrada, remunerada e utilizada no dia a dia escolar.",
    imagem: heroEducacao,
    conteudo: [
      "A hora-atividade é o tempo destinado ao planejamento, à correção de avaliações e à formação continuada, e deve constar no contrato de trabalho.",
      "A convenção coletiva vigente estabelece o percentual mínimo em relação à jornada e determina que esse tempo não pode ser substituído por atividades de substituição em sala.",
      "Em caso de descumprimento, o associado pode registrar um atendimento no departamento jurídico pelo canal de contato do sindicato.",
    ],
  },
  {
    slug: "curso-de-mediacao-de-conflitos-em-sala",
    titulo: "Inscrições abertas para o curso de mediação de conflitos em sala",
    categoria: "Educação",
    data: "2026-07-15",
    autor: "Formação e Cultura",
    resumo:
      "Formação gratuita para associados, com certificado e turmas presenciais e online ao longo do segundo semestre.",
    imagem: heroEducacao,
    conteudo: [
      "O curso aborda escuta ativa, comunicação não violenta e protocolos de encaminhamento em situações de conflito escolar.",
      "São 20 horas, distribuídas em cinco encontros, com certificado emitido pelo sindicato.",
      "As vagas são limitadas e a inscrição é feita na página de eventos.",
    ],
  },
  {
    slug: "mutirao-de-saude-bucal-para-dependentes",
    titulo: "Mutirão de saúde bucal atende associados e dependentes",
    categoria: "Saúde",
    data: "2026-06-30",
    autor: "Núcleo de Saúde",
    resumo:
      "Atendimentos de avaliação odontológica em duas unidades, com agendamento prévio pelo site.",
    imagem: heroEducacao,
    conteudo: [
      "O mutirão oferece avaliação clínica, orientação preventiva e encaminhamento para tratamento quando necessário.",
      "O atendimento é destinado a associados em dia e seus dependentes cadastrados.",
      "O agendamento é feito pela página de saúde e confirmado pela equipe responsável.",
    ],
  },
  {
    slug: "festa-da-categoria-na-sede-recreativa",
    titulo: "Festa da categoria movimenta a sede recreativa",
    categoria: "Eventos",
    data: "2026-06-10",
    autor: "Equipe de Comunicação",
    resumo:
      "Dia de confraternização com atividades esportivas, oficinas para crianças e almoço coletivo na sede de lazer.",
    imagem: sedeLazer,
    conteudo: [
      "A confraternização anual reuniu associados e familiares na sede recreativa, com programação esportiva e cultural.",
      "Durante o evento também foram apresentadas as prioridades da próxima campanha salarial.",
      "As reservas de espaços da sede continuam disponíveis para associados durante todo o ano.",
    ],
  },
  {
    slug: "novos-convenios-em-farmacias-e-oticas",
    titulo: "Novos convênios ampliam descontos em farmácias e óticas",
    categoria: "Benefícios",
    data: "2026-05-22",
    autor: "Relações Institucionais",
    resumo:
      "Rede de parceiros cresce em seis cidades da base, com condições específicas para associados e dependentes.",
    imagem: heroEducacao,
    conteudo: [
      "Os novos parceiros oferecem descontos mediante apresentação da carteirinha digital do associado.",
      "As condições variam por unidade e podem ser consultadas no diretório de benefícios.",
      "Recomendamos confirmar a validade do benefício diretamente com o parceiro antes da utilização.",
    ],
  },
];

/* ------------------------------ Documentos ----------------------------- */
export const tiposDocumento = [
  "Convenção coletiva",
  "Acordo coletivo",
  "Piso salarial",
  "Comunicado",
  "Edital",
  "Ata de assembleia",
] as const;

export type Documento = {
  id: string;
  titulo: string;
  tipo: (typeof tiposDocumento)[number];
  ano: number;
  publicacao: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  instituicoes: string;
  categoriaProfissional: string;
  abrangencia: string;
  vigente: boolean;
};

export const documentos: Documento[] = [
  {
    id: "doc-1",
    titulo: "Convenção Coletiva de Trabalho 2026/2027 — Escolas Particulares",
    tipo: "Convenção coletiva",
    ano: 2026,
    publicacao: "2026-03-05",
    vigenciaInicio: "2026-03-01",
    vigenciaFim: "2027-02-28",
    instituicoes: "Sindicato das mantenedoras de escolas particulares (demonstração)",
    categoriaProfissional: "Professores",
    abrangencia: "Toda a base territorial",
    vigente: true,
  },
  {
    id: "doc-2",
    titulo: "Convenção Coletiva 2026/2027 — Instituições Filantrópicas",
    tipo: "Convenção coletiva",
    ano: 2026,
    publicacao: "2026-03-12",
    vigenciaInicio: "2026-03-01",
    vigenciaFim: "2027-02-28",
    instituicoes: "Entidades filantrópicas de ensino (demonstração)",
    categoriaProfissional: "Auxiliares e administrativo",
    abrangencia: "Toda a base territorial",
    vigente: true,
  },
  {
    id: "doc-3",
    titulo: "Tabela de Pisos Salariais 2026",
    tipo: "Piso salarial",
    ano: 2026,
    publicacao: "2026-03-15",
    vigenciaInicio: "2026-03-01",
    vigenciaFim: "2027-02-28",
    instituicoes: "Todas as mantenedoras da base",
    categoriaProfissional: "Todas as categorias",
    abrangencia: "Toda a base territorial",
    vigente: true,
  },
  {
    id: "doc-4",
    titulo: "Acordo Coletivo — Jornada e hora-atividade (Londrina)",
    tipo: "Acordo coletivo",
    ano: 2025,
    publicacao: "2025-09-01",
    vigenciaInicio: "2025-09-01",
    vigenciaFim: "2026-08-31",
    instituicoes: "Colégio Exemplo (demonstração)",
    categoriaProfissional: "Professores",
    abrangencia: "Londrina",
    vigente: true,
  },
  {
    id: "doc-5",
    titulo: "Comunicado 04/2025 — Pagamento de férias e recesso escolar",
    tipo: "Comunicado",
    ano: 2025,
    publicacao: "2025-11-20",
    vigenciaInicio: "2025-11-20",
    vigenciaFim: "2025-12-31",
    instituicoes: "Sindicato da Educação Regional",
    categoriaProfissional: "Todas as categorias",
    abrangencia: "Toda a base territorial",
    vigente: false,
  },
  {
    id: "doc-6",
    titulo: "Ata da Assembleia Geral Extraordinária de 2024",
    tipo: "Ata de assembleia",
    ano: 2024,
    publicacao: "2024-04-18",
    vigenciaInicio: "2024-04-18",
    vigenciaFim: "2024-12-31",
    instituicoes: "Sindicato da Educação Regional",
    categoriaProfissional: "Todas as categorias",
    abrangencia: "Toda a base territorial",
    vigente: false,
  },
];

/* ------------------------------- Convênios ----------------------------- */
export const categoriasConvenio = [
  "Saúde",
  "Educação",
  "Restaurantes",
  "Hotéis",
  "Viagens",
  "Academias",
  "Farmácias",
  "Óticas",
  "Serviços automotivos",
  "Beleza",
  "Lazer",
] as const;

export type Convenio = {
  id: string;
  nome: string;
  categoria: (typeof categoriasConvenio)[number];
  descricao: string;
  cidade: string;
  beneficio: string;
  documentos: string;
  atualizadoEm: string;
};

export const convenios: Convenio[] = [
  {
    id: "conv-1",
    nome: "Clínica Bem Viver (demonstração)",
    categoria: "Saúde",
    descricao: "Consultas em clínica geral e exames laboratoriais com valores diferenciados.",
    cidade: "Londrina",
    beneficio: "20% de desconto em consultas particulares",
    documentos: "Carteirinha digital e documento com foto",
    atualizadoEm: "2026-07-01",
  },
  {
    id: "conv-2",
    nome: "Faculdade Horizonte (demonstração)",
    categoria: "Educação",
    descricao: "Graduação e pós-graduação com bolsa parcial para associados e dependentes.",
    cidade: "Cambé",
    beneficio: "Até 30% de desconto na mensalidade",
    documentos: "Declaração de associado emitida pelo sindicato",
    atualizadoEm: "2026-06-18",
  },
  {
    id: "conv-3",
    nome: "Restaurante Sabor da Praça (demonstração)",
    categoria: "Restaurantes",
    descricao: "Almoço executivo de segunda a sexta, com condição especial para a categoria.",
    cidade: "Ibiporã",
    beneficio: "10% de desconto no almoço executivo",
    documentos: "Carteirinha digital",
    atualizadoEm: "2026-05-30",
  },
  {
    id: "conv-4",
    nome: "Academia Movimento (demonstração)",
    categoria: "Academias",
    descricao: "Planos mensais e trimestrais com isenção de matrícula para associados.",
    cidade: "Arapongas",
    beneficio: "15% de desconto e matrícula isenta",
    documentos: "Carteirinha digital e comprovante de residência",
    atualizadoEm: "2026-07-22",
  },
  {
    id: "conv-5",
    nome: "Farmácia Popular Central (demonstração)",
    categoria: "Farmácias",
    descricao: "Medicamentos genéricos e similares com desconto direto no caixa.",
    cidade: "Rolândia",
    beneficio: "Até 25% em genéricos",
    documentos: "Carteirinha digital",
    atualizadoEm: "2026-04-11",
  },
  {
    id: "conv-6",
    nome: "Pousada Serra Azul (demonstração)",
    categoria: "Hotéis",
    descricao: "Diárias com tarifa especial para associados fora de alta temporada.",
    cidade: "Apucarana",
    beneficio: "18% de desconto nas diárias",
    documentos: "Carteirinha digital e reserva antecipada",
    atualizadoEm: "2026-06-02",
  },
];

/* ------------------------- Profissionais de saúde ---------------------- */
export const especialidades = [
  "Psicologia",
  "Odontologia",
  "Fisioterapia",
  "Fonoaudiologia",
  "Nutrição",
  "Psicopedagogia",
] as const;

export type Profissional = {
  id: string;
  nome: string;
  especialidade: (typeof especialidades)[number];
  curriculo: string;
  unidade: string;
  modalidade: "Presencial" | "Online" | "Presencial e online";
  telefone: string;
};

export const profissionais: Profissional[] = [
  {
    id: "prof-1",
    nome: "Ana Ribeiro (profissional fictícia)",
    especialidade: "Psicologia",
    curriculo: "Psicóloga clínica com atuação em saúde mental de trabalhadores da educação.",
    unidade: "Unidade Centro — Londrina",
    modalidade: "Presencial e online",
    telefone: "(00) 0000-0011",
  },
  {
    id: "prof-2",
    nome: "Bruno Tavares (profissional fictício)",
    especialidade: "Odontologia",
    curriculo: "Cirurgião-dentista, com foco em odontologia preventiva e restauradora.",
    unidade: "Unidade Centro — Londrina",
    modalidade: "Presencial",
    telefone: "(00) 0000-0012",
  },
  {
    id: "prof-3",
    nome: "Carla Menezes (profissional fictícia)",
    especialidade: "Fisioterapia",
    curriculo: "Fisioterapeuta com experiência em dores posturais e lesões por esforço repetitivo.",
    unidade: "Unidade Norte — Cambé",
    modalidade: "Presencial",
    telefone: "(00) 0000-0013",
  },
  {
    id: "prof-4",
    nome: "Diego Alencar (profissional fictício)",
    especialidade: "Fonoaudiologia",
    curriculo: "Fonoaudiólogo especializado em saúde vocal de professores.",
    unidade: "Unidade Centro — Londrina",
    modalidade: "Presencial e online",
    telefone: "(00) 0000-0014",
  },
  {
    id: "prof-5",
    nome: "Elisa Prado (profissional fictícia)",
    especialidade: "Nutrição",
    curriculo: "Nutricionista com atendimento voltado à rotina de quem trabalha em turnos.",
    unidade: "Atendimento online",
    modalidade: "Online",
    telefone: "(00) 0000-0015",
  },
  {
    id: "prof-6",
    nome: "Fábio Nunes (profissional fictício)",
    especialidade: "Psicopedagogia",
    curriculo: "Psicopedagogo com atuação em dificuldades de aprendizagem de crianças e adolescentes.",
    unidade: "Unidade Sul — Arapongas",
    modalidade: "Presencial e online",
    telefone: "(00) 0000-0016",
  },
];

/* -------------------------------- Eventos ------------------------------ */
export const tiposEvento = [
  "Assembleia",
  "Curso",
  "Palestra",
  "Campanha",
  "Evento recreativo",
  "Reunião",
] as const;

export type Evento = {
  id: string;
  titulo: string;
  tipo: (typeof tiposEvento)[number];
  data: string;
  horario: string;
  local: string;
  descricao: string;
  publico: string;
  inscricao: boolean;
};

export const eventos: Evento[] = [
  {
    id: "ev-1",
    titulo: "Assembleia Geral da Campanha Salarial",
    tipo: "Assembleia",
    data: "2026-09-18",
    horario: "19h00",
    local: "Sede administrativa — Londrina",
    descricao: "Apreciação e votação da proposta apresentada pelas mantenedoras.",
    publico: "Toda a categoria representada",
    inscricao: false,
  },
  {
    id: "ev-2",
    titulo: "Curso: Mediação de Conflitos em Sala de Aula",
    tipo: "Curso",
    data: "2026-09-26",
    horario: "8h30 às 12h30",
    local: "Auditório da sede — Londrina",
    descricao: "Formação de 20 horas com certificado, dividida em cinco encontros.",
    publico: "Associados",
    inscricao: true,
  },
  {
    id: "ev-3",
    titulo: "Palestra: Saúde vocal para professores",
    tipo: "Palestra",
    data: "2026-10-03",
    horario: "18h30",
    local: "Online (transmissão ao vivo)",
    descricao: "Orientações práticas de cuidado com a voz durante a jornada escolar.",
    publico: "Associados e dependentes",
    inscricao: true,
  },
  {
    id: "ev-4",
    titulo: "Campanha de Sindicalização nas Escolas",
    tipo: "Campanha",
    data: "2026-10-14",
    horario: "Durante o dia",
    local: "Escolas da base territorial",
    descricao: "Visitas às unidades para tirar dúvidas sobre direitos e associação.",
    publico: "Toda a categoria",
    inscricao: false,
  },
  {
    id: "ev-5",
    titulo: "Dia da Família na Sede Recreativa",
    tipo: "Evento recreativo",
    data: "2026-10-25",
    horario: "9h às 17h",
    local: "Sede recreativa — Londrina",
    descricao: "Atividades esportivas, oficinas infantis e almoço coletivo.",
    publico: "Associados e familiares",
    inscricao: true,
  },
  {
    id: "ev-6",
    titulo: "Reunião de Delegados Sindicais",
    tipo: "Reunião",
    data: "2026-11-07",
    horario: "14h00",
    local: "Sede administrativa — Londrina",
    descricao: "Balanço das negociações e organização das próximas ações por região.",
    publico: "Delegados sindicais",
    inscricao: false,
  },
];

/* ------------------------------ Depoimentos ---------------------------- */
export const depoimentos = [
  {
    nome: "Marina L. (depoimento fictício)",
    cargo: "Professora do ensino fundamental",
    texto:
      "Quando tive dúvidas sobre o pagamento da hora-atividade, o atendimento jurídico explicou tudo com calma e acompanhou o caso até a solução.",
  },
  {
    nome: "Renato S. (depoimento fictício)",
    cargo: "Auxiliar administrativo escolar",
    texto:
      "Uso os convênios de farmácia e ótica todos os meses. A economia no fim do ano faz diferença real no orçamento da família.",
  },
  {
    nome: "Joana P. (depoimento fictício)",
    cargo: "Coordenadora pedagógica",
    texto:
      "Participar das assembleias mudou minha visão: dá para entender de onde vem cada cláusula da convenção coletiva.",
  },
];

/* ------------------------------- Diretoria ----------------------------- */
export const diretoria = [
  { nome: "Pessoa Fictícia 1", cargo: "Presidência" },
  { nome: "Pessoa Fictícia 2", cargo: "Vice-presidência" },
  { nome: "Pessoa Fictícia 3", cargo: "Secretaria-geral" },
  { nome: "Pessoa Fictícia 4", cargo: "Tesouraria" },
  { nome: "Pessoa Fictícia 5", cargo: "Diretoria de Formação" },
  { nome: "Pessoa Fictícia 6", cargo: "Diretoria de Saúde e Lazer" },
];

export const conselhoFiscal = [
  { nome: "Pessoa Fictícia 7", cargo: "Titular" },
  { nome: "Pessoa Fictícia 8", cargo: "Titular" },
  { nome: "Pessoa Fictícia 9", cargo: "Suplente" },
];

export const estruturaAdministrativa = [
  { setor: "Atendimento ao associado", descricao: "Cadastro, carteirinha, dúvidas gerais e encaminhamentos." },
  { setor: "Departamento jurídico", descricao: "Orientação trabalhista, análise de casos e defesa da categoria." },
  { setor: "Negociação coletiva", descricao: "Preparação de pauta, rodadas com mantenedoras e assembleias." },
  { setor: "Comunicação", descricao: "Notícias, comunicados e transparência das ações." },
  { setor: "Saúde", descricao: "Agendamentos, unidades de atendimento e campanhas preventivas." },
  { setor: "Lazer", descricao: "Sede recreativa, reservas e programação de eventos." },
];

export const faq = [
  {
    p: "Preciso ser associado para ser representado?",
    r: "Não. A convenção coletiva vale para toda a categoria da base territorial. Ser associado dá acesso a serviços adicionais, como convênios, saúde, lazer e atendimento jurídico individual.",
  },
  {
    p: "Como faço para me associar?",
    r: "Pelo formulário da página “Quero me associar”. Após o envio, você recebe um número de protocolo e a equipe confere os dados antes de concluir o cadastro.",
  },
  {
    p: "O sindicato é o mesmo que a escola ou a mantenedora?",
    r: "Não. O sindicato representa os trabalhadores; a escola é a empregadora. São partes distintas na negociação coletiva.",
  },
  {
    p: "O sindicato é um plano de saúde?",
    r: "Não. O sindicato oferece atendimentos e convênios próprios, que não substituem plano de saúde nem atendimento de emergência.",
  },
  {
    p: "Posso levar convidados à sede recreativa?",
    r: "Sim, respeitando o regulamento de uso e o pagamento da taxa de convidado vigente.",
  },
  {
    p: "Como consulto o piso salarial da minha função?",
    r: "Na página “Direitos e Acordos”, filtrando por tipo de documento “Piso salarial” e pelo ano desejado.",
  },
];

/* --------------------- Área do associado (demonstração) ---------------- */
export const associadoDemo = {
  nome: "Associada Demonstração",
  matricula: "0001-DEMO",
  cpf: "000.000.000-00",
  email: "associada.demo@exemplo.org",
  telefone: "(00) 90000-0000",
  instituicao: "Colégio Exemplo (demonstração)",
  cargo: "Professora",
  cidade: "Londrina",
  desde: "2019-03-01",
  situacao: "Ativa",
  dependentes: [
    { nome: "Dependente Demonstração 1", parentesco: "Filho(a)", nascimento: "2015-05-10" },
    { nome: "Dependente Demonstração 2", parentesco: "Cônjuge", nascimento: "1988-11-02" },
  ],
  solicitacoes: [
    { protocolo: "SER-2026-100234", tipo: "Agendamento — Psicologia", status: "Em análise", data: "2026-08-10" },
    { protocolo: "SER-2026-100119", tipo: "Orientação jurídica", status: "Concluída", data: "2026-06-22" },
  ],
  reservas: [
    { protocolo: "SER-2026-200045", espaco: "Churrasqueira 2", data: "2026-09-12", status: "Confirmada" },
    { protocolo: "SER-2026-200088", espaco: "Salão de eventos", data: "2026-11-08", status: "Pendente" },
  ],
};

/* --------------------- Painel administrativo (demo) -------------------- */
export type StatusConteudo = "Rascunho" | "Publicado" | "Arquivado" | "Pendente de revisão";

export const adminRegistros: {
  area: string;
  itens: { titulo: string; status: StatusConteudo; atualizado: string }[];
}[] = [
  {
    area: "Notícias",
    itens: [
      { titulo: "Campanha salarial 2026 abre negociação", status: "Publicado", atualizado: "2026-08-12" },
      { titulo: "Balanço da assembleia de setembro", status: "Rascunho", atualizado: "2026-08-20" },
      { titulo: "Retrospectiva 2025", status: "Arquivado", atualizado: "2026-01-05" },
    ],
  },
  {
    area: "Eventos",
    itens: [
      { titulo: "Assembleia Geral da Campanha Salarial", status: "Publicado", atualizado: "2026-08-01" },
      { titulo: "Curso de mediação — turma 2", status: "Pendente de revisão", atualizado: "2026-08-18" },
    ],
  },
  {
    area: "Documentos",
    itens: [
      { titulo: "CCT 2026/2027 — Escolas Particulares", status: "Publicado", atualizado: "2026-03-05" },
      { titulo: "Comunicado 05/2026", status: "Rascunho", atualizado: "2026-08-22" },
    ],
  },
  {
    area: "Convênios",
    itens: [
      { titulo: "Academia Movimento", status: "Publicado", atualizado: "2026-07-22" },
      { titulo: "Ótica Visão Clara", status: "Pendente de revisão", atualizado: "2026-08-15" },
    ],
  },
  {
    area: "Profissionais de saúde",
    itens: [
      { titulo: "Ana Ribeiro — Psicologia", status: "Publicado", atualizado: "2026-05-04" },
      { titulo: "Novo fisioterapeuta — Unidade Sul", status: "Rascunho", atualizado: "2026-08-19" },
    ],
  },
  {
    area: "Reservas",
    itens: [
      { titulo: "Churrasqueira 2 — 12/09", status: "Publicado", atualizado: "2026-08-21" },
      { titulo: "Salão de eventos — 08/11", status: "Pendente de revisão", atualizado: "2026-08-23" },
    ],
  },
  {
    area: "Denúncias",
    itens: [
      { titulo: "Protocolo SER-2026-300012", status: "Pendente de revisão", atualizado: "2026-08-24" },
      { titulo: "Protocolo SER-2026-300007", status: "Arquivado", atualizado: "2026-07-30" },
    ],
  },
  {
    area: "Formulários recebidos",
    itens: [
      { titulo: "Associação — 14 novos pedidos", status: "Pendente de revisão", atualizado: "2026-08-25" },
      { titulo: "Contato — 32 mensagens", status: "Publicado", atualizado: "2026-08-25" },
    ],
  },
  {
    area: "Diretoria",
    itens: [{ titulo: "Gestão 2025–2029", status: "Publicado", atualizado: "2025-04-10" }],
  },
  {
    area: "Cidades atendidas",
    itens: [{ titulo: "Base territorial — 12 municípios", status: "Publicado", atualizado: "2026-02-01" }],
  },
];
