import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DemoNotice, EmptyState, PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoriasConvenio, cidades, convenios } from "@/data/demo";
import { formatarData } from "@/lib/masks";

export const Route = createFileRoute("/beneficios")({
  head: () => ({
    meta: [
      { title: "Benefícios e convênios para associados do sindicato" },
      {
        name: "description",
        content:
          "Descontos em saúde, educação, farmácias, óticas, academias, restaurantes e lazer para associados e dependentes, com busca por categoria e cidade.",
      },
      { property: "og:title", content: "Benefícios e convênios" },
      { property: "og:description", content: "Rede de descontos para associados e dependentes." },
    ],
  }),
  component: Beneficios,
});

const TODOS = "todos";

function Beneficios() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState(TODOS);
  const [cidade, setCidade] = useState(TODOS);

  const filtrados = convenios.filter(
    (c) =>
      `${c.nome} ${c.descricao} ${c.beneficio}`.toLowerCase().includes(busca.toLowerCase().trim()) &&
      (categoria === TODOS || c.categoria === categoria) &&
      (cidade === TODOS || c.cidade === cidade),
  );

  return (
    <>
      <PageHeader
        title="Benefícios"
        description="Rede de convênios com desconto para associados e seus dependentes."
        breadcrumbs={[{ label: "Benefícios" }]}
      />

      <section className="section-y">
        <div className="container-page">
          <div className="max-w-3xl">
            <DemoNotice>
              Todos os parceiros abaixo são fictícios, assim como os percentuais de desconto. Substitua pela
              rede real de convênios.
            </DemoNotice>
          </div>

          <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card md:grid-cols-3">
            <div>
              <Label htmlFor="busca-conv">Buscar parceiro</Label>
              <Input
                id="busca-conv"
                className="mt-1.5"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: farmácia, academia, faculdade"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="mt-1.5" aria-label="Categoria do convênio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todas</SelectItem>
                  {categoriasConvenio.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Select value={cidade} onValueChange={setCidade}>
                <SelectTrigger className="mt-1.5" aria-label="Cidade do convênio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todas</SelectItem>
                  {cidades.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground" role="status">
            {filtrados.length} convênio(s) encontrado(s).
          </p>

          {filtrados.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="Nenhum convênio encontrado"
                description="Tente outra palavra, mude a categoria ou selecione outra cidade."
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((c) => (
                <article key={c.id} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card">
                  <Badge variant="secondary" className="w-fit">
                    {c.categoria}
                  </Badge>
                  <h2 className="mt-3 font-display text-base font-bold">{c.nome}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{c.descricao}</p>
                  <p className="mt-3 rounded-lg bg-action/10 px-3 py-2 text-sm font-semibold text-action">
                    {c.beneficio}
                  </p>
                  <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <div>
                      <dt className="inline font-medium text-foreground">Cidade: </dt>
                      <dd className="inline">{c.cidade}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-foreground">Como usar: </dt>
                      <dd className="inline">{c.documentos}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-foreground">Atualizado em: </dt>
                      <dd className="inline">{formatarData(c.atualizadoEm)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="container-page">
          <SectionTitle
            eyebrow="Como aproveitar"
            title="Regras gerais de uso dos convênios"
            description="Cada parceiro pode ter condições próprias. Confirme antes de usar."
          />
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "Os descontos são exclusivos para associados em dia e seus dependentes cadastrados.",
              "Apresente a carteirinha digital do associado junto com um documento com foto.",
              "Descontos não são cumulativos com outras promoções, salvo indicação do parceiro.",
              "A relação de parceiros pode mudar; consulte esta página antes de agendar.",
            ].map((r) => (
              <li key={r} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-action text-action-foreground hover:bg-action/90">
              <Link to="/quero-me-associar">Quero me associar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contato">Indicar um parceiro</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
