import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/lazer")({
  head: () => ({
    meta: [
      { title: "Lazer — Sinpro Regional" },
      { name: "description", content: "Sede campestre, reservas e regras de uso para associados." },
      { property: "og:title", content: "Lazer" },
      { property: "og:description", content: "Sede campestre, reservas e regras de uso para associados." },
    ],
  }),
  component: Plazer,
});

function Plazer() {
  return (
    <>
      <PageHeader title="Lazer" description="Sede campestre, reservas e regras de uso para associados." breadcrumbs={[{ label: "Lazer" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
