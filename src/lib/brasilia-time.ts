/**
 * ATHLETA PONTO — SERVIÇO DE SINCRONIZAÇÃO DE HORÁRIO OFICIAL DE BRASÍLIA
 * Fuso Horário Obrigatório: America/Sao_Paulo (UTC-03:00).
 * 
 * Garante que todas as marcações, relatórios e auditorias sigam o Horário Oficial de Brasília,
 * independente da configuração do relógio do dispositivo/tablet.
 */

import { useState, useEffect } from "react";

// Desvio em milissegundos em relação ao servidor de hora oficial
let serverOffsetMs = 0;
let isSynchronized = false;

// Sincroniza o relógio com o servidor de aplicação
export async function syncWithOfficialBrasiliaTime(): Promise<number> {
  try {
    const startTime = Date.now();
    // Faz uma requisição HEAD simples ao próprio host para ler o header 'Date' do servidor
    const response = await fetch(window.location.href, {
      method: "HEAD",
      cache: "no-store",
    });
    const serverDateHeader = response.headers.get("Date");
    if (serverDateHeader) {
      const serverTime = new Date(serverDateHeader).getTime();
      const latency = Math.round((Date.now() - startTime) / 2);
      serverOffsetMs = (serverTime + latency) - Date.now();
      isSynchronized = true;
    }
  } catch (err) {
    // Se estiver offline ou falhar requisição, mantém offset zero
    console.warn("Sincronização de relógio de rede indisponível, usando fuso America/Sao_Paulo local:", err);
  }
  return serverOffsetMs;
}

// Inicializa a sincronização em ambiente de navegador
if (typeof window !== "undefined") {
  syncWithOfficialBrasiliaTime();
}

/**
 * Retorna o objeto Date ajustado para o instante real calibrado com o servidor
 */
export function getBrasiliaDate(): Date {
  return new Date(Date.now() + serverOffsetMs);
}

/**
 * Retorna a data no padrão YYYY-MM-DD no fuso de Brasília (America/Sao_Paulo)
 */
export function getBrasiliaDateStr(refDate: Date = getBrasiliaDate()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(refDate);
  } catch {
    const year = refDate.getFullYear();
    const month = String(refDate.getMonth() + 1).padStart(2, "0");
    const day = String(refDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Retorna o horário no padrão HH:mm no fuso de Brasília (America/Sao_Paulo)
 */
export function getBrasiliaTimeStr(refDate: Date = getBrasiliaDate()): string {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(refDate);
  } catch {
    const hours = String(refDate.getHours()).padStart(2, "0");
    const minutes = String(refDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}

/**
 * Retorna o horário completo com segundos no padrão HH:mm:ss no fuso de Brasília
 */
export function getBrasiliaFullTimeStr(refDate: Date = getBrasiliaDate()): string {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return formatter.format(refDate);
  } catch {
    const hours = String(refDate.getHours()).padStart(2, "0");
    const minutes = String(refDate.getMinutes()).padStart(2, "0");
    const seconds = String(refDate.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
}

/**
 * Formata uma data por extenso no Horário Oficial de Brasília
 * Ex: "Quinta-feira, 12 de Novembro de 2026"
 */
export function formatBrasiliaDateLong(refDate: Date = getBrasiliaDate()): string {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formatted = formatter.format(refDate);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return refDate.toLocaleDateString("pt-BR");
  }
}

/**
 * Hook do React para o relógio em tempo real de Brasília com atualização a cada segundo
 */
export function useBrasiliaClock() {
  const [clockDate, setClockDate] = useState<Date>(() => getBrasiliaDate());

  useEffect(() => {
    // Sincroniza periodicamente a cada 10 minutos
    const syncTimer = setInterval(() => {
      syncWithOfficialBrasiliaTime();
    }, 10 * 60 * 1000);

    const timer = setInterval(() => {
      setClockDate(getBrasiliaDate());
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
    };
  }, []);

  return {
    date: clockDate,
    timeStr: getBrasiliaTimeStr(clockDate),
    fullTimeStr: getBrasiliaFullTimeStr(clockDate),
    dateStr: getBrasiliaDateStr(clockDate),
    longDateStr: formatBrasiliaDateLong(clockDate),
    isServerSynced: isSynchronized,
  };
}
