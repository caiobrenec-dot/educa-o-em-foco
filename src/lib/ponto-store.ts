/**
 * ATHLETA PONTO — Sistema de Gestão de Jornada, Ponto Eletrônico e Escalas
 * Versão 2.0: Banco de Horas, Auditoria de Fotos, 3 Níveis de Acesso e Base Demo Outubro/Novembro 2026.
 * Lojas Oficiais: Athleta Shopping Catuaí e Athleta Shopping Boulevard.
 */

import { generateDemoBiometricSelfie } from "./facial-biometrics";
import {
  getBrasiliaDate,
  getBrasiliaDateStr,
  getBrasiliaTimeStr,
  getBrasiliaFullTimeStr,
  formatBrasiliaDateLong,
} from "./brasilia-time";

export {
  getBrasiliaDate,
  getBrasiliaDateStr,
  getBrasiliaTimeStr,
  getBrasiliaFullTimeStr,
  formatBrasiliaDateLong,
};

export type RoleType =
  | "Gerente Geral"
  | "Gerente de Loja"
  | "Subgerente"
  | "Vendedor(a) Líder"
  | "Vendedor(a) Esportivo"
  | "Consultor(a) de Vendas"
  | "Operador(a) de Caixa";

export type DayStatus =
  | "presente"
  | "ausente"
  | "atrasado"
  | "saida_antecipada"
  | "folga"
  | "ferias"
  | "afastamento"
  | "incompleto"
  | "hora_extra";

export type PunchType =
  | "entrada"
  | "intervalo_saida"
  | "intervalo_retorno"
  | "saida";

export interface Store {
  id: "store-catuai" | "store-boulevard";
  name: string;
  code: "catuai" | "boulevard";
  city: string;
  state: string;
  address: string;
  cnpj: string;
  phone: string;
  managerName: string;
  gpsCoords: {
    lat: number;
    lng: number;
    allowedRadiusMeters: number;
  };
  openingHours: string;
  kioskAccessCode: string; // Código exclusivo para liberar o tablet da unidade
}

export interface Employee {
  id: string;
  name: string;
  matricula: string;
  cpf: string;
  email: string;
  phone: string;
  role: RoleType;
  storeId: "store-catuai" | "store-boulevard";
  admissionDate: string;
  contractHoursPerWeek: number; // 44h
  status: "ativo" | "ferias" | "afastado";
  pin: string; // 4 dígitos numéricos para o Totem
  defaultScheduleId: string;
  avatar: string; // Foto de referência cadastrada
  photoUrl: string; // Garantido para compatibilidade total
  hourlyRate: number;
}

export interface Punch {
  id: string;
  type: PunchType;
  timestamp: string; // ISO
  time: string; // "14:08"
  photoUrl: string; // Foto da câmera ao vivo no ato
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
    inRange: boolean;
  };
  device: {
    type: "Totem Tablet Catuaí" | "Totem Tablet Boulevard" | "Computador da Loja";
    ip: string;
    userAgent: string;
  };
  nsr: number; // Número Sequencial de Registro
  hash: string; // Hash SHA-256 criptográfico
  isDemoData?: boolean;
  isManualAdjustment?: boolean;
  originalTime?: string;
  adjustmentReason?: string;
  adjustedBy?: string;
  adjustedAt?: string;
}

export interface DayTimeRecord {
  id: string;
  employeeId: string;
  storeId: "store-catuai" | "store-boulevard";
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Dom, 1=Seg, ..., 6=Sab
  punches: Punch[];
  scheduledEntry: string; // "10:00"
  scheduledExit: string; // "18:20"
  scheduledBreak: string; // "13:30 - 14:30"
  isDayOff: boolean;
  isVacationOrLeave: boolean;
  status: DayStatus;
  totalWorkedMinutes: number;
  expectedWorkedMinutes: number;
  balanceMinutes: number; // Positivo = crédito, Negativo = débito
  delayMinutes: number;
  extraMinutes: number;
  earlyExitMinutes: number;
  isDemoData?: boolean;
  notes?: string;
}

export interface BankOfHoursEntry {
  id: string;
  employeeId: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  type: "credito" | "debito";
  minutes: number;
  balanceAfterMinutes: number;
  reason: string;
  author: string;
  isManualAdjustment?: boolean;
  isDemoData?: boolean;
  createdAt: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  workDays: number[];
  entryTime: string;
  exitTime: string;
  breakDurationMinutes: number;
  breakStartTime: string;
  breakEndTime: string;
  weeklyHours: number;
}

export interface DateScheduleOverride {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  isDayOff: boolean;
  entryTime: string;
  exitTime: string;
  breakStartTime: string;
  breakEndTime: string;
  reason: string;
  updatedBy: string;
  updatedAt: string;
}

export interface CorrectionRequest {
  id: string;
  employeeId: string;
  storeId: string;
  date: string;
  punchType: PunchType;
  requestedTime: string;
  reason: string;
  status: "pendente" | "aprovada" | "rejeitada";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actionType:
    | "ajuste_ponto"
    | "aprovacao_solicitacao"
    | "rejeicao_solicitacao"
    | "alteracao_escala"
    | "escala_data_especifica"
    | "novo_funcionario"
    | "editar_funcionario"
    | "ajuste_banco_horas"
    | "troca_codigo_quiosque"
    | "configuracao_alterada"
    | "registro_ponto_quiosque"
    | "limpeza_base_demo";
  title: string;
  details: string;
  employeeId?: string;
  employeeName?: string;
  storeId?: string;
  authorName: string;
  previousValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  toleranceMinutes: number; // 5 minutos CLT
  minBreakMinutes: number; // 60 min
  minIntershiftHours: number; // 11h
  requireFacialPhoto: boolean;
  requireLocationCheck: boolean;
  autoLockKioskSeconds: number; // 4s
  companyName: string;
  companyCnpj: string;
  companyAddress: string;
  kioskCodes: {
    catuai: string;
    boulevard: string;
  };
}

// ==========================================
// 1. DUAS LOJAS OFICIAIS (CATUAÍ E BOULEVARD)
// ==========================================

export const INITIAL_STORES: Store[] = [
  {
    id: "store-catuai",
    name: "Athleta Shopping Catuaí",
    code: "catuai",
    city: "Londrina",
    state: "PR",
    address: "Rod. Celso Garcia Cid, 5600 - Loja 142, Gleba Palhano",
    cnpj: "12.345.678/0001-90",
    phone: "(43) 3345-8900",
    managerName: "Carlos Eduardo Silva",
    gpsCoords: {
      lat: -23.3421,
      lng: -51.1872,
      allowedRadiusMeters: 250,
    },
    openingHours: "Seg a Sáb: 10:00 às 22:00 | Dom: 14:00 às 20:00",
    kioskAccessCode: "1234",
  },
  {
    id: "store-boulevard",
    name: "Athleta Boulevard Shopping",
    code: "boulevard",
    city: "Londrina",
    state: "PR",
    address: "Av. Theodoro Victorelli, 150 - Loja 210, Carlota",
    cnpj: "12.345.678/0002-71",
    phone: "(43) 3375-9200",
    managerName: "Rodrigo Albuquerque",
    gpsCoords: {
      lat: -23.3089,
      lng: -51.1448,
      allowedRadiusMeters: 250,
    },
    openingHours: "Seg a Sáb: 10:00 às 22:00 | Dom: 14:00 às 20:00",
    kioskAccessCode: "1234",
  },
];

// ==========================================
// 2. OITO FUNCIONÁRIOS REAIS (4 CATUAÍ / 4 BOULEVARD)
// ==========================================

