import { useState, useEffect } from "react";
import {
  PontoStore,
  Store,
  Employee,
  DayTimeRecord,
  ScheduleTemplate,
  AuditLog,
  CorrectionRequest,
  SystemSettings,
  DateScheduleOverride,
} from "../lib/ponto-store";

export function usePonto() {
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<DayTimeRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(PontoStore.getSettings());
  const [overrides, setOverrides] = useState<DateScheduleOverride[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = () => {
    setStores(PontoStore.getStores());
    setEmployees(PontoStore.getEmployees());
    setRecords(PontoStore.getDayRecords());
    setSchedules(PontoStore.getSchedules());
    setAuditLogs(PontoStore.getAuditLogs());
    setCorrections(PontoStore.getCorrections());
    setSettings(PontoStore.getSettings());
    setOverrides(PontoStore.getScheduleOverrides());
    setIsLoaded(true);
  };

  useEffect(() => {
    refresh();
    const unsubscribe = PontoStore.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  return {
    stores,
    employees,
    records,
    schedules,
    auditLogs,
    corrections,
    settings,
    overrides,
    isLoaded,
    refresh,
    recordPunch: PontoStore.recordPunch.bind(PontoStore),
    adjustPunch: PontoStore.adjustPunch.bind(PontoStore),
    requestCorrection: PontoStore.requestCorrection.bind(PontoStore),
    reviewCorrection: PontoStore.reviewCorrection.bind(PontoStore),
    saveScheduleOverride: PontoStore.saveScheduleOverride.bind(PontoStore),
    addEmployee: PontoStore.addEmployee.bind(PontoStore),
    updateEmployee: PontoStore.updateEmployee.bind(PontoStore),
    addStore: PontoStore.addStore.bind(PontoStore),
    updateSettings: PontoStore.updateSettings.bind(PontoStore),
    resetDemoData: PontoStore.resetDemoData.bind(PontoStore),
  };
}
