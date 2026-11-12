import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Sinpro Regional" },
      { name: "description", content: "Regras de uso do site do sindicato." },
      { property: "og:title", content: "Termos de Uso" },
      { property: "og:description", content: "Regras de uso do site do sindicato." },
    ],
  }),
  component: Ptermos,
});

function Ptermos() {
  return (
    <>
      <PageHeader title="Termos de Uso" description="Regras de uso do site do sindicato." breadcrumbs={[{ label: "Termos de Uso" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
