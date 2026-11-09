import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  FileText,
  Gavel,
  GraduationCap,
  HandCoins,
  HeartPulse,
  MessageSquare,
  Scale,
  ShieldCheck,
  Stethoscope,
  Tent,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

import { DemoNotice, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/config/site";
import { categoriasNoticias, depoimentos, imagens, noticias } from "@/data/demo";
import { formatarData } from "@/lib/masks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sinpro Londrina — Sindicato dos Profissionais da Educação" },
      {
        name: "description",
        content:
          "Conheça seus direitos, acompanhe as negociações coletivas e acesse benefícios, saúde e lazer para profissionais da educação.",
      },
      { property: "og:title", content: "Sinpro Londrina" },
      {
        property: "og:description",
        content: "Informação, defesa e benefícios para quem trabalha na educação.",
      },
    ],
  }),
  component: Index,
});

const acessoRapido = [
  { icon: UserPlus, titulo: "Quero me associar", texto: "Preencha o cadastro em poucos minutos.", to: "/quero-me-associar" },
  { icon: FileText, titulo: "Consultar acordos coletivos", texto: "Convenções, acordos e pisos salariais.", to: "/direitos-e-acordos" },
  { icon: Scale, titulo: "Preciso de orientação jurídica", texto: "Fale com o departamento jurídico.", to: "/contato" },
  { icon: HandCoins, titulo: "Quero usar os benefícios", texto: "Descontos e convênios em toda a base.", to: "/beneficios" },
  { icon: Stethoscope, titulo: "Quero agendar atendimento de saúde", texto: "Psicologia, odontologia e mais.", to: "/saude" },
  { icon: MessageSquare, titulo: "Quero falar com o sindicato", texto: "Telefone, WhatsApp, e-mail e endereço.", to: "/contato" },
] as const;

const beneficios = [
  { icon: Scale, titulo: "Assistência jurídica", texto: "Orientação trabalhista individual e defesa coletiva da categoria." },
  { icon: Gavel, titulo: "Negociação coletiva", texto: "Campanha salarial anual, pauta construída em assembleia." },
  { icon: HandCoins, titulo: "Convênios e descontos", texto: "Rede de parceiros em saúde, educação, lazer e serviços." },
  { icon: HeartPulse, titulo: "Atendimento em saúde", texto: "Especialidades para associados e dependentes." },
  { icon: Tent, titulo: "Espaço de lazer", texto: "Sede recreativa com piscinas, quadras e salão de eventos." },
  { icon: GraduationCap, titulo: "Cursos e formação", texto: "Formação continuada com certificado para a categoria." },
] as const;

