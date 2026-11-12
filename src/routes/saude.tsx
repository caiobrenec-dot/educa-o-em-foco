import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/saude")({
  head: () => ({
    meta: [
      { title: "Saúde — Sinpro Regional" },
      { name: "description", content: "Clínica de especialidades e profissionais de saúde para associados." },
      { property: "og:title", content: "Saúde" },
      { property: "og:description", content: "Clínica de especialidades e profissionais de saúde para associados." },
    ],
  }),
  component: Psaude,
});

function Psaude() {
  return (
    <>
      <PageHeader title="Saúde" description="Clínica de especialidades e profissionais de saúde para associados." breadcrumbs={[{ label: "Saúde" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
