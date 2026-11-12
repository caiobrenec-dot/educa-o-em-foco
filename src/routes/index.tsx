import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { usePonto } from "../hooks/use-ponto";
import { Employee, DayTimeRecord, Store } from "../lib/ponto-store";
import { AthletaLogo } from "../components/AthletaLogo";
import { OverviewModule } from "../components/ponto/OverviewModule";
import { EmployeesModule } from "../components/ponto/EmployeesModule";
import { WeeklyControlModule } from "../components/ponto/WeeklyControlModule";
import { TimeRecordsModule } from "../components/ponto/TimeRecordsModule";
import { BankOfHoursModule } from "../components/ponto/BankOfHoursModule";
import { PhotoAuditModule } from "../components/ponto/PhotoAuditModule";
import { SchedulesModule } from "../components/ponto/SchedulesModule";
import { StoresModule } from "../components/ponto/StoresModule";
import { ReportsModule } from "../components/ponto/ReportsModule";
import { AuditModule } from "../components/ponto/AuditModule";
import { SettingsModule } from "../components/ponto/SettingsModule";
import { EmployeeProfileModal } from "../components/ponto/EmployeeProfileModal";
import { DayDetailsModal } from "../components/ponto/DayDetailsModal";
import { KioskView } from "../components/ponto/KioskView";
import { EmployeeSelfServiceView } from "../components/ponto/EmployeeSelfServiceView";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  CalendarRange,
  Building2,
  BarChart3,
  ShieldCheck,
  Settings,
  Tablet,
  Bell,
  Clock,
  Sparkles,
  ChevronDown,
  Scale,
  Camera,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

export type TabType =
  | "visao-geral"
  | "funcionarios"
  | "controle-semanal"
  | "registro-ponto"
  | "banco-horas"
  | "auditoria-fotos"
  | "escalas"
  | "lojas"
  | "relatorios"
  | "auditoria"
  | "configuracoes";

export type ViewMode = "admin" | "self_service" | "kiosk";

