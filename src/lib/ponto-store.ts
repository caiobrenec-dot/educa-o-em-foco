/**
 * ATHLETA PONTO — Sistema de Gestão de Jornada, Ponto Eletrônico e Escalas
 * Store reativo, com persistência local e auditoria imutável (Portaria 671 MTE).
 */

export type RoleType =
  | "Gerente Geral"
  | "Gerente de Loja"
  | "Subgerente"
  | "Vendedor(a) Líder"
  | "Vendedor(a) Esportivo"
  | "Consultor(a) de Vendas"
  | "Operador(a) de Caixa"
  | "Estoquista"
  | "Auxiliar de Loja";

export type DayStatus =
  | "presente"
  | "ausente"
  | "atrasado"
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
  id: string;
  name: string;
  code: string;
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
  activeEmployeesCount?: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  matricula: string;
  cpf: string;
  email: string;
  phone: string;
  role: RoleType;
  storeId: string;
  admissionDate: string;
  contractHoursPerWeek: number; // e.g. 44
  status: "ativo" | "ferias" | "afastado" | "desligado";
  pin: string; // 4 a 6 dígitos para o Totem
  defaultScheduleId: string;
  avatar: string;
  hourlyRate: number;
  emergencyContact?: string;
  rg?: string;
  birthDate?: string;
}

export interface Punch {
  id: string;
  type: PunchType;
  timestamp: string; // ISO
  time: string; // "09:58"
  photoUrl: string; // base64 da câmera do quiosque/computador
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
    inRange: boolean;
  };
  device: {
    type: "Totem Quiosque Tablet" | "Computador da Loja" | "Dispositivo Mobile Autorizado";
    ip: string;
    userAgent: string;
  };
  nsr: number; // Número Sequencial de Registro
  hash: string; // Hash SHA-256 criptográfico
  isManualAdjustment?: boolean;
  originalTime?: string;
  adjustmentReason?: string;
  adjustedBy?: string;
  adjustedAt?: string;
}

export interface DayTimeRecord {
  id: string;
  employeeId: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  punches: Punch[];
  scheduledEntry: string; // "10:00"
  scheduledExit: string; // "18:20"
  scheduledBreak: string; // "13:00 - 14:00"
  isDayOff: boolean; // Folga / DSR
  isVacationOrLeave: boolean;
  leaveReason?: string;
  status: DayStatus;
  totalWorkedMinutes: number;
  expectedWorkedMinutes: number;
  balanceMinutes: number; // positivo = extra, negativo = débito/atraso
  delayMinutes: number;
  extraMinutes: number;
  notes?: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  storeId?: string; // se específico para loja ou geral
  description: string;
  workDays: number[]; // [1, 2, 3, 4, 5, 6] (seg a sab)
  entryTime: string; // "10:00"
  exitTime: string; // "18:20"
  breakDurationMinutes: number; // 60
  breakStartTime: string; // "14:00"
  breakEndTime: string; // "15:00"
  weeklyHours: number; // 44
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
    | "nova_loja"
    | "configuracao_alterada"
    | "registro_ponto_quiosque";
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
  toleranceMinutes: number; // Padrão CLT: 5 a 10 min
  minBreakMinutes: number; // 60 min para jornada > 6h
  minIntershiftHours: number; // 11h
  requireFacialPhoto: boolean; // true
  requireLocationCheck: boolean; // true
  autoLockKioskSeconds: number; // 4s
  companyName: string;
  companyCnpj: string;
  companyAddress: string;
}

// ==========================================
// SEED DATA INICIAL REALISTA ATHLETA
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
    activeEmployeesCount: 5,
    createdAt: "2024-01-15T08:00:00.000Z",
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
    activeEmployeesCount: 4,
    createdAt: "2024-03-01T08:00:00.000Z",
  },
  {
    id: "store-ecommerce",
    name: "Athleta Matriz & E-Commerce",
    code: "matriz",
    city: "Londrina",
    state: "PR",
    address: "Rua Mato Grosso, 890 - Centro",
    cnpj: "12.345.678/0003-52",
    phone: "(43) 3322-1935",
    managerName: "Diretoria Geral",
    gpsCoords: {
      lat: -23.3105,
      lng: -51.1628,
      allowedRadiusMeters: 300,
    },
    openingHours: "Seg a Sex: 08:00 às 18:00",
    activeEmployeesCount: 2,
    createdAt: "2023-01-10T08:00:00.000Z",
  },
];

