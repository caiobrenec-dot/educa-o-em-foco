import React, { useState, useEffect, useMemo } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Employee, timeToMinutes, formatMinutesHuman } from "../../lib/ponto-store";
import {
  X,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Coffee,
  LogIn,
  LogOut,
  Save,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AdjustHoursModalProps {
  onClose: () => void;
  defaultEmployeeId?: string;
  defaultDate?: string;
}

export function AdjustHoursModal({
  onClose,
  defaultEmployeeId,
  defaultDate,
}: AdjustHoursModalProps) {
  const { employees, stores, records, adjustDayTimes } = usePonto();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    defaultEmployeeId || employees[0]?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [isDayOff, setIsDayOff] = useState<boolean>(false);

  // Horários de batida
  const [entryTime, setEntryTime] = useState<string>("09:45");
  const [breakStartTime, setBreakStartTime] = useState<string>("13:30");
  const [breakEndTime, setBreakEndTime] = useState<string>("14:30");
  const [exitTime, setExitTime] = useState<string>("18:05");

  // Justificativa
  const [reason, setReason] = useState<string>("Ajuste de jornada / Horário cumprido");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);
  const selectedStore = stores.find((s) => s.id === selectedEmployee?.storeId);

  // Ao mudar de colaborador ou data, carregar o registro existente se houver
  useEffect(() => {
    if (!selectedEmpId || !selectedDate) return;

    const existingRecord = records.find(
      (r) => r.employeeId === selectedEmpId && r.date === selectedDate
    );

    if (existingRecord) {
      setIsDayOff(!!existingRecord.isDayOff);
      const p1 = existingRecord.punches.find((p) => p.type === "entrada");
      const p2 = existingRecord.punches.find((p) => p.type === "intervalo_saida");
      const p3 = existingRecord.punches.find((p) => p.type === "intervalo_retorno");
      const p4 = existingRecord.punches.find((p) => p.type === "saida");

      if (p1?.time) setEntryTime(p1.time);
      else if (existingRecord.scheduledEntry && existingRecord.scheduledEntry !== "-")
        setEntryTime(existingRecord.scheduledEntry);

      if (p2?.time) setBreakStartTime(p2.time);
      if (p3?.time) setBreakEndTime(p3.time);

      if (p4?.time) setExitTime(p4.time);
      else if (existingRecord.scheduledExit && existingRecord.scheduledExit !== "-")
        setExitTime(existingRecord.scheduledExit);
    } else {
      setIsDayOff(false);
      setEntryTime("09:45");
      setBreakStartTime("13:30");
      setBreakEndTime("14:30");
      setExitTime("18:05");
    }
  }, [selectedEmpId, selectedDate, records]);

  // Cálculo das horas trabalhadas em tempo real
  const calculation = useMemo(() => {
    if (isDayOff) {
      return {
        totalMinutes: 0,
        balanceMinutes: 0,
        extraMinutes: 0,
        missingMinutes: 0,
        humanWorked: "0h 00m (Folga)",
      };
    }

    const t1 = timeToMinutes(entryTime);
    const t2 = timeToMinutes(breakStartTime);
    const t3 = timeToMinutes(breakEndTime);
    const t4 = timeToMinutes(exitTime);

    let worked = 0;
    if (t2 > t1) worked += t2 - t1;
    if (t4 > t3) worked += t4 - t3;

    // Se não preencheu intervalo direito mas saída > entrada
    if (worked === 0 && t4 > t1) {
      worked = t4 - t1 - 60; // desconta 1h almoço por padrão
      if (worked < 0) worked = 0;
    }

    const expected = 440; // 7h20 = 440 min
    const balance = worked - expected;

    const h = Math.floor(worked / 60);
    const m = worked % 60;

    return {
      totalMinutes: worked,
      balanceMinutes: balance,
      extraMinutes: balance > 0 ? balance : 0,
      missingMinutes: balance < 0 ? Math.abs(balance) : 0,
      humanWorked: `${h}h ${String(m).padStart(2, "0")}m`,
    };
  }, [isDayOff, entryTime, breakStartTime, breakEndTime, exitTime]);

  // Presets rápidos
  const applyPreset = (preset: "padrao" | "extra1" | "extra2" | "menos1" | "fechamento") => {
    setIsDayOff(false);
    if (preset === "padrao") {
      setEntryTime("09:45");
      setBreakStartTime("13:30");
      setBreakEndTime("14:30");
      setExitTime("18:05");
      setReason("Jornada padrão regular (7h20)");
    } else if (preset === "extra1") {
      setEntryTime("09:45");
      setBreakStartTime("13:30");
      setBreakEndTime("14:30");
      setExitTime("19:05");
      setReason("Fez 1 hora extra para cobrir pico de movimento");
    } else if (preset === "extra2") {
      setEntryTime("09:45");
      setBreakStartTime("13:30");
      setBreakEndTime("14:30");
      setExitTime("20:05");
      setReason("Fez 2 horas extras para fechamento especial de loja");
    } else if (preset === "menos1") {
      setEntryTime("09:45");
      setBreakStartTime("13:30");
      setBreakEndTime("14:30");
      setExitTime("17:05");
      setReason("Saiu 1 hora mais cedo com autorização da gerência");
    } else if (preset === "fechamento") {
      setEntryTime("13:40");
      setBreakStartTime("17:00");
      setBreakEndTime("18:00");
      setExitTime("22:00");
      setReason("Turno de fechamento de shopping");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedDate) {
      toast.error("Selecione um funcionário e uma data.");
      return;
    }

    setIsSubmitting(true);
    try {
      adjustDayTimes({
        employeeId: selectedEmpId,
        date: selectedDate,
        entryTime: isDayOff ? undefined : entryTime,
        breakStartTime: isDayOff ? undefined : breakStartTime,
        breakEndTime: isDayOff ? undefined : breakEndTime,
        exitTime: isDayOff ? undefined : exitTime,
        isDayOff,
        reason: reason.trim() || "Ajuste manual de jornada pelo gestor",
        authorName: "Carlos Eduardo Silva (Gerente Athleta)",
      });

      const empName = selectedEmployee ? selectedEmployee.name : "Funcionário";
      const dateFormatted = selectedDate.split("-").reverse().join("/");

      if (isDayOff) {
        toast.success(`Dia ${dateFormatted} marcado como FOLGA para ${empName}!`);
      } else if (calculation.extraMinutes > 0) {
        toast.success(
          `Horários salvos para ${empName}! +${formatMinutesHuman(
            calculation.extraMinutes
          )} computadas no Banco de Horas.`
        );
      } else if (calculation.missingMinutes > 0) {
        toast.warning(
          `Horários salvos para ${empName}! -${formatMinutesHuman(
            calculation.missingMinutes
          )} debitadas do Banco de Horas.`
        );
      } else {
        toast.success(`Horários do dia ${dateFormatted} atualizados com sucesso para ${empName}!`);
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar horários.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Topo / Header */}
        <div className="bg-[#005C30] text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFC72C] text-[#004724] flex items-center justify-center font-black shadow-md shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Ajustar Horários do Funcionário
              </h3>
              <p className="text-xs text-white/80">
                Altere os horários de entrada e saída livremente (fazer mais ou menos horas no dia)
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo / Formulário com scroll */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 text-xs">
          {/* 1. SELEÇÃO DE COLABORADOR E DATA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Colaborador */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Funcionário
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#005C30]"
                required
              >
                {employees.map((emp) => {
                  const s = stores.find((st) => st.id === emp.storeId);
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {s?.name?.replace("Athleta ", "") || s?.name || "Loja"}
                    </option>
                  );
                })}
              </select>

              {selectedEmployee && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{selectedEmployee.name}</p>
                    <p className="text-[10px] text-[#005C30] font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {selectedStore?.name || "Loja"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Data do Dia */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Data a Ajustar
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#005C30]"
                required
              />

              {/* Botões rápidos de data */}
              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split("T")[0]);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Ontem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 2);
                    setSelectedDate(d.toISOString().split("T")[0]);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Anteontem
                </button>
              </div>
            </div>
          </div>

          {/* 2. TOGGLE: DIA TRABALHADO OU FOLGA */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Status do Dia
                </span>
                <span className="text-[11px] text-slate-500">
                  {isDayOff ? "Marcado como Folga / DSR (não gera banco)" : "Dia com expediente trabalhado"}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsDayOff(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isDayOff
                      ? "bg-[#005C30] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Trabalhou
                </button>
                <button
                  type="button"
                  onClick={() => setIsDayOff(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isDayOff
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Folga / DSR
                </button>
              </div>
            </div>
          </div>

          {/* 3. HORÁRIOS DE BATIDA DO DIA (SE TRABALHOU) */}
          {!isDayOff && (
            <div className="space-y-4">
              {/* Presets Rápidos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#005C30]" />
                    Atalhos Rápidos de Horário
                  </span>
                  <span className="text-[10px] text-slate-400">Preenchimento com 1 clique</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset("padrao")}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
                  >
                    <span className="font-bold text-slate-800 block text-[11px]">Padrão 7h20</span>
                    <span className="text-[10px] text-slate-500">09:45 às 18:05</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("extra1")}
                    className="p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all"
                  >
                    <span className="font-bold text-emerald-900 block text-[11px]">⭐ +1h Extra</span>
                    <span className="text-[10px] text-emerald-700">09:45 às 19:05</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("extra2")}
                    className="p-2 rounded-xl bg-emerald-100/70 hover:bg-emerald-200/70 border border-emerald-300 text-left transition-all"
                  >
                    <span className="font-bold text-emerald-900 block text-[11px]">⭐ +2h Extras</span>
                    <span className="text-[10px] text-emerald-800">09:45 às 20:05</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("menos1")}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-left transition-all"
                  >
                    <span className="font-bold text-amber-900 block text-[11px]">⚠️ -1h Menos</span>
                    <span className="text-[10px] text-amber-700">09:45 às 17:05</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("fechamento")}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 text-left transition-all col-span-2 sm:col-span-2"
                  >
                    <span className="font-bold text-indigo-900 block text-[11px]">🌙 Fechamento Noite</span>
                    <span className="text-[10px] text-indigo-700">13:40 às 22:00</span>
                  </button>
                </div>
              </div>

              {/* 4 Inputs de Horário */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* 1. Entrada */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1 mb-1">
                    <LogIn className="w-3 h-3 text-[#005C30]" />
                    1. Entrada
                  </label>
                  <input
                    type="time"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-full text-sm font-mono font-bold p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005C30]"
                    required
                  />
                </div>

                {/* 2. Saída Intervalo */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1 mb-1">
                    <Coffee className="w-3 h-3 text-amber-600" />
                    2. Início Almoço
                  </label>
                  <input
                    type="time"
                    value={breakStartTime}
                    onChange={(e) => setBreakStartTime(e.target.value)}
                    className="w-full text-sm font-mono font-bold p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005C30]"
                    required
                  />
                </div>

                {/* 3. Retorno Intervalo */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1 mb-1">
                    <Coffee className="w-3 h-3 text-emerald-600" />
                    3. Fim Almoço
                  </label>
                  <input
                    type="time"
                    value={breakEndTime}
                    onChange={(e) => setBreakEndTime(e.target.value)}
                    className="w-full text-sm font-mono font-bold p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005C30]"
                    required
                  />
                </div>

                {/* 4. Saída */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1 mb-1">
                    <LogOut className="w-3 h-3 text-red-600" />
                    4. Saída Final
                  </label>
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="w-full text-sm font-mono font-bold p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005C30]"
                    required
                  />
                </div>
              </div>

              {/* CARD DE FEEDBACK VISUAL EM TEMPO REAL */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  calculation.extraMinutes > 0
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    : calculation.missingMinutes > 0
                    ? "bg-amber-50/80 border-amber-300 text-amber-950"
                    : "bg-blue-50/80 border-blue-200 text-blue-950"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Total Trabalhado no Dia
                    </span>
                    <span className="text-xl font-black font-mono">
                      {calculation.humanWorked}
                    </span>
                    <span className="text-[11px] opacity-75 ml-2 font-medium">
                      (Meta padrão: 7h 20m)
                    </span>
                  </div>

                  <div className="text-right">
                    {calculation.extraMinutes > 0 && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        +{formatMinutesHuman(calculation.extraMinutes)} Hora Extra
                      </div>
                    )}
                    {calculation.missingMinutes > 0 && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-xs">
                        <AlertTriangle className="w-4 h-4" />
                        -{formatMinutesHuman(calculation.missingMinutes)} Débito
                      </div>
                    )}
                    {calculation.balanceMinutes === 0 && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Jornada Regular (Saldo Zero)
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] mt-2 pt-2 border-t border-black/10 opacity-80">
                  {calculation.extraMinutes > 0
                    ? `⭐ O colaborador trabalhou mais tempo hoje. Essas ${formatMinutesHuman(
                        calculation.extraMinutes
                      )} serão CREDITADAS no Banco de Horas dele.`
                    : calculation.missingMinutes > 0
                    ? `⚠️ O colaborador trabalhou menos hoje. Essas ${formatMinutesHuman(
                        calculation.missingMinutes
                      )} serão DEBITADAS do Banco de Horas dele.`
                    : "✅ O colaborador cumpriu exatamente a carga horária padrão da empresa."}
                </p>
              </div>
            </div>
          )}

          {/* 4. JUSTIFICATIVA / MOTIVO */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Motivo do Ajuste (Opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Hora extra para cobrir escala, troca de horário, etc."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-[#005C30]"
            />

            {/* Chips de motivos comuns */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              {[
                "Hora extra autorizada",
                "Saiu mais cedo",
                "Troca de turno entre vendedores",
                "Cobriu escala de folga",
                "Esqueceu de bater saída",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setReason(chip)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Rodapé / Botões */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Salvando..." : "Salvar Horários no Ponto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
