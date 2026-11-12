import React, { useState, useMemo } from "react";
import { usePonto } from "../../hooks/use-ponto";
import {
  Employee,
  DayTimeRecord,
  Store,
  formatMinutesHuman,
  Punch,
} from "../../lib/ponto-store";
import {
  FileText,
  Search,
  Building2,
  Calendar,
  Filter,
  Camera,
  MapPin,
  ShieldCheck,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface TimeRecordsModuleProps {
  onSelectEmployee: (emp: Employee) => void;
  onSelectDayRecord: (record: DayTimeRecord, emp: Employee) => void;
  selectedStoreId: string;
  onStoreChange: (storeId: string) => void;
}

export function TimeRecordsModule({
  onSelectEmployee,
  onSelectDayRecord,
  selectedStoreId,
  onStoreChange,
}: TimeRecordsModuleProps) {
  const { records, employees, stores } = usePonto();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specificDate, setSpecificDate] = useState<string>("");

  const monthStr = String(selectedMonth).padStart(2, "0");
  const monthPrefix = `${selectedYear}-${monthStr}`;

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Filtra os registros
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Filtro de data específica ou mês/ano
      if (specificDate) {
        if (rec.date !== specificDate) return false;
      } else {
        if (!rec.date.startsWith(monthPrefix)) return false;
      }

      // Filtro de Loja
      if (selectedStoreId !== "all" && rec.storeId !== selectedStoreId) return false;

      // Filtro de Funcionário
      if (employeeFilter !== "all" && rec.employeeId !== employeeFilter) return false;

      // Filtro de Status
      if (statusFilter !== "all" && rec.status !== statusFilter) return false;

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [records, specificDate, monthPrefix, selectedStoreId, employeeFilter, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = "Data;Funcionario;Matricula;Loja;Previsto;Entrada;Intervalo_Saida;Intervalo_Retorno;Saida;Horas_Trabalhadas;Saldo;Status\n";
    filteredRecords.forEach((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      const store = stores.find((s) => s.id === r.storeId);
      const p1 = r.punches.find((p) => p.type === "entrada")?.time || "-";
      const p2 = r.punches.find((p) => p.type === "intervalo_saida")?.time || "-";
      const p3 = r.punches.find((p) => p.type === "intervalo_retorno")?.time || "-";
      const p4 = r.punches.find((p) => p.type === "saida")?.time || "-";
      csv += `${r.date};"${emp?.name || "-"}";"${emp?.matricula || "-"}";"${store?.name || "-"}";"${r.scheduledEntry}-${r.scheduledExit}";${p1};${p2};${p3};${p4};"${Math.floor(r.totalWorkedMinutes/60)}h ${r.totalWorkedMinutes%60}m";"${formatMinutesHuman(r.balanceMinutes)}";${r.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `espelho_ponto_athleta_${monthPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Espelho de ponto exportado em CSV!");
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Espelho de Ponto Oficial & Registros Fiscais
            </h3>
            <p className="text-xs text-slate-500">
              Marcações eletrônicas invioláveis, fotos da câmera e auditoria (Portaria 671 MTE)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-[#005C30] text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#005C30]" />
              Exportar CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Espelho
            </button>
          </div>
        </div>

        {/* Linha de Filtros: Mês/Ano, Dia Específico, Loja, Funcionário, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Mês e Ano */}
          <div className="flex items-center gap-1">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSpecificDate("");
              }}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSpecificDate("");
              }}
              className="w-24 p-2 bg-slate-50 border rounded-xl font-semibold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* Dia Específico */}
          <div>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-semibold"
              title="Filtrar por dia específico"
            />
          </div>

          {/* Loja */}
          <div>
            <select
              value={selectedStoreId}
              onChange={(e) => onStoreChange(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
            >
              <option value="all">Todas as Lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Funcionário */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
            >
              <option value="all">Todos os Funcionários</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
            >
              <option value="all">Todos os Status</option>
              <option value="presente">Presente</option>
              <option value="atrasado">Atrasado</option>
              <option value="hora_extra">Hora Extra</option>
              <option value="incompleto">Registro Incompleto</option>
              <option value="ausente">Ausente / Falta</option>
              <option value="folga">Folga / DSR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela do Espelho */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#005C30]/5 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Colaborador</th>
                <th className="py-3 px-3">Loja</th>
                <th className="py-3 px-3">Previsto</th>
                <th className="py-3 px-3">Entrada 1</th>
                <th className="py-3 px-3">Saída Alm.</th>
                <th className="py-3 px-3">Retorno</th>
                <th className="py-3 px-3">Saída 2</th>
                <th className="py-3 px-3">Total Dia</th>
                <th className="py-3 px-3">Saldo</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Foto / NSR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  const store = stores.find((s) => s.id === rec.storeId);

                  const p1 = rec.punches.find((p) => p.type === "entrada");
                  const p2 = rec.punches.find((p) => p.type === "intervalo_saida");
                  const p3 = rec.punches.find((p) => p.type === "intervalo_retorno");
                  const p4 = rec.punches.find((p) => p.type === "saida");

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => emp && onSelectDayRecord(rec, emp)}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {rec.date.split("-").reverse().join("/")}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp?.avatar}
                            alt=""
                            className="w-6 h-6 rounded-md object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900 truncate max-w-[130px]">
                            {emp?.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[110px]">
                        {store?.name.replace("Athleta ", "")}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {rec.isDayOff ? "Folga" : `${rec.scheduledEntry}-${rec.scheduledExit}`}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {p1 ? p1.time : "-"}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {p2 ? p2.time : "-"}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {p3 ? p3.time : "-"}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {p4 ? p4.time : "-"}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {rec.totalWorkedMinutes > 0
                          ? `${Math.floor(rec.totalWorkedMinutes / 60)}h ${rec.totalWorkedMinutes % 60}m`
                          : "-"}
                      </td>

                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        {rec.balanceMinutes !== 0 ? (
                          <span className={rec.balanceMinutes > 0 ? "text-emerald-700" : "text-red-600"}>
                            {formatMinutesHuman(rec.balanceMinutes)}
                          </span>
                        ) : (
                          <span className="text-slate-400">0m</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {rec.punches.length > 0 ? (
                          <div className="flex items-center justify-center -space-x-1">
                            {rec.punches.slice(0, 2).map((p, pIdx) => (
                              <img
                                key={pIdx}
                                src={p.photoUrl}
                                alt="Foto"
                                className="w-5 h-5 rounded-full border border-white object-cover"
                              />
                            ))}
                            <span className="text-[10px] font-mono text-slate-400 ml-1">
                              #{rec.punches[0]?.nsr}
                            </span>
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
  );
}
