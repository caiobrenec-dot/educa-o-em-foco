import React, { useState, useMemo } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Employee, formatMinutesHuman } from "../../lib/ponto-store";
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Building2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface ReportsModuleProps {
  selectedStoreId: string;
  onSelectEmployee: (emp: Employee) => void;
}

export function ReportsModule({ selectedStoreId, onSelectEmployee }: ReportsModuleProps) {
  const { employees, records, stores } = usePonto();
  const [reportType, setReportType] = useState<"banco_horas" | "absenteismo" | "custo_extras">("banco_horas");

  const filteredEmployees = useMemo(() => {
    return selectedStoreId === "all"
      ? employees
      : employees.filter((e) => e.storeId === selectedStoreId);
  }, [employees, selectedStoreId]);

  // Agrega dados de relatório por funcionário
  const reportData = useMemo(() => {
    return filteredEmployees.map((emp) => {
      const empRecords = records.filter((r) => r.employeeId === emp.id);

      let totalWorkedMinutes = 0;
      let totalExpectedMinutes = 0;
      let totalExtraMinutes = 0;
      let totalDelayMinutes = 0;
      let absences = 0;
      let incompletes = 0;

      empRecords.forEach((r) => {
        totalWorkedMinutes += r.totalWorkedMinutes || 0;
        totalExpectedMinutes += r.expectedWorkedMinutes || 0;
        totalExtraMinutes += r.extraMinutes || 0;
        totalDelayMinutes += r.delayMinutes || 0;
        if (r.status === "ausente") absences++;
        if (r.status === "incompleto") incompletes++;
      });

      const netBalanceMinutes = totalWorkedMinutes - totalExpectedMinutes;
      const extraHours = totalExtraMinutes / 60;
      // Custo estimado: valor da hora * 1.5 (adicional 50%)
      const estimatedExtraCost = extraHours * emp.hourlyRate * 1.5;

      const store = stores.find((s) => s.id === emp.storeId);

      return {
        emp,
        storeName: store?.name || "Athleta",
        totalWorkedMinutes,
        totalExpectedMinutes,
        netBalanceMinutes,
        totalExtraMinutes,
        totalDelayMinutes,
        absences,
        incompletes,
        hourlyRate: emp.hourlyRate,
        estimatedExtraCost,
      };
    });
  }, [filteredEmployees, records, stores]);

  const handleExport = () => {
    let csv = "";
    if (reportType === "banco_horas") {
      csv = "Funcionario;Cargo;Loja;Horas_Trabalhadas;Horas_Previstas;Saldo_Horas;Status_Saldo\n";
      reportData.forEach((d) => {
        csv += `"${d.emp.name}";"${d.emp.role}";"${d.storeName}";"${Math.floor(d.totalWorkedMinutes/60)}h";"${Math.floor(d.totalExpectedMinutes/60)}h";"${formatMinutesHuman(d.netBalanceMinutes)}";"${d.netBalanceMinutes >= 0 ? "Credito" : "Debito"}"\n`;
      });
    } else if (reportType === "absenteismo") {
      csv = "Funcionario;Cargo;Loja;Atrasos_Minutos;Faltas_Dias;Incompletos_Dias\n";
      reportData.forEach((d) => {
        csv += `"${d.emp.name}";"${d.emp.role}";"${d.storeName}";${d.totalDelayMinutes};${d.absences};${d.incompletes}\n`;
      });
    } else {
      csv = "Funcionario;Cargo;Loja;Horas_Extras;Valor_Hora_Base;Custo_Estimado_Extras_R$\n";
      reportData.forEach((d) => {
        csv += `"${d.emp.name}";"${d.emp.role}";"${d.storeName}";"${(d.totalExtraMinutes/60).toFixed(1)}h";"R$ ${d.hourlyRate.toFixed(2)}";"R$ ${d.estimatedExtraCost.toFixed(2)}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_athleta_${reportType}.csv`;
    a.click();
    toast.success("Relatório baixado em CSV com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Header e Seleção de Relatório */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Relatórios Gerenciais & Fechamento de Folha
            </h3>
            <p className="text-xs text-slate-500">
              Análise de banco de horas, absenteísmo e projeção de custos com horas extras
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-[#005C30] text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#005C30]" />
              Exportar CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório
            </button>
          </div>
        </div>

        {/* Abas dos Relatórios */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setReportType("banco_horas")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              reportType === "banco_horas"
                ? "bg-[#005C30] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#FFC72C]" />
            Banco de Horas & Saldos
          </button>
          <button
            onClick={() => setReportType("absenteismo")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              reportType === "absenteismo"
                ? "bg-[#005C30] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#FFC72C]" />
            Absenteísmo & Atrasos
          </button>
          <button
            onClick={() => setReportType("custo_extras")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              reportType === "custo_extras"
                ? "bg-[#005C30] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#FFC72C]" />
            Custo Estimado Horas Extras
          </button>
        </div>
      </div>

      {/* Tabela do Relatório Selecionado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#005C30]/5 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4">Unidade</th>
                {reportType === "banco_horas" && (
                  <>
                    <th className="py-3 px-4">Horas Realizadas</th>
                    <th className="py-3 px-4">Horas Previstas</th>
                    <th className="py-3 px-4">Saldo Acumulado</th>
                    <th className="py-3 px-4">Situação</th>
                  </>
                )}
                {reportType === "absenteismo" && (
                  <>
                    <th className="py-3 px-4">Atrasos (Minutos)</th>
                    <th className="py-3 px-4">Faltas Injustificadas</th>
                    <th className="py-3 px-4">Batidas Incompletas</th>
                    <th className="py-3 px-4">Índice Assiduidade</th>
                  </>
                )}
                {reportType === "custo_extras" && (
                  <>
                    <th className="py-3 px-4">Horas Extras Realizadas</th>
                    <th className="py-3 px-4">Salário Hora Base</th>
                    <th className="py-3 px-4">Adicional CLT (+50%)</th>
                    <th className="py-3 px-4">Custo Total Projetado</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((d) => (
                <tr
                  key={d.emp.id}
                  onClick={() => onSelectEmployee(d.emp)}
                  className="hover:bg-amber-50/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={d.emp.avatar}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-900">{d.emp.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{d.emp.role}</td>
                  <td className="py-3 px-4 text-slate-600">{d.storeName.replace("Athleta ", "")}</td>

                  {/* Relatório 1: Banco de Horas */}
                  {reportType === "banco_horas" && (
                    <>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {Math.floor(d.totalWorkedMinutes / 60)}h {d.totalWorkedMinutes % 60}m
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {Math.floor(d.totalExpectedMinutes / 60)}h
                      </td>
                      <td className="py-3 px-4 font-black">
                        <span className={d.netBalanceMinutes >= 0 ? "text-emerald-700" : "text-red-600"}>
                          {formatMinutesHuman(d.netBalanceMinutes)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            d.netBalanceMinutes >= 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {d.netBalanceMinutes >= 0 ? "Crédito Positivo" : "Débito a Compensar"}
                        </span>
                      </td>
                    </>
                  )}

                  {/* Relatório 2: Absenteísmo */}
                  {reportType === "absenteismo" && (
                    <>
                      <td className="py-3 px-4 font-bold text-slate-800">{d.totalDelayMinutes} min</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${d.absences > 0 ? "text-red-600" : "text-slate-700"}`}>
                          {d.absences} dia(s)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-700">{d.incompletes} ocorrência(s)</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700">
                          {Math.max(0, 100 - d.absences * 15 - Math.floor(d.totalDelayMinutes / 20))}%
                        </span>
                      </td>
                    </>
                  )}

                  {/* Relatório 3: Custo Estimado */}
                  {reportType === "custo_extras" && (
                    <>
                      <td className="py-3 px-4 font-bold text-amber-700">
                        +{(d.totalExtraMinutes / 60).toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-mono">
                        R$ {d.hourlyRate.toFixed(2)}/h
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        R$ {(d.hourlyRate * 1.5).toFixed(2)}/h
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 font-mono text-sm">
                        R$ {d.estimatedExtraCost.toFixed(2)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