export const INITIAL_SCHEDULES: ScheduleTemplate[] = [
  {
    id: "sch-shopping-abertura",
    name: "Shopping Abertura (6x1)",
    description: "Turno da manhã/tarde para lojas em shopping center",
    workDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
    entryTime: "09:45",
    exitTime: "18:05",
    breakDurationMinutes: 60,
    breakStartTime: "13:30",
    breakEndTime: "14:30",
    weeklyHours: 44,
  },
  {
    id: "sch-shopping-fechamento",
    name: "Shopping Fechamento (6x1)",
    description: "Turno da tarde/noite para lojas em shopping center",
    workDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
    entryTime: "13:40",
    exitTime: "22:00",
    breakDurationMinutes: 60,
    breakStartTime: "17:00",
    breakEndTime: "18:00",
    weeklyHours: 44,
  },
  {
    id: "sch-shopping-intermediario",
    name: "Shopping Intermediário (6x1)",
    description: "Turno central de pico para vendedores principais",
    workDays: [1, 2, 3, 4, 5, 6],
    entryTime: "11:30",
    exitTime: "19:50",
    breakDurationMinutes: 60,
    breakStartTime: "15:00",
    breakEndTime: "16:00",
    weeklyHours: 44,
  },
  {
    id: "sch-comercial-adm",
    name: "Administrativo & Logística (5x2)",
    description: "Segunda a sexta para estoque e gerência de operações",
    workDays: [1, 2, 3, 4, 5],
    entryTime: "08:00",
    exitTime: "17:48",
    breakDurationMinutes: 60,
    breakStartTime: "12:00",
    breakEndTime: "13:00",
    weeklyHours: 44,
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
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
    pin: "1010",
    defaultScheduleId: "sch-shopping-abertura",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
    pin: "2020",
    defaultScheduleId: "sch-shopping-intermediario",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
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
    pin: "3030",
    defaultScheduleId: "sch-shopping-fechamento",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    pin: "4040",
    defaultScheduleId: "sch-shopping-abertura",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 16.0,
  },
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
    pin: "5050",
    defaultScheduleId: "sch-shopping-abertura",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
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
    pin: "6060",
    defaultScheduleId: "sch-shopping-intermediario",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
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
    pin: "7070",
    defaultScheduleId: "sch-shopping-fechamento",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
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
    pin: "8080",
    defaultScheduleId: "sch-shopping-abertura",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 16.0,
  },
  {
    id: "emp-9",
    name: "Rafael Menezes Antunes",
    matricula: "ATH-0005",
    cpf: "198.742.665-20",
    email: "rafael.antunes@athleta.com.br",
    phone: "(43) 99890-1234",
    role: "Estoquista",
    storeId: "store-ecommerce",
    admissionDate: "2023-01-20",
    contractHoursPerWeek: 44,
    status: "ativo",
    pin: "9090",
    defaultScheduleId: "sch-comercial-adm",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    hourlyRate: 16.8,
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
};

// ==========================================
// FUNÇÕES AUXILIARES DE DATAS E CÁLCULO
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
  return `${sign}${h}h ${m}m`;
}

// Retorna as datas da semana atual (Segunda a Domingo)
export function getWeekDates(referenceDate: Date = new Date()): { date: string; dayOfWeek: number; dayName: string; dayNumber: number }[] {
  const curr = new Date(referenceDate);
  // Segunda-feira como início
  const day = curr.getDay(); // 0=Dom, 1=Seg, ... 6=Sab
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diff));

  const daysNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const week = [];

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    const dateStr = nextDate.toISOString().split("T")[0];
    const jsDayOfWeek = nextDate.getDay(); // 0 a 6
    week.push({
      date: dateStr,
      dayOfWeek: jsDayOfWeek,
      dayName: daysNames[i],
      dayNumber: nextDate.getDate(),
    });
  }

  return week;
}

