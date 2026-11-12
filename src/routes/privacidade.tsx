import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Sinpro Regional" },
      { name: "description", content: "Como tratamos seus dados pessoais." },
      { property: "og:title", content: "Política de Privacidade" },
      { property: "og:description", content: "Como tratamos seus dados pessoais." },
    ],
  }),
  component: Pprivacidade,
});

function Pprivacidade() {
  return (
    <>
      <PageHeader title="Política de Privacidade" description="Como tratamos seus dados pessoais." breadcrumbs={[{ label: "Política de Privacidade" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
