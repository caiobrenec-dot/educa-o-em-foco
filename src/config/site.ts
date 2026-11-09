/**
 * CONFIGURAÇÃO OFICIAL — SINPRO LONDRINA
 * ------------------------------------------------------------------
 * Sindicato dos Profissionais da Educação de Londrina e Região Norte do PR.
 * Dados reais extraídos do portal institucional sinprolondrina.com.br
 */

import logo from "@/assets/logo-sindicato.png";

export const site = {
  nome: "Sinpro Londrina — Sindicato dos Profissionais da Educação",
  nomeCurto: "Sinpro Londrina",
  slogan: "Informação, defesa e benefícios para quem trabalha na educação",
  descricao:
    "Sindicato dos Professores das Escolas Particulares e dos Centros de Educação Infantil Filantrópicos de Londrina e de 59 municípios da Região Norte do Paraná.",
  logo,
  contato: {
    endereco: "Rua Delaine Negro, nº 75 — Residencial Ilha Bela",
    cidade: "Londrina / PR",
    cep: "86055-680",
    telefone: "(43) 3374-0900",
    whatsapp: "(43) 3374-0900",
    email: "sinpro@sercomtel.com.br",
    horario: "Segunda a sexta, das 8h às 12h e das 13h30 às 18h",
    mapaEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.5684687588234!2d-51.1895697237894!3d-23.33145455325608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94eb4377063fa7b5%3A0x6b10787e91eb7e1!2sR.%20Delaine%20Negro%2C%2075%20-%20Res.%20Ilha%20Bela%2C%20Londrina%20-%20PR%2C%2086055-680!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
  },
  setores: [
    { nome: "Administração Geral", email: "sinpro@sercomtel.com.br", telefone: "(43) 3374-0900" },
    { nome: "Departamento Jurídico", email: "juridico@sinprolondrina.com.br", telefone: "(43) 3374-0900" },
    { nome: "Sinpro Especialidades (Saúde)", email: "especialidades@sinprolondrina.com.br", telefone: "(43) 3374-0900" },
    { nome: "Sinpro Campestre (Lazer)", email: "campestre@sinprolondrina.com.br", telefone: "(43) 3374-0900" },
    { nome: "Comunicação e Imprensa", email: "comunicacao@sinprolondrina.com.br", telefone: "(43) 3374-0900" },
    { nome: "Financeiro e Guias Online", email: "financeiro@sinprolondrina.com.br", telefone: "(43) 3374-0900" },
  ],
  numeros: [
    { valor: "+59", rotulo: "cidades na base territorial" },
    { valor: "+30", rotulo: "anos de luta e conquistas" },
    { valor: "+4.000", rotulo: "profissionais representados" },
    { valor: "+120", rotulo: "convênios e parcerias" },
  ],
  institucional: {
    missao:
      "Representar, defender e valorizar professores e funcionários da rede particular de ensino e dos Centros de Educação Infantil filantrópicos de Londrina e Norte do Paraná, garantindo piso digno, saúde e qualidade de vida.",
    visao:
      "Ser uma entidade sindical moderna, acolhedora e combativa, referência no Paraná em conquista de direitos trabalhistas, assistência à saúde e integração da categoria.",
    valores: [
      "Defesa intransigente dos direitos trabalhistas e da dignidade docente",
      "Transparência financeira e diálogo permanente com a base",
      "Saúde preventiva e multidisciplinar no Sinpro Especialidades",
      "Integração e bem-estar das famílias no Sinpro Campestre",
      "Educação de excelência como direito fundamental da sociedade",
    ],
    historia:
      "O Sinpro Londrina nasceu da mobilização dos professores e professoras do ensino privado e dos Centros de Educação Infantil filantrópicos de Londrina e de toda a região Norte do Paraná. Ao longo de décadas de atuação, o sindicato consolidou convenções coletivas pioneiras, assessoria jurídica ativa e gratuita aos associados, atendimento multidisciplinar na área de saúde (Sinpro Especialidades) e um moderno complexo de lazer na Sede Campestre. Uma história construída lado a lado com os profissionais da educação.",
  },
  reservaLazer: {
    valorConvidado: "Consultar taxas e normas vigentes na secretaria",
    horarios: "Terça a domingo, das 8h às 22h",
  },
} as const;

export const menu = [
  { label: "O Sindicato", to: "/o-sindicato" },
  { label: "Direitos e Acordos", to: "/direitos-e-acordos" },
  { label: "Benefícios", to: "/beneficios" },
  { label: "Saúde (Especialidades)", to: "/saude" },
  { label: "Lazer (Campestre)", to: "/lazer" },
  { label: "Notícias", to: "/noticias" },
  { label: "Eventos", to: "/eventos" },
  { label: "Contato", to: "/contato" },
] as const;
