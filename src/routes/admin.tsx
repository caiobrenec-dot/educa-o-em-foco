import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Sinpro Regional" },
      { name: "description", content: "Gestão de conteúdos do site (demonstração)." },
      { property: "og:title", content: "Painel administrativo" },
      { property: "og:description", content: "Gestão de conteúdos do site (demonstração)." },
    ],
  }),
  component: Padmin,
});

function Padmin() {
  return (
    <>
      <PageHeader title="Painel administrativo" description="Gestão de conteúdos do site (demonstração)." breadcrumbs={[{ label: "Painel administrativo" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
