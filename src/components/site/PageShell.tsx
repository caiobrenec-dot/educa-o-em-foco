import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-primary-foreground/75">
        <li>
          <Link to="/" className="underline-offset-4 hover:underline">
            Início
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden="true" />
            {item.to ? (
              <Link to={item.to} className="underline-offset-4 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-primary-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs: { label: string; to?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container-page py-8 lg:py-12">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mt-4 text-3xl font-extrabold lg:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-base text-primary-foreground/85">{description}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-base text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <Alert className="border-highlight/60 bg-highlight/15">
      <Info className="size-4" aria-hidden="true" />
      <AlertTitle>Conteúdo de demonstração</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
