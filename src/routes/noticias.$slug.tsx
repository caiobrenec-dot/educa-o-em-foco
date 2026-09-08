import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { noticias } from "@/data/demo";
import { formatarData } from "@/lib/masks";

export const Route = createFileRoute("/noticias/$slug")({
  loader: ({ params }) => {
    const noticia = noticias.find((n) => n.slug === params.slug);
    if (!noticia) throw notFound();
    return { noticia };
  },
  head: ({ loaderData }) => {
    const n = loaderData?.noticia;
    return {
      meta: [
        { title: n ? `${n.titulo} — Notícias do sindicato` : "Notícia não encontrada" },
        { name: "description", content: n?.resumo ?? "Notícia do sindicato dos profissionais da educação." },
        { property: "og:title", content: n?.titulo ?? "Notícia" },
        { property: "og:description", content: n?.resumo ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: NoticiaDetalhe,
});

function NoticiaDetalhe() {
  const { noticia } = Route.useLoaderData();
  const relacionadas = noticias.filter((n) => n.slug !== noticia.slug && n.categoria === noticia.categoria).slice(0, 3);

  return (
    <>
      <PageHeader
        title={noticia.titulo}
        breadcrumbs={[{ label: "Notícias", to: "/noticias" }, { label: noticia.categoria }]}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/85">
          <Badge className="bg-highlight text-highlight-foreground">{noticia.categoria}</Badge>
          <time dateTime={noticia.data}>{formatarData(noticia.data)}</time>
          <span>Por {noticia.autor}</span>
        </div>
      </PageHeader>

      <article className="section-y">
        <div className="container-page max-w-3xl">
          <img
            src={noticia.imagem}
            alt={`Imagem ilustrativa da notícia: ${noticia.titulo}`}
            className="w-full rounded-xl object-cover shadow-card"
          />
          <p className="mt-6 text-lg font-medium text-foreground">{noticia.resumo}</p>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            {noticia.conteudo.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <p className="mt-8 rounded-lg bg-surface p-4 text-sm text-muted-foreground">
            Conteúdo de demonstração criado para este protótipo. Substitua por matérias reais publicadas pela
            equipe de comunicação.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/noticias">Voltar para notícias</Link>
            </Button>
            <Button asChild>
              <Link to="/direitos-e-acordos">Ver documentos da categoria</Link>
            </Button>
          </div>

          {relacionadas.length > 0 ? (
            <section className="mt-12">
              <h2 className="font-display text-xl font-bold">Leia também</h2>
              <ul className="mt-4 space-y-3">
                {relacionadas.map((r) => (
                  <li key={r.slug} className="rounded-xl border border-border bg-card p-4">
                    <Link
                      to="/noticias/$slug"
                      params={{ slug: r.slug }}
                      className="font-medium text-brand underline-offset-4 hover:underline"
                    >
                      {r.titulo}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{r.resumo}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
