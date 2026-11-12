import React, { useState, useMemo } from "react";
import { Employee, Store } from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import {
  Users,
  Search,
  Building2,
  UserPlus,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  Filter,
  Eye,
  KeyRound,
  Calendar,
} from "lucide-react";
import { NewEmployeeModal } from "./NewEmployeeModal";

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
  const { employees, stores } = usePonto();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedStoreId !== "all" && emp.storeId !== selectedStoreId) return false;
      if (roleFilter !== "all" && emp.role !== roleFilter) return false;
      if (statusFilter !== "all" && emp.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = emp.name.toLowerCase().includes(q);
        const mRole = emp.role.toLowerCase().includes(q);
        const mMat = emp.matricula.toLowerCase().includes(q);
        const mCpf = emp.cpf.includes(q);
        if (!mName && !mRole && !mMat && !mCpf) return false;
      }
      return true;
    });
  }, [employees, selectedStoreId, roleFilter, statusFilter, search]);

  const allRoles = Array.from(new Set(employees.map((e) => e.role)));

  return (
    <div className="space-y-4">
      {/* Header com Ações e Busca */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Diretório de Funcionários & Equipes
            </h3>
            <p className="text-xs text-slate-500">
              Gestão cadastral, jornada contratual e PINs de segurança do Totem
            </p>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            + Novo Funcionário
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Busca */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, cargo ou CPF..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl"
            />
          </div>

          {/* Loja */}
          <div>
            <select
              value={selectedStoreId}
              onChange={(e) => onStoreChange(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold text-slate-800"
            >
              <option value="all">Todas as Lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cargo */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold text-slate-800"
            >
              <option value="all">Todos os Cargos</option>
              {allRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold text-slate-800"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="ferias">Férias</option>
              <option value="afastado">Afastado</option>
              <option value="desligado">Desligado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Tabela de Funcionários */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#005C30]/5 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4">Unidade / Loja</th>
                <th className="py-3 px-4">Carga Contratual</th>
                <th className="py-3 px-4">Admissão</th>
                <th className="py-3 px-4">PIN Totem</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const empStore = stores.find((s) => s.id === emp.storeId);

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onSelectEmployee(emp)}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 hover:text-[#005C30] transition-colors">
                              {emp.name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Mat: {emp.matricula} • CPF: {emp.cpf}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {emp.role}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-[#005C30]" />
                          {empStore?.name.replace("Athleta ", "") || "Matriz"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {emp.contractHoursPerWeek}h semanais
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {emp.admissionDate.split("-").reverse().join("/")}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        •••• <span className="text-[10px] text-slate-400 font-normal">({emp.pin})</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEmployee(emp);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#005C30] text-slate-700 hover:text-white font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Perfil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNewModalOpen && <NewEmployeeModal onClose={() => setIsNewModalOpen(false)} />}
    </div>
  );
}
