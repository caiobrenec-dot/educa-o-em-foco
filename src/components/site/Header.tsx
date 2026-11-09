import { Link } from "@tanstack/react-router";
import { Menu, Search, UserRound } from "lucide-react";
import { useState } from "react";

import { GlobalSearch } from "@/components/site/GlobalSearch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { menu, site } from "@/config/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center gap-3 lg:h-20">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${site.nome} — página inicial`}>
          <img
            src={site.logo}
            alt={`Logotipo do ${site.nome}`}
            width={40}
            height={40}
            className="h-10 w-auto max-h-12 object-contain"
          />
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold text-primary lg:text-base tracking-tight">Sinpro Londrina</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Londrina e Norte do PR</span>
          </span>
        </Link>

        <nav aria-label="Menu principal" className="ml-auto hidden xl:flex xl:items-center xl:gap-1">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir busca global"
            className="min-h-11 min-w-11"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" aria-hidden="true" />
          </Button>

          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link to="/area-do-associado">
              <UserRound aria-hidden="true" />
              Área do associado
            </Link>
          </Button>

          <Button asChild className="hidden bg-action text-action-foreground hover:bg-action/90 sm:inline-flex">
            <Link to="/quero-me-associar">Quero me associar</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menu" className="min-h-11 min-w-11 xl:hidden">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto">
              <SheetTitle className="px-4 pt-4 font-display text-lg">Navegação</SheetTitle>
              <nav aria-label="Menu mobile" className="mt-2 flex flex-col gap-1 p-4">
                {menu.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    activeProps={{ className: "bg-accent text-primary" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/denuncias"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-accent"
                >
                  Canal de denúncias
                </Link>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild className="w-full bg-action text-action-foreground hover:bg-action/90">
                    <Link to="/quero-me-associar" onClick={() => setOpen(false)}>
                      Quero me associar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/area-do-associado" onClick={() => setOpen(false)}>
                      Área do associado
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