// Gera foto facial de fallback padrão em SVG DataURL estilizada com crachá
export function generateFaceAvatar(name: string, role: string, initials: string, time: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#005C30" />
        <stop offset="100%" stop-color="#00361C" />
      </linearGradient>
    </defs>
    <rect width="320" height="320" fill="url(#bg)" rx="16" />
    <circle cx="160" cy="115" r="50" fill="#FFC72C" fill-opacity="0.9" />
    <path d="M90 240 C90 190, 230 190, 230 240 Z" fill="#FFC72C" fill-opacity="0.9" />
    <text x="160" y="125" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#00361C" text-anchor="middle">${initials}</text>
    <rect x="20" y="260" width="280" height="42" rx="8" fill="#000000" fill-opacity="0.6" />
    <text x="160" y="278" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${name.split(' ').slice(0, 2).join(' ')}</text>
    <text x="160" y="294" font-family="Arial, sans-serif" font-size="10" fill="#FFC72C" text-anchor="middle">FACIAL AO VIVO: ${time}</text>
    <circle cx="285" cy="35" r="8" fill="#10B981" />
    <text x="270" y="38" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#10B981" text-anchor="end">AO VIVO</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Criação de registros de demonstração ricos
export function generateSeedDayRecords(): DayTimeRecord[] {
  const week = getWeekDates(new Date());
  const records: DayTimeRecord[] = [];
  let nsrCounter = 100450;

  INITIAL_EMPLOYEES.forEach((emp) => {
    week.forEach((wDay, idx) => {
      const isSunday = wDay.dayOfWeek === 0;
      const isDayOff = isSunday || (emp.id === "emp-3" && wDay.dayOfWeek === 2) || (emp.id === "emp-6" && wDay.dayOfWeek === 3);

      const recordId = `rec-${emp.id}-${wDay.date}`;
      const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

      let scheduledEntry = "10:00";
      let scheduledExit = "18:20";
      let scheduledBreak = "13:30 - 14:30";

      if (emp.role.includes("Fechamento") || emp.id === "emp-3" || emp.id === "emp-7") {
        scheduledEntry = "13:40";
        scheduledExit = "22:00";
        scheduledBreak = "17:00 - 18:00";
      } else if (emp.role.includes("Líder") || emp.role.includes("Consultor") || emp.id === "emp-2" || emp.id === "emp-6") {
        scheduledEntry = "11:30";
        scheduledExit = "19:50";
        scheduledBreak = "15:00 - 16:00";
      }

      if (isDayOff) {
        records.push({
          id: recordId,
          employeeId: emp.id,
          storeId: emp.storeId,
          date: wDay.date,
          dayOfWeek: wDay.dayOfWeek,
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
        });
        return;
      }

      // Variações realistas nos dias de trabalho:
      // Dia 0 (Segunda): Presente no horário certinho
      // Dia 1 (Terça): Atrasado 18 min
      // Dia 2 (Quarta): Hora Extra (+45 min)
      // Dia 3 (Quinta): Registro incompleto (esqueceu saída) para Beatriz emp-4
      // Dia 4 (Sexta): Presente
      // Dia 5 (Sábado): Presente
      const dayIndex = idx;
      let status: DayStatus = "presente";
      let punches: Punch[] = [];
      let delayMinutes = 0;
      let extraMinutes = 0;

      let actualEntry = scheduledEntry;
      let actualExit = scheduledExit;
      const [breakStart, breakEnd] = scheduledBreak.split(" - ");

      if (dayIndex === 1 && (emp.id === "emp-2" || emp.id === "emp-7")) {
        // Atrasado
        status = "atrasado";
        const entryM = timeToMinutes(scheduledEntry) + 18;
        actualEntry = minutesToTime(entryM);
        delayMinutes = 18;
      } else if (dayIndex === 2 && (emp.id === "emp-1" || emp.id === "emp-5")) {
        // Hora extra
        status = "hora_extra";
        const exitM = timeToMinutes(scheduledExit) + 50;
        actualExit = minutesToTime(exitM);
        extraMinutes = 50;
      } else if (dayIndex === 3 && emp.id === "emp-4") {
        // Incompleto (sem saída)
        status = "incompleto";
      } else if (dayIndex === 4 && emp.id === "emp-8") {
        // Falta / Ausente
        status = "ausente";
      }

      if (status !== "ausente") {
        nsrCounter++;
        punches.push({
          id: `p-${nsrCounter}`,
          type: "entrada",
          timestamp: `${wDay.date}T${actualEntry}:00.000Z`,
          time: actualEntry,
          photoUrl: generateFaceAvatar(emp.name, emp.role, initials, actualEntry),
          location: {
            latitude: -23.3421 + (Math.random() - 0.5) * 0.0005,
            longitude: -51.1872 + (Math.random() - 0.5) * 0.0005,
            accuracy: 8,
            address: "Shopping Catuaí - Loja Athleta, Londrina - PR",
            inRange: true,
          },
          device: {
            type: "Totem Quiosque Tablet",
            ip: "192.168.1.105",
            userAgent: "Mozilla/5.0 (iPad; CPU OS 17_4) AthletaKiosk/2.4",
          },
          nsr: nsrCounter,
          hash: `sha256-athleta-${nsrCounter}-8f7a9e`,
        });

        nsrCounter++;
        punches.push({
          id: `p-${nsrCounter}`,
          type: "intervalo_saida",
          timestamp: `${wDay.date}T${breakStart}:00.000Z`,
          time: breakStart,
          photoUrl: generateFaceAvatar(emp.name, emp.role, initials, breakStart),
          location: {
            latitude: -23.3421,
            longitude: -51.1872,
            accuracy: 6,
            address: "Shopping Catuaí - Loja Athleta, Londrina - PR",
            inRange: true,
          },
          device: {
            type: "Totem Quiosque Tablet",
            ip: "192.168.1.105",
            userAgent: "Mozilla/5.0 (iPad; CPU OS 17_4) AthletaKiosk/2.4",
          },
          nsr: nsrCounter,
          hash: `sha256-athleta-${nsrCounter}-3b4c1d`,
        });

        nsrCounter++;
        punches.push({
          id: `p-${nsrCounter}`,
          type: "intervalo_retorno",
          timestamp: `${wDay.date}T${breakEnd}:00.000Z`,
          time: breakEnd,
          photoUrl: generateFaceAvatar(emp.name, emp.role, initials, breakEnd),
          location: {
            latitude: -23.3421,
            longitude: -51.1872,
            accuracy: 7,
            address: "Shopping Catuaí - Loja Athleta, Londrina - PR",
            inRange: true,
          },
          device: {
            type: "Totem Quiosque Tablet",
            ip: "192.168.1.105",
            userAgent: "Mozilla/5.0 (iPad; CPU OS 17_4) AthletaKiosk/2.4",
          },
          nsr: nsrCounter,
          hash: `sha256-athleta-${nsrCounter}-5f8e2a`,
        });

        if (status !== "incompleto") {
          nsrCounter++;
          punches.push({
            id: `p-${nsrCounter}`,
            type: "saida",
            timestamp: `${wDay.date}T${actualExit}:00.000Z`,
            time: actualExit,
            photoUrl: generateFaceAvatar(emp.name, emp.role, initials, actualExit),
            location: {
              latitude: -23.3421,
              longitude: -51.1872,
              accuracy: 9,
              address: "Shopping Catuaí - Loja Athleta, Londrina - PR",
              inRange: true,
            },
            device: {
              type: "Totem Quiosque Tablet",
              ip: "192.168.1.105",
              userAgent: "Mozilla/5.0 (iPad; CPU OS 17_4) AthletaKiosk/2.4",
            },
            nsr: nsrCounter,
            hash: `sha256-athleta-${nsrCounter}-9a1b2c`,
          });
        }
      }

      const expectedWorkedMinutes = timeToMinutes(scheduledExit) - timeToMinutes(scheduledEntry) - 60;
      let totalWorkedMinutes = 0;

      if (punches.length === 4) {
        const morning = timeToMinutes(punches[1].time) - timeToMinutes(punches[0].time);
        const afternoon = timeToMinutes(punches[3].time) - timeToMinutes(punches[2].time);
        totalWorkedMinutes = Math.max(0, morning + afternoon);
      } else if (punches.length >= 2) {
        totalWorkedMinutes = timeToMinutes(punches[1].time) - timeToMinutes(punches[0].time);
      }

      const balanceMinutes = totalWorkedMinutes - expectedWorkedMinutes;

      records.push({
        id: recordId,
        employeeId: emp.id,
        storeId: emp.storeId,
        date: wDay.date,
        dayOfWeek: wDay.dayOfWeek,
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
      });
    });
  });

  return records;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-01",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actionType: "alteracao_escala",
    title: "Atualização de escala de sábado",
    details: "Turno da funcionária Mariana Santos Rocha alterado de Abertura para Intermediário no Shopping Catuaí.",
    employeeId: "emp-2",
    employeeName: "Mariana Santos Rocha",
    storeId: "store-catuai",
    authorName: "Carlos Eduardo Silva (Gerente)",
    previousValue: "10:00 - 18:20",
    newValue: "11:30 - 19:50",
  },
  {
    id: "aud-02",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    actionType: "aprovacao_solicitacao",
    title: "Aprovação de ajuste de saída",
    details: "Solicitação #CORR-4012 aprovada. Horário original não registrado por instabilidade na rede do shopping.",
    employeeId: "emp-4",
    employeeName: "Beatriz Fernandes Lima",
    storeId: "store-catuai",
    authorName: "Carlos Eduardo Silva (Gerente)",
    previousValue: "Sem registro de saída",
    newValue: "18:20 (Aprovado com justificativa)",
  },
  {
    id: "aud-03",
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    actionType: "configuracao_alterada",
    title: "Parametrização de Geofencing e Câmera",
    details: "Ativada obrigatoriedade de captura de foto ao vivo no Totem Quiosque e raio de 250m GPS para as lojas Athleta.",
    authorName: "Proprietário / Admin Geral",
    previousValue: "Câmera Opcional",
    newValue: "Câmera Obrigatória + Foto Ao Vivo Sem Upload",
  },
];

