import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DemoNotice, EmptyState, PageHeader, SectionTitle } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoriasConvenio, cidades, convenios } from "@/data/demo";
import { formatarData } from "@/lib/masks";

export const Route = createFileRoute("/beneficios")({
  head: () => ({
    meta: [
      { title: "Benefícios e convênios para associados do sindicato" },
      {
        name: "description",
        content:
          "Descontos em saúde, educação, farmácias, óticas, academias, restaurantes e lazer para associados e dependentes, com busca por categoria e cidade.",
      },
      { property: "og:title", content: "Benefícios e convênios" },
      { property: "og:description", content: "Rede de descontos para associados e dependentes." },
    ],
  }),
  component: Beneficios;
});

function Beneficios() {
  return null;
}
