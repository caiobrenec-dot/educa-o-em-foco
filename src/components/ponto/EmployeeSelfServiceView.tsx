import React, { useState, useMemo } from "react";
import { Employee, DayTimeRecord, Store, formatMinutesHuman, timeToMinutes, minutesToTime } from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import { AthletaLogo } from "../AthletaLogo";
import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Camera,
  FileText,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Send,
  X,
  ShieldCheck,
  User,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface EmployeeSelfServiceViewProps {
  onBackToAdmin: () => void;
  initialEmployeeId?: string;
}

export function EmployeeSelfServiceView({
  onBackToAdmin,
  initialEmployeeId = "emp-2", // Mariana Santos por padrão
}: EmployeeSelfServiceViewProps) {
  const { employees, stores, records, schedules, getEmployeeBankSummary, requestCorrection } = usePonto();

  // Seleção de qual funcionário está acessando
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId);
  const employee = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const store = stores.find((s) => s.id === employee.storeId);

  // Aba ativa na Área do Colaborador
  const [activeTab, setActiveTab] = useState<"meu_ponto" | "minha_escala" | "banco_horas" | "historico" | "comprovantes">("meu_ponto");

  // Competência selecionada para histórico
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");

  // Modal de solicitação de correção
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [corrDate, setCorrDate] = useState("2026-11-10");
  const [corrType, setCorrType] = useState<"entrada" | "intervalo_saida" | "intervalo_retorno" | "saida">("saida");
  const [corrTime, setCorrTime] = useState("18:05");
  const [corrReason, setCorrReason] = useState("");

  const todayStr = "2026-11-11"; // Data base do sistema 11/11/2026

  // Registro de hoje do colaborador
  const todayRecord = useMemo(() => {
    return records.find((r) => r.employeeId === employee.id && r.date === todayStr);
  }, [records, employee.id, todayStr]);

  // Batidas de hoje
  const pEntrada = todayRecord?.punches.find((p) => p.type === "entrada");
  const pIntSai = todayRecord?.punches.find((p) => p.type === "intervalo_saida");
  const pIntRet = todayRecord?.punches.find((p) => p.type === "intervalo_retorno");
  const pSaida = todayRecord?.punches.find((p) => p.type === "saida");

  // Escala padrão do colaborador
  const empSchedule = schedules.find((s) => s.id === employee.defaultScheduleId) || schedules[0];

  // Cálculo de jornada de hoje
  const scheduledEntry = todayRecord?.scheduledEntry || empSchedule.entryTime;
  const scheduledExit = todayRecord?.scheduledExit || empSchedule.exitTime;
  const scheduledBreak = todayRecord?.scheduledBreak || `${empSchedule.breakStartTime} - ${empSchedule.breakEndTime}`;

  // Horas trabalhadas até o momento
  const workedMinutesToday = todayRecord ? todayRecord.totalWorkedMinutes : 0;
  const expectedTotalMinutes = 440; // 7h20 padrão
  const remainingMinutes = Math.max(0, expectedTotalMinutes - workedMinutesToday);

  // Status da jornada de hoje
  let currentStatusLabel = "Aguardando Início";
  let currentStatusBadge = "bg-slate-100 text-slate-700";

  if (pSaida) {
    currentStatusLabel = "Jornada Concluída";
    currentStatusBadge = "bg-emerald-100 text-emerald-800";
  } else if (pIntSai && !pIntRet) {
    currentStatusLabel = "Em Intervalo / Almoço";
    currentStatusBadge = "bg-amber-100 text-amber-800";
  } else if (pEntrada) {
    currentStatusLabel = "Trabalhando";
    currentStatusBadge = "bg-emerald-500 text-white font-bold animate-pulse";
  }

  // Resumo do Banco de Horas
  const bankSummary = useMemo(() => {
    return getEmployeeBankSummary(employee.id, selectedMonth);
  }, [employee.id, selectedMonth, getEmployeeBankSummary]);

  // Registros do mês selecionado
  const monthRecords = useMemo(() => {
    return records
      .filter((r) => r.employeeId === employee.id && r.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, employee.id, selectedMonth]);

  // Envio de solicitação de correção
  const handleSendCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrDate || !corrTime || !corrReason.trim()) {
      toast.error("Preencha todos os campos da solicitação.");
      return;
    }

    requestCorrection({
      employeeId: employee.id,
      storeId: employee.storeId,
      date: corrDate,
      punchType: corrType,
      requestedTime: corrTime,
      reason: corrReason,
    });

    toast.success("Solicitação enviada com sucesso para aprovação do gerente!");
    setIsCorrectionModalOpen(false);
    setCorrReason("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Topo Exclusivo da Área do Colaborador */}
      <header className="bg-gradient-to-r from-[#005C30] via-[#004724] to-[#012e18] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AthletaLogo variant="white" size="sm" subtitleText="MEU PONTO" />
              <div className="h-6 w-px bg-white/20 hidden sm:block" />
              <span className="text-xs font-bold text-[#FFC72C] hidden sm:block">
                Portal Individual do Colaborador
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Simulador de Acesso: Selecionar outro funcionário */}
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                <User className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span className="text-white/60 text-[10px] uppercase font-bold">Colaborador:</span>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onBackToAdmin}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                ← Painel ADM TOTAL
              </button>
            </div>
          </div>

          {/* Card do Perfil do Funcionário Logado */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFC72C] shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{employee.name}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFC72C] text-[#004724] text-[10px] font-black uppercase">
                    {employee.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80 mt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-[#FFC72C]">
                    <Building2 className="w-3.5 h-3.5" />
                    {store?.name}
                  </span>
                  <span>•</span>
                  <span>Matrícula: {employee.matricula}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCorrectionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#004724] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              Solicitar Correção de Ponto
            </button>
          </div>

          {/* Abas do Colaborador */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto text-xs font-bold scrollbar-none">
            {[
              { id: "meu_ponto", label: "Meu Ponto Hoje", icon: Clock },
              { id: "banco_horas", label: "Meu Banco de Horas", icon: TrendingUp },
              { id: "minha_escala", label: "Minha Escala", icon: Calendar },
              { id: "historico", label: "Meu Histórico", icon: FileText },
              { id: "comprovantes", label: "Comprovantes com Foto", icon: Camera },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-[#f8fafc] text-[#005C30] font-black shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-6">
        {/* ABA 1: MEU PONTO HOJE (JORNADA DE HOJE) */}
        {activeTab === "meu_ponto" && (
          <div className="space-y-6">
            {/* Card Principal: Status da Jornada de Hoje */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                    Data Oficial: Quarta-feira, 11 de Novembro de 2026
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Acompanhamento da Jornada de Hoje
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-black ${currentStatusBadge}`}>
                    {currentStatusLabel}
                  </span>
                </div>
              </div>

              {/* Grade Comparativa: Horários Previstos vs Registrados */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Entrada */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Entrada</span>
                  <div>
                    <span className="text-xs text-slate-400 block">Previsto:</span>
                    <span className="font-mono text-sm font-semibold text-slate-700">{scheduledEntry}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500 block font-bold">Registrado:</span>
                    {pEntrada ? (
                      <span className="font-mono text-lg font-black text-[#005C30] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {pEntrada.time}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Saída Intervalo */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">2. Início Intervalo</span>
                  <div>
                    <span className="text-xs text-slate-400 block">Previsto:</span>
                    <span className="font-mono text-sm font-semibold text-slate-700">{empSchedule.breakStartTime}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500 block font-bold">Registrado:</span>
                    {pIntSai ? (
                      <span className="font-mono text-lg font-black text-[#005C30] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {pIntSai.time}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Retorno Intervalo */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Retorno Intervalo</span>
                  <div>
                    <span className="text-xs text-slate-400 block">Previsto:</span>
                    <span className="font-mono text-sm font-semibold text-slate-700">{empSchedule.breakEndTime}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500 block font-bold">Registrado:</span>
                    {pIntRet ? (
                      <span className="font-mono text-lg font-black text-[#005C30] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {pIntRet.time}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Saída do Expediente */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">4. Fim de Expediente</span>
                  <div>
                    <span className="text-xs text-slate-400 block">Previsto:</span>
                    <span className="font-mono text-sm font-semibold text-slate-700">{scheduledExit}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200/60">
                    <span className="text-xs text-slate-500 block font-bold">Registrado:</span>
                    {pSaida ? (
                      <span className="font-mono text-lg font-black text-[#005C30] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {pSaida.time}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg inline-block">
                        Pendente (Não encerrado)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicadores de Tempo Trabalhado e Tempo Restante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Horas Trabalhadas até o Momento:</span>
                  <p className="text-2xl font-black text-[#005C30] mt-0.5">
                    {Math.floor(workedMinutesToday / 60)}h {workedMinutesToday % 60}m
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Carga diária contratual: 7h 20m</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Tempo Restante Estimado:</span>
                  <p className="text-2xl font-black text-amber-700 mt-0.5">
                    {pSaida ? "0h 00m (Encerrado)" : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Saída prevista no totem: {scheduledExit}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#005C30] shrink-0" />
                <span>
                  <strong>Aviso Oficial de Conformidade:</strong> O ponto é registrado através do Totem Quiosque na loja com foto facial ao vivo e PIN individual. Horários previstos não constituem comprovação de jornada até a efetiva batida.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: MEU BANCO DE HORAS */}
        {activeTab === "banco_horas" && (
          <div className="space-y-6">
            {/* Header com os 4 Indicadores Ilustrativos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Saldo Anterior */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Anterior</span>
                <p className="text-xl font-black text-slate-800 mt-1 font-mono">
                  {formatMinutesHuman(bankSummary.previousBalanceMinutes)}
                </p>
                <span className="text-[10px] text-slate-400">Até Outubro/2026</span>
              </div>

              {/* Horas Positivas no Mês */}
              <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Horas Positivas (Mês)</span>
                <p className="text-xl font-black text-emerald-700 mt-1 font-mono">
                  +{Math.floor(bankSummary.positiveMonthMinutes / 60)}h {String(bankSummary.positiveMonthMinutes % 60).padStart(2, "0")}m
                </p>
                <span className="text-[10px] text-emerald-600">Créditos de horas</span>
              </div>

              {/* Horas Negativas no Mês */}
              <div className="bg-red-50/60 rounded-2xl border border-red-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold text-red-800 uppercase block">Horas Negativas (Mês)</span>
                <p className="text-xl font-black text-red-600 mt-1 font-mono">
                  -{Math.floor(bankSummary.negativeMonthMinutes / 60)}h {String(bankSummary.negativeMonthMinutes % 60).padStart(2, "0")}m
                </p>
                <span className="text-[10px] text-red-500">Atrasos / Saídas</span>
              </div>

              {/* Saldo Atual Acumulado */}
              <div className="bg-gradient-to-br from-[#005C30] to-[#003d20] text-white rounded-2xl p-4 shadow-md">
                <span className="text-[10px] font-bold text-[#FFC72C] uppercase block">Saldo Atual Total</span>
                <p className="text-2xl font-black text-white mt-1 font-mono">
                  {formatMinutesHuman(bankSummary.currentBalanceMinutes)}
                </p>
                <span className="text-[10px] text-white/70">
                  {bankSummary.currentBalanceMinutes >= 0 ? "Crédito positivo" : "Débito a compensar"}
                </span>
              </div>
            </div>

            {/* Extrato Detalhado de Movimentações */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Extrato de Movimentações do Banco de Horas</h4>
                  <p className="text-xs text-slate-500">Histórico de todas as compensações, extras e atrasos</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Motivo / Descrição</th>
                      <th className="py-2.5 px-3">Quantidade</th>
                      <th className="py-2.5 px-3">Saldo Resultante</th>
                      <th className="py-2.5 px-3">Origem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bankSummary.entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Nenhuma movimentação registrada no período.
                        </td>
                      </tr>
                    ) : (
                      bankSummary.entries.map((ent) => (
                        <tr key={ent.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {ent.date.split("-").reverse().join("/")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ent.type === "credito"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ent.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{ent.reason}</td>
                          <td className="py-2.5 px-3 font-bold font-mono">
                            <span className={ent.type === "credito" ? "text-emerald-700" : "text-red-600"}>
                              {ent.type === "credito" ? "+" : "-"}{formatMinutesHuman(ent.minutes).replace(/^[+-]/, "")}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {formatMinutesHuman(ent.balanceAfterMinutes)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">{ent.author}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: MINHA ESCALA SEMANAL */}
        {activeTab === "minha_escala" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Escala de Trabalho Semanal</h3>
              <p className="text-xs text-slate-500">
                Turno: <strong>{empSchedule.name}</strong> • Carga horária: {employee.contractHoursPerWeek}h semanais
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-center">
              {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dayName, idx) => {
                const dayNum = idx === 6 ? 0 : idx + 1;
                const isWork = empSchedule.workDays.includes(dayNum);

                return (
                  <div
                    key={dayName}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      isWork
                        ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider block text-[11px] text-slate-900">
                      {dayName}
                    </span>

                    {isWork ? (
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#005C30] text-white uppercase block">
                          Trabalho
                        </span>
                        <p className="font-mono font-bold text-slate-900 pt-1 text-sm">
                          {empSchedule.entryTime} - {empSchedule.exitTime}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Int: {empSchedule.breakStartTime}-{empSchedule.breakEndTime}
                        </p>
                      </div>
                    ) : (
                      <div className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-600 uppercase">
                          Folga / DSR
                        </span>
                        <p className="text-slate-400 text-xs italic mt-2">Sem expediente</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 4: MEU HISTÓRICO DE REGISTROS */}
        {activeTab === "historico" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Espelho Mensal do Funcionário</h3>
                <p className="text-xs text-slate-500">Histórico de ponto para conferência pessoal</p>
              </div>

              {/* Seletor de Competência */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Competência:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 border rounded-xl bg-slate-50 text-xs font-bold text-[#005C30]"
                >
                  <option value="2026-11">Novembro / 2026</option>
                  <option value="2026-10">Outubro / 2026</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#005C30]/5 border-b text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Entrada 1</th>
                    <th className="py-2.5 px-3">Saída Alm.</th>
                    <th className="py-2.5 px-3">Retorno</th>
                    <th className="py-2.5 px-3">Saída 2</th>
                    <th className="py-2.5 px-3">Horas Feitas</th>
                    <th className="py-2.5 px-3">Saldo</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthRecords.map((r) => {
                    const p1 = r.punches.find((p) => p.type === "entrada");
                    const p2 = r.punches.find((p) => p.type === "intervalo_saida");
                    const p3 = r.punches.find((p) => p.type === "intervalo_retorno");
                    const p4 = r.punches.find((p) => p.type === "saida");

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {r.date.split("-").reverse().join("/")}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{p1 ? p1.time : "-"}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{p2 ? p2.time : "-"}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{p3 ? p3.time : "-"}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{p4 ? p4.time : "-"}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {r.totalWorkedMinutes > 0 ? `${Math.floor(r.totalWorkedMinutes / 60)}h ${r.totalWorkedMinutes % 60}m` : "-"}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          {r.balanceMinutes !== 0 ? (
                            <span className={r.balanceMinutes > 0 ? "text-emerald-700" : "text-red-600"}>
                              {formatMinutesHuman(r.balanceMinutes)}
                            </span>
                          ) : (
                            <span className="text-slate-400">0m</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 5: COMPROVANTES COM FOTO */}
        {activeTab === "comprovantes" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Minhas Fotos e Comprovantes de Marcação</h3>
              <p className="text-xs text-slate-500">Todas as fotos tiradas no momento da batida no Totem Quiosque da Loja</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {monthRecords.flatMap((r) => r.punches).slice(0, 12).map((punch, idx) => (
                <div key={idx} className="border rounded-2xl overflow-hidden bg-slate-50 p-2.5 space-y-2">
                  <div className="aspect-square rounded-xl overflow-hidden bg-black relative">
                    <img src={punch.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#005C30] text-[9px] font-bold text-white font-mono">
                      {punch.time}
                    </span>
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block capitalize">{punch.type.replace("_", " ")}</span>
                    <span className="text-slate-400 text-[10px] font-mono">NSR: #{punch.nsr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE SOLICITAÇÃO DE CORREÇÃO */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-base font-bold text-slate-900">Solicitar Correção de Ponto</h4>
              <button onClick={() => setIsCorrectionModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Esqueceu de bater o ponto ou houve falha no dispositivo? Envie a justificativa para aprovação do gerente.
            </p>

            <form onSubmit={handleSendCorrection} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Data da Ocorrência *</label>
                <input
                  type="date"
                  value={corrDate}
                  onChange={(e) => setCorrDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Batida</label>
                  <select
                    value={corrType}
                    onChange={(e) => setCorrType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="intervalo_saida">Saída Intervalo</option>
                    <option value="intervalo_retorno">Retorno Intervalo</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Horário Real (HH:MM) *</label>
                  <input
                    type="time"
                    value={corrTime}
                    onChange={(e) => setCorrTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Justificativa Detalhada *</label>
                <textarea
                  rows={3}
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  placeholder="Ex: Fila no caixa no fechamento da loja ou instabilidade técnica..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold shadow-md"
                >
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
