import { createFileRoute } from "@tanstack/react-router";

import { DemoNotice, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Sinpro Regional" },
      { name: "description", content: "Fale com o sindicato: telefones, e-mail, endereço e horário de atendimento." },
      { property: "og:title", content: "Contato" },
      { property: "og:description", content: "Fale com o sindicato: telefones, e-mail, endereço e horário de atendimento." },
    ],
  }),
  component: Pcontato,
});

function Pcontato() {
  return (
    <>
      <PageHeader title="Contato" description="Fale com o sindicato: telefones, e-mail, endereço e horário de atendimento." breadcrumbs={[{ label: "Contato" }]} />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <DemoNotice>Esta página ainda está em construção no protótipo.</DemoNotice>
        </div>
      </section>
    </>
  );
}
