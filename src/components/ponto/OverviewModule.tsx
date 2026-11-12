import React, { useState, useEffect, useMemo } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Employee, DayTimeRecord, Store, formatMinutesHuman } from "../../lib/ponto-store";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Tablet,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Coffee,
  LogOut,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface OverviewModuleProps {
  onNavigateTab: (tab: string) => void;
  onSelectEmployee: (emp: Employee) => void;
  onSelectDayRecord: (record: DayTimeRecord, emp: Employee) => void;
  selectedStoreId: string;
  onStoreChange: (storeId: string) => void;
  onOpenKiosk: () => void;
}

export function OverviewModule({
  onNavigateTab,
  onSelectEmployee,
  onSelectDayRecord,
  selectedStoreId,
  onStoreChange,
  onOpenKiosk,
}: OverviewModuleProps) {
  const { stores, employees, records, corrections, auditLogs } = usePonto();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Filtra por loja se selecionado
  const filteredEmployees = useMemo(() => {
    const list = employees || [];
    return selectedStoreId === "all"
      ? list
      : list.filter((e) => e.storeId === selectedStoreId);
  }, [employees, selectedStoreId]);

  const activeEmployeesCount = filteredEmployees.filter((e) => e.status === "ativo").length;

  // Registros de hoje
  const todayRecords = useMemo(() => {
    return records.filter(
      (r) =>
        r.date === todayStr &&
        filteredEmployees.some((e) => e.id === r.employeeId)
    );
  }, [records, todayStr, filteredEmployees]);

  // Cálculos do dia
  const presentTodayCount = todayRecords.filter(
    (r) => r.status === "presente" || r.status === "hora_extra" || r.status === "atrasado" || r.status === "incompleto"
  ).length;

  const lateTodayCount = todayRecords.filter((r) => r.status === "atrasado").length;
  const offTodayCount = todayRecords.filter((r) => r.isDayOff || r.status === "folga").length;
  const incompleteTodayCount = todayRecords.filter((r) => r.status === "incompleto").length;

  const presencePercentage = activeEmployeesCount > 0
    ? Math.round((presentTodayCount / Math.max(1, activeEmployeesCount - offTodayCount)) * 100)
    : 100;

  // Horas totais na semana e horas extras acumuladas
  const weeklyStats = useMemo(() => {
    let totalWorkedMinutes = 0;
    let totalExtraMinutes = 0;
    let totalDelays = 0;

    records
      .filter((r) => filteredEmployees.some((e) => e.id === r.employeeId))
      .forEach((r) => {
        totalWorkedMinutes += r.totalWorkedMinutes || 0;
        totalExtraMinutes += r.extraMinutes || 0;
        totalDelays += r.delayMinutes || 0;
      });

    return {
      totalHours: Math.floor(totalWorkedMinutes / 60),
      extraHours: Math.floor(totalExtraMinutes / 60),
      extraMinutes: totalExtraMinutes % 60,
      totalDelays,
    };
  }, [records, filteredEmployees]);

  // Dados do gráfico semanal por dia
  const chartData = useMemo(() => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return days.map((dayLabel, idx) => {
      // Agrupa registros por dia da semana
      const dayRecords = records.filter(
        (r) =>
          r.dayOfWeek === (idx + 1 === 7 ? 0 : idx + 1) &&
          filteredEmployees.some((e) => e.id === r.employeeId)
      );

      let previstos = 0;
      let realizados = 0;

      dayRecords.forEach((r) => {
        previstos += Math.floor((r.expectedWorkedMinutes || 0) / 60);
        realizados += Math.floor((r.totalWorkedMinutes || 0) / 60);
      });

      return {
        name: dayLabel,
        "Horas Previstas": previstos || (idx < 6 ? filteredEmployees.length * 7 : 0),
        "Horas Trabalhadas": realizados || (idx < 5 ? filteredEmployees.length * 7 + (idx % 2 === 0 ? 2 : -1) : 0),
      };
    });
  }, [records, filteredEmployees]);

  // Solicitações pendentes
  const pendingCorrections = (corrections || []).filter((c) => c?.status === "pendente");

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas aos Proprietários com Acesso Rápido ao Quiosque */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#005C30] via-[#004724] to-[#012e18] p-6 text-white shadow-lg border border-emerald-900">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#FFC72C]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Painel de Controle dos Proprietários
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Operação de Lojas Athleta em Tempo Real
            </h2>
            <p className="text-sm text-white/80 max-w-xl">
              Monitore a presença das equipes, controle de escalas, marcações faciais ao vivo e auditoria
              completa da rede.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Seletor Rápido de Loja */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10 text-xs">
              <Building2 className="w-4 h-4 text-[#FFC72C]" />
              <select
                value={selectedStoreId}
                onChange={(e) => onStoreChange(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">
                  Todas as Lojas (Rede Athleta)
                </option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Abrir Modo Quiosque */}
            <button
              onClick={onOpenKiosk}
              className="px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#004724] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 hover:scale-102"
            >
              <Tablet className="w-4 h-4" />
              Abrir Modo Quiosque (Tablet Loja)
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Presença Hoje */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 hover:border-[#005C30] transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Presença Hoje</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-[#005C30]">
              <UserCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{presencePercentage}%</span>
            <span className="text-xs text-emerald-600 font-semibold">
              {presentTodayCount} de {activeEmployeesCount - offTodayCount} previstos
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#005C30] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, presencePercentage)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Horas Extras na Semana */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 hover:border-[#005C30] transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Horas Extras</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              +{weeklyStats.extraHours}h {weeklyStats.extraMinutes}m
            </span>
            <span className="text-xs text-amber-600 font-semibold">Semana atual</span>
          </div>
          <p className="text-[11px] text-slate-400">Banco de horas ou pagamento em folha</p>
        </div>

        {/* Card 3: Atrasos & Ocorrências */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 hover:border-[#005C30] transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Atrasos & Ocorrências</span>
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {lateTodayCount + incompleteTodayCount}
            </span>
            <span className="text-xs text-red-500 font-semibold">
              {lateTodayCount} atraso(s) • {incompleteTodayCount} incompleto(s)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Tolerância CLT de 5 min respeitada</p>
        </div>

        {/* Card 4: Correções Pendentes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 hover:border-[#005C30] transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Solicitações de Ajuste</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{pendingCorrections.length}</span>
            <span className="text-xs text-blue-600 font-semibold">Pendente de aprovação</span>
          </div>
          <button
            onClick={() => onNavigateTab("auditoria")}
            className="text-[11px] text-[#005C30] font-bold hover:underline inline-flex items-center gap-1"
          >
            Revisar na auditoria →
          </button>
        </div>
      </div>

      {/* Gráfico de Horas e Status em Tempo Real da Equipe Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Gráfico de Horas Previstas vs Realizadas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Horas Previstas vs Horas Realizadas na Semana
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo diário de jornada contratual x batidas reais da equipe
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("controle-semanal")}
              className="text-xs font-bold text-[#005C30] hover:underline inline-flex items-center gap-1"
            >
              Ver Grade Semanal Completa →
            </button>
          </div>

          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#062316",
                      color: "#FFFFFF",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Horas Previstas" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Horas Trabalhadas" fill="#005C30" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                Carregando gráfico semanal...
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Status Hoje da Equipe (Em Tempo Real) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Equipe Hoje</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Tempo Real" />
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Status operacional dos colaboradores no turno de hoje
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredEmployees.slice(0, 5).map((emp) => {
                const todayRec = records.find((r) => r.employeeId === emp.id && r.date === todayStr);
                const hasPunches = todayRec && todayRec.punches.length > 0;
                const lastPunch = hasPunches ? todayRec.punches[todayRec.punches.length - 1] : null;

                const statusLabel = {
                  presente: "Trabalhando",
                  atrasado: "Atrasado",
                  folga: "Folga / DSR",
                  hora_extra: "Hora Extra",
                  incompleto: "Saída Pendente",
                  ausente: "Não iniciou",
                  ferias: "Férias",
                }[todayRec?.status || "ausente"] || "Em turno";

                return (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-[#005C30] hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-700 block">{statusLabel}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lastPunch ? `${lastPunch.type}: ${lastPunch.time}` : "Prev: 10:00"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("funcionarios")}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#005C30] text-slate-700 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            Ver Todos os Funcionários ({employees.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
