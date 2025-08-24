/**
 * Utilitário para validação de datas em registros
 * Permite apenas registros de ontem, hoje e amanhã
 */

export interface DateValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Verifica se uma data está dentro do período permitido para registros
 * @param dateString Data no formato YYYY-MM-DD
 * @returns Resultado da validação
 */
export const isDateAllowed = (dateString: string): DateValidationResult => {
  if (!dateString) {
    return {
      isValid: false,
      message: "Data é obrigatória"
    };
  }

  const inputDate = new Date(dateString + 'T00:00:00');
  const today = new Date();
  
  // Zerar horários para comparação apenas de datas
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Permitir apenas: ontem, hoje e amanhã
  if (inputDate < yesterday || inputDate > tomorrow) {
    return {
      isValid: false,
      message: "Data deve estar entre ontem e amanhã para registros válidos"
    };
  }

  return { isValid: true };
};

/**
 * Formata uma data para exibição amigável
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hoje";
  if (diffDays === -1) return "Ontem";
  if (diffDays === 1) return "Amanhã";
  
  return date.toLocaleDateString('pt-BR');
};

/**
 * Obtém a data atual no formato YYYY-MM-DD
 */
export const getCurrentDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};