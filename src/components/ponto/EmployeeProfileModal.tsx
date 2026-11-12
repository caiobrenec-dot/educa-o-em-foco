import React, { useState, useMemo } from "react";
import {
  Employee,
  DayTimeRecord,
  Store,
  formatMinutesHuman,
  minutesToTime,
} from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import {
  User,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Camera,
  MapPin,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Phone,
  Mail,
  CreditCard,
  Hash,
} from "lucide-react";

interface EmployeeProfileModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSelectDayRecord?: (record: DayTimeRecord) => void;
}

export function EmployeeProfileModal({
  employee,
  onClose,
  onSelectDayRecord,
}: EmployeeProfileModalProps) {
  const { stores, records, corrections, schedules } = usePonto();

  // Filtro de mês e ano
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1 a 12
  const [activeTab, setActiveTab] = useState<"espelho" | "comprovantes" | "solicitacoes" | "dados">("espelho");

  if (!employee) return null;

  const store = stores.find((s) => s.id === employee.storeId);
  const employeeSchedule = schedules.find((s) => s.id === employee.defaultScheduleId);

  // Registros do funcionário no mês selecionado
  const monthRecords = useMemo(() => {
    const monthStr = String(selectedMonth).padStart(2, "0");
    const prefix = `${selectedYear}-${monthStr}`;
    return records
      .filter((r) => r.employeeId === employee.id && r.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records, employee.id, selectedYear, selectedMonth]);

  // Totais do período
  const stats = useMemo(() => {
    let totalWorkedMinutes = 0;
    let expectedMinutes = 0;
    let totalDelayMinutes = 0;
    let totalExtraMinutes = 0;
    let absencesCount = 0;
    let incompleteCount = 0;
    let daysWorked = 0;

    monthRecords.forEach((r) => {
      totalWorkedMinutes += r.totalWorkedMinutes || 0;
      expectedMinutes += r.expectedWorkedMinutes || 0;
      totalDelayMinutes += r.delayMinutes || 0;
      totalExtraMinutes += r.extraMinutes || 0;

      if (r.status === "ausente") absencesCount++;
      if (r.status === "incompleto") incompleteCount++;
      if (r.punches && r.punches.length > 0) daysWorked++;
    });

    const netBalance = totalWorkedMinutes - expectedMinutes;

    return {
      totalWorkedMinutes,
      expectedMinutes,
      totalDelayMinutes,
      totalExtraMinutes,
      netBalance,
      absencesCount,
      incompleteCount,
      daysWorked,
    };
  }, [monthRecords]);

  // Solicitações do funcionário
  const employeeCorrections = useMemo(() => {
    return corrections.filter((c) => c.employeeId === employee.id);
  }, [corrections, employee.id]);

  // Lista de todos os comprovantes/punches com foto
  const allPunchesWithPhoto = useMemo(() => {
    const list: { punch: any; date: string; dayRecord: DayTimeRecord }[] = [];
    monthRecords.forEach((rec) => {
      rec.punches.forEach((p) => {
        list.push({ punch: p, date: rec.date, dayRecord: rec });
      });
    });
    return list.reverse(); // mais recentes primeiro
  }, [monthRecords]);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Superior com Identidade Athleta */}
        <div className="bg-gradient-to-r from-[#005C30] via-[#004724] to-[#023119] text-white p-5 md:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-[#FFC72C] shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFC72C] text-[#004724]">
                  {employee.status}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {employee.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-white/20 text-white text-xs font-semibold">
                    Matrícula: {employee.matricula}
                  </span>
                </div>
                <p className="text-[#FFC72C] font-semibold text-sm mt-0.5">
                  {employee.role}
                </p>
                <div className="flex items-center gap-3 text-xs text-white/80 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                    {store?.name || "Athleta Londrina"}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FFC72C]" />
                    {employee.contractHoursPerWeek}h semanais
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFC72C]" />
                    PIN Totem: ••••
                  </span>
                </div>
              </div>
            </div>

            {/* Seletor de Mês e Ano */}
            <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10 self-start md:self-auto">
              <button
                onClick={() => {
                  if (selectedMonth === 1) {
                    setSelectedMonth(12);
                    setSelectedYear((y) => y - 1);
                  } else {
                    setSelectedMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center px-3 min-w-[130px]">
                <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                  Competência
                </p>
                <p className="text-sm font-bold text-[#FFC72C]">
                  {monthNames[selectedMonth - 1]} / {selectedYear}
                </p>
              </div>

              <button
                onClick={() => {
                  if (selectedMonth === 12) {
                    setSelectedMonth(1);
                    setSelectedYear((y) => y + 1);
                  } else {
                    setSelectedMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas do Perfil */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/15 pt-3 overflow-x-auto text-xs md:text-sm font-semibold">
            <button
              onClick={() => setActiveTab("espelho")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "espelho"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              Histórico & Espelho de Ponto
            </button>
            <button
              onClick={() => setActiveTab("comprovantes")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "comprovantes"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Camera className="w-4 h-4" />
              Fotos & Comprovantes ({allPunchesWithPhoto.length})
            </button>
            <button
              onClick={() => setActiveTab("solicitacoes")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "solicitacoes"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Correções Solicitadas ({employeeCorrections.length})
            </button>
            <button
              onClick={() => setActiveTab("dados")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "dados"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              Dados Cadastrais & Contrato
            </button>
          </div>
        </div>

        {/* Corpo com Barra de Indicadores Consolidados */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Cards de Métricas do Mês */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Horas Feitas</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {Math.floor(stats.totalWorkedMinutes / 60)}h {stats.totalWorkedMinutes % 60}m
              </p>
              <span className="text-[10px] text-slate-400">Previsto: {Math.floor(stats.expectedMinutes / 60)}h</span>
            </div>

            <div className={`border rounded-xl p-3 ${stats.netBalance >= 0 ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-red-50/60 border-red-200 text-red-800"}`}>
              <span className="text-[11px] font-medium uppercase flex items-center gap-1">
                {stats.netBalance >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Saldo Período
              </span>
              <p className="text-lg font-black mt-0.5">
                {formatMinutesHuman(stats.netBalance)}
              </p>
              <span className="text-[10px] opacity-80">{stats.netBalance >= 0 ? "Crédito positivo" : "Débito a compensar"}</span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-amber-800">
              <span className="text-[11px] font-medium uppercase">Horas Extras</span>
              <p className="text-lg font-black mt-0.5">
                +{Math.floor(stats.totalExtraMinutes / 60)}h {stats.totalExtraMinutes % 60}m
              </p>
              <span className="text-[10px] text-amber-600">Adicional 50%/100%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Atrasos Total</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {stats.totalDelayMinutes} min
              </p>
              <span className="text-[10px] text-slate-400">Tolerância CLT 5m</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Faltas</span>
              <p className={`text-lg font-black mt-0.5 ${stats.absencesCount > 0 ? "text-red-600" : "text-slate-800"}`}>
                {stats.absencesCount} {stats.absencesCount === 1 ? "dia" : "dias"}
              </p>
              <span className="text-[10px] text-slate-400">Injustificadas</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Inconsistências</span>
              <p className={`text-lg font-black mt-0.5 ${stats.incompleteCount > 0 ? "text-amber-600" : "text-slate-800"}`}>
                {stats.incompleteCount}
              </p>
              <span className="text-[10px] text-slate-400">Batidas pendentes</span>
            </div>
          </div>

          {/* CONTEÚDO DA ABA SELECIONADA */}

          {/* 1. ESPELHO DE PONTO COMPLETO */}
          {activeTab === "espelho" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Espelho Mensal de Ponto — {monthNames[selectedMonth - 1]} de {selectedYear}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clique em qualquer dia para ver os comprovantes de marcação e auditoria detalhada.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#005C30]/5 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Previsto</th>
                        <th className="py-2.5 px-3">Entrada 1</th>
                        <th className="py-2.5 px-3">Saída 1 (Alm.)</th>
                        <th className="py-2.5 px-3">Entrada 2 (Ret.)</th>
                        <th className="py-2.5 px-3">Saída 2</th>
                        <th className="py-2.5 px-3">Total Dia</th>
                        <th className="py-2.5 px-3">Saldo</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-center">Fotos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthRecords.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                            Nenhum registro encontrado para este mês.
                          </td>
                        </tr>
                      ) : (
                        monthRecords.map((rec) => {
                          const dateObj = new Date(rec.date + "T00:00:00");
                          const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dateObj.getDay()];
                          const pEntrada = rec.punches.find((p) => p.type === "entrada");
                          const pIntSai = rec.punches.find((p) => p.type === "intervalo_saida");
                          const pIntRet = rec.punches.find((p) => p.type === "intervalo_retorno");
                          const pSaida = rec.punches.find((p) => p.type === "saida");

                          const statusBadge = {
                            presente: "bg-emerald-100 text-emerald-800 border-emerald-200",
                            ausente: "bg-red-100 text-red-800 border-red-200",
                            atrasado: "bg-amber-100 text-amber-800 border-amber-200",
                            folga: "bg-slate-100 text-slate-600 border-slate-200",
                            ferias: "bg-blue-100 text-blue-800 border-blue-200",
                            afastamento: "bg-purple-100 text-purple-800 border-purple-200",
                            incompleto: "bg-orange-100 text-orange-800 border-orange-200",
                            hora_extra: "bg-emerald-600 text-white font-bold",
                          }[rec.status] || "bg-slate-100 text-slate-700";

                          return (
                            <tr
                              key={rec.id}
                              onClick={() => onSelectDayRecord && onSelectDayRecord(rec)}
                              className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                {rec.date.split("-").reverse().join("/")} <span className="text-slate-400 font-normal">({dayName})</span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                                {rec.isDayOff ? (
                                  <span className="text-slate-400 italic">Folga / DSR</span>
                                ) : (
                                  `${rec.scheduledEntry} - ${rec.scheduledExit}`
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">
                                {pEntrada ? pEntrada.time : "-"}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-600">
                                {pIntSai ? pIntSai.time : "-"}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-600">
                                {pIntRet ? pIntRet.time : "-"}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">
                                {pSaida ? pSaida.time : "-"}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900">
                                {rec.totalWorkedMinutes > 0
                                  ? `${Math.floor(rec.totalWorkedMinutes / 60)}h ${rec.totalWorkedMinutes % 60}m`
                                  : "-"}
                              </td>
                              <td className="py-2 px-3 font-semibold">
                                {rec.balanceMinutes !== 0 ? (
                                  <span className={rec.balanceMinutes > 0 ? "text-emerald-700" : "text-red-600"}>
                                    {formatMinutesHuman(rec.balanceMinutes)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">0m</span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] border uppercase font-semibold ${statusBadge}`}>
                                  {rec.status.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                {rec.punches.length > 0 ? (
                                  <div className="flex items-center justify-center -space-x-1.5">
                                    {rec.punches.slice(0, 3).map((p, pIdx) => (
                                      <img
                                        key={pIdx}
                                        src={p.photoUrl}
                                        alt="Facial"
                                        className="w-5 h-5 rounded-full border border-white shadow-xs object-cover"
                                        title={`${p.type}: ${p.time}`}
                                      />
                                    ))}
                                    {rec.punches.length > 3 && (
                                      <span className="w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center text-slate-600">
                                        +{rec.punches.length - 3}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. COMPROVANTES E FOTOS AO VIVO */}
          {activeTab === "comprovantes" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Comprovantes de Marcação com Captura Facial ao Vivo
                </h3>
                <p className="text-xs text-slate-500">
                  Fotos tiradas exclusivamente na câmera no momento exato do registro (sem opção de upload da galeria).
                </p>
              </div>

              {allPunchesWithPhoto.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Camera className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p>Nenhum comprovante com foto capturada neste mês.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {allPunchesWithPhoto.map(({ punch, date, dayRecord }, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectDayRecord && onSelectDayRecord(dayRecord)}
                      className="border border-slate-200 rounded-xl p-3 bg-white hover:border-[#005C30] hover:shadow-md transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                        <img
                          src={punch.photoUrl}
                          alt="Comprovante Facial"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          AO VIVO
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#005C30] text-[10px] text-white font-mono font-bold">
                          {punch.time}
                        </div>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="capitalize">{punch.type.replace("_", " ")}</span>
                          <span className="text-slate-500 font-normal">
                            {date.split("-").reverse().join("/")}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#005C30] shrink-0" />
                          {punch.location.address}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          NSR: #{punch.nsr} • Hash: {punch.hash.slice(0, 16)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. SOLICITAÇÕES DE CORREÇÃO */}
          {activeTab === "solicitacoes" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Solicitações de Ajuste de Ponto
                </h3>
                <p className="text-xs text-slate-500">
                  Histórico de pedidos de correção de batida e justificativas do colaborador.
                </p>
              </div>

              {employeeCorrections.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                  <p>Nenhuma solicitação de correção registrada para este colaborador.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeCorrections.map((corr) => (
                    <div
                      key={corr.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 uppercase">
                            {corr.punchType.replace("_", " ")}
                          </span>
                          <span className="text-slate-500">em {corr.date.split("-").reverse().join("/")}</span>
                          <span className="font-mono font-bold text-[#005C30]">
                            Horário solicitado: {corr.requestedTime}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            corr.status === "aprovada"
                              ? "bg-emerald-100 text-emerald-800"
                              : corr.status === "rejeitada"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {corr.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-slate-700 italic">"{corr.reason}"</p>
                      </div>

                      {corr.reviewedBy && (
                        <p className="text-[11px] text-slate-500">
                          Revisado por <strong>{corr.reviewedBy}</strong> em{" "}
                          {new Date(corr.reviewedAt || "").toLocaleString("pt-BR")}.{" "}
                          {corr.reviewNotes && `Parecer: "${corr.reviewNotes}"`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. DADOS CADASTRAIS & CONTRATO */}
          {activeTab === "dados" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#005C30]" />
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Nome Completo</span>
                    <span className="font-semibold text-slate-800">{employee.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CPF</span>
                    <span className="font-mono font-semibold text-slate-800">{employee.cpf}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">E-mail Corporativo</span>
                    <span className="text-slate-800">{employee.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Telefone / WhatsApp</span>
                    <span className="text-slate-800">{employee.phone}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#005C30]" />
                  Dados Contratuais & Escala
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Unidade de Lotação</span>
                    <span className="font-semibold text-slate-800">{store?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Cargo Atual</span>
                    <span className="font-semibold text-[#005C30]">{employee.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Carga Horária</span>
                    <span className="font-semibold text-slate-800">{employee.contractHoursPerWeek} horas semanais</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Data de Admissão</span>
                    <span className="text-slate-800">{employee.admissionDate.split("-").reverse().join("/")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Escala Padrão Vinculada</span>
                    <span className="font-semibold text-slate-800">{employeeSchedule?.name || "Escala Comercial Shopping"}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Horário base: {employeeSchedule?.entryTime} às {employeeSchedule?.exitTime} (Intervalo: {employeeSchedule?.breakStartTime} - {employeeSchedule?.breakEndTime})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
