/**
 * ARQUIVO DE CONFIGURAÇÃO DO SITE
 * ------------------------------------------------------------------
 * Altere aqui: nome, logo, contatos, cidades, números institucionais,
 * horários e textos institucionais. Todo o site lê deste arquivo.
 *
 * Referência de conteúdo: sindicato de professores da rede particular e
 * dos CEIs filantrópicos da região Norte do Paraná (Londrina e região).
 * O LOGOTIPO É ORIGINAL — não reproduz a marca de nenhuma entidade.
 *
 * IMPORTANTE: valores com "XX", "00" ou "(demonstração)" são PLACEHOLDERS
 * e devem ser substituídos por dados reais antes da publicação.
 */

import logo from "@/assets/logo-sindicato.png";

export const site = {
  nome: "Sindicato dos Profissionais da Educação — Londrina e Norte do PR",
  nomeCurto: "Sinpro Regional",
  slogan: "Um sindicato a serviço dos profissionais da educação",
  descricao:
    "Entidade sindical que representa professores e funcionários administrativos da rede particular de ensino e dos Centros de Educação Infantil filantrópicos da região Norte do Paraná.",
  logo,
  contato: {
    endereco: "Rua Exemplo, 000 — Centro (confirme o endereço real antes de publicar)",
    cidade: "Londrina / PR",
    cep: "86000-000",
    telefone: "(43) 0000-0000",
    whatsapp: "(43) 90000-0000",
    email: "contato@sindicatoeducacao.exemplo",
    horario: "Segunda a sexta, das 8h às 12h e das 13h30 às 18h",
    mapaEmbed:
      "https://www.openstreetmap.org/export/embed.html?bbox=-51.20%2C-23.36%2C-51.10%2C-23.28&layer=mapnik",
  },
  setores: [
    { nome: "Administração", email: "administracao@sindicatoeducacao.exemplo", telefone: "(43) 0000-0001" },
    { nome: "Financeiro", email: "financeiro@sindicatoeducacao.exemplo", telefone: "(43) 0000-0002" },
    { nome: "Jurídico", email: "juridico@sindicatoeducacao.exemplo", telefone: "(43) 0000-0003" },
    { nome: "Comunicação", email: "comunicacao@sindicatoeducacao.exemplo", telefone: "(43) 0000-0004" },
    { nome: "Especialidades (saúde)", email: "saude@sindicatoeducacao.exemplo", telefone: "(43) 0000-0005" },
    { nome: "Sede Campestre (lazer)", email: "campestre@sindicatoeducacao.exemplo", telefone: "(43) 0000-0006" },
  ],
  /** SUBSTITUIR POR DADOS REAIS ANTES DA PUBLICAÇÃO */
  numeros: [
    { valor: "+59", rotulo: "cidades atendidas" },
    { valor: "+XX", rotulo: "anos de atuação" },
    { valor: "+XX", rotulo: "associados" },
    { valor: "+XX", rotulo: "convênios" },
  ],
  institucional: {
    missao:
      "Representar, defender e valorizar professores e funcionários administrativos da rede particular de ensino e dos CEIs filantrópicos, garantindo condições dignas de trabalho.",
    visao:
      "Ser referência regional em representação sindical transparente, próxima da categoria e comprometida com a qualidade da educação.",
    valores: [
      "Transparência nas contas e nas decisões",
      "Respeito à diversidade e à dignidade do trabalho",
      "Diálogo permanente com a categoria",
      "Defesa firme dos direitos trabalhistas",
      "Educação como bem público essencial",
    ],
    historia:
      "Até meados da década de 1990, docentes da universidade pública e da rede particular eram representados por uma única entidade. Com a separação entre a representação do setor público e do setor privado, um grupo de professoras e professores fundou este sindicato para representar a rede privada e os Centros de Educação Infantil filantrópicos das cidades que compõem a região Norte do Paraná. Desde então, a entidade construiu assessoria jurídica própria, campanha salarial anual, clínica de especialidades e uma sede campestre para associados. (Texto de referência — revise e confirme os dados históricos antes de publicar.)",
  },
  reservaLazer: {
    valorConvidado: "R$ 00,00 por convidado (confirmar valores vigentes)",
    horarios: "Terça a domingo, das 8h às 22h",
  },
} as const;

export const menu = [
  { label: "O Sindicato", to: "/o-sindicato" },
  { label: "Direitos e Acordos", to: "/direitos-e-acordos" },
  { label: "Benefícios", to: "/beneficios" },
  { label: "Saúde", to: "/saude" },
  { label: "Lazer", to: "/lazer" },
  { label: "Notícias", to: "/noticias" },
  { label: "Eventos", to: "/eventos" },
  { label: "Contato", to: "/contato" },
] as const;
