import React, { useState, useMemo, useEffect } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Employee, BankOfHoursEntry, formatMinutesHuman } from "../../lib/ponto-store";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Building2,
  User,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  History,
  ShieldCheck,
  Scale,
  DollarSign,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface BankOfHoursModuleProps {
  selectedStoreId?: string;
  onStoreChange?: (storeId: string) => void;
  onSelectEmployee?: (employee: Employee) => void;
}

export function BankOfHoursModule({
  selectedStoreId = "all",
  onStoreChange,
  onSelectEmployee,
}: BankOfHoursModuleProps) {
  const { employees, stores, bankEntries, getEmployeeBankSummary, addBankOfHoursAdjustment } =
    usePonto();

  const [storeFilter, setStoreFilter] = useState<string>(selectedStoreId);
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedEmpForStatement, setSelectedEmpForStatement] = useState<string>("all");

  // Modal de Ajuste Manual
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetEmpId, setAdjustTargetEmpId] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"credito" | "debito">("credito");
  const [adjustHours, setAdjustHours] = useState<number>(1);
  const [adjustMinutes, setAdjustMinutes] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [adjustAuthor, setAdjustAuthor] = useState<string>("Carlos Eduardo Silva (Gerente Admin)");

  // Sincroniza storeFilter se a prop mudar
  React.useEffect(() => {
    setStoreFilter(selectedStoreId);
  }, [selectedStoreId]);

  // Colaboradores filtrados
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesStore = storeFilter === "all" || emp.storeId === storeFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        (emp?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp?.role || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStore && matchesSearch;
    });
  }, [employees, storeFilter, searchTerm]);

  // Resumo de cada colaborador
  const employeesSummaries = useMemo(() => {
    return filteredEmployees.map((emp) => {
      const summary = getEmployeeBankSummary(emp.id, selectedMonth);
      return {
        employee: emp,
        ...summary,
      };
    });
  }, [filteredEmployees, selectedMonth, getEmployeeBankSummary, bankEntries]);

  // Totais consolidados da rede
  const consolidatedTotals = useMemo(() => {
    let totalBalance = 0;
    let totalPositiveMonth = 0;
    let totalNegativeMonth = 0;
    let catuaiBalance = 0;
    let boulevardBalance = 0;
    let positiveEmpsCount = 0;
    let negativeEmpsCount = 0;

    employees.forEach((emp) => {
      const sum = getEmployeeBankSummary(emp.id, selectedMonth);
      totalBalance += sum.currentBalanceMinutes;
      totalPositiveMonth += sum.positiveMonthMinutes;
      totalNegativeMonth += sum.negativeMonthMinutes;

      if (emp.storeId === "store-catuai") {
        catuaiBalance += sum.currentBalanceMinutes;
      } else if (emp.storeId === "store-boulevard") {
        boulevardBalance += sum.currentBalanceMinutes;
      }

      if (sum.currentBalanceMinutes > 0) positiveEmpsCount++;
      else if (sum.currentBalanceMinutes < 0) negativeEmpsCount++;
    });

    return {
      totalBalance,
      totalPositiveMonth,
      totalNegativeMonth,
      catuaiBalance,
      boulevardBalance,
      positiveEmpsCount,
      negativeEmpsCount,
    };
  }, [employees, selectedMonth, getEmployeeBankSummary, bankEntries]);

  // Movimentações para o extrato detalhado
  const statementEntries = useMemo(() => {
    let entries = [...bankEntries];

    if (storeFilter !== "all") {
      entries = entries.filter((e) => e.storeId === storeFilter);
    }
    if (selectedEmpForStatement !== "all") {
      entries = entries.filter((e) => e.employeeId === selectedEmpForStatement);
    }
    if (selectedMonth) {
      entries = entries.filter((e) => e.date.startsWith(selectedMonth));
    }

    return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bankEntries, storeFilter, selectedEmpForStatement, selectedMonth]);

  // Abertura do modal de ajuste para colaborador específico
  const handleOpenAdjustment = (employeeId?: string) => {
    setAdjustTargetEmpId(employeeId || (filteredEmployees[0]?.id ?? ""));
    setAdjustType("credito");
    setAdjustHours(1);
    setAdjustMinutes(0);
    setAdjustReason("");
    setIsAdjustModalOpen(true);
  };

  // Submissão do Ajuste Manual
  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetEmpId) {
      toast.error("Selecione um funcionário.");
      return;
    }
    const totalMinutes = Math.max(1, adjustHours * 60 + adjustMinutes);
    if (!adjustReason.trim()) {
      toast.error("A justificativa do ajuste é obrigatória conforme a Portaria 671.");
      return;
    }

    addBankOfHoursAdjustment({
      employeeId: adjustTargetEmpId,
      type: adjustType,
      minutes: totalMinutes,
      reason: adjustReason.trim(),
      authorName: adjustAuthor.trim() || "Administrador Geral",
    });

    const empName = employees.find((e) => e.id === adjustTargetEmpId)?.name || "Colaborador";
    toast.success(
      `Ajuste de ${adjustType === "credito" ? "+" : "-"}${formatMinutesHuman(
        totalMinutes
      )} lançado com sucesso para ${empName}!`
    );

    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOPO: TÍTULO, SUBTÍTULO E FILTROS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#005C30] text-[#FFC72C]">
                Módulo Oficial
              </span>
              <span className="text-xs text-slate-500 font-medium">Acordo de Compensação CLT</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Scale className="w-6 h-6 text-[#005C30]" />
              Gestão Central de Banco de Horas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle de créditos, débitos, horas extras, atrasos e compensações das 2 lojas oficiais da Athleta
            </p>
          </div>

          {/* Filtros de Loja, Mês e Ação Rápida */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de Loja */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Building2 className="w-4 h-4 text-[#005C30]" />
              <select
                value={storeFilter}
                onChange={(e) => {
                  setStoreFilter(e.target.value);
                  onStoreChange?.(e.target.value);
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas as Unidades (Rede)</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Mês */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-4 h-4 text-[#005C30]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="2026-11">Novembro / 2026 (Atual)</option>
                <option value="2026-10">Outubro / 2026</option>
              </select>
            </div>

            {/* Botão Novo Ajuste Manual */}
            <button
              onClick={() => handleOpenAdjustment()}
              className="px-4 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#FFC72C]" />
              Lançar Ajuste Manual
            </button>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE KPIS CONSOLIDADOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Saldo Consolidado da Rede */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saldo Geral da Rede
            </span>
            <div
              className={`p-2 rounded-xl ${
                consolidatedTotals.totalBalance >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-black ${
                consolidatedTotals.totalBalance >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {consolidatedTotals.totalBalance >= 0 ? "+" : "-"}
              {formatMinutesHuman(Math.abs(consolidatedTotals.totalBalance))}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Saldo líquido acumulado somando todos os colaboradores
            </p>
          </div>
        </div>

        {/* KPI 2: Horas Positivas Geradas no Mês */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Créditos no Mês
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700">
              +{formatMinutesHuman(consolidatedTotals.totalPositiveMonth)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Horas extras e créditos acumulados em {selectedMonth === "2026-11" ? "Novembro" : "Outubro"}
            </p>
          </div>
        </div>

        {/* KPI 3: Débitos / Atrasos no Mês */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Débitos no Mês
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-700">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-red-700">
              -{formatMinutesHuman(consolidatedTotals.totalNegativeMonth)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Atrasos, saídas antecipadas e compensações
            </p>
          </div>
        </div>

        {/* KPI 4: Comparativo Lojas Físicas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Catuaí vs Boulevard
            </span>
            <div className="p-2 rounded-xl bg-[#005C30]/10 text-[#005C30]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Shopping Catuaí:</span>
              <span
                className={`font-black ${
                  consolidatedTotals.catuaiBalance >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {consolidatedTotals.catuaiBalance >= 0 ? "+" : "-"}
                {formatMinutesHuman(Math.abs(consolidatedTotals.catuaiBalance))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Shopping Boulevard:</span>
              <span
                className={`font-black ${
                  consolidatedTotals.boulevardBalance >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {consolidatedTotals.boulevardBalance >= 0 ? "+" : "-"}
                {formatMinutesHuman(Math.abs(consolidatedTotals.boulevardBalance))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABELA CONSOLIDADA DOS COLABORADORES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#005C30]" />
              Quadro Geral de Saldos por Funcionário
            </h3>
            <p className="text-xs text-slate-500">
              Visão individualizada do saldo anterior, movimentações no mês e saldo líquido acumulado
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar funcionário ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005C30]/20 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Funcionário / Cargo</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4 text-center">Saldo Anterior</th>
                <th className="py-3 px-4 text-center">Créditos ({selectedMonth === "2026-11" ? "Nov" : "Out"})</th>
                <th className="py-3 px-4 text-center">Débitos ({selectedMonth === "2026-11" ? "Nov" : "Out"})</th>
                <th className="py-3 px-4 text-center">Saldo Acumulado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {employeesSummaries.map(({ employee, previousBalanceMinutes, positiveMonthMinutes, negativeMonthMinutes, currentBalanceMinutes }) => {
                const store = stores.find((s) => s.id === employee.storeId);
                const isPositive = currentBalanceMinutes > 0;
                const isNegative = currentBalanceMinutes < 0;

                return (
                  <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Nome e Foto */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={employee.photoUrl}
                          alt={employee.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0"
                        />
                        <div>
                          <button
                            onClick={() => onSelectEmployee?.(employee)}
                            className="font-bold text-slate-900 hover:text-[#005C30] hover:underline text-left block"
                          >
                            {employee.name}
                          </button>
                          <span className="text-[11px] text-slate-400 block">{employee.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Unidade */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                        {store ? store.name.replace("Athleta ", "") : "Loja"}
                      </span>
                    </td>

                    {/* Saldo Anterior */}
                    <td className="py-3 px-4 text-center font-bold text-slate-600">
                      {previousBalanceMinutes === 0
                        ? "0h 00m"
                        : `${previousBalanceMinutes > 0 ? "+" : "-"}${formatMinutesHuman(
                            Math.abs(previousBalanceMinutes)
                          )}`}
                    </td>

                    {/* Créditos no Mês */}
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {positiveMonthMinutes > 0 ? `+${formatMinutesHuman(positiveMonthMinutes)}` : "—"}
                    </td>

                    {/* Débitos no Mês */}
                    <td className="py-3 px-4 text-center font-bold text-red-600">
                      {negativeMonthMinutes > 0 ? `-${formatMinutesHuman(negativeMonthMinutes)}` : "—"}
                    </td>

                    {/* Saldo Acumulado Atual */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                          isPositive
                            ? "bg-emerald-100 text-emerald-800"
                            : isNegative
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {currentBalanceMinutes === 0
                          ? "0h 00m"
                          : `${isPositive ? "+" : "-"}${formatMinutesHuman(
                              Math.abs(currentBalanceMinutes)
                            )}`}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedEmpForStatement(employee.id);
                            const el = document.getElementById("statement-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                          title="Ver histórico e extrato detalhado de lançamentos"
                        >
                          Extrato
                        </button>
                        <button
                          onClick={() => handleOpenAdjustment(employee.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#005C30]/10 hover:bg-[#005C30]/20 text-[#005C30] font-bold text-[11px] transition-colors flex items-center gap-1"
                          title="Lançar crédito ou débito manual com justificativa"
                        >
                          <PlusCircle className="w-3 h-3" />
                          Ajustar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. EXTRATO DETALHADO DE MOVIMENTAÇÕES */}
      <div id="statement-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-[#005C30]" />
              Extrato Detalhado de Movimentações
            </h3>
            <p className="text-xs text-slate-500">
              Histórico cronológico de todos os créditos, débitos e ajustes com auditoria e justificativas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Colaborador */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs">
              <User className="w-3.5 h-3.5 text-[#005C30]" />
              <select
                value={selectedEmpForStatement}
                onChange={(e) => setSelectedEmpForStatement(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Todos os Colaboradores</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmpForStatement !== "all" && (
              <button
                onClick={() => setSelectedEmpForStatement("all")}
                className="text-[11px] font-bold text-[#005C30] hover:underline"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Funcionário</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-center">Quantidade</th>
                <th className="py-3 px-4">Motivo / Justificativa</th>
                <th className="py-3 px-4 text-center">Saldo Resultante</th>
                <th className="py-3 px-4">Origem / Autor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {statementEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhuma movimentação registrada no período selecionado.
                  </td>
                </tr>
              ) : (
                statementEntries.map((entry) => {
                  const emp = employees.find((e) => e.id === entry.employeeId);
                  const store = stores.find((s) => s.id === entry.storeId);
                  const isCredit = entry.type === "credito";

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Data formatada */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800">
                        {entry.date.split("-").reverse().join("/")}
                      </td>

                      {/* Funcionário */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {emp && (
                            <img
                              src={emp.photoUrl}
                              alt={emp.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="font-bold text-slate-800">{emp ? emp.name : "—"}</span>
                        </div>
                      </td>

                      {/* Loja */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {store ? store.name.replace("Athleta ", "") : "—"}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isCredit
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isCredit ? (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              Crédito (+)
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3" />
                              Débito (-)
                            </>
                          )}
                        </span>
                      </td>

                      {/* Quantidade */}
                      <td
                        className={`py-3 px-4 text-center whitespace-nowrap font-black ${
                          isCredit ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatMinutesHuman(entry.minutes)}
                      </td>

                      {/* Motivo */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={entry.reason}>
                        <div className="flex items-center gap-1.5">
                          {entry.isManualAdjustment && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase shrink-0">
                              Manual
                            </span>
                          )}
                          <span className="truncate">{entry.reason}</span>
                        </div>
                      </td>

                      {/* Saldo Após */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-slate-700">
                        {entry.balanceAfterMinutes === 0
                          ? "0h 00m"
                          : `${entry.balanceAfterMinutes > 0 ? "+" : "-"}${formatMinutesHuman(
                              Math.abs(entry.balanceAfterMinutes)
                            )}`}
                      </td>

                      {/* Origem / Autor */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{entry.author}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL DE AJUSTE MANUAL JUSTIFICADO */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#005C30] text-[#FFC72C]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Novo Ajuste de Banco de Horas</h3>
                  <p className="text-xs text-slate-500">Lançamento oficial com registro em auditoria fiscal</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 pt-4">
              {/* Seleção de Funcionário */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Colaborador Beneficiado / Ajustado *
                </label>
                <select
                  value={adjustTargetEmpId}
                  onChange={(e) => setAdjustTargetEmpId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005C30]/20"
                  required
                >
                  <option value="">Selecione um funcionário...</option>
                  {employees.map((e) => {
                    const st = stores.find((s) => s.id === e.storeId);
                    return (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.role || "Colaborador"} ({st?.name?.replace("Athleta ", "") || st?.name || "Loja"})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tipo de Ajuste */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Natureza da Movimentação *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType("credito")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      adjustType === "credito"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Crédito (+ Horas Extras)
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType("debito")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      adjustType === "debito"
                        ? "bg-red-50 border-red-500 text-red-900 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Débito (- Horas Compensadas)
                  </button>
                </div>
              </div>

              {/* Tempo do Ajuste (Horas e Minutos) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade a Lançar *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">Horas</span>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={adjustHours}
                      onChange={(e) => setAdjustHours(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">Minutos</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      step={5}
                      value={adjustMinutes}
                      onChange={(e) => setAdjustMinutes(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Justificativa Obrigatória */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justificativa Detalhada (Obrigatória Portaria 671) *
                </label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ex: Acordo bilateral de compensação de jornada referente ao evento de lançamento no shopping."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005C30]/20"
                  required
                />
              </div>

              {/* Gestor Responsável */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gestor Responsável pela Autorização
                </label>
                <input
                  type="text"
                  value={adjustAuthor}
                  onChange={(e) => setAdjustAuthor(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
                  required
                />
              </div>

              {/* Alerta de Imutabilidade */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Este lançamento será gravado de forma imutável na trilha de auditoria fiscal e fará parte do espelho oficial do colaborador.
                </span>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
                  Homologar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
