import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, MapPin, Users } from "lucide-react";

import { DemoNotice, PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/config/site";
import { cidades, conselhoFiscal, diretoria, estruturaAdministrativa, faq } from "@/data/demo";

export const Route = createFileRoute("/o-sindicato")({
  head: () => ({
    meta: [
      { title: "O Sindicato — história, missão, diretoria e base territorial" },
      {
        name: "description",
        content:
          "Conheça a história, a missão, a diretoria, o conselho fiscal e as cidades atendidas pelo sindicato dos profissionais da educação.",
      },
      { property: "og:title", content: "O Sindicato" },
      { property: "og:description", content: "História, missão, diretoria e base territorial da entidade." },
    ],
  }),
  component: OSindicato,
});

const diferencas = [
  {
    titulo: "Sindicato",
    texto:
      "Representa os trabalhadores. Negocia convenções e acordos coletivos, orienta sobre direitos e defende a categoria.",
  },
  {
    titulo: "Escola / mantenedora",
    texto: "É a empregadora. Contrata, paga salários e cumpre o que está previsto na convenção coletiva.",
  },
  {
    titulo: "Plano de saúde",
    texto:
      "É um serviço contratado, com regras próprias de carência e cobertura. O sindicato pode ter convênios, mas não é operadora de saúde.",
  },
  {
    titulo: "Associação recreativa",
    texto:
      "Cuida de lazer e convivência. Aqui, a sede campestre é um benefício aos associados, e não a atividade principal da entidade.",
  },
];

function OSindicato() {
  return (
    <>
      <PageHeader
        title="O Sindicato"
        description={site.descricao}
        breadcrumbs={[{ label: "O Sindicato" }]}
      />

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionTitle eyebrow="Nossa trajetória" title="História" />
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {site.institucional.historia}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Missão</CardTitle>
                  <CardDescription>{site.institucional.missao}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Visão</CardTitle>
                  <CardDescription>{site.institucional.visao}</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <h3 className="mt-8 font-display text-lg font-bold">Valores</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {site.institucional.valores.map((v) => (
                <li key={v} className="rounded-lg bg-surface px-4 py-3 text-sm">
                  {v}
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Users className="size-5 text-brand" aria-hidden="true" />
                  Quem o sindicato representa
                </CardTitle>
                <CardDescription>
                  Professores e funcionários administrativos de escolas particulares e de Centros de
                  Educação Infantil filantrópicos da base territorial, associados ou não.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <MapPin className="size-5 text-brand" aria-hidden="true" />
                  Base territorial
                </CardTitle>
                <CardDescription>
                  A representação alcança os municípios da região Norte do Paraná listados abaixo.
                  Atualize a lista completa em src/data/demo.ts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-wrap gap-2">
                  {cidades.map((c) => (
                    <li key={c} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="container-page">
          <SectionTitle eyebrow="Gestão" title="Diretoria e conselho fiscal" />
          <div className="mt-5 max-w-3xl">
            <DemoNotice>
              Os nomes abaixo são fictícios. Substitua pelos integrantes reais da gestão atual.
            </DemoNotice>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold">Diretoria executiva</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {diretoria.map((d) => (
                  <li key={d.cargo} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <p className="text-sm font-semibold">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">{d.cargo}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Conselho fiscal</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {conselhoFiscal.map((d) => (
                  <li key={d.nome} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <p className="text-sm font-semibold">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">{d.cargo}</p>
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 font-display text-lg font-bold">Estrutura administrativa</h3>
              <ul className="mt-4 space-y-3">
                {estruturaAdministrativa.map((e) => (
                  <li key={e.setor} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                    <Building2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold">{e.setor}</span>
                      <span className="block text-xs text-muted-foreground">{e.descricao}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionTitle
            eyebrow="Sem confusão"
            title="Sindicato, escola, plano de saúde e clube: qual é a diferença?"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {diferencas.map((d) => (
              <Card key={d.titulo}>
                <CardHeader>
                  <CardTitle className="font-display text-base">{d.titulo}</CardTitle>
                  <CardDescription>{d.texto}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="container-page max-w-3xl">
          <SectionTitle eyebrow="Dúvidas comuns" title="Perguntas frequentes" />
          <Accordion type="single" collapsible className="mt-6">
            {faq.map((f, i) => (
              <AccordionItem key={f.p} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.p}</AccordionTrigger>
                <AccordionContent>{f.r}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/como-funciona">Saiba como funciona</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contato">Falar com o sindicato</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
