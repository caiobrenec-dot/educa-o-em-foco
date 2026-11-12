import React, { useState, useMemo } from "react";
import {
  Employee,
  DayTimeRecord,
  Store,
  getWeekDates,
  formatMinutesHuman,
  DayStatus,
} from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import {
  Calendar,
  Building2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

interface WeeklyControlModuleProps {
  onSelectEmployee: (emp: Employee) => void;
  onSelectDayRecord: (record: DayTimeRecord, emp: Employee) => void;
  selectedStoreId?: string;
  onStoreChange?: (storeId: string) => void;
}

export function WeeklyControlModule({
  onSelectEmployee,
  onSelectDayRecord,
  selectedStoreId = "all",
  onStoreChange,
}: WeeklyControlModuleProps) {
  const { employees, records, stores } = usePonto();

  // Estado da semana selecionada (data de referência)
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  // Semanas calculadas (Segunda a Domingo)
  const currentWeekDays = useMemo(() => {
    return getWeekDates(referenceDate);
  }, [referenceDate]);

  const weekStartStr = currentWeekDays[0]?.date.split("-").reverse().join("/");
  const weekEndStr = currentWeekDays[6]?.date.split("-").reverse().join("/");

  // Filtragem dos funcionários
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Filtro de Loja
      if (selectedStoreId !== "all" && emp.storeId !== selectedStoreId) return false;

      // Filtro de Funcionário específico
      if (employeeFilter !== "all" && emp.id !== employeeFilter) return false;

      // Busca por nome ou cargo
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesRole = emp.role.toLowerCase().includes(query);
        const matchesMatricula = emp.matricula.toLowerCase().includes(query);
        if (!matchesName && !matchesRole && !matchesMatricula) return false;
      }

      // Filtro por status na semana
      if (statusFilter !== "all") {
        const empRecords = records.filter(
          (r) => r.employeeId === emp.id && currentWeekDays.some((w) => w.date === r.date)
        );
        const hasStatus = empRecords.some((r) => r.status === statusFilter);
        if (!hasStatus) return false;
      }

      return true;
    });
  }, [employees, selectedStoreId, employeeFilter, searchQuery, statusFilter, records, currentWeekDays]);

  // Função para navegar entre semanas
  const handlePrevWeek = () => {
    setReferenceDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setReferenceDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleToday = () => {
    setReferenceDate(new Date());
  };

  // Helper para buscar registro do dia ou criar placeholder se ainda não existir
  const getRecordForDay = (empId: string, storeId: string, date: string, dayOfWeek: number): DayTimeRecord => {
    const found = records.find((r) => r.employeeId === empId && r.date === date);
    if (found) return found;

    const isSunday = dayOfWeek === 0;
    return {
      id: `placeholder-${empId}-${date}`,
      employeeId: empId,
      storeId,
      date,
      dayOfWeek,
      punches: [],
      scheduledEntry: isSunday ? "-" : "10:00",
      scheduledExit: isSunday ? "-" : "18:20",
      scheduledBreak: isSunday ? "-" : "13:30 - 14:30",
      isDayOff: isSunday,
      isVacationOrLeave: false,
      status: isSunday ? "folga" : "ausente",
      totalWorkedMinutes: 0,
      expectedWorkedMinutes: isSunday ? 0 : 440,
      balanceMinutes: 0,
      delayMinutes: 0,
      extraMinutes: 0,
    };
  };

  // Status badges visuais discretos
  const renderStatusBadge = (status: DayStatus) => {
    const config = {
      presente: { label: "Presente", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
      ausente: { label: "Ausente", bg: "bg-red-50 text-red-800 border-red-200" },
      atrasado: { label: "Atrasado", bg: "bg-amber-50 text-amber-800 border-amber-200" },
      folga: { label: "Folga", bg: "bg-slate-100 text-slate-600 border-slate-200" },
      ferias: { label: "Férias", bg: "bg-blue-50 text-blue-800 border-blue-200" },
      afastamento: { label: "Afastamento", bg: "bg-purple-50 text-purple-800 border-purple-200" },
      incompleto: { label: "Incompleto", bg: "bg-orange-50 text-orange-800 border-orange-200" },
      hora_extra: { label: "Hora Extra", bg: "bg-emerald-600 text-white font-bold border-transparent" },
    }[status] || { label: status, bg: "bg-slate-100 text-slate-700" };

    return (
      <span
        className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold border ${config.bg}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Navegação da Semana */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Seletor e Navegador de Semana */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-all"
                title="Semana Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-1 rounded-lg text-xs font-bold text-[#005C30] hover:bg-white transition-all"
              >
                Esta Semana
              </button>

              <button
                onClick={handleNextWeek}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-all"
                title="Próxima Semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#005C30]/5 rounded-xl border border-[#005C30]/20">
              <CalendarDays className="w-4 h-4 text-[#005C30]" />
              <span className="text-xs font-bold text-slate-800">
                Semana: {weekStartStr} até {weekEndStr}
              </span>
            </div>
          </div>

          {/* Legenda Discreta de Cores */}
          <div className="hidden xl:flex items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-medium">Legenda:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Presente
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Atrasado
            </span>
            <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Ausente
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Folga
            </span>
            <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Incompleto
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span> Hora Extra
            </span>
          </div>
        </div>

        {/* Filtros em Linha: Loja, Funcionário, Status, Busca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Filtro por Loja */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Unidade / Loja
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => onStoreChange && onStoreChange(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-[#005C30]"
            >
              <option value="all">Todas as Unidades (Rede Athleta)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Funcionário */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Colaborador Específico
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-[#005C30]"
            >
              <option value="all">Todos os Colaboradores</option>
              {employees
                .filter((e) => selectedStoreId === "all" || e.storeId === selectedStoreId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Filtro por Status de Presença */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Status de Presença
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-[#005C30]"
            >
              <option value="all">Todos os Status</option>
              <option value="presente">Presente</option>
              <option value="atrasado">Atrasado</option>
              <option value="hora_extra">Hora Extra</option>
              <option value="incompleto">Registro Incompleto</option>
              <option value="ausente">Ausente / Falta</option>
              <option value="folga">Folga / DSR</option>
              <option value="ferias">Férias</option>
            </select>
          </div>

          {/* Busca Rápida */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Buscar por Nome ou Matrícula
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Carlos, Vendedor, ATH-0101..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-[#005C30]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grade Semanal 7 Colunas (Segunda a Domingo) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1100px]">
            {/* Cabeçalho das 7 Colunas */}
            <thead>
              <tr className="bg-[#005C30] text-white">
                <th className="py-3.5 px-4 text-left font-black text-xs uppercase tracking-wider w-[240px] sticky left-0 bg-[#005C30] z-20 shadow-r">
                  Funcionário / Loja
                </th>
                {currentWeekDays.map((day) => {
                  const isToday =
                    new Date().toISOString().split("T")[0] === day.date;
                  return (
                    <th
                      key={day.date}
                      className={`py-3 px-3 text-center border-l border-white/10 ${
                        isToday ? "bg-[#004724] ring-2 ring-[#FFC72C] ring-inset" : ""
                      }`}
                    >
                      <div className="text-[11px] font-black uppercase tracking-wider text-white">
                        {day.dayName}
                      </div>
                      <div className="text-sm font-bold text-[#FFC72C] mt-0.5">
                        {String(day.dayNumber).padStart(2, "0")}
                        {isToday && (
                          <span className="block text-[9px] uppercase tracking-widest text-emerald-300 font-extrabold">
                            HOJE
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Linhas por Funcionário */}
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empStore = stores.find((s) => s.id === emp.storeId);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Coluna Fixa do Funcionário (ao clicar, abre Perfil Completo) */}
                      <td
                        onClick={() => onSelectEmployee(emp)}
                        className="py-3 px-4 sticky left-0 bg-white hover:bg-amber-50/80 cursor-pointer z-10 transition-colors border-r border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#005C30]/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate hover:text-[#005C30] transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[11px] font-medium text-slate-500 truncate">
                              {emp.role}
                            </p>
                            <span className="inline-block mt-0.5 text-[10px] text-emerald-800 font-semibold px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 truncate">
                              {empStore?.name.replace("Athleta ", "") || "Athleta"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 7 Células dos Dias (Segunda a Domingo) */}
                      {currentWeekDays.map((day) => {
                        const dayRecord = getRecordForDay(
                          emp.id,
                          emp.storeId,
                          day.date,
                          day.dayOfWeek
                        );

                        const pEntrada = dayRecord.punches.find((p) => p.type === "entrada");
                        const pSaida = dayRecord.punches.find((p) => p.type === "saida");
                        const pIntSai = dayRecord.punches.find((p) => p.type === "intervalo_saida");
                        const pIntRet = dayRecord.punches.find((p) => p.type === "intervalo_retorno");

                        const hasPunches = dayRecord.punches.length > 0;

                        return (
                          <td
                            key={day.date}
                            onClick={() => onSelectDayRecord(dayRecord, emp)}
                            className="p-2 text-center border-l border-slate-200 hover:bg-amber-50 cursor-pointer transition-colors align-top"
                          >
                            <div className="flex flex-col items-center justify-between h-full min-h-[96px] space-y-1.5 p-1 rounded-lg">
                              {/* Status Badge */}
                              <div>{renderStatusBadge(dayRecord.status)}</div>

                              {/* Horário Previsto */}
                              <div className="text-[10px] text-slate-400 font-medium">
                                {dayRecord.isDayOff ? (
                                  <span className="italic">DSR</span>
                                ) : (
                                  `Prev: ${dayRecord.scheduledEntry}-${dayRecord.scheduledExit}`
                                )}
                              </div>

                              {/* Horários Reais */}
                              {hasPunches ? (
                                <div className="space-y-0.5 text-center">
                                  <div className="font-mono font-bold text-slate-800 text-[11px]">
                                    {pEntrada ? pEntrada.time : "--:--"} →{" "}
                                    {pSaida ? pSaida.time : "--:--"}
                                  </div>
                                  {pIntSai && pIntRet && (
                                    <div className="text-[9px] text-slate-500 font-mono">
                                      Int: {pIntSai.time}-{pIntRet.time}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-slate-300 text-xs font-mono">
                                  {dayRecord.isDayOff ? "—" : "--:--"}
                                </div>
                              )}

                              {/* Total de Horas do Dia e Saldo */}
                              <div className="text-[10px] font-bold">
                                {dayRecord.totalWorkedMinutes > 0 ? (
                                  <span className="text-slate-700">
                                    {Math.floor(dayRecord.totalWorkedMinutes / 60)}h{" "}
                                    {dayRecord.totalWorkedMinutes % 60}m
                                    {dayRecord.balanceMinutes !== 0 && (
                                      <span
                                        className={`ml-1 text-[9px] ${
                                          dayRecord.balanceMinutes > 0
                                            ? "text-emerald-600 font-extrabold"
                                            : "text-red-500"
                                        }`}
                                      >
                                        ({formatMinutesHuman(dayRecord.balanceMinutes)})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela com Dica de Interatividade */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#005C30]" />
            <span>
              <strong>Dica do Gestor:</strong> Clique no <strong>nome do funcionário</strong> para
              abrir seu perfil cadastral e espelho completo. Clique em <strong>qualquer dia</strong>{" "}
              para ver as fotos faciais capturadas ao vivo na câmera e realizar correções auditadas.
            </span>
          </div>
          <span className="font-semibold text-slate-700">
            Total exibido: {filteredEmployees.length} colaboradores
          </span>
        </div>
      </div>
    </div>
  );
}
