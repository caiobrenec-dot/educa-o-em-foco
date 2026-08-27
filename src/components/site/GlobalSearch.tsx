import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { menu } from "@/config/site";
import { convenios, documentos, eventos, noticias, profissionais } from "@/data/demo";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function GlobalSearch({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas, notícias, documentos, convênios..." aria-label="Busca global" />

      <CommandList>
        <CommandEmpty>
          Nenhum resultado encontrado. Tente outra palavra, como “convenção”, “piso” ou “saúde”.
        </CommandEmpty>
        <CommandGroup heading="Páginas">
          {[...menu, { label: "Quero me associar", to: "/quero-me-associar" }, { label: "Como funciona", to: "/como-funciona" }, { label: "Canal de denúncias", to: "/denuncias" }, { label: "Área do associado", to: "/area-do-associado" }, { label: "Painel administrativo", to: "/admin" }].map((i) => (
            <CommandItem key={i.to} value={i.label} onSelect={() => go(i.to)}>
              {i.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Notícias">
          {noticias.map((n) => (
            <CommandItem key={n.slug} value={n.titulo} onSelect={() => go(`/noticias/${n.slug}`)}>
              {n.titulo}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Documentos">
          {documentos.map((d) => (
            <CommandItem key={d.id} value={d.titulo} onSelect={() => go("/direitos-e-acordos")}>
              {d.titulo}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Convênios">
          {convenios.map((c) => (
            <CommandItem key={c.id} value={c.nome} onSelect={() => go("/beneficios")}>
              {c.nome}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Saúde e eventos">
          {profissionais.map((p) => (
            <CommandItem key={p.id} value={p.nome} onSelect={() => go("/saude")}>
              {p.nome} — {p.especialidade}
            </CommandItem>
          ))}
          {eventos.map((e) => (
            <CommandItem key={e.id} value={e.titulo} onSelect={() => go("/eventos")}>
              {e.titulo}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
