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
  BankOfHoursEntry,
} from "../lib/ponto-store";

export function usePonto() {
  const [stores, setStores] = useState<Store[]>(() => PontoStore.getStores());
  const [employees, setEmployees] = useState<Employee[]>(() => PontoStore.getEmployees());
  const [records, setRecords] = useState<DayTimeRecord[]>(() => PontoStore.getDayRecords());
  const [schedules, setSchedules] = useState<ScheduleTemplate[]>(() => PontoStore.getSchedules());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => PontoStore.getAuditLogs());
  const [corrections, setCorrections] = useState<CorrectionRequest[]>(() => PontoStore.getCorrections());
  const [settings, setSettings] = useState<SystemSettings>(() => PontoStore.getSettings());
  const [overrides, setOverrides] = useState<DateScheduleOverride[]>(() => PontoStore.getScheduleOverrides());
  const [bankEntries, setBankEntries] = useState<BankOfHoursEntry[]>(() => PontoStore.getBankOfHoursEntries());
  const [isLoaded, setIsLoaded] = useState(true);

  const refresh = () => {
    setStores(PontoStore.getStores());
    setEmployees(PontoStore.getEmployees());
    setRecords(PontoStore.getDayRecords());
    setSchedules(PontoStore.getSchedules());
    setAuditLogs(PontoStore.getAuditLogs());
    setCorrections(PontoStore.getCorrections());
    setSettings(PontoStore.getSettings());
    setOverrides(PontoStore.getScheduleOverrides());
    setBankEntries(PontoStore.getBankOfHoursEntries());
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
    bankEntries,
    isLoaded,
    refresh,
    recordPunch: PontoStore.recordPunch.bind(PontoStore),
    requestCorrection: PontoStore.requestCorrection.bind(PontoStore),
    reviewCorrection: PontoStore.reviewCorrection.bind(PontoStore),
    saveScheduleOverride: PontoStore.saveScheduleOverride.bind(PontoStore),
    updateEmployee: PontoStore.updateEmployee.bind(PontoStore),
    updateSettings: PontoStore.updateSettings.bind(PontoStore),
    getEmployeeBankSummary: PontoStore.getEmployeeBankSummary.bind(PontoStore),
    addBankOfHoursAdjustment: PontoStore.addBankOfHoursAdjustment.bind(PontoStore),
    getAllPunchesForAudit: PontoStore.getAllPunchesForAudit.bind(PontoStore),
    validateKioskCode: PontoStore.validateKioskCode.bind(PontoStore),
    regenerateKioskCode: PontoStore.regenerateKioskCode.bind(PontoStore),
    clearDemoDataOnly: PontoStore.clearDemoDataOnly.bind(PontoStore),
    regenerateDemoData: PontoStore.regenerateDemoData.bind(PontoStore),
    addEmployee: PontoStore.addEmployee.bind(PontoStore),
    deleteEmployee: PontoStore.deleteEmployee.bind(PontoStore),
    adjustPunch: PontoStore.adjustPunch.bind(PontoStore),
    adjustDayTimes: PontoStore.adjustDayTimes.bind(PontoStore),
  };
}
