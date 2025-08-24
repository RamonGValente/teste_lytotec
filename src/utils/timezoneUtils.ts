
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte uma data para o timezone brasileiro e normaliza para meio-dia
 * para evitar problemas de fuso horário
 */
export function normalizeDateToBrazilianNoon(date?: Date | string | null): Date {
  if (!date) {
    // Se não fornecida, usa a data atual no timezone brasileiro
    const now = new Date();
    const brazilianNow = toZonedTime(now, BRAZIL_TIMEZONE);
    return new Date(
      brazilianNow.getFullYear(),
      brazilianNow.getMonth(),
      brazilianNow.getDate(),
      12, 0, 0
    );
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error("Data inválida fornecida para normalização:", date);
    const now = new Date();
    const brazilianNow = toZonedTime(now, BRAZIL_TIMEZONE);
    return new Date(
      brazilianNow.getFullYear(),
      brazilianNow.getMonth(),
      brazilianNow.getDate(),
      12, 0, 0
    );
  }
  
  // Converter para timezone brasileiro
  const brazilianDate = toZonedTime(dateObj, BRAZIL_TIMEZONE);
  
  // Normalizar para meio-dia brasileiro
  return new Date(
    brazilianDate.getFullYear(),
    brazilianDate.getMonth(),
    brazilianDate.getDate(),
    12, 0, 0
  );
}

/**
 * Obtém a data atual no timezone brasileiro normalizada para meio-dia
 */
export function getCurrentBrazilianDate(): string {
  const now = new Date();
  const brazilianDate = toZonedTime(now, BRAZIL_TIMEZONE);
  const normalizedDate = new Date(
    brazilianDate.getFullYear(),
    brazilianDate.getMonth(),
    brazilianDate.getDate(),
    12, 0, 0
  );
  
  const year = normalizedDate.getFullYear();
  const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
  const day = String(normalizedDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data normalizada para string no formato YYYY-MM-DD
 * mantendo o timezone brasileiro
 */
export function formatBrazilianDateToString(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return getCurrentBrazilianDate();
  }
  
  const brazilianDate = toZonedTime(date, BRAZIL_TIMEZONE);
  const year = brazilianDate.getFullYear();
  const month = String(brazilianDate.getMonth() + 1).padStart(2, '0');
  const day = String(brazilianDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string de data (YYYY-MM-DD) para Date no timezone brasileiro
 */
export function parseBrazilianDate(dateString: string): Date {
  if (!dateString) {
    return normalizeDateToBrazilianNoon();
  }
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    // Criar data no timezone brasileiro
    const brazilianDate = new Date(year, month - 1, day, 12, 0, 0);
    return brazilianDate;
  } catch (error) {
    console.error("Erro ao fazer parse da data brasileira:", error);
    return normalizeDateToBrazilianNoon();
  }
}

/**
 * Formata uma data para exibição no padrão brasileiro (DD/MM/AAAA)
 */
export function formatBrazilianDateForDisplay(dateString?: string): string {
  if (!dateString) return "-";
  
  try {
    const date = parseBrazilianDate(dateString);
    const brazilianDate = toZonedTime(date, BRAZIL_TIMEZONE);
    return format(brazilianDate, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data para exibição:", error);
    return dateString;
  }
}
