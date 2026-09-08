import { Link, createFileRoute } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona o sindicato — guia simples para a categoria" },
      {
        name: "description",
        content:
          "Entenda o que é um sindicato, como funcionam a representação coletiva, a convenção coletiva, o acordo coletivo, o piso salarial e as assembleias.",
      },
      { property: "og:title", content: "Como funciona o sindicato" },
      { property: "og:description", content: "Guia didático sobre representação coletiva e direitos." },
    ],
  }),
  component: ComoFunciona,
});

const topicos = [
  {
    titulo: "1. O que é um sindicato",
    texto:
      "É a entidade que representa um grupo de trabalhadores de uma mesma categoria e região. Ele fala em nome desse grupo diante das empresas e do poder público.",
    exemplo:
      "Exemplo: em vez de cada professor negociar sozinho o reajuste com a escola, o sindicato negocia um reajuste único para todos.",
  },
  {
    titulo: "2. Como funciona a representação coletiva",
    texto:
      "A categoria define suas prioridades em assembleia. O sindicato leva essa pauta às mantenedoras e negocia. O resultado vale para todos os trabalhadores da base, sejam associados ou não.",
    exemplo: "Exemplo: a assembleia aprova pedir aumento da hora-atividade; essa passa a ser a pauta oficial.",
  },
  {
    titulo: "3. O que é uma convenção coletiva (CCT)",
    texto:
      "É o documento assinado entre o sindicato dos trabalhadores e o sindicato patronal. Vale para todas as escolas representadas pelo sindicato patronal na base territorial.",
    exemplo: "Exemplo: a CCT define reajuste, piso, benefícios e regras de jornada para o ano.",
  },
  {
    titulo: "4. O que é um acordo coletivo (ACT)",
    texto:
      "É negociado com uma instituição específica. Vale apenas para os trabalhadores daquela escola ou mantenedora e pode trazer condições diferentes da CCT, desde que não sejam piores no conjunto.",
    exemplo: "Exemplo: uma faculdade negocia um calendário próprio de pagamento com o sindicato.",
  },
  {
    titulo: "5. O que é um piso salarial",
    texto:
      "É o menor salário que pode ser pago para cada função da categoria. Nenhum contrato pode ficar abaixo dele.",
    exemplo: "Exemplo: se o piso da função é R$ X por hora-aula, a escola não pode pagar menos que isso.",
  },
  {
    titulo: "6. Quem pode procurar o sindicato",
    texto:
      "Qualquer profissional da base territorial, associado ou não, pode buscar orientação sobre direitos. Serviços como convênios, clínica e sede campestre são exclusivos de associados.",
    exemplo: "Exemplo: quem foi demitido pode pedir a conferência da rescisão antes de assinar.",
  },
  {
    titulo: "7. Diferença entre ser representado e ser associado",
    texto:
      "Toda a categoria é representada nas negociações. Ser associado é uma escolha: garante atendimento individual, benefícios e direito a voto nas assembleias.",
    exemplo: "Exemplo: o reajuste chega a todos; o desconto na farmácia conveniada, só a quem é associado.",
  },
  {
    titulo: "8. Como participar de assembleias",
    texto:
      "As assembleias são divulgadas com antecedência no site e nos canais oficiais, com data, horário, local e pauta. Basta comparecer (ou entrar na sala virtual) no horário indicado.",
    exemplo: "Exemplo: assembleias de campanha salarial costumam votar a pauta e depois a proposta final.",
  },
];

function ComoFunciona() {
  return (
    <>
      <PageHeader
        title="Como funciona"
        description="Um guia direto, sem juridiquês, para entender a representação sindical no dia a dia."
        breadcrumbs={[{ label: "O Sindicato", to: "/o-sindicato" }, { label: "Como funciona" }]}
      />

      <section className="section-y">
        <div className="container-page max-w-3xl">
          <SectionTitle
            eyebrow="Passo a passo"
            title="Do básico ao dia a dia"
            description="Leia na ordem ou vá direto ao tópico que você precisa."
          />

          <div className="mt-8 space-y-6">
            {topicos.map((t) => (
              <article key={t.titulo} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold text-foreground">{t.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.texto}</p>
                <p className="mt-4 flex gap-2 rounded-lg bg-highlight/15 p-3 text-sm text-foreground">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-highlight-foreground" aria-hidden="true" />
                  {t.exemplo}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="bg-action text-action-foreground hover:bg-action/90">
              <Link to="/quero-me-associar">Quero me associar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/direitos-e-acordos">Consultar documentos</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
