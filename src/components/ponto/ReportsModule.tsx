import React, { useState, useMemo, useEffect } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Employee, formatMinutesHuman, DayTimeRecord } from "../../lib/ponto-store";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

interface ReportsModuleProps {
  selectedStoreId: string;
  onSelectEmployee: (emp: Employee) => void;
}

type ReportCategory = "diario" | "semanal" | "mensal";

export function ReportsModule({ selectedStoreId, onSelectEmployee }: ReportsModuleProps) {
  const { employees, records, stores, getEmployeeBankSummary } = usePonto();

  // Tipo de relatório ativo
  const [reportCategory, setReportCategory] = useState<ReportCategory>("diario");

  // Filtros de tempo
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-11");
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(46); // Semana de 09 a 15 de Nov/2026
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [storeFilter, setStoreFilter] = useState<string>(selectedStoreId);

  React.useEffect(() => {
    setStoreFilter(selectedStoreId);
  }, [selectedStoreId]);

  // Colaboradores filtrados pela loja
  const filteredEmployees = useMemo(() => {
    return storeFilter === "all"
      ? employees
      : employees.filter((e) => e.storeId === storeFilter);
  }, [employees, storeFilter]);

  // ==========================================
  // 1. DADOS DO RELATÓRIO DIÁRIO
  // ==========================================
  const dailyReportData = useMemo(() => {
    return filteredEmployees.map((emp) => {
      const store = stores.find((s) => s.id === emp.storeId);
      const record = records.find((r) => r.employeeId === emp.id && r.date === selectedDate);

      const entryPunch = record?.punches.find((p) => p.type === "entrada");
      const exitPunch = record?.punches.slice().reverse().find((p) => p.type === "saida");
      const breakExit = record?.punches.find((p) => p.type === "intervalo_saida");
      const breakReturn = record?.punches.find((p) => p.type === "intervalo_retorno");

      const isWorking = record && record.punches.length > 0;
      const isAbsent = !record || (record.punches.length === 0 && !record.isDayOff);
      const isDayOff = record?.isDayOff;

      return {
        emp,
        storeName: store?.name?.replace("Athleta ", "") || store?.name || "Loja",
        record,
        isWorking,
        isAbsent,
        isDayOff,
        entryTime: entryPunch ? entryPunch.time : "—",
        exitTime: exitPunch ? exitPunch.time : record?.punches.length ? "Pendente" : "—",
        breakInterval:
          breakExit && breakReturn ? `${breakExit.time} - ${breakReturn.time}` : "—",
        delayMinutes: record?.delayMinutes || 0,
        extraMinutes: record?.extraMinutes || 0,
        totalWorkedMinutes: record?.totalWorkedMinutes || 0,
        status: record ? record.status : "ausente",
      };
    });
  }, [filteredEmployees, records, stores, selectedDate]);

  // ==========================================
  // 2. DADOS DO RELATÓRIO SEMANAL
  // ==========================================
  const weeklyReportData = useMemo(() => {
    // Semana de 09/11/2026 a 15/11/2026
    const weekDates = [
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ];

    return filteredEmployees.map((emp) => {
      const store = stores.find((s) => s.id === emp.storeId);
      const empWeekRecords = records.filter(
        (r) => r.employeeId === emp.id && weekDates.includes(r.date)
      );

      let totalWorkedMinutes = 0;
      let totalExpectedMinutes = 0;
      let totalExtraMinutes = 0;
      let totalDelayMinutes = 0;
      let daysWorkedCount = 0;

      empWeekRecords.forEach((r) => {
        totalWorkedMinutes += r.totalWorkedMinutes || 0;
        totalExpectedMinutes += r.expectedWorkedMinutes || 0;
        totalExtraMinutes += r.extraMinutes || 0;
        totalDelayMinutes += r.delayMinutes || 0;
        if (r.punches.length > 0) daysWorkedCount++;
      });

      const netBalanceMinutes = totalWorkedMinutes - totalExpectedMinutes;

      return {
        emp,
        storeName: store?.name?.replace("Athleta ", "") || store?.name || "Loja",
        totalWorkedMinutes,
        totalExpectedMinutes,
        totalExtraMinutes,
        totalDelayMinutes,
        daysWorkedCount,
        netBalanceMinutes,
      };
    });
  }, [filteredEmployees, records, stores, selectedWeekNumber]);

  // ==========================================
  // 3. DADOS DO RELATÓRIO MENSAL (ESPELHO FISCAL)
  // ==========================================
  const monthlyReportData = useMemo(() => {
    return filteredEmployees.map((emp) => {
      const store = stores.find((s) => s.id === emp.storeId);
      const empMonthRecords = records.filter(
        (r) => r.employeeId === emp.id && r.date.startsWith(selectedMonth)
      );

      let totalWorkedMinutes = 0;
      let totalExpectedMinutes = 0;
      let totalExtraMinutes = 0;
      let totalDelayMinutes = 0;
      let daysPresent = 0;
      let daysAbsent = 0;

      empMonthRecords.forEach((r) => {
        totalWorkedMinutes += r.totalWorkedMinutes || 0;
        totalExpectedMinutes += r.expectedWorkedMinutes || 0;
        totalExtraMinutes += r.extraMinutes || 0;
        totalDelayMinutes += r.delayMinutes || 0;
        if (r.punches.length > 0) daysPresent++;
        else if (!r.isDayOff) daysAbsent++;
      });

      const bankSummary = getEmployeeBankSummary(emp.id, selectedMonth);

      return {
        emp,
        storeName: store?.name?.replace("Athleta ", "") || store?.name || "Loja",
        totalWorkedMinutes,
        totalExpectedMinutes,
        totalExtraMinutes,
        totalDelayMinutes,
        daysPresent,
        daysAbsent,
        bankBalance: bankSummary.currentBalanceMinutes,
      };
    });
  }, [filteredEmployees, records, stores, selectedMonth, getEmployeeBankSummary]);

  // ==========================================
  // EXPORTAÇÃO CSV / EXCEL COM BOM UTF-8
  // ==========================================
  const handleExportCSV = () => {
    let csv = "\uFEFF"; // UTF-8 BOM para compatibilidade com Microsoft Excel brasileiro

    if (reportCategory === "diario") {
      csv += `RELATÓRIO DIÁRIO DE JORNADA - ATHLETA PONTO\n`;
      csv += `Data de Referência:;${selectedDate.split("-").reverse().join("/")}\n`;
      csv += `Unidade:;${storeFilter === "all" ? "Todas as Lojas" : storeFilter}\n\n`;
      csv += `Funcionário;Cargo;Loja;Entrada;Saída;Intervalo;Atraso_Min;Horas_Extras_Min;Total_Trabalhado;Status\n`;

      dailyReportData.forEach((d) => {
        csv += `"${d.emp.name}";"${d.emp.role}";"${d.storeName}";"${d.entryTime}";"${d.exitTime}";"${d.breakInterval}";${d.delayMinutes};${d.extraMinutes};"${formatMinutesHuman(d.totalWorkedMinutes)}";"${d.status}"\n`;
      });
    } else if (reportCategory === "semanal") {
      csv += `RELATÓRIO SEMANAL DE HORAS - ATHLETA PONTO\n`;
      csv += `Período:;Semana 46 (09/11/2026 a 15/11/2026)\n`;
      csv += `Unidade:;${storeFilter === "all" ? "Todas as Lojas" : storeFilter}\n\n`;
      csv += `Funcionário;Cargo;Loja;Dias_Trabalhados;Horas_Previstas;Horas_Realizadas;Horas_Extras;Atrasos;Saldo_Semanal\n`;

      weeklyReportData.forEach((d) => {
        csv += `"${d.emp.name}";"${d.emp.role}";"${d.storeName}";${d.daysWorkedCount};"${formatMinutesHuman(d.totalExpectedMinutes)}";"${formatMinutesHuman(d.totalWorkedMinutes)}";"${formatMinutesHuman(d.totalExtraMinutes)}";"${formatMinutesHuman(d.totalDelayMinutes)}";"${d.netBalanceMinutes >= 0 ? "+" : "-"}${formatMinutesHuman(Math.abs(d.netBalanceMinutes))}"\n`;
      });
    } else {
      csv += `RELATÓRIO MENSAL & ESPELHO DE BANCO DE HORAS - ATHLETA PONTO\n`;
      csv += `Mês de Referência:;${selectedMonth === "2026-11" ? "Novembro/2026" : "Outubro/2026"}\n`;
      csv += `Unidade:;${storeFilter === "all" ? "Todas as Lojas" : storeFilter}\n\n`;
      csv += `Funcionário;Cargo;Loja;Dias_Presentes;Faltas;Total_Trabalhado_Mes;Total_Extras_Mes;Total_Atrasos_Mes;Saldo_Banco_Horas\n`;

      monthlyReportData.forEach((d) => {
        csv += `"${d.emp.name}";"${d.emp.role}";"${d.storeName}";${d.daysPresent};${d.daysAbsent};"${formatMinutesHuman(d.totalWorkedMinutes)}";"${formatMinutesHuman(d.totalExtraMinutes)}";"${formatMinutesHuman(d.totalDelayMinutes)}";"${d.bankBalance >= 0 ? "+" : "-"}${formatMinutesHuman(Math.abs(d.bankBalance))}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `athleta_relatorio_${reportCategory}_${Date.now()}.csv`;
    link.click();
    toast.success(`Relatório ${reportCategory} exportado com sucesso para Excel/CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. TOPO: TÍTULO, SUBTÍTULO E SELEÇÃO DO TIPO DE RELATÓRIO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#005C30] text-[#FFC72C]">
              Centro de Relatórios Oficiais
            </span>
            <span className="text-xs text-slate-500 font-medium">Portaria 671 MTE & Fiscalização</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#005C30]" />
            Relatórios Operacionais e Gerenciais
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão diária, semanal e mensal com consolidação de horas, atrasos, faltas e banco de horas
          </p>
        </div>

        {/* Abas dos 3 Relatórios Solicitados */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setReportCategory("diario")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportCategory === "diario"
                ? "bg-[#005C30] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-[#FFC72C]" />
            Relatório Diário
          </button>

          <button
            onClick={() => setReportCategory("semanal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportCategory === "semanal"
                ? "bg-[#005C30] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-4 h-4 text-[#FFC72C]" />
            Relatório Semanal
          </button>

          <button
            onClick={() => setReportCategory("mensal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportCategory === "mensal"
                ? "bg-[#005C30] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#FFC72C]" />
            Relatório Mensal
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS E BOTÕES DE EXPORTAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de Loja */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Building2 className="w-4 h-4 text-[#005C30]" />
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro específico conforme a aba */}
          {reportCategory === "diario" && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-4 h-4 text-[#005C30]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {reportCategory === "semanal" && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <CalendarDays className="w-4 h-4 text-[#005C30]" />
              <select
                value={selectedWeekNumber}
                onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={46}>Semana 46 (09 a 15 de Nov/2026 - Atual)</option>
                <option value={45}>Semana 45 (02 a 08 de Nov/2026)</option>
                <option value={44}>Semana 44 (26 de Out a 01 de Nov/2026)</option>
              </select>
            </div>
          )}

          {reportCategory === "mensal" && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-4 h-4 text-[#005C30]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="2026-11">Novembro / 2026 (Mês Atual)</option>
                <option value="2026-10">Outubro / 2026 (Mês Fechado)</option>
              </select>
            </div>
          )}
        </div>

        {/* Botões de Ação: Excel/CSV e Impressão/PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            title="Download de planilha em formato CSV com suporte nativo a Microsoft Excel"
          >
            <Download className="w-4 h-4" />
            Exportar Excel / CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            title="Abrir diálogo de impressão e salvar como PDF"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* 3. CONTEÚDO DA TABELA DO RELATÓRIO ATIVO */}

      {/* RELATÓRIO 1: DIÁRIO */}
      {reportCategory === "diario" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Quadro Diário da Operação — {selectedDate.split("-").reverse().join("/")}
              </h3>
              <p className="text-xs text-slate-500">
                Lista de funcionários escalados, horários registrados ao vivo e status de presença
              </p>
            </div>
            <span className="text-xs font-bold text-[#005C30] bg-[#005C30]/10 px-3 py-1 rounded-full">
              {dailyReportData.filter((d) => d.isWorking).length} de {dailyReportData.length} Presentes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4 text-center">Entrada Real</th>
                  <th className="py-3 px-4 text-center">Intervalo</th>
                  <th className="py-3 px-4 text-center">Saída Real</th>
                  <th className="py-3 px-4 text-center">Atraso</th>
                  <th className="py-3 px-4 text-center">Horas Extras</th>
                  <th className="py-3 px-4 text-center">Trabalhado</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dailyReportData.map((d) => {
                  return (
                    <tr key={d.emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={d.emp.photoUrl}
                            alt={d.emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <button
                              onClick={() => onSelectEmployee(d.emp)}
                              className="font-bold text-slate-900 hover:text-[#005C30] hover:underline text-left block"
                            >
                              {d.emp.name}
                            </button>
                            <span className="text-[10px] text-slate-400 block">{d.emp.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{d.storeName}</td>

                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {d.entryTime}
                      </td>

                      <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {d.breakInterval}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {d.exitTime === "Pendente" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            Pendente
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800">{d.exitTime}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-red-600">
                        {d.delayMinutes > 0 ? `+${d.delayMinutes} min` : "—"}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {d.extraMinutes > 0 ? `+${formatMinutesHuman(d.extraMinutes)}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {d.totalWorkedMinutes > 0 ? formatMinutesHuman(d.totalWorkedMinutes) : "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            d.status === "presente" || d.isWorking
                              ? "bg-emerald-100 text-emerald-800"
                              : d.isDayOff
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {d.isDayOff ? "Folga" : d.isWorking ? "Presente" : "Ausente"}
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

      {/* RELATÓRIO 2: SEMANAL */}
      {reportCategory === "semanal" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Resumo Semanal de Jornada — Semana 46 (09 a 15/11/2026)
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo de horas previstas vs realizadas e apuração do saldo semanal
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4 text-center">Dias Trabalhados</th>
                  <th className="py-3 px-4 text-center">Horas Previstas</th>
                  <th className="py-3 px-4 text-center">Horas Realizadas</th>
                  <th className="py-3 px-4 text-center">Horas Extras</th>
                  <th className="py-3 px-4 text-center">Atrasos</th>
                  <th className="py-3 px-4 text-right">Saldo da Semana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {weeklyReportData.map((d) => {
                  const isPositive = d.netBalanceMinutes >= 0;
                  return (
                    <tr key={d.emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={d.emp.photoUrl}
                            alt={d.emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <button
                              onClick={() => onSelectEmployee(d.emp)}
                              className="font-bold text-slate-900 hover:text-[#005C30] hover:underline text-left block"
                            >
                              {d.emp.name}
                            </button>
                            <span className="text-[10px] text-slate-400 block">{d.emp.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{d.storeName}</td>

                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {d.daysWorkedCount} dias
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        {formatMinutesHuman(d.totalExpectedMinutes)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {formatMinutesHuman(d.totalWorkedMinutes)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {d.totalExtraMinutes > 0 ? `+${formatMinutesHuman(d.totalExtraMinutes)}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-red-600">
                        {d.totalDelayMinutes > 0 ? `-${formatMinutesHuman(d.totalDelayMinutes)}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPositive ? "+" : "-"}
                          {formatMinutesHuman(Math.abs(d.netBalanceMinutes))}
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

      {/* RELATÓRIO 3: MENSAL (ESPELHO FISCAL DE PONTO) */}
      {reportCategory === "mensal" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Espelho Mensal Consolidado — {selectedMonth === "2026-11" ? "Novembro/2026" : "Outubro/2026"}
              </h3>
              <p className="text-xs text-slate-500">
                Totais acumulados de jornada, faltas, atrasos e saldo atualizado do Banco de Horas
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4 text-center">Dias Presença</th>
                  <th className="py-3 px-4 text-center">Faltas</th>
                  <th className="py-3 px-4 text-center">Total Horas Mês</th>
                  <th className="py-3 px-4 text-center">Total Extras</th>
                  <th className="py-3 px-4 text-center">Total Atrasos</th>
                  <th className="py-3 px-4 text-right">Saldo Banco de Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {monthlyReportData.map((d) => {
                  const isPositive = d.bankBalance >= 0;
                  return (
                    <tr key={d.emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={d.emp.photoUrl}
                            alt={d.emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <button
                              onClick={() => onSelectEmployee(d.emp)}
                              className="font-bold text-slate-900 hover:text-[#005C30] hover:underline text-left block"
                            >
                              {d.emp.name}
                            </button>
                            <span className="text-[10px] text-slate-400 block">{d.emp.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{d.storeName}</td>

                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {d.daysPresent} dias
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-red-600">
                        {d.daysAbsent > 0 ? `${d.daysAbsent} falta(s)` : "0"}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {formatMinutesHuman(d.totalWorkedMinutes)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {d.totalExtraMinutes > 0 ? `+${formatMinutesHuman(d.totalExtraMinutes)}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-red-600">
                        {d.totalDelayMinutes > 0 ? `-${formatMinutesHuman(d.totalDelayMinutes)}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPositive ? "+" : "-"}
                          {formatMinutesHuman(Math.abs(d.bankBalance))}
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
    </div>
  );
}
