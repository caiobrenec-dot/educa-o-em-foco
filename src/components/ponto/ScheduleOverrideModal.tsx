import React, { useState } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Employee } from "../../lib/ponto-store";
import { X, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduleOverrideModalProps {
  onClose: () => void;
  defaultEmployeeId?: string;
}

export function ScheduleOverrideModal({
  onClose,
  defaultEmployeeId,
}: ScheduleOverrideModalProps) {
  const { employees, saveScheduleOverride } = usePonto();

  const [employeeId, setEmployeeId] = useState<string>(
    defaultEmployeeId || employees[0]?.id || ""
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isDayOff, setIsDayOff] = useState<boolean>(false);
  const [entryTime, setEntryTime] = useState<string>("10:00");
  const [exitTime, setExitTime] = useState<string>("18:20");
  const [breakStartTime, setBreakStartTime] = useState<string>("13:30");
  const [breakEndTime, setBreakEndTime] = useState<string>("14:30");
  const [reason, setReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !date || !reason.trim()) {
      toast.error("Preencha todos os campos obrigatórios e a justificativa.");
      return;
    }

    saveScheduleOverride({
      employeeId,
      date,
      isDayOff,
      entryTime: isDayOff ? "-" : entryTime,
      exitTime: isDayOff ? "-" : exitTime,
      breakStartTime: isDayOff ? "-" : breakStartTime,
      breakEndTime: isDayOff ? "-" : breakEndTime,
      reason,
      updatedBy: "Carlos Eduardo Silva (Gerente Admin)",
    });

    toast.success("Escala pontual alterada com sucesso! Histórico de auditoria atualizado.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#005C30] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#004724] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alterar Escala em Data Específica</h3>
              <p className="text-xs text-white/80">Troca de turno, plantão de feriado ou folga pontual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Colaborador *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
              required
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Data da Alteração *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
              required
            />
          </div>

          {/* Opção de Folga */}
          <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Definir como Dia de Folga (DSR)</span>
              <span className="text-[11px] text-slate-500">Sem expediente previsto para o colaborador</span>
            </div>
            <input
              type="checkbox"
              checked={isDayOff}
              onChange={(e) => setIsDayOff(e.target.checked)}
              className="w-5 h-5 accent-[#005C30] cursor-pointer"
            />
          </div>

          {/* Horários se não for folga */}
          {!isDayOff && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Horário de Entrada
                </label>
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Horário de Saída
                </label>
                <input
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Início do Intervalo
                </label>
                <input
                  type="time"
                  value={breakStartTime}
                  onChange={(e) => setBreakStartTime(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Fim do Intervalo
                </label>
                <input
                  type="time"
                  value={breakEndTime}
                  onChange={(e) => setBreakEndTime(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg font-mono"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Justificativa Obrigatória (Auditoria) *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Cobertura de folga no Shopping Catuaí ou evento especial"
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold transition-all shadow-md"
            >
              Salvar Escala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
