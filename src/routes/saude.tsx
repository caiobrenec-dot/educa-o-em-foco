import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  MapPin,
  Phone,
  Smile,
  Stethoscope,
  Users,
} from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/config/site";

export const Route = createFileRoute("/saude")({
  head: () => ({
    meta: [
      { title: "Sinpro Especialidades — Saúde e Bem-Estar dos Professores" },
      {
        name: "description",
        content:
          "Atendimento multidisciplinar em Odontologia, Psicologia, Fisioterapia, Fonoaudiologia e Nutrição para associados e dependentes do Sinpro Londrina.",
      },
      { property: "og:title", content: "Sinpro Especialidades" },
      { property: "og:description", content: "Saúde e bem-estar integral para profissionais da educação." },
    ],
  }),
  component: Saude,
});

const especialidadesLista = [
  {
    nome: "Odontologia",
    icone: Smile,
    descricao: "Prevenção, restaurações, profilaxia, tratamento periodontal e orientação em saúde bucal para você e sua família.",
    beneficio: "Atendimento gratuito e procedimentos com subsídio do sindicato",
    modalidade: "Presencial na Sede",
  },
  {
    nome: "Psicologia",
    icone: HeartPulse,
    descricao: "Acolhimento clínico focado em saúde mental docente, síndrome de burnout, estresse e desafios da rotina educacional.",
    beneficio: "Sessões semanais com coparticipação social",
    modalidade: "Presencial e Online",
  },
  {
    nome: "Fisioterapia",
    icone: ActivityIcon,
    descricao: "Tratamento de LER/DORT, dores posturais, reabilitação física e ergonomia para quem passa horas em pé ou em sala.",
    beneficio: "Sessões individuais personalizadas",
    modalidade: "Presencial na Sede",
  },
  {
    nome: "Fonoaudiologia",
    icone: Stethoscope,
    descricao: "Cuidado e aprimoramento vocal específico para professores, prevenção de lesões nas pregas vocais e reabilitação.",
    beneficio: "Avaliação preventiva e terapia vocal",
    modalidade: "Presencial e Online",
  },
  {
    nome: "Nutrição",
    icone: AppleIcon,
    descricao: "Planos alimentares adaptados à rotina de múltiplos turnos escolares, prevenção de doenças crônicas e qualidade de vida.",
    beneficio: "Consultas e acompanhamento nutricional",
    modalidade: "Presencial e Online",
  },
];

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a4 4 0 00-4 4c0 1.5.8 2.8 2 3.5C6 11 3 15 3 19a1 1 0 001 1h16a1 1 0 001-1c0-4-3-8-7-9.5 1.2-.7 2-2 2-3.5a4 4 0 00-4-4z" />
    </svg>
  );
}

function Saude() {
  const [selecionada, setSelecionada] = useState("Odontologia");

  return (
    <>
      <PageHeader
        title="Sinpro Especialidades"
        description="Atendimento em saúde multidisciplinar pensado exclusivamente para as necessidades dos profissionais da educação e seus dependentes."
        breadcrumbs={[{ label: "Saúde" }]}
      />

      <section className="section-y">
        <div className="container-page space-y-12">
          {/* Card Destacado de Agendamento */}
          <div className="rounded-2xl bg-gradient-to-r from-primary to-brand p-8 text-primary-foreground shadow-lift">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <Badge className="bg-highlight text-highlight-foreground">Clínica Própria</Badge>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">Agendamento de Consultas</h2>
                <p className="mt-2 text-primary-foreground/90">
                  Os atendimentos do Sinpro Especialidades acontecem na Sede do sindicato, em ambiente moderno e acolhedor.
                  Agende pelo telefone ou WhatsApp oficial.
                </p>
                <div className="mt-5 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-highlight" />
                    <span className="font-semibold">{site.contato.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-highlight" />
                    <span>Segunda a sexta, das 8h às 18h</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-start md:justify-end">
                <Button asChild size="lg" className="bg-action text-action-foreground hover:bg-action/90 shadow-md">
                  <a href={`https://wa.me/554333740900?text=Olá,%20gostaria%20de%20agendar%20um%20atendimento%20no%20Sinpro%20Especialidades`} target="_blank" rel="noopener noreferrer">
                    <CalendarCheck className="mr-2 size-5" />
                    Agendar pelo WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Grid de Especialidades */}
          <div>
            <SectionTitle
              eyebrow="Cuidado Integral"
              title="Especialidades Disponíveis"
              description="Conheça as áreas de saúde preparadas para atender você e seus familiares com carinho e responsabilidade."
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {especialidadesLista.map((esp) => {
                const Icon = esp.icone;
                return (
                  <Card key={esp.nome} className="flex flex-col justify-between transition-shadow hover:shadow-card">
                    <CardHeader>
                      <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                        <Icon className="size-6" />
                      </div>
                      <CardTitle className="text-xl font-bold">{esp.nome}</CardTitle>
                      <CardDescription className="text-sm">{esp.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="rounded-lg bg-surface p-3 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Condição para filiados:</p>
                        <p>{esp.beneficio}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Modalidade:</span>
                        <Badge variant="outline">{esp.modalidade}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Informações de Localização e Acesso */}
          <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Onde nos encontrar</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                O Sinpro Especialidades está localizado junto à sede administrativa do Sinpro Londrina, com fácil estacionamento e acessibilidade completa.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <strong className="block text-foreground">{site.contato.endereco}</strong>
                    <span className="text-muted-foreground">{site.contato.cidade} — CEP {site.contato.cep}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-brand" />
                  <span className="text-muted-foreground">Atendimento para associados titulares e dependentes diretos.</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border bg-surface flex items-center justify-center min-h-[220px]">
              <iframe
                title="Mapa do Sinpro Londrina"
                src={site.contato.mapaEmbed}
                className="h-full w-full border-0 min-h-[220px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
