import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/area-do-associado")({
  head: () => ({
    meta: [
      { title: "Área do Associado — Sinpro Regional" },
      { name: "description", content: "Acesse seus dados, solicitações e reservas." },
      { property: "og:title", content: "Área do Associado" },
      { property: "og:description", content: "Acesse seus dados, solicitações e reservas." },
    ],
  }),
  component: Parea_do_associado,
});

function Parea_do_associado() {
  return (
    <>
      <PageHeader title="Área do Associado" description="Acesse seus dados, solicitações e reservas." breadcrumbs={[{ label: "Área do Associado" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
