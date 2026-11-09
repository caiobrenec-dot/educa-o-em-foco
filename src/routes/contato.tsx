import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
} from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Fale com o Sinpro Londrina" },
      {
        name: "description",
        content:
          "Entre em contato com o Sinpro Londrina: telefone, WhatsApp, e-mail, departamento jurídico e denúncias anônimas.",
      },
      { property: "og:title", content: "Contato — Sinpro Londrina" },
      { property: "og:description", content: "Canais oficiais de atendimento da entidade sindical." },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <>
      <PageHeader
        title="Fale Conosco"
        description="Estamos prontos para atender você. Tire dúvidas, envie solicitações para o jurídico ou agende um horário."
        breadcrumbs={[{ label: "Contato" }]}
      />

      <section className="section-y">
        <div className="container-page space-y-12">
          {/* Grid Geral de Contato */}
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            {/* Formulário */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
              <SectionTitle
                eyebrow="Envie sua Mensagem"
                title="Mensagem Direta para a Secretaria"
                description="Preencha o formulário abaixo que nossa equipe retornará no seu e-mail ou telefone."
              />

              {enviado ? (
                <div className="mt-8 rounded-xl bg-action/10 p-6 border border-action/20 text-center">
                  <h3 className="font-display text-lg font-bold text-foreground">Mensagem enviada com sucesso!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Agradecemos o contato. Nossa equipe administrativa ou jurídica retornará o mais breve possível.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setEnviado(false)}>
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" required placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" required placeholder="seu@email.com" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                      <Input id="telefone" required placeholder="(43) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instituicao">Escola / Instituição onde trabalha</Label>
                      <Input id="instituicao" placeholder="Nome da escola (opcional)" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea id="mensagem" required rows={4} placeholder="Como podemos ajudar você?" />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto bg-action text-action-foreground hover:bg-action/90">
                    <Send className="mr-2 size-4" />
                    Enviar Mensagem
                  </Button>
                </form>
              )}

              {/* Box Canal de Denúncias */}
              <div className="mt-10 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="size-6 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-destructive">Canal de Denúncias Anônimas</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Presenciou descumprimento da convenção coletiva, atraso de salários, assédio ou sobrecarga não remunerada? Denuncie com total sigilo garantido por lei.
                    </p>
                    <Button asChild size="sm" variant="destructive" className="mt-3">
                      <a href="mailto:juridico@sinprolondrina.com.br?subject=Denúncia%20Trabalhista%20Anônima">
                        Enviar Denúncia Sigilosa
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Institucionais e Endereço */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Sede Administrativa</CardTitle>
                  <CardDescription>Atendimento presencial e telefônico</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-foreground">{site.contato.endereco}</strong>
                      <span className="text-muted-foreground">{site.contato.cidade} — CEP {site.contato.cep}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="size-5 text-brand shrink-0" />
                    <div>
                      <strong className="block text-foreground">Telefone Geral</strong>
                      <span className="text-muted-foreground">{site.contato.telefone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="size-5 text-brand shrink-0" />
                    <div>
                      <strong className="block text-foreground">E-mail Oficial</strong>
                      <span className="text-muted-foreground">{site.contato.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-brand shrink-0" />
                    <div>
                      <strong className="block text-foreground">Horário de Funcionamento</strong>
                      <span className="text-muted-foreground">{site.contato.horario}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Setores e Ramais */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Setores do Sinpro Londrina</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {site.setores.map((setor) => (
                    <div key={setor.nome} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                      <div>
                        <strong className="block text-foreground">{setor.nome}</strong>
                        <span className="text-muted-foreground">{setor.email}</span>
                      </div>
                      <Badge variant="outline">{setor.telefone}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mapa */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-card h-[380px]">
            <iframe
              title="Localização do Sinpro Londrina"
              src={site.contato.mapaEmbed}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
