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
} from "lucide-react";
import { toast } from "sonner";

export function SettingsModule() {
  const { settings, updateSettings, resetDemoData } = usePonto();

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    toast.success("Configurações atualizadas com sucesso!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Deseja realmente restaurar os dados originais de demonstração da Athleta?")) {
      resetDemoData();
      toast.success("Dados padrão de demonstração restaurados!");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Configurações Gerais do Sistema ATHLETA PONTO
          </h3>
          <p className="text-xs text-slate-500">
            Parâmetros legais da CLT, regras do Totem Quiosque e dados da empresa
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Restaurar Dados Padrão (Demo)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Bloco 1: Dados da Empresa */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <Building2 className="w-4 h-4 text-[#005C30]" />
            Dados da Empresa Empregadora
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
                CNPJ Matriz
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
                Endereço Principal
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

        {/* Bloco 2: Parâmetros CLT e Legislação */}
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
                onChange={(e) => setFormData({ ...formData, toleranceMinutes: Number(e.target.value) })}
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
                onChange={(e) => setFormData({ ...formData, minBreakMinutes: Number(e.target.value) })}
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
                onChange={(e) => setFormData({ ...formData, minIntershiftHours: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Art. 66 CLT: Mínimo 11 horas</span>
            </div>
          </div>
        </div>

        {/* Bloco 3: Segurança do Modo Quiosque (Tablet da Loja) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <Tablet className="w-4 h-4 text-[#005C30]" />
            Configuração do Dispositivo Fixo na Loja (Tablet Totem)
          </h4>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">
                  Captura Facial Obrigatória ao Vivo pela Câmera
                </span>
                <span className="text-[11px] text-slate-500">
                  Desativa qualquer opção de upload de galeria. Foto tirada exclusivamente no ato da batida.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.requireFacialPhoto}
                onChange={(e) => setFormData({ ...formData, requireFacialPhoto: e.target.checked })}
                className="w-5 h-5 accent-[#005C30]"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">
                  Validação de Geolocalização (Geofencing)
                </span>
                <span className="text-[11px] text-slate-500">
                  Verifica se o tablet/computador está no raio cadastrado da unidade.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.requireLocationCheck}
                onChange={(e) => setFormData({ ...formData, requireLocationCheck: e.target.checked })}
                className="w-5 h-5 accent-[#005C30]"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">
                  Tempo de Retorno Automático à Tela Inicial
                </span>
                <span className="text-[11px] text-slate-500">
                  Segundos de exibição do comprovante antes de liberar para o próximo colaborador.
                </span>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={formData.autoLockKioskSeconds}
                  onChange={(e) => setFormData({ ...formData, autoLockKioskSeconds: Number(e.target.value) })}
                  className="w-full p-2 bg-white border rounded-lg font-bold font-mono text-center"
                />
              </div>
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
