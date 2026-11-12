import React, { useState } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { X, UserPlus, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface NewEmployeeModalProps {
  onClose: () => void;
  defaultStoreId?: string;
}

export function NewEmployeeModal({ onClose, defaultStoreId = "store-catuai" }: NewEmployeeModalProps) {
  const { addEmployee } = usePonto();

  const [name, setName] = useState("");
  const [storeId, setStoreId] = useState<"store-catuai" | "store-boulevard">(
    defaultStoreId === "store-boulevard" ? "store-boulevard" : "store-catuai"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, digite o nome do funcionário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addEmployee({
        name: name.trim(),
        storeId,
      });

      toast.success(
        `Funcionário "${created.name}" cadastrado com sucesso no ${
          storeId === "store-catuai" ? "Shopping Catuaí" : "Shopping Boulevard"
        }!`
      );
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar funcionário:", err);
      toast.error("Erro ao cadastrar funcionário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#005C30] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC72C] text-[#004724] flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Novo Funcionário</h3>
              <p className="text-xs text-white/80">Informe apenas o nome e o shopping</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Simplificado (Apenas Nome e Shopping) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* 1. Nome do Funcionário */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Nome do Funcionário *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Murilo Santos"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005C30]/20"
            />
          </div>

          {/* 2. Seleção do Shopping (Catuaí ou Boulevard) */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Shopping / Unidade *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStoreId("store-catuai")}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  storeId === "store-catuai"
                    ? "border-[#005C30] bg-[#005C30]/5 text-[#005C30] shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className={`w-5 h-5 ${storeId === "store-catuai" ? "text-[#005C30]" : "text-slate-400"}`} />
                  {storeId === "store-catuai" && <CheckCircle2 className="w-4 h-4 text-[#005C30]" />}
                </div>
                <span className="font-black text-sm block">Shopping Catuaí</span>
                <span className="text-[10px] text-slate-400">Londrina - PR</span>
              </button>

              <button
                type="button"
                onClick={() => setStoreId("store-boulevard")}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  storeId === "store-boulevard"
                    ? "border-[#005C30] bg-[#005C30]/5 text-[#005C30] shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className={`w-5 h-5 ${storeId === "store-boulevard" ? "text-[#005C30]" : "text-slate-400"}`} />
                  {storeId === "store-boulevard" && <CheckCircle2 className="w-4 h-4 text-[#005C30]" />}
                </div>
                <span className="font-black text-sm block">Shopping Boulevard</span>
                <span className="text-[10px] text-slate-400">Londrina - PR</span>
              </button>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#FFC72C]" />
              {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