function Index() {
  const [categoria, setCategoria] = useState<string>("Todas");
  const listadas = noticias
    .filter((n) => categoria === "Todas" || n.categoria === categoria)
    .slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <Badge className="bg-action text-action-foreground hover:bg-action">Representação sindical</Badge>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Informação, defesa e benefícios para quem trabalha na educação
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              Conheça seus direitos, participe das negociações coletivas e tenha acesso a serviços
              exclusivos para profissionais da educação.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-action text-action-foreground hover:bg-action/90">
                <Link to="/quero-me-associar">Quero me associar</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/o-sindicato">Conheça o sindicato</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-lift">
            <img
              src={imagens.heroEducacao}
              alt="Grupo de profissionais da educação reunidos no corredor de uma escola"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ACESSO RÁPIDO */}
      <section className="section-y bg-surface">
        <div className="container-page">
          <SectionTitle
            eyebrow="Comece por aqui"
            title="O que você precisa hoje?"
            description="Escolha uma das opções abaixo para ir direto ao ponto."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {acessoRapido.map((c) => (
              <Link
                key={c.titulo}
                to={c.to}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <c.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{c.titulo}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.texto}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Acessar
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE É O SINDICATO */}
      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src={imagens.assembleia}
              alt="Profissionais participando de uma assembleia com as mãos levantadas em votação"
              width={1200}
              height={800}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <SectionTitle
              eyebrow="Entenda em 1 minuto"
              title="O que é o sindicato?"
              description="O sindicato é a organização que representa quem trabalha na educação. Ele negocia melhores condições de trabalho com as escolas e mantenedoras, orienta sobre direitos e oferece serviços e benefícios aos associados."
            />
            <ul className="mt-6 space-y-3 text-sm text-foreground">
              {[
                "Negocia salários, jornada e condições em nome de toda a categoria.",
                "Orienta sobre férias, hora-atividade, rescisão e outros direitos.",
                "Oferece convênios, atendimento em saúde e espaço de lazer aos associados.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-action" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7">
              <Link to="/como-funciona">Saiba como funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      {/* ATENÇÃO: números institucionais são PLACEHOLDERS (src/config/site.ts → numeros).
          Substitua por dados reais antes da publicação. */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {site.numeros.map((n) => (
              <div key={n.rotulo} className="rounded-xl bg-primary-foreground/10 p-6 text-center">
                <p className="font-display text-4xl font-extrabold">{n.valor}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">{n.rotulo}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-primary-foreground/70">
            Valores em formato de placeholder (+XX). Substitua pelos números reais da entidade antes da publicação.
          </p>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="section-y">
        <div className="container-page">
          <SectionTitle eyebrow="Para associados" title="Principais benefícios" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beneficios.map((b) => (
              <Card key={b.titulo} className="border-border shadow-card">
                <CardHeader>
                  <span className="inline-flex size-11 items-center justify-center rounded-lg bg-action/12 text-action">
                    <b.icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="mt-3 font-display text-lg">{b.titulo}</CardTitle>
                  <CardDescription>{b.texto}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-8">
            <Link to="/beneficios">Ver todos os convênios</Link>
          </Button>
        </div>
      </section>

      {/* DIREITOS E ACORDOS */}
      <section className="section-y bg-surface">
        <div className="container-page grid gap-8 rounded-2xl border border-border bg-card p-8 shadow-card lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow="Transparência"
              title="Direitos e acordos"
              description="Consulte os documentos que garantem seus direitos, com histórico e período de vigência."
            />
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {["Pisos salariais", "Convenções coletivas", "Acordos coletivos", "Comunicados importantes"].map((t) => (
                <li key={t} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-sm">
                  <BookOpen className="size-4 text-brand" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:text-right">
            <Button asChild size="lg">
              <Link to="/direitos-e-acordos">Consultar documentos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NOTÍCIAS */}
      <section className="section-y">
        <div className="container-page">
          <SectionTitle eyebrow="Comunicação" title="Notícias" />
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar notícias por categoria">
            {["Todas", ...categoriasNoticias].map((c) => (
              <Button
                key={c}
                size="sm"
                variant={categoria === c ? "default" : "outline"}
                onClick={() => setCategoria(c)}
                aria-pressed={categoria === c}
              >
                {c}
              </Button>
            ))}
          </div>

          {listadas.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhuma notícia publicada nesta categoria por enquanto. Escolha outra categoria ou veja todas.
            </p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {listadas.map((n) => (
                <article key={n.slug} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
                  <img
                    src={n.imagem}
                    alt={`Imagem da notícia: ${n.titulo}`}
                    width={800}
                    height={520}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary">{n.categoria}</Badge>
                      <time dateTime={n.data} className="text-muted-foreground">
                        {formatarData(n.data)}
                      </time>
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold leading-snug">{n.titulo}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.resumo}</p>
                    <Button asChild variant="link" className="mt-auto justify-start px-0">
                      <Link to="/noticias/$slug" params={{ slug: n.slug }}>
                        Ler notícia
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="section-y bg-surface">
        <div className="container-page">
          <SectionTitle eyebrow="Vozes da categoria" title="Depoimentos" />
          <div className="mt-5 max-w-3xl">
            <DemoNotice>
              Os depoimentos abaixo são fictícios e servem apenas como exemplo de layout. Substitua por
              depoimentos reais, com autorização das pessoas citadas.
            </DemoNotice>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {depoimentos.map((d) => (
              <figure key={d.nome} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <blockquote className="text-sm text-foreground">“{d.texto}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{d.nome}</span>
                    <span className="block text-xs text-muted-foreground">{d.cargo}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-primary py-14 text-primary-foreground">
        <div className="container-page text-center">
          <h2 className="text-2xl font-extrabold lg:text-3xl">
            Fortaleça a categoria e conheça seus benefícios
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/85">
            Associar-se é apoiar a negociação coletiva e ter acesso a serviços pensados para quem
            trabalha na educação.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-action text-action-foreground hover:bg-action/90">
              <Link to="/quero-me-associar">Quero me associar</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contato">Entrar em contato</Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-primary-foreground/70">
            <CalendarCheck className="size-4" aria-hidden="true" />
            Protótipo com dados de demonstração — configure conteúdos reais em src/config/site.ts e src/data/demo.ts
          </p>
        </div>
      </section>
    </>
  );
}
