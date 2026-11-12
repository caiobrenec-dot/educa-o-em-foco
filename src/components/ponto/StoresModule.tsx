import React, { useState } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { Store, Employee, DayTimeRecord } from "../../lib/ponto-store";
import {
  Building2,
  MapPin,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { NewStoreModal } from "./NewStoreModal";

interface StoresModuleProps {
  selectedStoreId: string;
  onStoreChange: (storeId: string) => void;
  onSelectEmployee: (emp: Employee) => void;
}

export function StoresModule({
  selectedStoreId,
  onStoreChange,
  onSelectEmployee,
}: StoresModuleProps) {
  const { stores, employees, records } = usePonto();
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Cálculo de métricas por loja
  const storeMetrics = React.useMemo(() => {
    return stores.map((store) => {
      const storeEmps = employees.filter((e) => e.storeId === store.id && e.status === "ativo");
      const storeRecordsToday = records.filter(
        (r) => r.storeId === store.id && r.date === todayStr
      );

      const presentToday = storeRecordsToday.filter(
        (r) => r.status === "presente" || r.status === "hora_extra" || r.status === "atrasado"
      ).length;

      const offToday = storeRecordsToday.filter((r) => r.isDayOff || r.status === "folga").length;

      let weeklyExtraMinutes = 0;
      let weeklyWorkedMinutes = 0;

      records
        .filter((r) => r.storeId === store.id)
        .forEach((r) => {
          weeklyExtraMinutes += r.extraMinutes || 0;
          weeklyWorkedMinutes += r.totalWorkedMinutes || 0;
        });

      return {
        store,
        activeEmployees: storeEmps.length,
        presentToday,
        offToday,
        presenceRate: storeEmps.length > 0
          ? Math.round((presentToday / Math.max(1, storeEmps.length - offToday)) * 100)
          : 100,
        weeklyExtraHours: Math.floor(weeklyExtraMinutes / 60),
        weeklyWorkedHours: Math.floor(weeklyWorkedMinutes / 60),
        employees: storeEmps,
      };
    });
  }, [stores, employees, records, todayStr]);

  return (
    <div className="space-y-6">
      {/* Header com Ações e Seletor Consolidado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Comparativo Operacional de Lojas & Unidades Athleta
          </h3>
          <p className="text-xs text-slate-500">
            Compare o desempenho, presença, horas extras e equipes entre as filiais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => onStoreChange("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedStoreId === "all"
                  ? "bg-[#005C30] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Visão Consolidada (Todas)
            </button>
            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => onStoreChange(s.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStoreId === s.id
                    ? "bg-[#005C30] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.name.replace("Athleta ", "")}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewStoreModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Nova Loja
          </button>
        </div>
      </div>

      {/* Cards Comparativos das Lojas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeMetrics.map(
          ({
            store,
            activeEmployees,
            presentToday,
            offToday,
            presenceRate,
            weeklyExtraHours,
            weeklyWorkedHours,
            employees: emps,
          }) => {
            const isSelected = selectedStoreId === store.id;

            return (
              <div
                key={store.id}
                onClick={() => onStoreChange(store.id)}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-[#005C30] ring-2 ring-[#005C30]/20 shadow-md"
                    : "border-slate-200 hover:border-[#005C30]/60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#005C30] to-[#004724] text-[#FFC72C] flex items-center justify-center font-bold shadow-md">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{store.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#005C30]" />
                        {store.city} - {store.state}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#005C30] text-white uppercase">
                      Selecionada
                    </span>
                  )}
                </div>

                {/* Dados da Loja */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <p>
                    <strong>Endereço:</strong> {store.address}
                  </p>
                  <p>
                    <strong>Gerente:</strong> {store.managerName}
                  </p>
                  <p className="font-mono text-[11px]">
                    <strong>CNPJ:</strong> {store.cnpj}
                  </p>
                  <p>
                    <strong>Raio GPS Totem:</strong> {store.gpsCoords?.allowedRadiusMeters ?? 100} metros
                  </p>
                </div>

                {/* Métricas Comparativas */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Presença Hoje
                    </span>
                    <span className="text-lg font-black text-[#005C30]">{presenceRate}%</span>
                    <span className="text-[10px] text-slate-400 block">
                      {presentToday}/{activeEmployees}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Horas Trab.
                    </span>
                    <span className="text-lg font-black text-slate-800">{weeklyWorkedHours}h</span>
                    <span className="text-[10px] text-slate-400 block">Na semana</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      H. Extras
                    </span>
                    <span className="text-lg font-black text-amber-600">+{weeklyExtraHours}h</span>
                    <span className="text-[10px] text-slate-400 block">Acumuladas</span>
                  </div>
                </div>

                {/* Colaboradores da Unidade */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">
                    Equipe da Unidade ({emps.length}):
                  </span>
                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {emps.map((e) => (
                      <img
                        key={e.id}
                        src={e.avatar}
                        alt={e.name}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectEmployee(e);
                        }}
                        title={`${e.name} (${e.role})`}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover hover:scale-110 hover:z-10 transition-transform cursor-pointer shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {isNewStoreModalOpen && <NewStoreModal onClose={() => setIsNewStoreModalOpen(false)} />}
    </div>
  );
}
