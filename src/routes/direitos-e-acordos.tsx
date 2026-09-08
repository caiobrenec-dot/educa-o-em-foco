import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DemoNotice, EmptyState, PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cidades, documentos, tiposDocumento, type Documento } from "@/data/demo";
import { formatarData } from "@/lib/masks";

export const Route = createFileRoute("/direitos-e-acordos")({
  head: () => ({
    meta: [
      { title: "Direitos e Acordos — convenções, acordos e pisos salariais" },
      {
        name: "description",
        content:
          "Biblioteca de convenções coletivas, acordos coletivos, pisos salariais, comunicados, editais e atas de assembleia, com busca e filtros.",
      },
      { property: "og:title", content: "Direitos e Acordos" },
      { property: "og:description", content: "Consulte documentos vigentes e o histórico da categoria." },
    ],
  }),
  component: DireitosAcordos,
});

const TODOS = "todos";

function DocumentoCard({ doc }: { doc: Documento }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{doc.tipo}</Badge>
        <Badge className={doc.vigente ? "bg-action text-action-foreground" : "bg-muted text-muted-foreground"}>
          {doc.vigente ? "Vigente" : "Histórico"}
        </Badge>
      </div>
      <h3 className="mt-3 font-display text-base font-bold">{doc.titulo}</h3>
      <dl className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-foreground">Publicação: </dt>
          <dd className="inline">{formatarData(doc.publicacao)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Vigência: </dt>
          <dd className="inline">
            {formatarData(doc.vigenciaInicio)} a {formatarData(doc.vigenciaFim)}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Instituições: </dt>
          <dd className="inline">{doc.instituicoes}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Abrangência: </dt>
          <dd className="inline">{doc.abrangencia}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Categoria: </dt>
          <dd className="inline">{doc.categoriaProfissional}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("Modo demonstração", { description: "Aqui abriria a visualização do documento." })}
        >
          <Eye aria-hidden="true" /> Visualizar
        </Button>
        <Button
          size="sm"
          onClick={() => toast.info("Modo demonstração", { description: "Aqui começaria o download do PDF." })}
        >
          <Download aria-hidden="true" /> Baixar PDF
        </Button>
      </div>
    </article>
  );
}

function DireitosAcordos() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState(TODOS);
  const [ano, setAno] = useState(TODOS);
  const [cidade, setCidade] = useState(TODOS);
  const [categoria, setCategoria] = useState(TODOS);
  const [vigencia, setVigencia] = useState(TODOS);

  const anos = useMemo(() => [...new Set(documentos.map((d) => String(d.ano)))].sort().reverse(), []);
  const categorias = useMemo(() => [...new Set(documentos.map((d) => d.categoriaProfissional))], []);

  const filtrados = documentos.filter((d) => {
    const texto = `${d.titulo} ${d.instituicoes} ${d.abrangencia}`.toLowerCase();
    return (
      texto.includes(busca.toLowerCase().trim()) &&
      (tipo === TODOS || d.tipo === tipo) &&
      (ano === TODOS || String(d.ano) === ano) &&
      (cidade === TODOS || d.abrangencia.includes(cidade) || d.abrangencia.startsWith("Toda")) &&
      (categoria === TODOS || d.categoriaProfissional === categoria) &&
      (vigencia === TODOS || (vigencia === "vigentes" ? d.vigente : !d.vigente))
    );
  });

  const vigentes = filtrados.filter((d) => d.vigente);
  const historicos = filtrados.filter((d) => !d.vigente);

  return (
    <>
      <PageHeader
        title="Direitos e Acordos"
        description="Consulte convenções coletivas, acordos, pisos salariais, comunicados, editais e atas."
        breadcrumbs={[{ label: "Direitos e Acordos" }]}
      />

      <section className="section-y">
        <div className="container-page">
          <div className="max-w-3xl">
            <DemoNotice>
              Os documentos listados são exemplos e os arquivos ainda não estão anexados. Substitua por
              documentos reais e habilite os PDFs antes da publicação.
            </DemoNotice>
          </div>

          <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card lg:grid-cols-3">
            <div className="lg:col-span-3">
              <Label htmlFor="busca-doc">Buscar documento</Label>
              <Input
                id="busca-doc"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: convenção 2026, piso salarial, comunicado"
                className="mt-1.5"
              />
            </div>

            {[
              { label: "Tipo", value: tipo, set: setTipo, options: [...tiposDocumento] },
              { label: "Ano", value: ano, set: setAno, options: anos },
              { label: "Categoria profissional", value: categoria, set: setCategoria, options: categorias },
              { label: "Cidade ou região", value: cidade, set: setCidade, options: cidades },
            ].map((f) => (
              <div key={f.label}>
                <Label>{f.label}</Label>
                <Select value={f.value} onValueChange={f.set}>
                  <SelectTrigger className="mt-1.5" aria-label={f.label}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Todos</SelectItem>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div>
              <Label>Vigência</Label>
              <Select value={vigencia} onValueChange={setVigencia}>
                <SelectTrigger className="mt-1.5" aria-label="Vigência">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  <SelectItem value="vigentes">Somente vigentes</SelectItem>
                  <SelectItem value="historicos">Somente históricos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setBusca("");
                  setTipo(TODOS);
                  setAno(TODOS);
                  setCidade(TODOS);
                  setCategoria(TODOS);
                  setVigencia(TODOS);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground" role="status">
            {filtrados.length} documento(s) encontrado(s).
          </p>

          <div className="mt-8 space-y-10">
            <div>
              <SectionTitle eyebrow="Em vigor" title="Documentos vigentes" />
              {vigentes.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="Nenhum documento vigente com esses filtros"
                    description="Ajuste a busca, mude o tipo de documento ou limpe os filtros para ver todos os itens."
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {vigentes.map((d) => (
                    <DocumentoCard key={d.id} doc={d} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle eyebrow="Arquivo" title="Documentos históricos" />
              {historicos.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="Nenhum documento histórico com esses filtros"
                    description="Documentos encerrados aparecem aqui quando correspondem à busca."
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {historicos.map((d) => (
                    <DocumentoCard key={d.id} doc={d} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-4" aria-hidden="true" />
            Em caso de divergência entre o site e o documento assinado, vale sempre o documento oficial.
          </p>
        </div>
      </section>
    </>
  );
}
