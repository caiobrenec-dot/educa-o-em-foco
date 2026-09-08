import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DemoNotice, EmptyState, PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventos, tiposEvento, type Evento } from "@/data/demo";
import { formatarData, gerarProtocolo } from "@/lib/masks";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Agenda de eventos, assembleias e cursos do sindicato" },
      {
        name: "description",
        content:
          "Assembleias, cursos, palestras, campanhas e eventos recreativos do sindicato, com data, local, público e inscrição.",
      },
      { property: "og:title", content: "Agenda de eventos" },
      { property: "og:description", content: "Assembleias, cursos, palestras e campanhas da categoria." },
    ],
  }),
  component: Eventos,
});

const TODOS = "todos";
const hoje = new Date().toISOString().slice(0, 10);

function EventoCard({ ev }: { ev: Evento }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card">
      <Badge variant="secondary" className="w-fit">
        {ev.tipo}
      </Badge>
      <h3 className="mt-3 font-display text-base font-bold">{ev.titulo}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{ev.descricao}</p>
      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 text-brand" aria-hidden="true" />
          <time dateTime={ev.data}>{formatarData(ev.data)}</time>
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4 text-brand" aria-hidden="true" />
          {ev.horario}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 text-brand" aria-hidden="true" />
          {ev.local}
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Público: {ev.publico}</p>
      {ev.inscricao ? (
        <Button
          className="mt-4 bg-action text-action-foreground hover:bg-action/90"
          onClick={() =>
            toast.success("Inscrição registrada (demonstração)", {
              description: `Protocolo ${gerarProtocolo("EV")}. Nenhum dado foi enviado.`,
            })
          }
        >
          Fazer inscrição
        </Button>
      ) : (
        <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
          Participação livre para o público indicado, sem inscrição prévia.
        </p>
      )}
    </article>
  );
}

function Eventos() {
  const [tipo, setTipo] = useState(TODOS);

  const filtrados = eventos.filter((e) => tipo === TODOS || e.tipo === tipo);
  const proximos = filtrados.filter((e) => e.data >= hoje);
  const anteriores = filtrados.filter((e) => e.data < hoje);

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Assembleias, cursos, palestras, campanhas e atividades recreativas."
        breadcrumbs={[{ label: "Eventos" }]}
      />

      <section className="section-y">
        <div className="container-page">
          <div className="max-w-3xl">
            <DemoNotice>Datas e atividades são fictícias, criadas para demonstrar a agenda.</DemoNotice>
          </div>

          <div className="mt-8 max-w-xs">
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger aria-label="Filtrar por tipo de evento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os tipos</SelectItem>
                {tiposEvento.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-10 space-y-12">
            <div>
              <SectionTitle eyebrow="Agenda" title="Próximos eventos" />
              {proximos.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="Nenhum evento futuro para esse filtro"
                    description="Escolha outro tipo de evento ou volte em breve: a agenda é atualizada com frequência."
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {proximos.map((e) => (
                    <EventoCard key={e.id} ev={e} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle eyebrow="Histórico" title="Eventos realizados" />
              {anteriores.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="Ainda não há eventos realizados nessa categoria"
                    description="Assim que uma atividade acontecer, ela aparece aqui como registro."
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {anteriores.map((e) => (
                    <EventoCard key={e.id} ev={e} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
