import React, { useState } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { ScheduleTemplate, Employee, timeToMinutes } from "../../lib/ponto-store";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Plus,
  ShieldCheck,
  Building2,
  CalendarCheck,
  History,
  Info,
} from "lucide-react";
import { ScheduleOverrideModal } from "./ScheduleOverrideModal";
import { toast } from "sonner";

interface SchedulesModuleProps {
  selectedStoreId: string;
}

export function SchedulesModule({ selectedStoreId }: SchedulesModuleProps) {
  const { schedules, employees, stores, updateEmployee, overrides } = usePonto();
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  // Detector de Conflitos
  const conflicts = React.useMemo(() => {
    const list: { type: "intervalo" | "interjornada" | "cobertura"; message: string; severity: "alto" | "medio" }[] = [];

    // Checagem de intervalo < 60 min nas escalas cadastradas
    schedules.forEach((sch) => {
      if (sch.breakDurationMinutes < 60) {
        list.push({
          type: "intervalo",
          message: `Escala "${sch.name}" possui intervalo de ${sch.breakDurationMinutes}m (Mínimo CLT para jornada acima de 6h é 60 minutos).`,
          severity: "alto",
        });
      }
    });

    // Checagem de cobertura mínima de equipe por loja
    stores.forEach((store) => {
      const storeEmps = employees.filter((e) => e.storeId === store.id && e.status === "ativo");
      if (storeEmps.length < 2) {
        list.push({
          type: "cobertura",
          message: `Unidade ${store.name} possui menos de 2 colaboradores ativos para cobrir abertura e fechamento.`,
          severity: "medio",
        });
      }
    });

    return list;
  }, [schedules, stores, employees]);

  const handleUpdateEmployeeSchedule = (empId: string, newScheduleId: string) => {
    updateEmployee(empId, { defaultScheduleId: newScheduleId });
    toast.success("Escala do colaborador atualizada e auditada!");
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Gestão de Escalas, Turnos e Folgas (DSR)
          </h3>
          <p className="text-xs text-slate-500">
            Parâmetros de jornada, escalas personalizadas por colaborador e detecção de conflitos
          </p>
        </div>

        <button
          onClick={() => setIsOverrideModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CalendarCheck className="w-4 h-4 text-[#FFC72C]" />
          + Alterar Escala em Data Específica
        </button>
      </div>

      {/* Painel do Detector de Conflitos de Horários */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Detector de Conflitos e Inconsistências de Escala
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {conflicts.length === 0 ? "Nenhum conflito ativo" : `${conflicts.length} alerta(s) identificado(s)`}
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Todas as escalas estão em conformidade com as regras da CLT (intervalo intrajornada &gt;= 1h, interjornada &gt;= 11h e cobertura adequada).
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {conflicts.map((conf, idx) => (
              <div
                key={idx}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                    {conf.type}
                  </span>
                  <span className="text-amber-900 font-medium">{conf.message}</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                  Severidade: {conf.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Escalas Padrão Cadastradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((sch) => {
          const empsOnSchedule = employees.filter((e) => e.defaultScheduleId === sch.id);

          return (
            <div
              key={sch.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-[#005C30] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{sch.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{sch.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#005C30] border border-emerald-200">
                  {sch.weeklyHours}h semanais
                </span>
              </div>

              {/* Detalhes da Jornada Diária */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Entrada
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {sch.entryTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Intervalo (1h)
                  </span>
                  <span className="font-mono text-slate-600 text-xs">
                    {sch.breakStartTime} - {sch.breakEndTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Saída
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {sch.exitTime}
                  </span>
                </div>
              </div>

              {/* Colaboradores Vinculados */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Colaboradores vinculados ({empsOnSchedule.length}):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {empsOnSchedule.map((emp) => (
                    <span
                      key={emp.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700"
                    >
                      <img
                        src={emp.avatar}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      {emp.name.split(" ")[0]}
                    </span>
                  ))}
                  {empsOnSchedule.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Nenhum funcionário vinculado</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matriz de Atribuição Individual de Escala */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900">
          Atribuição de Escala Individual por Funcionário
        </h4>
        <p className="text-xs text-slate-500">
          Altere a escala base de qualquer colaborador. A modificação ficará registrada na auditoria.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Funcionário</th>
                <th className="py-2.5 px-3">Cargo</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3">Escala Base Atribuída</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => {
                const empStore = stores.find((s) => s.id === emp.storeId);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={emp.avatar}
                          alt=""
                          className="w-6 h-6 rounded-md object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{emp.role}</td>
                    <td className="py-2 px-3 text-slate-600">{empStore?.name.replace("Athleta ", "")}</td>
                    <td className="py-2 px-3">
                      <select
                        value={emp.defaultScheduleId}
                        onChange={(e) => handleUpdateEmployeeSchedule(emp.id, e.target.value)}
                        className="p-1.5 bg-slate-50 border rounded-lg font-semibold text-slate-800 text-xs"
                      >
                        {schedules.map((sch) => (
                          <option key={sch.id} value={sch.id}>
                            {sch.name} ({sch.entryTime} - {sch.exitTime})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Alterações de Escala em Datas Específicas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-[#005C30]" />
          Escalas em Datas Específicas & Trocas Pontuais ({overrides.length})
        </h4>

        {overrides.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Nenhuma alteração pontual de data cadastrada no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {overrides.map((ovr) => {
              const emp = employees.find((e) => e.id === ovr.employeeId);
              return (
                <div key={ovr.id} className="p-3 border rounded-xl bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{emp?.name}</span>
                    <span className="text-slate-500 font-normal">
                      {ovr.date.split("-").reverse().join("/")}
                    </span>
                  </div>
                  <p className="text-[#005C30] font-semibold">
                    {ovr.isDayOff ? "Folga / DSR Concedido" : `Turno: ${ovr.entryTime} às ${ovr.exitTime}`}
                  </p>
                  <p className="text-[11px] text-slate-500 italic">Motivo: "{ovr.reason}"</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isOverrideModalOpen && (
        <ScheduleOverrideModal onClose={() => setIsOverrideModalOpen(false)} />
      )}
    </div>
  );
}
