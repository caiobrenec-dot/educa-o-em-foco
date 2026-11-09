import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Palmtree,
  Phone,
  Sparkles,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/config/site";
import { imagens } from "@/data/demo";

export const Route = createFileRoute("/lazer")({
  head: () => ({
    meta: [
      { title: "Sinpro Campestre — Lazer e Integração para a Família Docente" },
      {
        name: "description",
        content:
          "Conheça o Sinpro Campestre: piscinas, quiosques com churrasqueiras, campos de futebol e área verde para associados do Sinpro Londrina.",
      },
      { property: "og:title", content: "Sinpro Campestre" },
      { property: "og:description", content: "Lazer, esportes e confraternização para professores e familiares." },
    ],
  }),
  component: Lazer,
});

const atracoes = [
  {
    nome: "Parque Aquático",
    icone: Waves,
    descricao: "Piscinas adulto e infantil com tratamento de água rigoroso, guarda-vidas e deck para banho de sol.",
  },
  {
    nome: "Quiosques com Churrasqueira",
    icone: UtensilsCrossed,
    descricao: "Espaços com grelha, pia, mesas e energia elétrica para reunir família e amigos nos fins de semana.",
  },
  {
    nome: "Esportes e Atividades",
    icone: Palmtree,
    descricao: "Campo de futebol society gramado, quadra de vôlei de areia e playground para as crianças.",
  },
  {
    nome: "Salão de Eventos",
    icone: Sparkles,
    descricao: "Espaço coberto e climatizado disponível para locação de aniversários, confraternizações e assembleias.",
  },
];

const normas = [
  "Acesso gratuito para o associado titular e seus dependentes cadastrados.",
  "Convidados são permitidos mediante emissão prévia de convite na secretaria do sindicato.",
  "Reserva de quiosques deve ser solicitada com antecedência para garantir vaga.",
  "Exame médico atualizado para uso das piscinas.",
  "Proibida a entrada com garrafas ou recipientes de vidro na área das piscinas.",
];

function Lazer() {
  return (
    <>
      <PageHeader
        title="Sinpro Campestre"
        description="O refúgio de descanso, lazer e confraternização dos professores e suas famílias em Londrina."
        breadcrumbs={[{ label: "Lazer" }]}
      />

      <section className="section-y">
        <div className="container-page space-y-12">
          {/* Banner Hero Campestre */}
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lift">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <Badge className="w-fit bg-highlight text-highlight-foreground">Sede Recreativa</Badge>
                <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                  Seu fim de semana com lazer e natureza
                </h2>
                <p className="mt-4 text-base text-primary-foreground/85 leading-relaxed">
                  O Sinpro Campestre foi planejado para proporcionar momentos inesquecíveis de descanso após a rotina intensa da sala de aula. Um clube completo com estrutura de primeiro nível.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-action text-action-foreground hover:bg-action/90">
                    <a href={`https://wa.me/554333740900?text=Olá,%20gostaria%20de%20reservar%20um%20quiosque%20no%20Sinpro%20Campestre`} target="_blank" rel="noopener noreferrer">
                      <Calendar className="mr-2 size-5" />
                      Reservar Quiosque
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                    <Link to="/contato">Falar com a Secretaria</Link>
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[300px] lg:min-h-full">
                <img
                  src={imagens.sedeLazer}
                  alt="Piscinas do Sinpro Campestre"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* O que o clube oferece */}
          <div>
            <SectionTitle
              eyebrow="Estrutura Completa"
              title="O que você encontra no Sinpro Campestre"
              description="Infraestrutura pensada para todas as idades, do descanso à prática esportiva."
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {atracoes.map((item) => {
                const Icon = item.icone;
                return (
                  <Card key={item.nome} className="transition-all hover:border-brand/50 hover:shadow-card">
                    <CardHeader>
                      <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                        <Icon className="size-6" />
                      </div>
                      <CardTitle className="mt-3 text-lg font-bold">{item.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Horários e Regras de Utilização */}
          <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Regras e Convivência</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Para manter nosso clube seguro, limpo e harmonioso para todas as famílias associadas, observe as seguintes diretrizes:
              </p>

              <ul className="mt-4 space-y-3">
                {normas.map((norma, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-action" />
                    <span>{norma}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-surface p-6">
              <div>
                <h4 className="font-display text-lg font-bold text-foreground">Dias e Horários de Abertura</h4>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-brand" />
                    <div>
                      <strong className="block text-foreground">Terça a Domingo</strong>
                      <span className="text-muted-foreground">{site.reservaLazer.horarios}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Info className="size-5 text-brand" />
                    <div>
                      <strong className="block text-foreground">Segundas-feiras</strong>
                      <span className="text-muted-foreground">Fechado para manutenção geral e tratamento das piscinas</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-brand" />
                    <div>
                      <strong className="block text-foreground">Localização da Sede</strong>
                      <span className="text-muted-foreground">Londrina - PR (consulte orientações de acesso na secretaria)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Dúvidas sobre reservas de convidados ou aluguel do salão? Ligue para <strong>{site.contato.telefone}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
