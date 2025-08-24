
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  normalizeDateToBrazilianNoon, 
  getCurrentBrazilianDate, 
  formatBrazilianDateToString,
  formatBrazilianDateForDisplay 
} from "@/utils/timezoneUtils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string): string {
  return formatBrazilianDateForDisplay(dateString);
}

/**
 * Normaliza uma data para meio-dia no timezone brasileiro
 * ATUALIZADA: Agora usa timezone brasileiro consistente
 */
export function normalizeDateToNoon(date?: Date | string | null): Date {
  return normalizeDateToBrazilianNoon(date);
}

/**
 * Formats a number with thousands separator and decimal places
 * @param value The number to format
 * @param decimalPlaces Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value?: number | string, decimalPlaces: number = 2): string {
  if (value === undefined || value === null || value === '') return '-';
  
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numberValue)) return '-';
  
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
}

// Backward compatibility functions for date handling
export function parseLocalDate(dateString: string): Date {
  return new Date(dateString);
}

export function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Export Brazilian timezone functions for consistency
export { 
  normalizeDateToBrazilianNoon, 
  formatBrazilianDateToString, 
  formatBrazilianDateForDisplay,
  getCurrentBrazilianDate
} from "@/utils/timezoneUtils";
