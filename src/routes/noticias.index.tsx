import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DemoNotice, EmptyState, PageHeader } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoriasNoticias, noticias } from "@/data/demo";
import { formatarData } from "@/lib/masks";

export const Route = createFileRoute("/noticias/")({
  head: () => ({
    meta: [
      { title: "Notícias e comunicados do sindicato da educação" },
      {
        name: "description",
        content:
          "Acompanhe notícias, comunicados e resultados de negociação do sindicato dos profissionais da educação, com busca e filtro por categoria.",
      },
      { property: "og:title", content: "Notícias do sindicato" },
      { property: "og:description", content: "Negociações, direitos, saúde, eventos e benefícios." },
    ],
  }),
  component: Noticias,
});

const TODAS = "todas";

function Noticias() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>(TODAS);

  const filtradas = noticias.filter(
    (n) =>
      `${n.titulo} ${n.resumo}`.toLowerCase().includes(busca.toLowerCase().trim()) &&
      (categoria === TODAS || n.categoria === categoria),
  );

  return (
    <>
      <PageHeader
        title="Notícias"
        description="Negociações, direitos, saúde, eventos e benefícios da categoria."
        breadcrumbs={[{ label: "Notícias" }]}
      />

      <section className="section-y">
        <div className="container-page">
          <div className="max-w-3xl">
            <DemoNotice>As notícias abaixo são exemplos criados para o protótipo.</DemoNotice>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-md">
              <Label htmlFor="busca-noticia">Buscar notícia</Label>
              <Input
                id="busca-noticia"
                className="mt-1.5"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: campanha salarial, hora-atividade"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[TODAS, ...categoriasNoticias].map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={categoria === c ? "default" : "outline"}
                  onClick={() => setCategoria(c)}
                >
                  {c === TODAS ? "Todas" : c}
                </Button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground" role="status">
            {filtradas.length} notícia(s) encontrada(s).
          </p>

          {filtradas.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="Nenhuma notícia encontrada"
                description="Tente outro termo de busca ou selecione a categoria “Todas”."
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtradas.map((n) => (
                <article
                  key={n.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
                >
                  <img
                    src={n.imagem}
                    alt={`Imagem ilustrativa da notícia: ${n.titulo}`}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{n.categoria}</Badge>
                      <time className="text-xs text-muted-foreground" dateTime={n.data}>
                        {formatarData(n.data)}
                      </time>
                    </div>
                    <h2 className="mt-3 font-display text-base font-bold leading-snug">{n.titulo}</h2>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{n.resumo}</p>
                    <Link
                      to="/noticias/$slug"
                      params={{ slug: n.slug }}
                      className="mt-4 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                    >
                      Ler notícia completa
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
