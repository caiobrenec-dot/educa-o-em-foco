/**
 * ARQUIVO DE CONFIGURAÇÃO DO SITE
 * ------------------------------------------------------------------
 * Altere aqui: nome, logo, contatos, cidades, números institucionais,
 * horários e textos institucionais. Todo o site lê deste arquivo.
 *
 * IMPORTANTE: os valores marcados com "XX" ou "(demonstração)" são
 * PLACEHOLDERS e devem ser substituídos por dados reais antes da publicação.
 */

import logo from "@/assets/logo-sindicato.png";

export const site = {
  nome: "Sindicato da Educação Regional",
  nomeCurto: "SER",
  slogan: "Informação, defesa e benefícios para quem trabalha na educação",
  descricao:
    "Entidade sindical que representa profissionais de escolas particulares e instituições de ensino filantrópicas da região.",
  logo,
  contato: {
    endereco: "Rua Exemplo das Escolas, 123 — Centro (endereço de demonstração)",
    cidade: "Cidade Modelo / UF",
    cep: "00000-000",
    telefone: "(00) 0000-0000",
    whatsapp: "(00) 90000-0000",
    email: "contato@sindicatoeducacao.exemplo",
    horario: "Segunda a sexta, das 8h às 17h",
    mapaEmbed:
      "https://www.openstreetmap.org/export/embed.html?bbox=-46.70%2C-23.62%2C-46.58%2C-23.52&layer=mapnik",
  },
  setores: [
    { nome: "Administração", email: "administracao@sindicatoeducacao.exemplo", telefone: "(00) 0000-0001" },
    { nome: "Financeiro", email: "financeiro@sindicatoeducacao.exemplo", telefone: "(00) 0000-0002" },
    { nome: "Jurídico", email: "juridico@sindicatoeducacao.exemplo", telefone: "(00) 0000-0003" },
    { nome: "Comunicação", email: "comunicacao@sindicatoeducacao.exemplo", telefone: "(00) 0000-0004" },
    { nome: "Saúde", email: "saude@sindicatoeducacao.exemplo", telefone: "(00) 0000-0005" },
    { nome: "Lazer", email: "lazer@sindicatoeducacao.exemplo", telefone: "(00) 0000-0006" },
  ],
  /** SUBSTITUIR POR DADOS REAIS ANTES DA PUBLICAÇÃO */
  numeros: [
    { valor: "+XX", rotulo: "cidades atendidas" },
    { valor: "+XX", rotulo: "anos de atuação" },
    { valor: "+XX", rotulo: "associados" },
    { valor: "+XX", rotulo: "convênios" },
  ],
  institucional: {
    missao:
      "Representar, defender e valorizar os profissionais da educação em escolas particulares e instituições filantrópicas, garantindo condições dignas de trabalho.",
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
      "Fundado por um grupo de professoras e professores que buscavam representação própria diante das mantenedoras da região, o sindicato cresceu com assembleias de base, campanhas salariais anuais e a construção de serviços próprios de saúde e lazer. Hoje atua em toda a base territorial com assessoria jurídica, negociação coletiva e uma rede de convênios. (Texto institucional de demonstração — substitua pela história real da entidade.)",
  },
  reservaLazer: {
    valorConvidado: "R$ 00,00 por convidado (valor de demonstração)",
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
