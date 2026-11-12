import React, { useState, useMemo } from "react";
import { Employee, Store } from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import {
  Users,
  Search,
  Building2,
  UserPlus,
  Clock,
  Eye,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { NewEmployeeModal } from "./NewEmployeeModal";
import { AdjustHoursModal } from "./AdjustHoursModal";
import { toast } from "sonner";

interface EmployeesModuleProps {
  onSelectEmployee: (emp: Employee) => void;
  selectedStoreId: string;
  onStoreChange: (storeId: string) => void;
}

export function EmployeesModule({
  onSelectEmployee,
  selectedStoreId,
  onStoreChange,
}: EmployeesModuleProps) {
  const { employees, stores, deleteEmployee } = usePonto();
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [adjustingEmployeeId, setAdjustingEmployeeId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedStoreId !== "all" && emp.storeId !== selectedStoreId) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = emp.name.toLowerCase().includes(q);
        if (!mName) return false;
      }
      return true;
    });
  }, [employees, selectedStoreId, search]);

  const handleDelete = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja remover o funcionário ${emp.name}?`)) {
      const ok = deleteEmployee(emp.id);
      if (ok) {
        toast.success(`Funcionário ${emp.name} removido com sucesso.`);
      } else {
        toast.error("Erro ao remover funcionário.");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com Ações e Busca Simplificada */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#005C30]" />
              Funcionários das Lojas
            </h3>
            <p className="text-xs text-slate-500">
              Gerencie colaboradores e ajuste horários de entrada e saída livremente
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAdjustingEmployeeId(employees[0]?.id || null)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Ajustar Horários (Geral)
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              + Novo Funcionário
            </button>
          </div>
        </div>

        {/* Filtros Simplificados: Apenas Busca por Nome e Seleção de Loja */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Busca por Nome */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pelo nome do colaborador..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#005C30]"
            />
          </div>

          {/* Loja / Shopping */}
          <div>
            <select
              value={selectedStoreId}
              onChange={(e) => onStoreChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#005C30]"
            >
              <option value="all">Todas as Lojas (Catuaí & Boulevard)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista Simplificada de Funcionários */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#005C30]/5 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Colaborador</th>
                <th className="py-3.5 px-5">Shopping / Loja</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const empStore = stores.find((s) => s.id === emp.storeId);
                  const isCatuai = emp.storeId === "store-catuai";

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onSelectEmployee(emp)}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      {/* 1. Nome e Foto */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm hover:text-[#005C30] transition-colors">
                              {emp.name}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {emp.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Loja / Shopping */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                            isCatuai
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          {empStore?.name.replace("Athleta ", "") || "Loja"}
                        </span>
                      </td>

                      {/* 3. Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            emp.status === "ativo"
                              ? "bg-emerald-100 text-emerald-800"
                              : emp.status === "ferias"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* 4. Ações: Ajustar Horários, Ver Perfil, Excluir */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdjustingEmployeeId(emp.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                            title="Ajustar horários de qualquer dia para este funcionário"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Ajustar Horários
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEmployee(emp);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#005C30] text-slate-700 hover:text-white font-bold text-xs transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Perfil
                          </button>

                          <button
                            onClick={(e) => handleDelete(emp, e)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remover colaborador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação Rápida de Funcionário (Apenas Nome + Shopping) */}
      {isNewModalOpen && <NewEmployeeModal onClose={() => setIsNewModalOpen(false)} />}

      {/* Modal de Ajuste Manual de Horários */}
      {adjustingEmployeeId && (
        <AdjustHoursModal
          defaultEmployeeId={adjustingEmployeeId}
          onClose={() => setAdjustingEmployeeId(null)}
        />
      )}
    </div>
  );
}
