import React, { useState, useMemo } from "react";
import { usePonto } from "../../hooks/use-ponto";
import {
  Employee,
  Store,
  Punch,
  DayTimeRecord,
  PunchType,
} from "../../lib/ponto-store";
import {
  Camera,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  MapPin,
  Clock,
  Layers,
  FileCheck,
  Maximize2,
  Lock,
  Sparkles,
  Info,
  ChevronRight,
  ArrowRight,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

interface PhotoAuditModuleProps {
  selectedStoreId?: string;
  onStoreChange?: (storeId: string) => void;
  onSelectEmployee?: (employee: Employee) => void;
}

export function PhotoAuditModule({
  selectedStoreId = "all",
  onStoreChange,
  onSelectEmployee,
}: PhotoAuditModuleProps) {
  const { employees, stores, records, getAllPunchesForAudit } = usePonto();

  // Estados de navegação interna
  const [activeView, setActiveView] = useState<"galeria" | "linha_tempo" | "lgpd">("galeria");

  // Filtros
  const [storeFilter, setStoreFilter] = useState<string>(selectedStoreId);
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [punchTypeFilter, setPunchTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Seleções para a Linha do Tempo
  const [timelineEmployeeId, setTimelineEmployeeId] = useState<string>(employees[0]?.id || "");
  const [timelineDate, setTimelineDate] = useState<string>("2026-11-11");

  // Modal de Inspeção Lado a Lado
  const [inspectItem, setInspectItem] = useState<{
    punch: Punch;
    employee: Employee;
    store: Store;
    recordDate: string;
    dayRecord: DayTimeRecord;
  } | null>(null);

  // Lista consolidada de marcações com foto
  const allAuditPunches = useMemo(() => {
    return getAllPunchesForAudit();
  }, [getAllPunchesForAudit]);

  // Lista filtrada para a Galeria
  const filteredPunches = useMemo(() => {
    return allAuditPunches.filter((item) => {
      if (storeFilter !== "all" && item.store.id !== storeFilter) return false;
      if (employeeFilter !== "all" && item.employee.id !== employeeFilter) return false;
      if (punchTypeFilter !== "all" && item.punch.type !== punchTypeFilter) return false;
      if (dateFilter && item.recordDate !== dateFilter) return false;
      if (
        searchTerm.trim() &&
        !item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.store.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allAuditPunches, storeFilter, employeeFilter, punchTypeFilter, dateFilter, searchTerm]);

  // Registro para a Linha do Tempo selecionada
  const selectedTimelineRecord = useMemo(() => {
    return records.find(
      (r) => r.employeeId === timelineEmployeeId && r.date === timelineDate
    );
  }, [records, timelineEmployeeId, timelineDate]);

  const timelineEmployee = useMemo(() => {
    return employees.find((e) => e.id === timelineEmployeeId) || employees[0];
  }, [employees, timelineEmployeeId]);

  // Métricas rápidas
  const totalAuditPhotos = allAuditPunches.length;
  const catuaiPhotosCount = allAuditPunches.filter((p) => p.store.id === "store-catuai").length;
  const boulevardPhotosCount = allAuditPunches.filter((p) => p.store.id === "store-boulevard").length;

  const getPunchTypeBadge = (type: PunchType) => {
    switch (type) {
      case "entrada":
        return { label: "Entrada", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "intervalo_saida":
        return { label: "Saída Almoço", color: "bg-amber-100 text-amber-800 border-amber-300" };
      case "intervalo_retorno":
        return { label: "Retorno Almoço", color: "bg-blue-100 text-blue-800 border-blue-300" };
      case "saida":
        return { label: "Saída Final", color: "bg-purple-100 text-purple-800 border-purple-300" };
      default:
        return { label: type, color: "bg-slate-100 text-slate-800 border-slate-300" };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DO MÓDULO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#005C30] text-[#FFC72C]">
              Portaria 671 MTE & LGPD
            </span>
            <span className="text-xs text-slate-500 font-medium">Auditoria Visual e Geográfica</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#005C30]" />
            Auditoria de Fotos & Verificação de Presença
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conferência humana de identidade, fotos ao vivo tiradas no totem e geocercamento das lojas Athleta
          </p>
        </div>

        {/* Abas Superiores */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveView("galeria")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === "galeria"
                ? "bg-[#005C30] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4 text-[#FFC72C]" />
            Galeria Geral ({filteredPunches.length})
          </button>
          <button
            onClick={() => setActiveView("linha_tempo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === "linha_tempo"
                ? "bg-[#005C30] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-[#FFC72C]" />
            Linha do Tempo Diária
          </button>
          <button
            onClick={() => setActiveView("lgpd")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === "lgpd"
                ? "bg-[#005C30] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#FFC72C]" />
            Conformidade LGPD
          </button>
        </div>
      </div>

      {/* 2. KPIS RÁPIDOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total de Fotos Gravadas</span>
            <Camera className="w-4 h-4 text-[#005C30]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalAuditPhotos}</div>
          <p className="text-[11px] text-slate-400 mt-1">Selfies ao vivo em totens</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Shopping Catuaí</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{catuaiPhotosCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Registros no totem Catuaí</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Shopping Boulevard</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{boulevardPhotosCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Registros no totem Boulevard</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Conformidade MTE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">100%</div>
          <p className="text-[11px] text-slate-400 mt-1">Geolocalização + Selfie sem bypass</p>
        </div>
      </div>

      {/* 3. ABA 1: GALERIA GERAL DE FOTOS */}
      {activeView === "galeria" && (
        <div className="space-y-4">
          {/* BARRA DE FILTROS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtro de Loja */}
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
                  <option value="all">Todas as Unidades</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Colaborador */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <User className="w-4 h-4 text-[#005C30]" />
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos os Funcionários</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Tipo de Marcação */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Clock className="w-4 h-4 text-[#005C30]" />
                <select
                  value={punchTypeFilter}
                  onChange={(e) => setPunchTypeFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos os Tipos de Batida</option>
                  <option value="entrada">Entrada</option>
                  <option value="intervalo_saida">Saída Almoço</option>
                  <option value="intervalo_retorno">Retorno Almoço</option>
                  <option value="saida">Saída Final</option>
                </select>
              </div>

              {/* Filtro de Data */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Calendar className="w-4 h-4 text-[#005C30]" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                />
              </div>

              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Limpar data
                </button>
              )}
            </div>

            {/* Busca textual */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005C30]/20 w-48 sm:w-56"
              />
            </div>
          </div>

          {/* GRID DE CARDS DE FOTOS */}
          {filteredPunches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">Nenhuma foto encontrada com estes filtros</h4>
              <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de loja, colaborador ou data acima.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPunches.map((item) => {
                const badge = getPunchTypeBadge(item.punch.type);
                const formattedDate = item.recordDate.split("-").reverse().join("/");

                return (
                  <div
                    key={item.punch.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Imagem capturada */}
                    <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                      <img
                        src={item.punch.photoUrl}
                        alt={`Ponto de ${item.employee.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Badge do Tipo de Batida */}
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Horário no topo direito */}
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xs">
                        <Clock className="w-3 h-3 text-[#FFC72C]" />
                        {item.punch.time}
                      </div>

                      {/* Indicador de Validação LGPD */}
                      <div className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ao Vivo (Sem upload)
                      </div>
                    </div>

                    {/* Dados do Colaborador e Localização */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">{formattedDate}</span>
                          <span className="text-[10px] font-mono text-slate-400">NSR: #{item.punch.nsr}</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">
                          {item.employee.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{item.employee.role}</p>

                        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-[#005C30] shrink-0" />
                          <span className="truncate">{item.store.name.replace("Athleta ", "")}</span>
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.punch.location.address}</span>
                        </div>
                      </div>

                      {/* Botão de Inspeção Comparativa */}
                      <button
                        onClick={() => setInspectItem(item)}
                        className="mt-3 w-full py-2 rounded-xl bg-slate-50 hover:bg-[#005C30] hover:text-white border border-slate-200 hover:border-[#005C30] text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 group-hover:bg-[#005C30] group-hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Comparar com Cadastro
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. ABA 2: LINHA DO TEMPO DIÁRIA */}
      {activeView === "linha_tempo" && (
        <div className="space-y-4">
          {/* Seletor de Colaborador e Data */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <User className="w-4 h-4 text-[#005C30]" />
                <select
                  value={timelineEmployeeId}
                  onChange={(e) => setTimelineEmployeeId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Calendar className="w-4 h-4 text-[#005C30]" />
                <input
                  type="date"
                  value={timelineDate}
                  onChange={(e) => setTimelineDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                </input>
              </div>
            </div>

            {/* Foto e resumo do colaborador selecionado */}
            <div className="flex items-center gap-3">
              <img
                src={timelineEmployee.photoUrl}
                alt={timelineEmployee.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#005C30]"
              />
              <div className="text-right sm:text-left">
                <h4 className="font-black text-sm text-slate-900">{timelineEmployee.name}</h4>
                <p className="text-xs text-slate-500">
                  {stores.find((s) => s.id === timelineEmployee.storeId)?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Sequência das Marcações do Dia */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Jornada de {timelineDate.split("-").reverse().join("/")}
                </h3>
                <p className="text-xs text-slate-500">
                  Horário previsto: {selectedTimelineRecord?.scheduledEntry || "09:45"} às{" "}
                  {selectedTimelineRecord?.scheduledExit || "18:05"} (Intervalo:{" "}
                  {selectedTimelineRecord?.scheduledBreak || "13:30 - 14:30"})
                </p>
              </div>

              {selectedTimelineRecord && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    selectedTimelineRecord.status === "presente"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedTimelineRecord.status === "folga"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Status: {selectedTimelineRecord.status}
                </span>
              )}
            </div>

            {/* Quatro posições da jornada diária */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {["entrada", "intervalo_saida", "intervalo_retorno", "saida"].map((typeKey, idx) => {
                const punch = selectedTimelineRecord?.punches.find((p) => p.type === typeKey);
                const badge = getPunchTypeBadge(typeKey as PunchType);
                const expectedLabels = [
                  "1º Batida — Entrada",
                  "2º Batida — Saída Almoço",
                  "3º Batida — Retorno Almoço",
                  "4º Batida — Saída Final",
                ];

                return (
                  <div
                    key={typeKey}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                      punch
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-50/50 border-dashed border-slate-200 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400">{expectedLabels[idx]}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {punch ? (
                        <div className="space-y-3">
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                            <img
                              src={punch.photoUrl}
                              alt={badge.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-xs font-black">
                              {punch.time}
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>Horário:</span>
                              <span className="text-[#005C30] text-sm">{punch.time}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>NSR:</span>
                              <span className="font-mono">#{punch.nsr}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate" title={punch.location.address}>
                              <MapPin className="w-3 h-3 text-emerald-600 inline mr-1" />
                              {punch.location.address}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                          <Clock className="w-8 h-8 text-slate-300 mb-2" />
                          <span className="text-xs font-bold text-slate-400">Marcação Pendente</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Aguardando registro no totem</span>
                        </div>
                      )}
                    </div>

                    {punch && (
                      <button
                        onClick={() => {
                          const store = stores.find((s) => s.id === timelineEmployee.storeId) || stores[0];
                          if (selectedTimelineRecord) {
                            setInspectItem({
                              punch,
                              employee: timelineEmployee,
                              store,
                              recordDate: timelineDate,
                              dayRecord: selectedTimelineRecord,
                            });
                          }
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-white hover:bg-[#005C30] hover:text-white border border-slate-200 text-slate-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        Inspecionar Foto
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA 3: CONFORMIDADE LGPD E PORTARIA 671 */}
      {activeView === "lgpd" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Termo de Conformidade LGPD & Portaria 671 MTE
              </h3>
              <p className="text-xs text-slate-500">
                Transparência no tratamento de dados e conferência humana de identidade
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Finalidade Estrita de Registro de Jornada
                </h4>
                <p>
                  As fotos capturadas no momento da marcação de ponto têm como única e exclusiva finalidade a
                  comprovação da presença física do colaborador na unidade oficial da Athleta, atendendo às
                  exigências de controle de jornada previstas no Art. 74 da CLT e na Portaria 671/2021 do MTE.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Validação Visual Humana (Sem Vetorização Biométrica Oculta)
                </h4>
                <p>
                  O sistema Athleta Ponto não comercializa nem compartilha dados biométricos com terceiros. A
                  conferência facial é realizada por meio de inspeção visual humana pelo administrador e auditor,
                  comparando a selfie ao vivo com a fotografia de cadastro, eliminando riscos de vazamento de mapas
                  biométricos vetoriais desnecessários.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Geolocalização Restrita ao Perímetro das Lojas
                </h4>
                <p>
                  A localização geográfica por GPS é capturada apenas no exato milissegundo do registro no totem da
                  loja (Shopping Catuaí ou Shopping Boulevard) para atestar a conformidade de raio geográfico. Não
                  há rastreamento contínuo de posição fora do momento do registro.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#005C30]" />
                  Inviolabilidade e Assinatura Criptográfica SHA-256
                </h4>
                <p>
                  Cada registro gera um Número Sequencial de Registro (NSR) e um hash criptográfico imutável.
                  Quaisquer solicitações de ajuste efetuadas por gestores geram eventos auditáveis na trilha fiscal,
                  mantendo a integridade documental original.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE INSPEÇÃO COMPARATIVA LADO A LADO */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#005C30] text-[#FFC72C]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Inspeção Visual Comparativa de Presença
                  </h3>
                  <p className="text-xs text-slate-500">Validação humana de identidade e conformidade</p>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* COMPARAÇÃO LADO A LADO DAS DUAS FOTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              {/* Foto 1: Cadastro Oficial */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-2">
                  Foto de Cadastro Oficial
                </span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-200 border-2 border-slate-300 mx-auto max-w-[220px]">
                  <img
                    src={inspectItem.employee.photoUrl}
                    alt="Cadastro Oficial"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2.5">
                  <span className="font-bold text-slate-900 text-xs block">{inspectItem.employee.name}</span>
                  <span className="text-[11px] text-slate-400">CPF: {inspectItem.employee.cpf}</span>
                </div>
              </div>

              {/* Foto 2: Selfie ao Vivo Capturada no Totem */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-emerald-300 text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Ao Vivo
                </div>
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider block mb-2">
                  Selfie Capturada no Totem
                </span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500 mx-auto max-w-[220px]">
                  <img
                    src={inspectItem.punch.photoUrl}
                    alt="Selfie no Ponto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2.5">
                  <span className="font-bold text-slate-900 text-xs block">
                    Horário Oficial: {inspectItem.punch.time}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Data: {inspectItem.recordDate.split("-").reverse().join("/")}
                  </span>
                </div>
              </div>
            </div>

            {/* DADOS TÉCNICOS DO REGISTRO */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="font-bold text-slate-800 block">Tipo de Registro:</span>
                  <span className="capitalize">{inspectItem.punch.type.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Dispositivo:</span>
                  <span>{inspectItem.punch.device.type}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">NSR Oficial:</span>
                  <span className="font-mono">#{inspectItem.punch.nsr}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Loja Frequência:</span>
                  <span>{inspectItem.store.name}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Geolocalização Validada:</span>
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {inspectItem.punch.location.address} (Precisão: {inspectItem.punch.location.accuracy}m)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Hash de Inviolabilidade (SHA-256):</span>
                <span className="font-mono text-[10px] text-slate-500 break-all">
                  {inspectItem.punch.hash}
                </span>
              </div>
            </div>

            {/* Ações do Auditor */}
            <div className="mt-5 flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Compatibilidade Visual Confirmada
              </div>

              <button
                onClick={() => {
                  toast.success(
                    `Identidade de ${inspectItem.employee.name} conferida e validada na trilha de auditoria!`
                  );
                  setInspectItem(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
                Concluir Validação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
