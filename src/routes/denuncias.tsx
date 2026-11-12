import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/denuncias")({
  head: () => ({
    meta: [
      { title: "Denúncias — Sinpro Regional" },
      { name: "description", content: "Envie uma denúncia sobre irregularidades trabalhistas, com sigilo." },
      { property: "og:title", content: "Denúncias" },
      { property: "og:description", content: "Envie uma denúncia sobre irregularidades trabalhistas, com sigilo." },
    ],
  }),
  component: Pdenuncias,
});

function Pdenuncias() {
  return (
    <>
      <PageHeader title="Denúncias" description="Envie uma denúncia sobre irregularidades trabalhistas, com sigilo." breadcrumbs={[{ label: "Denúncias" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
