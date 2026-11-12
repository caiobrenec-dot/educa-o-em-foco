import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/quero-me-associar")({
  head: () => ({
    meta: [
      { title: "Quero me associar — Sinpro Regional" },
      { name: "description", content: "Faça sua filiação ao sindicato." },
      { property: "og:title", content: "Quero me associar" },
      { property: "og:description", content: "Faça sua filiação ao sindicato." },
    ],
  }),
  component: Pquero_me_associar,
});

function Pquero_me_associar() {
  return (
    <>
      <PageHeader title="Quero me associar" description="Faça sua filiação ao sindicato." breadcrumbs={[{ label: "Quero me associar" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
