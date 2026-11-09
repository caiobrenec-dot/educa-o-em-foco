import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { menu, site } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={site.logo}
              alt={`Logotipo do ${site.nome}`}
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-md bg-background p-1"
            />
            <span className="font-display text-base font-bold">{site.nome}</span>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/80">{site.descricao}</p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Navegação</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {menu.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="text-primary-foreground/80 underline-offset-4 hover:underline">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Serviços">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Serviços</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { label: "Quero me associar", to: "/quero-me-associar" },
              { label: "Como funciona", to: "/como-funciona" },
              { label: "Canal de denúncias", to: "/denuncias" },
              { label: "Área do associado", to: "/area-do-associado" },
              { label: "Painel administrativo", to: "/admin" },
              { label: "Política de privacidade", to: "/privacidade" },
              { label: "Termos de uso", to: "/termos" },
            ].map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="text-primary-foreground/80 underline-offset-4 hover:underline">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Atendimento</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {site.contato.endereco}
                <br />
                {site.contato.cidade} — CEP {site.contato.cep}
              </span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {site.contato.telefone} · WhatsApp {site.contato.whatsapp}
              </span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{site.contato.email}</span>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{site.contato.horario}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.nome}. Todos os direitos reservados.
          </p>
          <p>Entidade sindical filiada à Contee e Fepesp.</p>
        </div>
      </div>
    </footer>
  );
}