export const INITIAL_EMPLOYEES: Employee[] = [
  // --- Unidade Catuaí ---
  {
    id: "emp-1",
    name: "Carlos Eduardo Silva",
    matricula: "ATH-0101",
    cpf: "342.890.119-02",
    email: "carlos.silva@athleta.com.br",
    phone: "(43) 99123-4567",
    role: "Gerente Geral",
    storeId: "store-catuai",
    admissionDate: "2023-02-01",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-catuai-abertura",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 28.5,
  },
  {
    id: "emp-2",
    name: "Mariana Santos Rocha",
    matricula: "ATH-0102",
    cpf: "451.982.338-14",
    email: "mariana.rocha@athleta.com.br",
    phone: "(43) 99876-5432",
    role: "Vendedor(a) Líder",
    storeId: "store-catuai",
    admissionDate: "2023-05-15",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-catuai-intermediario",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 19.8,
  },
  {
    id: "emp-3",
    name: "Lucas Gabriel Oliveira",
    matricula: "ATH-0103",
    cpf: "512.783.990-45",
    email: "lucas.oliveira@athleta.com.br",
    phone: "(43) 99654-3210",
    role: "Vendedor(a) Esportivo",
    storeId: "store-catuai",
    admissionDate: "2023-08-10",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-catuai-fechamento",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 17.5,
  },
  {
    id: "emp-4",
    name: "Beatriz Fernandes Lima",
    matricula: "ATH-0104",
    cpf: "623.491.229-87",
    email: "beatriz.lima@athleta.com.br",
    phone: "(43) 99432-1098",
    role: "Operador(a) de Caixa",
    storeId: "store-catuai",
    admissionDate: "2024-01-08",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-catuai-abertura",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 16.0,
  },
  {
    id: "emp-9",
    name: "Murilo Santos (Teste Catuaí)",
    matricula: "ATH-0105",
    cpf: "123.456.789-10",
    email: "murilo.santos@athleta.com.br",
    phone: "(43) 99111-2222",
    role: "Vendedor(a) Esportivo",
    storeId: "store-catuai",
    admissionDate: "2024-02-01",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-catuai-intermediario",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 20.0,
  },

  // --- Unidade Boulevard ---
  {
    id: "emp-5",
    name: "Rodrigo Albuquerque",
    matricula: "ATH-0201",
    cpf: "289.471.558-33",
    email: "rodrigo.albuquerque@athleta.com.br",
    phone: "(43) 99789-0123",
    role: "Gerente de Loja",
    storeId: "store-boulevard",
    admissionDate: "2024-03-01",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-blv-abertura",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 26.0,
  },
  {
    id: "emp-6",
    name: "Camila Nogueira Mendes",
    matricula: "ATH-0202",
    cpf: "390.182.774-60",
    email: "camila.mendes@athleta.com.br",
    phone: "(43) 99345-6789",
    role: "Consultor(a) de Vendas",
    storeId: "store-boulevard",
    admissionDate: "2024-03-10",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-blv-intermediario",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 18.0,
  },
  {
    id: "emp-7",
    name: "Thiago Henrique Costa",
    matricula: "ATH-0203",
    cpf: "415.698.223-11",
    email: "thiago.costa@athleta.com.br",
    phone: "(43) 99234-5678",
    role: "Vendedor(a) Esportivo",
    storeId: "store-boulevard",
    admissionDate: "2024-04-02",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-blv-fechamento",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 17.5,
  },
  {
    id: "emp-8",
    name: "Juliana Ribeiro Prado",
    matricula: "ATH-0204",
    cpf: "587.319.442-99",
    email: "juliana.prado@athleta.com.br",
    phone: "(43) 99567-8901",
    role: "Operador(a) de Caixa",
    storeId: "store-boulevard",
    admissionDate: "2024-04-15",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-blv-abertura",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 16.0,
  },
  {
    id: "emp-10",
    name: "Lucas Teste (Boulevard)",
    matricula: "ATH-0205",
    cpf: "987.654.321-00",
    email: "lucas.teste@athleta.com.br",
    phone: "(43) 99333-4444",
    role: "Vendedor(a) Esportivo",
    storeId: "store-boulevard",
    admissionDate: "2024-05-01",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "1234",
    defaultScheduleId: "sch-blv-intermediario",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 20.0,
  },
];

export const INITIAL_SCHEDULES: ScheduleTemplate[] = [
  {
    id: "sch-catuai-abertura",
    name: "Shopping Catuaí — Abertura (6x1)",
    description: "Turno de abertura Catuaí: 09:45 às 18:05 (1h de intervalo)",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "09:45",
    exitTime: "18:05",
    breakDurationMinutes: 60,
    breakStartTime: "13:30",
    breakEndTime: "14:30",
    weeklyHours: 44,
  },
  {
    id: "sch-catuai-intermediario",
    name: "Shopping Catuaí — Intermediário (6x1)",
    description: "Turno de pico Catuaí: 11:30 às 19:50 (1h de intervalo)",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "11:30",
    exitTime: "19:50",
    breakDurationMinutes: 60,
    breakStartTime: "15:00",
    breakEndTime: "16:00",
    weeklyHours: 44,
  },
  {
    id: "sch-catuai-fechamento",
    name: "Shopping Catuaí — Fechamento (6x1)",
    description: "Turno de fechamento Catuaí: 13:40 às 22:00 (1h de intervalo)",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "13:40",
    exitTime: "22:00",
    breakDurationMinutes: 60,
    breakStartTime: "17:00",
    breakEndTime: "18:00",
    weeklyHours: 44,
  },
  {
    id: "sch-blv-abertura",
    name: "Boulevard — Abertura (6x1)",
    description: "Turno de abertura Boulevard: 09:45 às 18:05 (1h de intervalo)",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "09:45",
    exitTime: "18:05",
    breakDurationMinutes: 60,
    breakStartTime: "13:30",
    breakEndTime: "14:30",
    weeklyHours: 44,
  },
  {
    id: "sch-blv-intermediario",
    name: "Boulevard — Intermediário (6x1)",
    description: "Turno intermediário Boulevard: 11:30 às 19:50 (1h de intervalo)",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "11:30",
    exitTime: "19:50",
    breakDurationMinutes: 60,
    breakStartTime: "15:00",
    breakEndTime: "16:00",
    weeklyHours: 44,
  },
  {
    id: "sch-blv-fechamento",
    name: "Boulevard — Fechamento (6x1)",
    description: "Turno de fechamento Boulevard: 13:40 às 22:00 (1h de intervalo)",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "13:40",
    exitTime: "22:00",
    breakDurationMinutes: 60,
    breakStartTime: "17:00",
    breakEndTime: "18:00",
    weeklyHours: 44,
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  toleranceMinutes: 5,
  minBreakMinutes: 60,
  minIntershiftHours: 11,
  requireFacialPhoto: true,
  requireLocationCheck: true,
  autoLockKioskSeconds: 4,
  companyName: "Athleta Confecções & Artigos Esportivos do Brasil Ltda",
  companyCnpj: "12.345.678/0001-90",
  companyAddress: "Rod. Celso Garcia Cid, 5600 - Londrina, PR",
  kioskCodes: {
    catuai: "1234",
    boulevard: "1234",
  },
};

// ==========================================
// FUNÇÕES AUXILIARES DE CÁLCULO
// ==========================================

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const isNegative = totalMinutes < 0;
  const absMinutes = Math.abs(totalMinutes);
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;
  const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatMinutesHuman(totalMinutes: number): string {
  const isNegative = totalMinutes < 0;
  const absMinutes = Math.abs(totalMinutes);
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;
  const sign = isNegative ? "-" : "+";
  if (h === 0) return `${sign}${m}m`;
  return `${sign}${h}h ${String(m).padStart(2, "0")}m`;
}

// Retorna a data no Horário Oficial de Brasília (America/Sao_Paulo, UTC-3) no formato YYYY-MM-DD
export function getLocalDateStr(date: Date = getBrasiliaDate()): string {
  return getBrasiliaDateStr(date);
}

// Retorna o horário no Horário Oficial de Brasília (America/Sao_Paulo, UTC-3) no formato HH:mm
export function getLocalTimeStr(date: Date = getBrasiliaDate()): string {
  return getBrasiliaTimeStr(date);
}

export interface PunchStageInfo {
  type: PunchType;
  name: string;
  shortName: string;
  stepNumber: number; // 1, 2, 3, 4
  expectedTime: string;
  actualTime: string | null;
  status: "concluido" | "proxima" | "aguardando";
  punch: Punch | null;
  isCompleted: boolean;
  isNext: boolean;
}

export function getEmployeeDayStages(params: {
  employee: Employee;
  dayRecord?: DayTimeRecord | null;
  schedule?: Schedule | null;
}): {
  stages: PunchStageInfo[];
  nextStage: PunchStageInfo | null;
  completedCount: number;
  isAllCompleted: boolean;
  canPunch: boolean;
} {
  const { employee, dayRecord, schedule } = params;
  const punches = dayRecord?.punches || [];

  const expectedEntry = dayRecord?.scheduledEntry || schedule?.entryTime || "09:45";
  const expectedBreakStart = schedule?.breakStartTime || "13:30";
  const expectedBreakEnd = schedule?.breakEndTime || "14:30";
  const expectedExit = dayRecord?.scheduledExit || schedule?.exitTime || "18:05";

  const stageDefs: { type: PunchType; name: string; shortName: string; stepNumber: number; expectedTime: string }[] = [
    { type: "entrada", name: "1. Entrada", shortName: "Entrada", stepNumber: 1, expectedTime: expectedEntry },
    { type: "intervalo_saida", name: "2. Saída para Intervalo", shortName: "Saída Almoço", stepNumber: 2, expectedTime: expectedBreakStart },
    { type: "intervalo_retorno", name: "3. Retorno do Intervalo", shortName: "Retorno Almoço", stepNumber: 3, expectedTime: expectedBreakEnd },
    { type: "saida", name: "4. Saída Final", shortName: "Saída Final", stepNumber: 4, expectedTime: expectedExit },
  ];

  let foundNext = false;
  let nextStage: PunchStageInfo | null = null;
  let completedCount = 0;

  const stages: PunchStageInfo[] = stageDefs.map((def) => {
    const existingPunch = punches.find((p) => p.type === def.type) || null;
    const isCompleted = !!existingPunch;

    let status: "concluido" | "proxima" | "aguardando" = "aguardando";
    let isNext = false;

    if (isCompleted) {
      status = "concluido";
      completedCount++;
    } else if (!foundNext) {
      status = "proxima";
      isNext = true;
      foundNext = true;
    } else {
      status = "aguardando";
    }

    const stageObj: PunchStageInfo = {
      type: def.type,
      name: def.name,
      shortName: def.shortName,
      stepNumber: def.stepNumber,
      expectedTime: def.expectedTime,
      actualTime: existingPunch ? existingPunch.time : null,
      status,
      punch: existingPunch,
      isCompleted,
      isNext,
    };

    if (isNext) {
      nextStage = stageObj;
    }

    return stageObj;
  });

  return {
    stages,
    nextStage,
    completedCount,
    isAllCompleted: completedCount === 4,
    canPunch: !foundNext ? false : true,
  };
}

// Retorna as datas da semana (Segunda a Domingo)
export function getWeekDates(referenceDate: Date = new Date()): {
  date: string;
  dayOfWeek: number;
  dayName: string;
  dayNumber: number;
}[] {
  const curr = new Date(referenceDate);
  const day = curr.getDay(); // 0=Dom, 1=Seg, ...
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diff));

  const daysNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const week = [];

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    const dateStr = getLocalDateStr(nextDate);
    const jsDayOfWeek = nextDate.getDay();
    week.push({
      date: dateStr,
      dayOfWeek: jsDayOfWeek,
      dayName: daysNames[i],
      dayNumber: nextDate.getDate(),
    });
  }

  return week;
}

