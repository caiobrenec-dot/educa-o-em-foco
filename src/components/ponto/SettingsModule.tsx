import React, { useState } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { SystemSettings } from "../../lib/ponto-store";
import {
  Settings,
  ShieldCheck,
  Building2,
  Clock,
  Tablet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Trash2,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsModule() {
  const {
    settings,
    stores,
    updateSettings,
    regenerateKioskCode,
    clearDemoDataOnly,
    regenerateDemoData,
  } = usePonto();

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    toast.success("Configurações atualizadas com sucesso!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRegenerateCode = (storeId: "store-catuai" | "store-boulevard", storeName: string) => {
    const newCode = regenerateKioskCode(storeId);
    toast.success(`Novo código gerado para ${storeName}: ${newCode}`);
  };

  const handleClearDemo = () => {
    if (
      confirm(
        "Atenção: Deseja realmente limpar todas as marcações e extratos simulados de demonstração de Outubro e Novembro?\n\nOs cadastros de colaboradores e lojas serão PRESERVADOS."
      )
    ) {
      clearDemoDataOnly();
      toast.success("Base de dados de demonstração limpa com sucesso!");
    }
  };

  const handleRegenerateDemo = () => {
    if (
      confirm(
        "Deseja regenerar a base completa de demonstração histórica (01/10/2026 até 11/11/2026) para os 8 colaboradores?"
      )
    ) {
      regenerateDemoData();
      toast.success("Base de demonstração histórica regenerada com sucesso!");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Configurações Gerais do Sistema ATHLETA PONTO
          </h3>
          <p className="text-xs text-slate-500">
            Códigos de quiosque das filiais, base de demonstração e conformidade CLT
          </p>
        </div>
      </div>

      {/* BLOCO 1: CÓDIGOS DE ACESSO EXCLUSIVO DOS QUIOSQUES (CATUAÍ E BOULEVARD) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#005C30]" />
              Códigos de Ativação dos Quiosques (Tablets das Lojas)
            </h4>
            <p className="text-xs text-slate-500">
              Códigos exclusivos gerados para travar os tablets físicos em cada unidade
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            Segurança Nível 2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stores.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-xs">{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Loja {s.code}</span>
                </div>
                <div className="my-2 p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Código de Acesso do Totem
                  </span>
                  <span className="text-xl font-black font-mono text-[#005C30] tracking-widest">
                    {s.kioskAccessCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Digite este código no tablet fixo da loja para liberar o ponto e bloquear acessos externos.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleRegenerateCode(s.id as "store-catuai" | "store-boulevard", s.name)
                }
                className="mt-3 w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Gerar Novo Código Aleatório
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BLOCO 2: GESTÃO DA BASE DE DEMONSTRAÇÃO HISTÓRICA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#005C30]" />
              Base de Dados de Demonstração (Data-Base 11/11/2026)
            </h4>
            <p className="text-xs text-slate-500">
              Controle de dados simulados de Outubro e Novembro/2026 sem afetar cadastros reais
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
            <div>
              <span className="font-bold text-amber-900 text-xs block">
                Limpar Apenas Dados de Demonstração
              </span>
              <p className="text-[11px] text-amber-800 mt-1">
                Remove todas as marcações e movimentações simuladas de teste. Os 8 colaboradores e as 2
                lojas continuam cadastrados.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearDemo}
              className="w-full py-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              Limpar Marcações Demo
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div>
              <span className="font-bold text-emerald-900 text-xs block">
                Regenerar Simulações de Demonstração
              </span>
              <p className="text-[11px] text-emerald-800 mt-1">
                Recria todo o histórico realista de 01/10/2026 até 11/11/2026 com fotos, atrasos e banco de
                horas para apresentação.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRegenerateDemo}
              className="w-full py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FFC72C]" />
              Regenerar Base Completa
            </button>
          </div>
        </div>
      </div>

      {/* BLOCO 3: PARÂMETROS CLT E LEGISLAÇÃO */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <Clock className="w-4 h-4 text-[#005C30]" />
            Parâmetros Trabalhistas (CLT & Portaria 671 MTE)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Tolerância por Batida (Minutos)
              </label>
              <input
                type="number"
                min={0}
                max={15}
                value={formData.toleranceMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, toleranceMinutes: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Regra CLT: 5 a 10 min diários</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Intervalo Mínimo (Minutos)
              </label>
              <input
                type="number"
                value={formData.minBreakMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, minBreakMinutes: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Mínimo 60 min para jornada &gt; 6h</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Descanso Interjornada (Horas)
              </label>
              <input
                type="number"
                value={formData.minIntershiftHours}
                onChange={(e) =>
                  setFormData({ ...formData, minIntershiftHours: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Art. 66 CLT: Mínimo 11 horas</span>
            </div>
          </div>
        </div>

        {/* BLOCO 4: DADOS CADASTRAIS DA REDE ATHLETA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <Building2 className="w-4 h-4 text-[#005C30]" />
            Dados Cadastrais Oficiais da Rede Athleta
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Razão Social
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                CNPJ Geral
              </label>
              <input
                type="text"
                value={formData.companyCnpj}
                onChange={(e) => setFormData({ ...formData, companyCnpj: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Endereço Corporativo
              </label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Alterações salvas!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-sm shadow-md transition-all"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
