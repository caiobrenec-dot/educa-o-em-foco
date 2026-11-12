import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-7xl font-black text-[#005C30]">404</h1>
        <h2 className="mt-4 text-xl font-bold text-slate-800">Página não encontrada</h2>
        <p className="mt-2 text-sm text-slate-500">
          A rota solicitada não existe no sistema ATHLETA PONTO.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#005C30] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#004724] shadow-md"
          >
            Voltar ao Painel Geral
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Ocorreu uma instabilidade na página
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Você pode tentar recarregar os dados do sistema.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-[#005C30] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#004724]"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "ATHLETA PONTO — Painel de Controle Total dos Proprietários" },
      {
        name: "description",
        content:
          "Sistema oficial de controle de jornada, ponto eletrônico com reconhecimento facial ao vivo, gestão de escalas e auditoria das Lojas Athleta.",
      },
      { name: "author", content: "Athleta Brasil" },
      { property: "og:title", content: "ATHLETA PONTO — Centro de Gestão de Funcionários e Jornadas" },
      {
        property: "og:description",
        content: "Visão total da operação para donos e gerentes: Catuaí, Boulevard e rede nacional.",
      },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#005C30" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