function IndexPage() {
  const navigate = useNavigate();
  const { stores, employees, corrections } = usePonto();

  // Modo de visualização geral do sistema (Proprietário ADM vs Colaborador Meu Ponto vs Totem Loja)
  const [viewMode, setViewMode] = useState<ViewMode>("admin");

  const [activeTab, setActiveTab] = useState<TabType>("visao-geral");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");

  // Modais de detalhe
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null);
  const [detailsRecord, setDetailsRecord] = useState<DayTimeRecord | null>(null);
  const [detailsEmployee, setDetailsEmployee] = useState<Employee | null>(null);

  // Quantidade de solicitações pendentes de correção
  const pendingCorrectionsCount = (corrections || []).filter((c) => c?.status === "pendente").length;

  const handleOpenDayDetails = (record: DayTimeRecord, emp?: Employee) => {
    setDetailsRecord(record);
    if (emp) {
      setDetailsEmployee(emp);
    } else {
      const found = employees.find((e) => e.id === record.employeeId);
      setDetailsEmployee(found || null);
    }
  };

  // Configuração das Abas do Painel dos Proprietários (ADM TOTAL)
  const tabsConfig: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
    { id: "funcionarios", label: "Funcionários", icon: Users },
    { id: "controle-semanal", label: "Controle Semanal", icon: CalendarDays },
    { id: "registro-ponto", label: "Registro de Ponto", icon: FileText },
    { id: "banco-horas", label: "Banco de Horas", icon: Scale },
    { id: "auditoria-fotos", label: "Auditoria de Fotos", icon: Camera },
    { id: "escalas", label: "Escalas", icon: CalendarRange },
    { id: "lojas", label: "Lojas", icon: Building2 },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "auditoria", label: "Trilha & Homologações", icon: ShieldCheck, badge: pendingCorrectionsCount },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* 1. BARRA SUPERIOR GLOBAL FIXA — ABAS PRINCIPAIS (ADMIN / TOTEM QUIOSQUE / MEU PONTO) */}
      <div className="bg-[#00381c] border-b-2 border-[#FFC72C]/40 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Marca Athleta Ponto */}
          <div className="flex items-center gap-3">
            <AthletaLogo variant="white" size="sm" subtitleText="PONTO ELETRÔNICO" />
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/80 font-semibold">Shopping Catuaí & Shopping Boulevard</span>
            </div>
          </div>

          {/* ABAS PRINCIPAIS: ADMIN vs TOTEM QUIOSQUE vs MEU PONTO */}
          <div className="flex items-center bg-[#002412] p-1.5 rounded-2xl border border-white/15 shadow-inner gap-1.5 w-full sm:w-auto justify-center">
            {/* 1. ABA ADMIN */}
            <button
              onClick={() => setViewMode("admin")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                viewMode === "admin"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md scale-102 font-black"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>👑 PAINEL ADMIN</span>
            </button>

            {/* 2. ABA TOTEM QUIOSQUE */}
            <button
              onClick={() => setViewMode("kiosk")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                viewMode === "kiosk"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md scale-102 font-black"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Tablet className="w-4 h-4 text-[#004724]" />
              <span>📱 TOTEM QUIOSQUE</span>
            </button>

            {/* 3. ABA ÁREA DO COLABORADOR */}
            <button
              onClick={() => setViewMode("self_service")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                viewMode === "self_service"
                  ? "bg-[#FFC72C] text-[#004724] shadow-md scale-102 font-black"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#004724]" />
              <span>👤 MEU PONTO</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODO TOTEM QUIOSQUE (BATER PONTO) */}
      {viewMode === "kiosk" && (
        <KioskView
          onExitKiosk={() => setViewMode("admin")}
          defaultStoreId={selectedStoreId !== "all" ? selectedStoreId : undefined}
        />
      )}

      {/* 3. MODO MEU PONTO (PAINEL DO COLABORADOR) */}
      {viewMode === "self_service" && (
        <EmployeeSelfServiceView
          onReturnToAdmin={() => setViewMode("admin")}
        />
      )}

      {/* 4. MODO PAINEL ADMIN TOTAL */}
      {viewMode === "admin" && (
        <>
          {/* HEADER DO ADMINISTRADOR COM SELETOR DE LOJA E NOTIFICAÇÕES */}
          <header className="bg-[#005C30] text-white shadow-md border-b border-[#004724]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 md:h-18 gap-4">
                <div className="flex items-center gap-3">
                  <div className="font-black text-sm uppercase tracking-wider text-[#FFC72C] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#FFC72C]" />
                    <span>Gestão Integrada de Ponto & Escalas</span>
                  </div>
                </div>

                {/* Ações Centrais e Direita */}
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Seletor de Loja no Topo */}
                  <div className="flex items-center gap-2 bg-[#004724] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                    <Building2 className="w-4 h-4 text-[#FFC72C]" />
                    <select
                      value={selectedStoreId}
                      onChange={(e) => setSelectedStoreId(e.target.value)}
                      className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-[#004724] text-white">
                        Todas as Unidades (Rede Athleta)
                      </option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#004724] text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notificações de Auditoria / Correções */}
                  <button
                    onClick={() => setActiveTab("auditoria")}
                    className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Auditoria & Solicitações"
                  >
                    <Bell className="w-5 h-5" />
                    {pendingCorrectionsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFC72C] text-[#004724] font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {pendingCorrectionsCount}
                      </span>
                    )}
                  </button>

                  {/* Perfil do Administrador / Proprietário */}
                  <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                    <div className="w-8 h-8 rounded-full bg-[#FFC72C] text-[#004724] font-black flex items-center justify-center text-xs">
                      AP
                    </div>
                    <div className="hidden sm:block text-left text-xs leading-tight">
                      <span className="font-bold text-white block">Administrador Geral</span>
                      <span className="text-white/70 text-[10px]">Proprietário Athleta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BARRA DE NAVEGAÇÃO DOS MÓDULOS ADMIN */}
            <div className="bg-[#004724] border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs font-bold">
                  {tabsConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isActive
                            ? "bg-[#FFC72C] text-[#004724] shadow-sm font-black"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              isActive
                                ? "bg-[#005C30] text-white"
                                : "bg-[#FFC72C] text-[#004724]"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </header>

      {/* 3. CONTEÚDO PRINCIPAL DO MÓDULO ATIVO */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* MÓDULO 1: VISÃO GERAL */}
        {activeTab === "visao-geral" && (
          <OverviewModule
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
            onSelectDayRecord={(record, emp) => handleOpenDayDetails(record, emp)}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            onOpenKiosk={() => setViewMode("kiosk")}
          />
        )}

        {/* MÓDULO 2: FUNCIONÁRIOS */}
        {activeTab === "funcionarios" && (
          <EmployeesModule
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />
        )}

        {/* MÓDULO 3: CONTROLE SEMANAL (GRADE 7 COLUNAS) */}
        {activeTab === "controle-semanal" && (
          <WeeklyControlModule
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
            onSelectDayRecord={(record, emp) => handleOpenDayDetails(record, emp)}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />
        )}

        {/* MÓDULO 4: REGISTRO DE PONTO (ESPELHO MENSAL) */}
        {activeTab === "registro-ponto" && (
          <TimeRecordsModule
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
            onSelectDayRecord={(record, emp) => handleOpenDayDetails(record, emp)}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />
        )}

        {/* MÓDULO 5: BANCO DE HORAS (NOVO) */}
        {activeTab === "banco-horas" && (
          <BankOfHoursModule
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
          />
        )}

        {/* MÓDULO 6: AUDITORIA DE FOTOS (NOVO) */}
        {activeTab === "auditoria-fotos" && (
          <PhotoAuditModule
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
          />
        )}

        {/* MÓDULO 7: ESCALAS */}
        {activeTab === "escalas" && (
          <SchedulesModule selectedStoreId={selectedStoreId} />
        )}

        {/* MÓDULO 8: LOJAS */}
        {activeTab === "lojas" && (
          <StoresModule
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
          />
        )}

        {/* MÓDULO 9: RELATÓRIOS */}
        {activeTab === "relatorios" && (
          <ReportsModule
            selectedStoreId={selectedStoreId}
            onSelectEmployee={(emp) => setProfileEmployee(emp)}
          />
        )}

        {/* MÓDULO 10: AUDITORIA & HOMOLOGAÇÕES */}
        {activeTab === "auditoria" && <AuditModule />}

        {/* MÓDULO 11: CONFIGURAÇÕES */}
        {activeTab === "configuracoes" && <SettingsModule />}
      </main>

          {/* RODAPÉ INSTITUCIONAL */}
          <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AthletaLogo variant="compact" />
                <span>
                  © {new Date().getFullYear()} <strong>ATHLETA BRASIL</strong> — Sistema Homologado Portaria 671 MTE.
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <span>Londrina - PR</span>
                <span>•</span>
                <span>Shopping Catuaí (CAT)</span>
                <span>•</span>
                <span>Shopping Boulevard (BLV)</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">Conexão Segura SSL</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* MODAL DE PERFIL INDIVIDUAL DO FUNCIONÁRIO */}
      {profileEmployee && (
        <EmployeeProfileModal
          employee={profileEmployee}
          onClose={() => setProfileEmployee(null)}
          onSelectDayRecord={(rec) => {
            handleOpenDayDetails(rec, profileEmployee);
          }}
        />
      )}

      {/* MODAL DE DETALHES DAS MARCAÇÕES DO DIA COM FOTOS AO VIVO */}
      {detailsRecord && (
        <DayDetailsModal
          record={detailsRecord}
          employee={detailsEmployee}
          onClose={() => {
            setDetailsRecord(null);
            setDetailsEmployee(null);
          }}
        />
      )}
    </div>
  );
}