export const INITIAL_CORRECTIONS: CorrectionRequest[] = [
  {
    id: "corr-1",
    employeeId: "emp-4",
    storeId: "store-catuai",
    date: new Date().toISOString().split("T")[0],
    punchType: "saida",
    requestedTime: "18:20",
    reason: "Atendi cliente no fechamento da venda e o tablet da loja estava reiniciando atualização.",
    status: "pendente",
    requestedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "corr-2",
    employeeId: "emp-7",
    storeId: "store-boulevard",
    date: new Date(Date.now() - 3600000 * 24).toISOString().split("T")[0],
    punchType: "intervalo_retorno",
    requestedTime: "18:00",
    reason: "Retornei pontualmente mas houve fila momentânea no tablet da loja Boulevard.",
    status: "pendente",
    requestedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

// ==========================================
// STORE STORAGE ENGINE
// ==========================================

const STORAGE_KEYS = {
  STORES: "athleta_ponto_stores_v1",
  EMPLOYEES: "athleta_ponto_employees_v1",
  SCHEDULES: "athleta_ponto_schedules_v1",
  DAY_RECORDS: "athleta_ponto_records_v1",
  AUDIT_LOGS: "athleta_ponto_audit_v1",
  CORRECTIONS: "athleta_ponto_corrections_v1",
  SETTINGS: "athleta_ponto_settings_v1",
  SCHEDULE_OVERRIDES: "athleta_ponto_overrides_v1",
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
      return JSON.parse(data);
    } catch {
      return INITIAL_STORES;
    }
  }

  public static saveStores(stores: Store[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    this.notify();
  }

  public static addStore(newStore: Omit<Store, "id" | "createdAt">): Store {
    const stores = this.getStores();
    const store: Store = {
      ...newStore,
      id: `store-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    stores.push(store);
    this.saveStores(stores);

    this.addAuditLog({
      actionType: "nova_loja",
      title: `Nova unidade cadastrada: ${store.name}`,
      details: `Loja ${store.name} em ${store.city} adicionada ao painel da rede Athleta.`,
      storeId: store.id,
      authorName: "Proprietário / Admin",
      newValue: store.name,
    });

    return store;
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
      return JSON.parse(data);
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }

  public static saveEmployees(employees: Employee[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.notify();
  }

  public static addEmployee(empData: Omit<Employee, "id">): Employee {
    const employees = this.getEmployees();
    const emp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
    };
    employees.push(emp);
    this.saveEmployees(employees);

    this.addAuditLog({
      actionType: "novo_funcionario",
      title: `Novo colaborador cadastrado: ${emp.name}`,
      details: `Cargo: ${emp.role} | Loja: ${emp.storeId} | Carga: ${emp.contractHoursPerWeek}h | Matrícula: ${emp.matricula}`,
      employeeId: emp.id,
      employeeName: emp.name,
      storeId: emp.storeId,
      authorName: "Proprietário / Admin",
      newValue: emp.name,
    });

    return emp;
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
      title: `Dados cadastrais atualizados: ${updated.name}`,
      details: `Atualizações realizadas no perfil do funcionário.`,
      employeeId: updated.id,
      employeeName: updated.name,
      storeId: updated.storeId,
      authorName: "Proprietário / Admin",
      previousValue: JSON.stringify(previous),
      newValue: JSON.stringify(updated),
    });

    return updated;
  }

  // --- DAY RECORDS & PUNCHES ---
  public static getDayRecords(): DayTimeRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
      if (!data) {
        const seeded = generateSeedDayRecords();
        localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveDayRecords(records: DayTimeRecord[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(records));
    this.notify();
  }

  // REGISTRAR PONTO VIA QUIOSQUE / COMPUTADOR DA LOJA
  public static recordPunch(params: {
    employeeId: string;
    storeId: string;
    punchType: PunchType;
    photoUrl: string;
    location?: { latitude: number; longitude: number; accuracy: number; address: string; inRange: boolean };
    deviceType?: "Totem Quiosque Tablet" | "Computador da Loja" | "Dispositivo Mobile Autorizado";
  }): { success: boolean; punch: Punch; record: DayTimeRecord } {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const records = this.getDayRecords();
    const employees = this.getEmployees();
    const employee = employees.find((e) => e.id === params.employeeId);
    const employeeName = employee ? employee.name : "Funcionário";

    // Busca ou cria o registro do dia
    let dayRecord = records.find((r) => r.employeeId === params.employeeId && r.date === dateStr);

    if (!dayRecord) {
      dayRecord = {
        id: `rec-${params.employeeId}-${dateStr}`,
        employeeId: params.employeeId,
        storeId: params.storeId,
        date: dateStr,
        dayOfWeek: now.getDay(),
        punches: [],
        scheduledEntry: "10:00",
        scheduledExit: "18:20",
        scheduledBreak: "13:30 - 14:30",
        isDayOff: false,
        isVacationOrLeave: false,
        status: "presente",
        totalWorkedMinutes: 0,
        expectedWorkedMinutes: 440,
        balanceMinutes: 0,
        delayMinutes: 0,
        extraMinutes: 0,
      };
      records.push(dayRecord);
    }

    const nsr = 100000 + Math.floor(Math.random() * 900000);
    const hash = `sha256-${Date.now()}-${params.employeeId.slice(-4)}-${Math.random().toString(36).substring(2, 8)}`;

    const newPunch: Punch = {
      id: `p-${Date.now()}`,
      type: params.punchType,
      timestamp: now.toISOString(),
      time: timeStr,
      photoUrl: params.photoUrl,
      location: params.location || {
        latitude: -23.3421,
        longitude: -51.1872,
        accuracy: 5,
        address: "Shopping Catuaí - Unidade Athleta",
        inRange: true,
      },
      device: {
        type: params.deviceType || "Totem Quiosque Tablet",
        ip: "192.168.1.100",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Athleta Ponto Kiosk/1.0",
      },
      nsr,
      hash,
    };

    dayRecord.punches.push(newPunch);

    // Recomputar status e horas
    this.recalculateRecordStatus(dayRecord);

    this.saveDayRecords(records);

    // Auditoria oficial
    const typeLabel = {
      entrada: "Entrada",
      intervalo_saida: "Saída para Intervalo",
      intervalo_retorno: "Retorno do Intervalo",
      saida: "Saída do Expediente",
    }[params.punchType];

    this.addAuditLog({
      actionType: "registro_ponto_quiosque",
      title: `Marcação realizada: ${typeLabel} - ${employeeName}`,
      details: `Horário oficial: ${timeStr} | Loja: ${params.storeId} | Dispositivo: ${newPunch.device.type} | NSR: ${nsr} | Foto capturada via Câmera ao vivo`,
      employeeId: params.employeeId,
      employeeName,
      storeId: params.storeId,
      authorName: "Sistema Quiosque Athleta",
      newValue: `${typeLabel} às ${timeStr}`,
    });

    return { success: true, punch: newPunch, record: dayRecord };
  }

  // AJUSTAR MARCAÇÃO COM AUDITORIA TOTAL (NUNCA APAGA SILENCIOSAMENTE)
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

    const employees = this.getEmployees();
    const emp = employees.find((e) => e.id === record.employeeId);
    const empName = emp ? emp.name : "Funcionário";

    const oldTime = punch.time;
    punch.originalTime = punch.originalTime || oldTime;
    punch.time = params.newTime;
    punch.isManualAdjustment = true;
    punch.adjustmentReason = params.reason;
    punch.adjustedBy = params.authorName;
    punch.adjustedAt = new Date().toISOString();

    this.recalculateRecordStatus(record);
    this.saveDayRecords(records);

    this.addAuditLog({
      actionType: "ajuste_ponto",
      title: `Ajuste manual de marcação: ${empName}`,
      details: `Horário original: ${oldTime} alterado para ${params.newTime}. Justificativa: "${params.reason}". Registros originais preservados para auditoria fiscal (Portaria 671 MTE).`,
      employeeId: record.employeeId,
      employeeName: empName,
      storeId: record.storeId,
      authorName: params.authorName,
      previousValue: `${punch.type} às ${oldTime}`,
      newValue: `${punch.type} às ${params.newTime} (Aprovado e Auditado)`,
    });

    return true;
  }

  // Recalcular métricas de um dia
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

    // Verificar atraso na primeira entrada
    const firstEntry = punches.find((p) => p.type === "entrada");
    if (firstEntry) {
      const actualEntryM = timeToMinutes(firstEntry.time);
      if (actualEntryM > expectedEntryM + 5) {
        record.delayMinutes = actualEntryM - expectedEntryM;
      } else {
        record.delayMinutes = 0;
      }
    }

    // Calcular horas trabalhadas
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

    if (punches.length % 2 !== 0 && punches.length < 4) {
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

  // --- SOLICITAÇÕES DE CORREÇÃO ---
  public static getCorrections(): CorrectionRequest[] {
    if (typeof window === "undefined") return INITIAL_CORRECTIONS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CORRECTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(INITIAL_CORRECTIONS));
        return INITIAL_CORRECTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CORRECTIONS;
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

    // Se aprovada, aplicar no registro do ponto
    if (params.approved) {
      const records = this.getDayRecords();
      let record = records.find((r) => r.employeeId === item.employeeId && r.date === item.date);

      if (!record) {
        record = {
          id: `rec-${item.employeeId}-${item.date}`,
          employeeId: item.employeeId,
          storeId: item.storeId,
          date: item.date,
          dayOfWeek: new Date(item.date).getDay(),
          punches: [],
          scheduledEntry: "10:00",
          scheduledExit: "18:20",
          scheduledBreak: "13:30 - 14:30",
          isDayOff: false,
          isVacationOrLeave: false,
          status: "presente",
          totalWorkedMinutes: 0,
          expectedWorkedMinutes: 440,
          balanceMinutes: 0,
          delayMinutes: 0,
          extraMinutes: 0,
        };
        records.push(record);
      }

      // Adiciona o punch aprovado
      const nsr = 100000 + Math.floor(Math.random() * 900000);
      record.punches.push({
        id: `p-${Date.now()}`,
        type: item.punchType,
        timestamp: `${item.date}T${item.requestedTime}:00.000Z`,
        time: item.requestedTime,
        photoUrl: generateFaceAvatar("Correção", "Aprovada", "OK", item.requestedTime),
        location: {
          latitude: -23.3421,
          longitude: -51.1872,
          accuracy: 10,
          address: "Correção Administrativa Homologada",
          inRange: true,
        },
        device: {
          type: "Computador da Loja",
          ip: "192.168.1.1",
          userAgent: "Painel Administrativo Proprietários",
        },
        nsr,
        hash: `sha256-corr-${nsr}`,
        isManualAdjustment: true,
        adjustmentReason: `Solicitação aprovada: ${item.reason}`,
        adjustedBy: params.reviewedBy,
        adjustedAt: new Date().toISOString(),
      });

      this.recalculateRecordStatus(record);
      this.saveDayRecords(records);
    }

    this.addAuditLog({
      actionType: params.approved ? "aprovacao_solicitacao" : "rejeicao_solicitacao",
      title: `${params.approved ? "Aprovação" : "Rejeição"} de Correção de Ponto`,
      details: `Solicitação #${params.requestId} para o funcionário ${item.employeeId} na data ${item.date}. Parecer: ${params.reviewNotes || "Sem observações adicionais"}.`,
      employeeId: item.employeeId,
      storeId: item.storeId,
      authorName: params.reviewedBy,
      newValue: params.approved ? "Aprovada e integrada ao espelho" : "Rejeitada",
    });

    return true;
  }

  // --- ESCALAS & OVERRIDES ---
  public static getSchedules(): ScheduleTemplate[] {
    if (typeof window === "undefined") return INITIAL_SCHEDULES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
        return INITIAL_SCHEDULES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SCHEDULES;
    }
  }

  public static saveSchedules(schedules: ScheduleTemplate[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    this.notify();
  }

  public static getScheduleOverrides(): DateScheduleOverride[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE_OVERRIDES);
      return data ? JSON.parse(data) : [];
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

    // Atualiza o registro daquele dia se já existir
    const records = this.getDayRecords();
    const dayRecord = records.find((r) => r.employeeId === override.employeeId && r.date === override.date);
    if (dayRecord) {
      dayRecord.isDayOff = override.isDayOff;
      if (!override.isDayOff) {
        dayRecord.scheduledEntry = override.entryTime;
        dayRecord.scheduledExit = override.exitTime;
        dayRecord.scheduledBreak = `${override.breakStartTime} - ${override.breakEndTime}`;
      }
      this.recalculateRecordStatus(dayRecord);
      this.saveDayRecords(records);
    }

    this.addAuditLog({
      actionType: "escala_data_especifica",
      title: `Escala customizada em data específica`,
      details: `Escala da data ${override.date} alterada para o colaborador ${override.employeeId}. Motivo: ${override.reason}`,
      employeeId: override.employeeId,
      authorName: override.updatedBy,
      newValue: override.isDayOff ? "Folga" : `${override.entryTime} às ${override.exitTime}`,
    });

    this.notify();
    return newOverride;
  }

  // --- AUDIT LOGS ---
  public static getAuditLogs(): AuditLog[] {
    if (typeof window === "undefined") return INITIAL_AUDIT_LOGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
        return INITIAL_AUDIT_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_AUDIT_LOGS;
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
      return JSON.parse(data);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public static updateSettings(settings: Partial<SystemSettings>) {
    if (typeof window === "undefined") return;
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

    this.addAuditLog({
      actionType: "configuracao_alterada",
      title: "Configurações gerais do sistema atualizadas",
      details: "Parâmetros de tolerância, intervalo e quiosque ajustados pelo proprietário.",
      authorName: "Proprietário / Admin",
    });

    this.notify();
  }

  // Resetar dados para demonstração limpa
  public static resetDemoData() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(generateSeedDayRecords()));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(INITIAL_CORRECTIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE_OVERRIDES);
    this.notify();
  }
}
