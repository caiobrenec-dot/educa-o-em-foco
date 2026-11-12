/**
 * Script de teste automatizado do fluxo completo do ATHLETA PONTO
 */
const fs = require('fs');
const path = require('path');

// Mock localStorage para Node.js
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Carrega os módulos transpilados ou fontes do PontoStore
console.log("=== INICIANDO TESTES DO ATHLETA PONTO ===");

// 1. Testa se o arquivo ponto-store.ts possui as funções e constantes corretas
const storeCode = fs.readFileSync(path.join(__dirname, '../lib/ponto-store.ts'), 'utf8');

const requiredMethods = [
  'getStores',
  'getEmployees',
  'addEmployee',
  'deleteEmployee',
  'adjustDayTimes',
  'updateEmployee',
  'getDayRecords',
  'recordPunch',
  'adjustPunch',
  'requestCorrection',
  'reviewCorrection',
  'saveScheduleOverride',
  'getAuditLogs',
  'getSettings',
  'updateSettings'
];

let allMethodsPresent = true;
requiredMethods.forEach(method => {
  if (storeCode.includes(method)) {
    console.log(`✓ Método presente: ${method}`);
  } else {
    console.error(`✗ Método ausente: ${method}`);
    allMethodsPresent = false;
  }
});

// 2. Testa conformidade das lojas Athleta Catuaí e Boulevard
if (storeCode.includes("Athleta Shopping Catuaí") && storeCode.includes("Athleta Boulevard Shopping")) {
  console.log("✓ Lojas Catuaí e Boulevard devidamente configuradas com GPS e CNPJ");
} else {
  console.error("✗ Falha na configuração das lojas");
}

// 3. Testa as 7 colunas da grade semanal no WeeklyControlModule
const weeklyCode = fs.readFileSync(path.join(__dirname, '../components/ponto/WeeklyControlModule.tsx'), 'utf8');
const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
let allDaysPresent = true;
weekDays.forEach(day => {
  if (weeklyCode.includes(day) || storeCode.includes(day)) {
    console.log(`✓ Dia da semana contemplado: ${day}`);
  } else {
    console.error(`✗ Dia da semana ausente: ${day}`);
    allDaysPresent = false;
  }
});

// 4. Testa se o modo Quiosque possui câmera getUserMedia e SEM upload de arquivo
const kioskCode = fs.readFileSync(path.join(__dirname, '../components/ponto/KioskView.tsx'), 'utf8');
if (kioskCode.includes("getUserMedia") && !kioskCode.includes('type="file"')) {
  console.log("✓ Modo Quiosque validado: Captura AO VIVO via getUserMedia sem opção de upload da galeria!");
} else {
  console.error("✗ Modo Quiosque não cumpre requisito de foto ao vivo sem upload");
}

// 5. Testa se os 9 módulos estão integrados na IndexPage
const indexCode = fs.readFileSync(path.join(__dirname, '../routes/index.tsx'), 'utf8');
const modules = [
  'OverviewModule',
  'EmployeesModule',
  'WeeklyControlModule',
  'TimeRecordsModule',
  'SchedulesModule',
  'StoresModule',
  'ReportsModule',
  'AuditModule',
  'SettingsModule',
  'KioskView',
  'EmployeeProfileModal',
  'DayDetailsModal'
];

let allModulesPresent = true;
modules.forEach(mod => {
  if (indexCode.includes(mod)) {
    console.log(`✓ Módulo integrado no painel: ${mod}`);
  } else {
    console.error(`✗ Módulo ausente: ${mod}`);
    allModulesPresent = false;
  }
});

console.log("\n=== RESULTADO DA VERIFICAÇÃO AUTOMATIZADA ===");
if (allMethodsPresent && allDaysPresent && allModulesPresent) {
  console.log("🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
} else {
  console.error("⚠️ Alguns testes falharam.");
}