// Gera foto facial de demonstração estilizada com estudo biométrico facial real
export function generateDemoSelfie(
  name: string,
  role: string,
  initials: string,
  time: string,
  storeCode: string,
  punchType: PunchType = "entrada"
): string {
  // Procura o colaborador correspondente para usar sua foto real cadastrada
  const emp = INITIAL_EMPLOYEES.find(
    (e) => e.name === name || e.name.toLowerCase().includes((name || "").split(" ")[0].toLowerCase())
  ) || {
    id: "emp-demo",
    name,
    role,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    storeId: storeCode as "store-catuai" | "store-boulevard",
    matricula: "ATH-0100",
  } as Employee;

  // Importa e gera a foto de biometria facial completa (com 68 marcos, scan HUD e selo Portaria 671 MTE)
  return generateDemoBiometricSelfie(emp, storeCode, time, punchType);
}

// ==========================================
// 3. BASE DE DEMONSTRAÇÃO REALISTA:
// OUTUBRO/2026 COMPLETO E 01 A 11/NOVEMBRO/2026
// ==========================================

export function generateFullHistoricalDemoData(): {
  records: DayTimeRecord[];
  bankEntries: BankOfHoursEntry[];
} {
  const records: DayTimeRecord[] = [];
  const bankEntries: BankOfHoursEntry[] = [];
  let nsrCounter = 200100;

  // Lista de datas: Outubro 2026 (01 a 31) + Novembro 2026 (01 a 11)
  const allDates: string[] = [];
  // Outubro
  for (let d = 1; d <= 31; d++) {
    allDates.push(`2026-10-${String(d).padStart(2, "0")}`);
  }
  // Novembro
  for (let d = 1; d <= 11; d++) {
    allDates.push(`2026-11-${String(d).padStart(2, "0")}`);
  }

  INITIAL_EMPLOYEES.forEach((emp) => {
    let runningBalance = 0;

    allDates.forEach((dateStr) => {
      const dateObj = new Date(`${dateStr}T12:00:00`);
      const dayOfWeek = dateObj.getDay(); // 0=Dom, 1=Seg...
      const isSunday = dayOfWeek === 0;

      // Escala de Folga (DSR): Domingo ou folga fixa no meio da semana para escala 6x1
      const isEmployeeOffDay =
        isSunday ||
        (emp.id === "emp-3" && dayOfWeek === 2) || // Lucas folga terça
        (emp.id === "emp-6" && dayOfWeek === 3) || // Camila folga quarta
        (emp.id === "emp-7" && dayOfWeek === 4);   // Thiago folga quinta

      let scheduledEntry = "09:45";
      let scheduledExit = "18:05";
      let breakStart = "13:30";
      let breakEnd = "14:30";

      if (emp.role.includes("Fechamento") || emp.id === "emp-3" || emp.id === "emp-7") {
        scheduledEntry = "13:40";
        scheduledExit = "22:00";
        breakStart = "17:00";
        breakEnd = "18:00";
      } else if (emp.role.includes("Líder") || emp.role.includes("Consultor") || emp.id === "emp-2" || emp.id === "emp-6") {
        scheduledEntry = "11:30";
        scheduledExit = "19:50";
        breakStart = "15:00";
        breakEnd = "16:00";
      }

      const scheduledBreak = `${breakStart} - ${breakEnd}`;
      const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

      // 1. DIA DE FOLGA
      if (isEmployeeOffDay) {
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          storeId: emp.storeId,
          date: dateStr,
          dayOfWeek,
          punches: [],
          scheduledEntry: "-",
          scheduledExit: "-",
          scheduledBreak: "-",
          isDayOff: true,
          isVacationOrLeave: false,
          status: "folga",
          totalWorkedMinutes: 0,
          expectedWorkedMinutes: 0,
          balanceMinutes: 0,
          delayMinutes: 0,
          extraMinutes: 0,
          earlyExitMinutes: 0,
          isDemoData: true,
          notes: "DSR / Folga semanal conforme escala",
        });
        return;
      }

      // 2. SIMULAÇÃO VARIADA REALISTA
      const dayNum = dateObj.getDate();
      const monthNum = dateObj.getMonth() + 1; // 10 ou 11
      const isNovember = monthNum === 11;
      const isToday = isNovember && dayNum === 11;

      let status: DayStatus = "presente";
      let actualEntry = scheduledEntry;
      let actualExit = scheduledExit;
      let delayMinutes = 0;
      let extraMinutes = 0;
      let earlyExitMinutes = 0;

      // Cenário A: Falta Injustificada
      const isAbsent = (dayNum === 14 && emp.id === "emp-4") || (dayNum === 22 && emp.id === "emp-8") || (isNovember && dayNum === 4 && emp.id === "emp-7");
      if (isAbsent && !isToday) {
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          storeId: emp.storeId,
          date: dateStr,
          dayOfWeek,
          punches: [],
          scheduledEntry,
          scheduledExit,
          scheduledBreak,
          isDayOff: false,
          isVacationOrLeave: false,
          status: "ausente",
          totalWorkedMinutes: 0,
          expectedWorkedMinutes: 440,
          balanceMinutes: -440,
          delayMinutes: 0,
          extraMinutes: 0,
          earlyExitMinutes: 0,
          isDemoData: true,
          notes: "Ausência não justificada",
        });

        runningBalance -= 440;
        bankEntries.push({
          id: `bkh-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          storeId: emp.storeId,
          date: dateStr,
          type: "debito",
          minutes: 440,
          balanceAfterMinutes: runningBalance,
          reason: `Falta injustificada dia ${dateStr.split('-').reverse().join('/')}`,
          author: "Sistema Automático",
          isDemoData: true,
          createdAt: `${dateStr}T23:59:00Z`,
        });
        return;
      }

      // Cenário B: Atraso na entrada (15 a 25 min)
      const hasDelay = (dayNum % 7 === 1 && (emp.id === "emp-2" || emp.id === "emp-6")) || (isNovember && dayNum === 6 && emp.id === "emp-3");
      if (hasDelay) {
        delayMinutes = 20;
        const entryM = timeToMinutes(scheduledEntry) + delayMinutes;
        actualEntry = minutesToTime(entryM);
        status = "atrasado";
      }

      // Cenário C: Horas Extras (+35 a +55 min)
      const hasExtra = (dayNum % 5 === 0 && (emp.id === "emp-1" || emp.id === "emp-5")) || (isNovember && dayNum === 7 && emp.id === "emp-2");
      if (hasExtra) {
        extraMinutes = 45;
        const exitM = timeToMinutes(scheduledExit) + extraMinutes;
        actualExit = minutesToTime(exitM);
        status = "hora_extra";
      }

      // Cenário D: Saída Antecipada (30 min)
      const hasEarlyExit = (dayNum === 19 && emp.id === "emp-3") || (isNovember && dayNum === 9 && emp.id === "emp-8");
      if (hasEarlyExit) {
        earlyExitMinutes = 30;
        const exitM = timeToMinutes(scheduledExit) - earlyExitMinutes;
        actualExit = minutesToTime(exitM);
        status = "saida_antecipada";
      }

      // Cenário E: Incompleto (esqueceu a batida de saída)
      const isIncomplete = (dayNum === 27 && emp.id === "emp-4") || (isNovember && dayNum === 9 && emp.id === "emp-4");

      // Cenário Especial: HOJE (11/11/2026)
      // Simula expediente em andamento (já bateu entrada, alguns no almoço, saída ainda PENDENTE)
      const punches: Punch[] = [];

      if (isToday) {
        // Hoje: Entrada registrada
        nsrCounter++;
        punches.push({
          id: `p-${nsrCounter}`,
          type: "entrada",
          timestamp: `${dateStr}T${actualEntry}:00.000Z`,
          time: actualEntry,
          photoUrl: generateDemoSelfie(emp.name, emp.role, initials, actualEntry, emp.storeId),
          location: {
            latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
            longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
            accuracy: 6,
            address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
            inRange: true,
          },
          device: {
            type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
            ip: "192.168.1.50",
            userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
          },
          nsr: nsrCounter,
          hash: `sha256-demo-${nsrCounter}`,
          isDemoData: true,
        });

        // Quem entrou cedo já saiu e voltou do almoço
        if (emp.role.includes("Abertura") || emp.id === "emp-1" || emp.id === "emp-5" || emp.id === "emp-4") {
          nsrCounter++;
          punches.push({
            id: `p-${nsrCounter}`,
            type: "intervalo_saida",
            timestamp: `${dateStr}T${breakStart}:00.000Z`,
            time: breakStart,
            photoUrl: generateDemoSelfie(emp.name, emp.role, initials, breakStart, emp.storeId),
            location: {
              latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
              longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
              accuracy: 6,
              address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
              inRange: true,
            },
            device: {
              type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
              ip: "192.168.1.50",
              userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
            },
            nsr: nsrCounter,
            hash: `sha256-demo-${nsrCounter}`,
            isDemoData: true,
          });

          nsrCounter++;
          punches.push({
            id: `p-${nsrCounter}`,
            type: "intervalo_retorno",
            timestamp: `${dateStr}T${breakEnd}:00.000Z`,
            time: breakEnd,
            photoUrl: generateDemoSelfie(emp.name, emp.role, initials, breakEnd, emp.storeId),
            location: {
              latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
              longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
              accuracy: 7,
              address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
              inRange: true,
            },
            device: {
              type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
              ip: "192.168.1.50",
              userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
            },
            nsr: nsrCounter,
            hash: `sha256-demo-${nsrCounter}`,
            isDemoData: true,
          });
        }

        // Saída de hoje: AINDA NÃO OCORREU (PENDENTE)! NUNCA criar saída antecipada no dia em curso!
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          storeId: emp.storeId,
          date: dateStr,
          dayOfWeek,
          punches,
          scheduledEntry,
          scheduledExit,
          scheduledBreak,
          isDayOff: false,
          isVacationOrLeave: false,
          status: punches.length === 2 ? "incompleto" : "presente",
          totalWorkedMinutes: 240, // 4h feitas até o momento
          expectedWorkedMinutes: 440,
          balanceMinutes: -200, // em andamento
          delayMinutes,
          extraMinutes: 0,
          earlyExitMinutes: 0,
          isDemoData: true,
          notes: "Expediente em andamento • Saída pendente",
        });
        return;
      }

      // DIAS ANTERIORES CONCLUÍDOS
      // Batida 1: Entrada
      nsrCounter++;
      punches.push({
        id: `p-${nsrCounter}`,
        type: "entrada",
        timestamp: `${dateStr}T${actualEntry}:00.000Z`,
        time: actualEntry,
        photoUrl: generateDemoSelfie(emp.name, emp.role, initials, actualEntry, emp.storeId),
        location: {
          latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
          longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
          accuracy: 5,
          address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
          inRange: true,
        },
        device: {
          type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
          ip: "192.168.1.50",
          userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
        },
        nsr: nsrCounter,
        hash: `sha256-demo-${nsrCounter}`,
        isDemoData: true,
      });

      // Batida 2: Saída Intervalo
      nsrCounter++;
      punches.push({
        id: `p-${nsrCounter}`,
        type: "intervalo_saida",
        timestamp: `${dateStr}T${breakStart}:00.000Z`,
        time: breakStart,
        photoUrl: generateDemoSelfie(emp.name, emp.role, initials, breakStart, emp.storeId),
        location: {
          latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
          longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
          accuracy: 5,
          address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
          inRange: true,
        },
        device: {
          type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
          ip: "192.168.1.50",
          userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
        },
        nsr: nsrCounter,
        hash: `sha256-demo-${nsrCounter}`,
        isDemoData: true,
      });

      // Batida 3: Retorno Intervalo
      nsrCounter++;
      punches.push({
        id: `p-${nsrCounter}`,
        type: "intervalo_retorno",
        timestamp: `${dateStr}T${breakEnd}:00.000Z`,
        time: breakEnd,
        photoUrl: generateDemoSelfie(emp.name, emp.role, initials, breakEnd, emp.storeId),
        location: {
          latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
          longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
          accuracy: 5,
          address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
          inRange: true,
        },
        device: {
          type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
          ip: "192.168.1.50",
          userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
        },
        nsr: nsrCounter,
        hash: `sha256-demo-${nsrCounter}`,
        isDemoData: true,
      });

      // Batida 4: Saída (se não for incompleto)
      if (!isIncomplete) {
        nsrCounter++;
        punches.push({
          id: `p-${nsrCounter}`,
          type: "saida",
          timestamp: `${dateStr}T${actualExit}:00.000Z`,
          time: actualExit,
          photoUrl: generateDemoSelfie(emp.name, emp.role, initials, actualExit, emp.storeId),
          location: {
            latitude: emp.storeId === "store-catuai" ? -23.3421 : -23.3089,
            longitude: emp.storeId === "store-catuai" ? -51.1872 : -51.1448,
            accuracy: 6,
            address: emp.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
            inRange: true,
          },
          device: {
            type: emp.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
            ip: "192.168.1.50",
            userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
          },
          nsr: nsrCounter,
          hash: `sha256-demo-${nsrCounter}`,
          isDemoData: true,
        });
      } else {
        status = "incompleto";
      }

      const expectedWorkedMinutes = timeToMinutes(scheduledExit) - timeToMinutes(scheduledEntry) - 60;
      let totalWorkedMinutes = 0;

      if (punches.length === 4) {
        const morning = timeToMinutes(punches[1].time) - timeToMinutes(punches[0].time);
        const afternoon = timeToMinutes(punches[3].time) - timeToMinutes(punches[2].time);
        totalWorkedMinutes = Math.max(0, morning + afternoon);
      } else if (punches.length === 3) {
        totalWorkedMinutes = timeToMinutes(punches[1].time) - timeToMinutes(punches[0].time);
      }

      const balanceMinutes = totalWorkedMinutes - expectedWorkedMinutes;

      // Alimenta Banco de Horas
      if (balanceMinutes !== 0 && !isIncomplete) {
        runningBalance += balanceMinutes;
        bankEntries.push({
          id: `bkh-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          storeId: emp.storeId,
          date: dateStr,
          type: balanceMinutes > 0 ? "credito" : "debito",
          minutes: Math.abs(balanceMinutes),
          balanceAfterMinutes: runningBalance,
          reason: balanceMinutes > 0
            ? `Horas extras realizadas (+${balanceMinutes}m)`
            : delayMinutes > 0
            ? `Atraso na entrada (-${delayMinutes}m)`
            : `Saída antecipada (-${earlyExitMinutes}m)`,
          author: "Sistema Automático",
          isDemoData: true,
          createdAt: `${dateStr}T22:30:00Z`,
        });
      }

      records.push({
        id: `rec-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        storeId: emp.storeId,
        date: dateStr,
        dayOfWeek,
        punches,
        scheduledEntry,
        scheduledExit,
        scheduledBreak,
        isDayOff: false,
        isVacationOrLeave: false,
        status,
        totalWorkedMinutes,
        expectedWorkedMinutes,
        balanceMinutes,
        delayMinutes,
        extraMinutes,
        earlyExitMinutes,
        isDemoData: true,
      });
    });
  });

  return { records, bankEntries };
}

// ==========================================
// 4. STORAGE & ENGINE
// ==========================================

const STORAGE_KEYS = {
  STORES: "athleta_ponto_stores_v2",
  EMPLOYEES: "athleta_ponto_employees_v2",
  SCHEDULES: "athleta_ponto_schedules_v2",
  DAY_RECORDS: "athleta_ponto_records_v2",
  AUDIT_LOGS: "athleta_ponto_audit_v2",
  CORRECTIONS: "athleta_ponto_corrections_v2",
  SETTINGS: "athleta_ponto_settings_v2",
  SCHEDULE_OVERRIDES: "athleta_ponto_overrides_v2",
  BANK_OF_HOURS: "athleta_ponto_bank_v2",
};

export class PontoStore {
  private static listeners: Set<() => void> = new Set();

  public static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in PontoStore listener:", err);
      }
    });
  }

  // --- STORES ---
  public static getStores(): Store[] {
    if (typeof window === "undefined") return INITIAL_STORES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES));
        return INITIAL_STORES;
      }
      const parsed: Store[] = JSON.parse(data);
      // Garante somente Catuaí e Boulevard e define senha 1234
      const onlyOfficial = parsed.filter(
        (s) => s.id === "store-catuai" || s.id === "store-boulevard"
      );
      let updated = false;
      onlyOfficial.forEach((s) => {
        if (s.kioskAccessCode !== "1234") {
          s.kioskAccessCode = "1234";
          updated = true;
        }
      });
      if (onlyOfficial.length < 2 || updated) {
        localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES));
        return INITIAL_STORES;
      }
      return onlyOfficial;
    } catch {
      return INITIAL_STORES;
    }
  }

  public static saveStores(stores: Store[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    this.notify();
  }

  // Validação do código exclusivo de quiosque
  public static validateKioskCode(code: string): {
    valid: boolean;
    store?: Store;
    errorMessage?: string;
  } {
    const stores = this.getStores();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "1234") {
      return { valid: true, store: stores[0] };
    }
    const store = stores.find((s) => s.kioskAccessCode.toUpperCase() === cleanCode || cleanCode === "1234");

    if (store) {
      return { valid: true, store };
    }
    return {
      valid: false,
      errorMessage: "Código de acesso inválido. A senha é 1234.",
    };
  }

  // Troca/revogação de código de quiosque pelo ADM
  public static regenerateKioskCode(storeId: "store-catuai" | "store-boulevard"): string {
    const stores = this.getStores();
    const store = stores.find((s) => s.id === storeId);
    if (!store) return "";

    const prefix = storeId === "store-catuai" ? "CAT" : "BLV";
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${prefix}-${randomDigits}`;

    const oldCode = store.kioskAccessCode;
    store.kioskAccessCode = newCode;
    this.saveStores(stores);

    // Atualiza também nas configurações
    const settings = this.getSettings();
    if (storeId === "store-catuai") {
      settings.kioskCodes.catuai = newCode;
    } else {
      settings.kioskCodes.boulevard = newCode;
    }
    this.updateSettings(settings);

    this.addAuditLog({
      actionType: "troca_codigo_quiosque",
      title: `Código de Acesso do Quiosque ${store.name} Renovado`,
      details: `Novo código gerado pelo administrador geral. Dispositivos antigos precisarão informar o novo código.`,
      storeId,
      authorName: "ADM TOTAL (Proprietário)",
      previousValue: oldCode,
      newValue: newCode,
    });

    return newCode;
  }

  // --- EMPLOYEES ---
  public static getEmployees(): Employee[] {
    if (typeof window === "undefined") return INITIAL_EMPLOYEES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
        return INITIAL_EMPLOYEES;
      }
      const parsed: Employee[] = JSON.parse(data);
      // Garante que novos funcionários de teste em INITIAL_EMPLOYEES sejam incorporados
      const existingIds = new Set(parsed.map((e) => e.id));
      let hadNew = false;
      INITIAL_EMPLOYEES.forEach((initEmp) => {
        if (!existingIds.has(initEmp.id)) {
          parsed.push(initEmp);
          hadNew = true;
        }
      });
      // Garante que todos os colaboradores estejam com a senha / PIN 1234
      parsed.forEach((emp) => {
        if (emp.pin !== "1234") {
          emp.pin = "1234";
          hadNew = true;
        }
      });
      if (hadNew) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(parsed));
      }

      // Filtra apenas Catuaí e Boulevard e garante photoUrl e pin 1234
      return parsed
        .filter((e) => e.storeId === "store-catuai" || e.storeId === "store-boulevard")
        .map((e) => ({
          ...e,
          pin: "1234",
          avatar:
            e.avatar ||
            e.photoUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          photoUrl:
            e.photoUrl ||
            e.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        }));
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }

  public static saveEmployees(employees: Employee[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.notify();
  }

  public static addEmployee(emp: {
    name: string;
    storeId: "store-catuai" | "store-boulevard";
    role?: RoleType;
    cpf?: string;
    email?: string;
    phone?: string;
    hourlyRate?: number;
    avatar?: string;
    photoUrl?: string;
    defaultScheduleId?: string;
    pin?: string;
    contractHoursPerWeek?: number;
    admissionDate?: string;
  }): Employee {
    const employees = this.getEmployees();
    const id = `emp-${Date.now()}`;
    const cleanName = emp.name.trim();

    const randomAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    ];
    const chosenPhoto =
      emp.photoUrl ||
      emp.avatar ||
      randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const matricula = `ATH-${randomDigits}`;
    const cleanSlug = cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ".");

    const newEmp: Employee = {
      id,
      name: cleanName,
      matricula,
      cpf:
        emp.cpf?.trim() ||
        `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-00`,
      email: emp.email?.trim() || `${cleanSlug}@athleta.com.br`,
      phone: emp.phone?.trim() || "(43) 99000-0000",
      role: emp.role || "Vendedor(a) Esportivo",
      storeId: emp.storeId,
      admissionDate: emp.admissionDate || new Date().toISOString().split("T")[0],
      contractHoursPerWeek: emp.contractHoursPerWeek || 44,
      status: "ativo",
      pin: emp.pin || "1234",
      defaultScheduleId:
        emp.defaultScheduleId ||
        (emp.storeId === "store-catuai" ? "sch-catuai-abertura" : "sch-blv-abertura"),
      avatar: chosenPhoto,
      photoUrl: chosenPhoto,
      hourlyRate: emp.hourlyRate || 19.5,
    };

    employees.push(newEmp);
    this.saveEmployees(employees);

    this.addAuditLog({
      actionType: "novo_funcionario",
      title: `Novo colaborador cadastrado: ${newEmp.name}`,
      details: `Cadastrado na unidade ${
        newEmp.storeId === "store-catuai" ? "Shopping Catuaí" : "Shopping Boulevard"
      }.`,
      employeeId: newEmp.id,
      employeeName: newEmp.name,
      storeId: newEmp.storeId,
      authorName: "ADM TOTAL (Proprietário)",
    });

    return newEmp;
  }

  public static deleteEmployee(id: string): boolean {
    let employees = this.getEmployees();
    const emp = employees.find((e) => e.id === id);
    if (!emp) return false;

    employees = employees.filter((e) => e.id !== id);
    this.saveEmployees(employees);

    this.addAuditLog({
      actionType: "editar_funcionario",
      title: `Colaborador removido: ${emp.name}`,
      details: `Cadastro desativado e removido pelo administrador.`,
      employeeId: emp.id,
      employeeName: emp.name,
      storeId: emp.storeId,
      authorName: "ADM TOTAL (Proprietário)",
    });

    return true;
  }

  public static updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const previous = employees[index];
    const updated = { ...previous, ...updates };
    employees[index] = updated;
    this.saveEmployees(employees);

    this.addAuditLog({
      actionType: "editar_funcionario",
      title: `Atualização de cadastro: ${updated.name}`,
      details: `Dados do colaborador atualizados no sistema.`,
      employeeId: updated.id,
      employeeName: updated.name,
      storeId: updated.storeId,
      authorName: "ADM TOTAL (Proprietário)",
    });

    return updated;
  }

  // --- DAY RECORDS ---
  public static getDayRecords(): DayTimeRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
      if (!data) {
        const { records, bankEntries } = generateFullHistoricalDemoData();
        localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(records));
        localStorage.setItem(STORAGE_KEYS.BANK_OF_HOURS, JSON.stringify(bankEntries));
        return records;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static saveDayRecords(records: DayTimeRecord[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(records));
    this.notify();
  }

  // --- BANCO DE HORAS ---
  public static getBankOfHoursEntries(): BankOfHoursEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANK_OF_HOURS);
      if (!data) {
        const { bankEntries } = generateFullHistoricalDemoData();
        localStorage.setItem(STORAGE_KEYS.BANK_OF_HOURS, JSON.stringify(bankEntries));
        return bankEntries;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static saveBankOfHoursEntries(entries: BankOfHoursEntry[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.BANK_OF_HOURS, JSON.stringify(entries));
    this.notify();
  }

  // Extrato e resumo consolidado do Banco de Horas de um colaborador
  public static getEmployeeBankSummary(employeeId: string, monthYearPrefix: string = "2026-11"): {
    previousBalanceMinutes: number;
    positiveMonthMinutes: number;
    negativeMonthMinutes: number;
    currentBalanceMinutes: number;
    entries: BankOfHoursEntry[];
  } {
    const allEntries = this.getBankOfHoursEntries()
      .filter((e) => e.employeeId === employeeId)
      .sort((a, b) => a.date.localeCompare(b.date));

    let previousBalanceMinutes = 0;
    let positiveMonthMinutes = 0;
    let negativeMonthMinutes = 0;
    let currentBalanceMinutes = 0;

    allEntries.forEach((entry) => {
      const isPriorMonth = entry.date < `${monthYearPrefix}-01`;
      const isCurrentMonth = entry.date.startsWith(monthYearPrefix);

      if (isPriorMonth) {
        if (entry.type === "credito") {
          previousBalanceMinutes += entry.minutes;
        } else {
          previousBalanceMinutes -= entry.minutes;
        }
      }

      if (isCurrentMonth) {
        if (entry.type === "credito") {
          positiveMonthMinutes += entry.minutes;
        } else {
          negativeMonthMinutes += entry.minutes;
        }
      }

      if (entry.type === "credito") {
        currentBalanceMinutes += entry.minutes;
      } else {
        currentBalanceMinutes -= entry.minutes;
      }
    });

    return {
      previousBalanceMinutes,
      positiveMonthMinutes,
      negativeMonthMinutes,
      currentBalanceMinutes,
      entries: allEntries.reverse(), // mais recentes primeiro
    };
  }

  // Lançamento manual de ajuste de Banco de Horas pelo Administrador
  public static addBankOfHoursAdjustment(params: {
    employeeId: string;
    type: "credito" | "debito";
    minutes: number;
    reason: string;
    authorName: string;
  }): BankOfHoursEntry {
    const entries = this.getBankOfHoursEntries();
    const employees = this.getEmployees();
    const emp = employees.find((e) => e.id === params.employeeId);
    const storeId = emp?.storeId || "store-catuai";

    const summary = this.getEmployeeBankSummary(params.employeeId);
    const balanceAfter =
      params.type === "credito"
        ? summary.currentBalanceMinutes + params.minutes
        : summary.currentBalanceMinutes - params.minutes;

    const newEntry: BankOfHoursEntry = {
      id: `bkh-adj-${Date.now()}`,
      employeeId: params.employeeId,
      storeId,
      date: new Date().toISOString().split("T")[0],
      type: params.type,
      minutes: params.minutes,
      balanceAfterMinutes: balanceAfter,
      reason: `Ajuste Administrativo: ${params.reason}`,
      author: params.authorName,
      isManualAdjustment: true,
      createdAt: new Date().toISOString(),
    };

    entries.push(newEntry);
    this.saveBankOfHoursEntries(entries);

    this.addAuditLog({
      actionType: "ajuste_banco_horas",
      title: `Ajuste manual de Banco de Horas: ${emp?.name}`,
      details: `${params.type === "credito" ? "Crédito" : "Débito"} de ${formatMinutesHuman(
        params.minutes
      )}. Justificativa: "${params.reason}". Saldo resultante: ${formatMinutesHuman(balanceAfter)}.`,
      employeeId: params.employeeId,
      employeeName: emp?.name,
      storeId,
      authorName: params.authorName,
      previousValue: formatMinutesHuman(summary.currentBalanceMinutes),
      newValue: formatMinutesHuman(balanceAfter),
    });

    return newEntry;
  }

  // --- REGISTRAR PONTO VIA QUIOSQUE DA LOJA ---
  public static recordPunch(params: {
    employeeId: string;
    storeId: "store-catuai" | "store-boulevard";
    punchType: PunchType;
    photoUrl: string;
    location?: { latitude: number; longitude: number; accuracy: number; address: string; inRange: boolean };
    deviceType?: "Totem Tablet Catuaí" | "Totem Tablet Boulevard" | "Computador da Loja";
  }): { success: boolean; punch?: Punch; record?: DayTimeRecord; errorMessage?: string } {
    try {
      const now = getBrasiliaDate();
      const dateStr = getBrasiliaDateStr(now);
      const timeStr = getBrasiliaTimeStr(now);

      const records = this.getDayRecords();
      const employees = this.getEmployees();
      const employee = employees.find((e) => e.id === params.employeeId);
      const employeeName = employee ? employee.name : "Funcionário";

      const schedules = this.getSchedules();
      const empSchedule = employee ? schedules.find((s) => s.id === employee.defaultScheduleId) : null;

      let dayRecord = records.find((r) => r.employeeId === params.employeeId && r.date === dateStr);

      // Validação das 4 etapas da jornada:
      const stagesInfo = getEmployeeDayStages({
        employee: employee || ({ id: params.employeeId, name: employeeName } as any),
        dayRecord: dayRecord || null,
        schedule: empSchedule,
      });

      // 1. Não permitir duplicações acidentais da mesma etapa no mesmo dia
      const existingSamePunch = dayRecord?.punches.find((p) => p.type === params.punchType);
      if (existingSamePunch) {
        const typeNames: Record<PunchType, string> = {
          entrada: "ENTRADA",
          intervalo_saida: "SAÍDA PARA INTERVALO",
          intervalo_retorno: "RETORNO DO INTERVALO",
          saida: "SAÍDA FINAL",
        };
        return {
          success: false,
          errorMessage: `A marcação de '${typeNames[params.punchType]}' já foi realizada hoje às ${existingSamePunch.time}. Não é permitido duplicar o registro.`,
        };
      }

      // 2. Não permitir pular etapas da jornada
      if (stagesInfo.nextStage && stagesInfo.nextStage.type !== params.punchType) {
        return {
          success: false,
          errorMessage: `Etapa fora de sequência! A próxima marcação esperada para hoje é '${stagesInfo.nextStage.name.toUpperCase()}'. Não é permitido pular etapas.`,
        };
      }

      if (!dayRecord) {
        dayRecord = {
          id: `rec-${params.employeeId}-${dateStr}`,
          employeeId: params.employeeId,
          storeId: params.storeId,
          date: dateStr,
          dayOfWeek: now.getDay(),
          punches: [],
          scheduledEntry: empSchedule?.entryTime || "09:45",
          scheduledExit: empSchedule?.exitTime || "18:05",
          scheduledBreak: empSchedule ? `${empSchedule.breakStartTime} - ${empSchedule.breakEndTime}` : "13:30 - 14:30",
          isDayOff: false,
          isVacationOrLeave: false,
          status: "presente",
          totalWorkedMinutes: 0,
          expectedWorkedMinutes: 440,
          balanceMinutes: 0,
          delayMinutes: 0,
          extraMinutes: 0,
          earlyExitMinutes: 0,
        };
        records.push(dayRecord);
      }

      const nsr = 300000 + Math.floor(Math.random() * 600000);
      const hash = `sha256-athleta-${Date.now()}-${params.employeeId}`;

      const newPunch: Punch = {
        id: `p-${Date.now()}`,
        type: params.punchType,
        timestamp: now.toISOString(),
        time: timeStr,
        photoUrl: params.photoUrl,
        location: params.location || {
          latitude: params.storeId === "store-catuai" ? -23.3421 : -23.3089,
          longitude: params.storeId === "store-catuai" ? -51.1872 : -51.1448,
          accuracy: 5,
          address: params.storeId === "store-catuai" ? "Shopping Catuaí - Loja Athleta" : "Shopping Boulevard - Loja Athleta",
          inRange: true,
        },
        device: {
          type: params.deviceType || (params.storeId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard"),
          ip: "192.168.1.100",
          userAgent: "AthletaKiosk/2.0 (Tablet Fixo)",
        },
        nsr,
        hash,
      };

      dayRecord.punches.push(newPunch);
      this.recalculateRecordStatus(dayRecord);
      this.saveDayRecords(records);

      // Se concluiu a saída e houve saldo, atualiza o Banco de Horas
      if (params.punchType === "saida" && dayRecord.balanceMinutes !== 0) {
        const summary = this.getEmployeeBankSummary(params.employeeId);
        const balanceAfter = summary.currentBalanceMinutes + dayRecord.balanceMinutes;
        const bankList = this.getBankOfHoursEntries();

        bankList.push({
          id: `bkh-real-${Date.now()}`,
          employeeId: params.employeeId,
          storeId: params.storeId,
          date: dateStr,
          type: dayRecord.balanceMinutes > 0 ? "credito" : "debito",
          minutes: Math.abs(dayRecord.balanceMinutes),
          balanceAfterMinutes: balanceAfter,
          reason: dayRecord.balanceMinutes > 0 ? "Horas extras do dia" : "Diferença negativa de jornada",
          author: "Sistema Automático Quiosque",
          createdAt: now.toISOString(),
        });
        this.saveBankOfHoursEntries(bankList);
      }

      const typeLabel = {
        entrada: "Entrada",
        intervalo_saida: "Saída para Intervalo",
        intervalo_retorno: "Retorno do Intervalo",
        saida: "Saída",
      }[params.punchType];

      this.addAuditLog({
        actionType: "registro_ponto_quiosque",
        title: `${typeLabel} — ${employeeName}`,
        details: `Horário oficial de Brasília: ${timeStr} | Loja: ${params.storeId} | Selfie capturada ao vivo | NSR: #${nsr}`,
        employeeId: params.employeeId,
        employeeName,
        storeId: params.storeId,
        authorName: "Totem Quiosque Loja",
        newValue: `${typeLabel} às ${timeStr}`,
      });

      this.notifySubscribers();

      return { success: true, punch: newPunch, record: dayRecord };
    } catch (err: any) {
      console.error("Erro fatal ao salvar registro de ponto:", err);
      return {
        success: false,
        errorMessage: "Falha técnica ao salvar no banco de dados. Tente novamente.",
      };
    }
  }

  // Recalcular métricas diárias
  private static recalculateRecordStatus(record: DayTimeRecord) {
    if (record.isDayOff) {
      record.status = "folga";
      return;
    }
    if (record.isVacationOrLeave) {
      record.status = "ferias";
      return;
    }

    const punches = record.punches;
    if (punches.length === 0) {
      record.status = "ausente";
      record.totalWorkedMinutes = 0;
      return;
    }

    const expectedEntryM = timeToMinutes(record.scheduledEntry);
    const expectedExitM = timeToMinutes(record.scheduledExit);
    const expectedWorkedM = Math.max(0, expectedExitM - expectedEntryM - 60);
    record.expectedWorkedMinutes = expectedWorkedM;

    // Atraso
    const firstEntry = punches.find((p) => p.type === "entrada");
    if (firstEntry) {
      const actualEntryM = timeToMinutes(firstEntry.time);
      if (actualEntryM > expectedEntryM + 5) {
        record.delayMinutes = actualEntryM - expectedEntryM;
      } else {
        record.delayMinutes = 0;
      }
    }

    // Horas trabalhadas
    let worked = 0;
    if (punches.length >= 2) {
      const p1 = timeToMinutes(punches[0].time);
      const p2 = timeToMinutes(punches[1].time);
      worked += Math.max(0, p2 - p1);
    }
    if (punches.length >= 4) {
      const p3 = timeToMinutes(punches[2].time);
      const p4 = timeToMinutes(punches[3].time);
      worked += Math.max(0, p4 - p3);
    }

    record.totalWorkedMinutes = worked;
    record.balanceMinutes = worked - expectedWorkedM;

    if (punches.length < 4) {
      record.status = "incompleto";
    } else if (record.balanceMinutes > 15) {
      record.status = "hora_extra";
      record.extraMinutes = record.balanceMinutes;
    } else if (record.delayMinutes > 5) {
      record.status = "atrasado";
    } else {
      record.status = "presente";
    }
  }

  // --- AUDITORIA DE FOTOS E PRESENÇA (PORTARIA 671) ---
  public static getAllPunchesForAudit(): {
    punch: Punch;
    employee: Employee;
    store: Store;
    recordDate: string;
    dayRecord: DayTimeRecord;
  }[] {
    const records = this.getDayRecords();
    const employees = this.getEmployees();
    const stores = this.getStores();

    const list: {
      punch: Punch;
      employee: Employee;
      store: Store;
      recordDate: string;
      dayRecord: DayTimeRecord;
    }[] = [];

    records.forEach((rec) => {
      const emp = employees.find((e) => e.id === rec.employeeId);
      const store = stores.find((s) => s.id === rec.storeId);
      if (!emp || !store) return;

      rec.punches.forEach((p) => {
        list.push({
          punch: p,
          employee: emp,
          store,
          recordDate: rec.date,
          dayRecord: rec,
        });
      });
    });

    // Ordena mais recentes primeiro
    return list.sort((a, b) => b.punch.timestamp.localeCompare(a.punch.timestamp));
  }

  // --- AJUSTE MANUAL DE MARCAÇÃO ESPECÍFICA ---
  public static adjustPunch(params: {
    recordId: string;
    punchId: string;
    newTime: string;
    reason: string;
    authorName: string;
  }): boolean {
    const records = this.getDayRecords();
    const record = records.find((r) => r.id === params.recordId);
    if (!record) return false;

    const punch = record.punches.find((p) => p.id === params.punchId);
    if (!punch) return false;

    const oldTime = punch.time;
    punch.time = params.newTime;
    punch.isManualAdjustment = true;
    punch.adjustmentReason = params.reason;
    punch.adjustedBy = params.authorName;
    punch.adjustedAt = new Date().toISOString();

    this.recalculateRecordStatus(record);
    this.saveDayRecords(records);

    const emp = this.getEmployees().find((e) => e.id === record.employeeId);

    this.addAuditLog({
      actionType: "ajuste_ponto",
      title: `Ajuste manual de marcação: ${emp?.name || "Colaborador"}`,
      details: `Marcação alterada de ${oldTime} para ${params.newTime}. Motivo: ${params.reason}`,
      employeeId: record.employeeId,
      employeeName: emp?.name,
      storeId: record.storeId,
      authorName: params.authorName,
      previousValue: oldTime,
      newValue: params.newTime,
    });

    return true;
  }

  // --- AJUSTE MANUAL COMPLETO DOS HORÁRIOS DO DIA (MUDAR HORÁRIOS / FAZER MAIS OU MENOS) ---
  public static adjustDayTimes(params: {
    employeeId: string;
    date: string;
    scheduledEntry?: string;
    scheduledExit?: string;
    entryTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
    exitTime?: string;
    isDayOff?: boolean;
    reason?: string;
    authorName?: string;
  }): DayTimeRecord {
    const records = this.getDayRecords();
    const employees = this.getEmployees();
    const emp = employees.find((e) => e.id === params.employeeId);
    const storeId = emp?.storeId || "store-catuai";

    let record = records.find((r) => r.employeeId === params.employeeId && r.date === params.date);

    if (!record) {
      record = {
        id: `rec-${params.employeeId}-${params.date}`,
        employeeId: params.employeeId,
        storeId,
        date: params.date,
        dayOfWeek: new Date(params.date + "T12:00:00").getDay(),
        punches: [],
        scheduledEntry: params.scheduledEntry || "09:45",
        scheduledExit: params.scheduledExit || "18:05",
        scheduledBreak: "13:30 - 14:30",
        isDayOff: !!params.isDayOff,
        isVacationOrLeave: false,
        status: params.isDayOff ? "folga" : "presente",
        totalWorkedMinutes: 0,
        expectedWorkedMinutes: 440,
        balanceMinutes: 0,
        delayMinutes: 0,
        extraMinutes: 0,
        earlyExitMinutes: 0,
      };
      records.push(record);
    }

    if (params.scheduledEntry) record.scheduledEntry = params.scheduledEntry;
    if (params.scheduledExit) record.scheduledExit = params.scheduledExit;
    if (params.isDayOff !== undefined) record.isDayOff = params.isDayOff;

    if (params.isDayOff) {
      record.punches = [];
      record.status = "folga";
      record.totalWorkedMinutes = 0;
      record.balanceMinutes = 0;
      record.delayMinutes = 0;
      record.extraMinutes = 0;
    } else {
      const entryT = params.entryTime || record.scheduledEntry || "09:45";
      const bStartT = params.breakStartTime || "13:30";
      const bEndT = params.breakEndTime || "14:30";
      const exitT = params.exitTime || record.scheduledExit || "18:05";

      const photoUrl =
        emp?.photoUrl ||
        emp?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

      // Atualiza ou cria as 4 marcações do dia
      record.punches = [
        {
          id: `p-${params.date}-1`,
          type: "entrada",
          timestamp: `${params.date}T${entryT}:00.000Z`,
          time: entryT,
          photoUrl,
          location: {
            latitude: -23.3421,
            longitude: -51.1872,
            accuracy: 5,
            address: storeId === "store-catuai" ? "Shopping Catuaí" : "Shopping Boulevard",
            inRange: true,
          },
          device: { type: "Totem Quiosque Tablet", ip: "192.168.1.100", userAgent: "Athleta/2.0" },
          nsr: 100000 + Math.floor(Math.random() * 900000),
          hash: `sha256-man-${Date.now()}-1`,
          isManualAdjustment: true,
          adjustmentReason: params.reason || "Ajuste manual de escala/horário",
          adjustedBy: params.authorName || "ADM TOTAL",
          adjustedAt: new Date().toISOString(),
        },
        {
          id: `p-${params.date}-2`,
          type: "intervalo_saida",
          timestamp: `${params.date}T${bStartT}:00.000Z`,
          time: bStartT,
          photoUrl,
          location: {
            latitude: -23.3421,
            longitude: -51.1872,
            accuracy: 5,
            address: storeId === "store-catuai" ? "Shopping Catuaí" : "Shopping Boulevard",
            inRange: true,
          },
          device: { type: "Totem Quiosque Tablet", ip: "192.168.1.100", userAgent: "Athleta/2.0" },
          nsr: 100000 + Math.floor(Math.random() * 900000),
          hash: `sha256-man-${Date.now()}-2`,
          isManualAdjustment: true,
          adjustmentReason: params.reason || "Ajuste manual de escala/horário",
          adjustedBy: params.authorName || "ADM TOTAL",
          adjustedAt: new Date().toISOString(),
        },
        {
          id: `p-${params.date}-3`,
          type: "intervalo_retorno",
          timestamp: `${params.date}T${bEndT}:00.000Z`,
          time: bEndT,
          photoUrl,
          location: {
            latitude: -23.3421,
            longitude: -51.1872,
            accuracy: 5,
            address: storeId === "store-catuai" ? "Shopping Catuaí" : "Shopping Boulevard",
            inRange: true,
          },
          device: { type: "Totem Quiosque Tablet", ip: "192.168.1.100", userAgent: "Athleta/2.0" },
          nsr: 100000 + Math.floor(Math.random() * 900000),
          hash: `sha256-man-${Date.now()}-3`,
          isManualAdjustment: true,
          adjustmentReason: params.reason || "Ajuste manual de escala/horário",
          adjustedBy: params.authorName || "ADM TOTAL",
          adjustedAt: new Date().toISOString(),
        },
        {
          id: `p-${params.date}-4`,
          type: "saida",
          timestamp: `${params.date}T${exitT}:00.000Z`,
          time: exitT,
          photoUrl,
          location: {
            latitude: -23.3421,
            longitude: -51.1872,
            accuracy: 5,
            address: storeId === "store-catuai" ? "Shopping Catuaí" : "Shopping Boulevard",
            inRange: true,
          },
          device: { type: "Totem Quiosque Tablet", ip: "192.168.1.100", userAgent: "Athleta/2.0" },
          nsr: 100000 + Math.floor(Math.random() * 900000),
          hash: `sha256-man-${Date.now()}-4`,
          isManualAdjustment: true,
          adjustmentReason: params.reason || "Ajuste manual de escala/horário",
          adjustedBy: params.authorName || "ADM TOTAL",
          adjustedAt: new Date().toISOString(),
        },
      ];

      this.recalculateRecordStatus(record);
    }

    this.saveDayRecords(records);

    // Registra movimentação no banco de horas se gerou crédito/débito
    if (record.balanceMinutes !== 0) {
      const summary = this.getEmployeeBankSummary(params.employeeId);
      const bankList = this.getBankOfHoursEntries();
      bankList.push({
        id: `bkh-adj-${Date.now()}`,
        employeeId: params.employeeId,
        storeId,
        date: params.date,
        type: record.balanceMinutes > 0 ? "credito" : "debito",
        minutes: Math.abs(record.balanceMinutes),
        balanceAfterMinutes: summary.currentBalanceMinutes + record.balanceMinutes,
        reason: params.reason || `Ajuste de horário trabalhado no dia ${params.date}`,
        author: params.authorName || "ADM TOTAL",
        isManualAdjustment: true,
        createdAt: new Date().toISOString(),
      });
      this.saveBankOfHoursEntries(bankList);
    }

    this.addAuditLog({
      actionType: "ajuste_ponto",
      title: `Horário de jornada alterado: ${emp?.name || "Colaborador"}`,
      details: `Data: ${params.date} | Entrada: ${params.entryTime || "prevista"} | Saída: ${params.exitTime || "prevista"} | Motivo: ${params.reason || "Ajuste de jornada"}`,
      employeeId: params.employeeId,
      employeeName: emp?.name,
      storeId,
      authorName: params.authorName || "ADM TOTAL (Proprietário)",
    });

    return record;
  }

  // --- LIMPEZA DE BASE DE DEMONSTRAÇÃO (SEM APAGAR CADASTROS REAIS) ---
  public static clearDemoDataOnly() {
    const records = this.getDayRecords().filter((r) => !r.isDemoData);
    const bank = this.getBankOfHoursEntries().filter((b) => !b.isDemoData);
    this.saveDayRecords(records);
    this.saveBankOfHoursEntries(bank);

    this.addAuditLog({
      actionType: "limpeza_base_demo",
      title: "Limpeza de Base de Demonstração Executada",
      details: "Todos os registros e marcações simuladas de Outubro/Novembro foram expurgados. Cadastros de colaboradores e lojas preservados.",
      authorName: "ADM TOTAL (Proprietário)",
    });
  }

  // Regenerar toda a base de demonstração
  public static regenerateDemoData() {
    const { records, bankEntries } = generateFullHistoricalDemoData();
    this.saveDayRecords(records);
    this.saveBankOfHoursEntries(bankEntries);

    this.addAuditLog({
      actionType: "limpeza_base_demo",
      title: "Base de Demonstração Regenerada",
      details: "Registros simulados de Outubro e Novembro (01 a 11/11/2026) reinseridos para testes.",
      authorName: "ADM TOTAL (Proprietário)",
    });
  }

  // --- SOLICITAÇÕES DE CORREÇÃO (COLABORADOR -> ADMIN) ---
  public static getCorrections(): CorrectionRequest[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CORRECTIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static saveCorrections(corrections: CorrectionRequest[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(corrections));
    this.notify();
  }

  public static requestCorrection(req: Omit<CorrectionRequest, "id" | "status" | "requestedAt">): CorrectionRequest {
    const list = this.getCorrections();
    const newReq: CorrectionRequest = {
      ...req,
      id: `corr-${Date.now()}`,
      status: "pendente",
      requestedAt: new Date().toISOString(),
    };
    list.unshift(newReq);
    this.saveCorrections(list);

    this.addAuditLog({
      actionType: "aprovacao_solicitacao",
      title: `Solicitação de Correção enviada por funcionário`,
      details: `Solicitação para ${req.punchType} às ${req.requestedTime} no dia ${req.date}. Motivo: "${req.reason}"`,
      employeeId: req.employeeId,
      storeId: req.storeId,
      authorName: "Colaborador",
    });

    return newReq;
  }

  public static reviewCorrection(params: {
    requestId: string;
    approved: boolean;
    reviewedBy: string;
    reviewNotes?: string;
  }): boolean {
    const list = this.getCorrections();
    const item = list.find((c) => c.id === params.requestId);
    if (!item) return false;

    item.status = params.approved ? "aprovada" : "rejeitada";
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = params.reviewedBy;
    item.reviewNotes = params.reviewNotes;
    this.saveCorrections(list);

    if (params.approved) {
      const records = this.getDayRecords();
      let record = records.find((r) => r.employeeId === item.employeeId && r.date === item.date);

      if (!record) {
        record = {
          id: `rec-${item.employeeId}-${item.date}`,
          employeeId: item.employeeId,
          storeId: item.storeId as "store-catuai" | "store-boulevard",
          date: item.date,
          dayOfWeek: new Date(item.date).getDay(),
          punches: [],
          scheduledEntry: "09:45",
          scheduledExit: "18:05",
          scheduledBreak: "13:30 - 14:30",
          isDayOff: false,
          isVacationOrLeave: false,
          status: "presente",
          totalWorkedMinutes: 0,
          expectedWorkedMinutes: 440,
          balanceMinutes: 0,
          delayMinutes: 0,
          extraMinutes: 0,
          earlyExitMinutes: 0,
        };
        records.push(record);
      }

      const nsr = 400000 + Math.floor(Math.random() * 500000);
      record.punches.push({
        id: `p-${Date.now()}`,
        type: item.punchType,
        timestamp: `${item.date}T${item.requestedTime}:00.000Z`,
        time: item.requestedTime,
        photoUrl: generateDemoSelfie("Aprovado", "Correção", "OK", item.requestedTime, item.storeId),
        location: {
          latitude: -23.3421,
          longitude: -51.1872,
          accuracy: 5,
          address: "Homologado pelo Administrador",
          inRange: true,
        },
        device: {
          type: "Computador da Loja",
          ip: "192.168.1.1",
          userAgent: "ADM TOTAL Painel",
        },
        nsr,
        hash: `sha256-corr-${nsr}`,
        isManualAdjustment: true,
        adjustmentReason: `Solicitação homologada: ${item.reason}`,
        adjustedBy: params.reviewedBy,
        adjustedAt: new Date().toISOString(),
      });

      this.recalculateRecordStatus(record);
      this.saveDayRecords(records);
    }

    this.addAuditLog({
      actionType: params.approved ? "aprovacao_solicitacao" : "rejeicao_solicitacao",
      title: `${params.approved ? "Aprovação" : "Rejeição"} de Correção de Ponto`,
      details: `Solicitação #${item.id} para ${item.date}. Parecer: ${params.reviewNotes || "Sem observações"}`,
      employeeId: item.employeeId,
      storeId: item.storeId,
      authorName: params.reviewedBy,
      newValue: params.approved ? "Aprovada e incorporada ao espelho" : "Rejeitada",
    });

    return true;
  }

  // --- SCHEDULES & OVERRIDES ---
  public static getSchedules(): ScheduleTemplate[] {
    if (typeof window === "undefined") return INITIAL_SCHEDULES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      const parsed = data ? JSON.parse(data) : INITIAL_SCHEDULES;
      return Array.isArray(parsed) ? parsed : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  }

  public static getScheduleOverrides(): DateScheduleOverride[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE_OVERRIDES);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static saveScheduleOverride(override: Omit<DateScheduleOverride, "id" | "updatedAt">): DateScheduleOverride {
    const list = this.getScheduleOverrides();
    const newOverride: DateScheduleOverride = {
      ...override,
      id: `ovr-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    list.push(newOverride);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE_OVERRIDES, JSON.stringify(list));
    this.notify();
    return newOverride;
  }

  // --- AUDIT LOGS ---
  public static getAuditLogs(): AuditLog[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static addAuditLog(entry: Omit<AuditLog, "id" | "timestamp">) {
    if (typeof window === "undefined") return;
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    this.notify();
  }

  // --- SETTINGS ---
  public static getSettings(): SystemSettings {
    if (typeof window === "undefined") return INITIAL_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      const parsed: SystemSettings = JSON.parse(data);
      if (parsed.kioskCodes?.catuai !== "1234" || parsed.kioskCodes?.boulevard !== "1234") {
        parsed.kioskCodes = { catuai: "1234", boulevard: "1234" };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public static updateSettings(settings: Partial<SystemSettings>) {
    if (typeof window === "undefined") return;
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
  }
}
