/**
 * Utilitários para conversão e padronização de unidades de massa
 * 
 * PADRONIZAÇÃO:
 * - Interface: Aceita entrada em kg (ex: 120000)
 * - Banco: Armazena sempre em toneladas (ex: 120.0)
 * - Exibição: Mostra sempre em toneladas com 1 casa decimal (ex: "120.0t")
 */

/**
 * Converte kg para toneladas
 */
export const kgToToneladas = (kg: number): number => {
  return kg / 1000;
};

/**
 * Converte toneladas para kg
 */
export const toneladasToKg = (toneladas: number): number => {
  return toneladas * 1000;
};

/**
 * Normaliza entrada do usuário para toneladas (para salvar no banco)
 * Lógica inteligente para detectar unidade com base no valor e contexto
 */
export const normalizeToToneladas = (value: number): number => {
  // Validação básica
  if (value <= 0) return 0;
  
  // Se o valor é muito alto (>1000), provavelmente está em kg
  if (value > 1000) {
    return kgToToneladas(value);
  }
  
  // Se valor entre 100-1000, pode ser ambíguo:
  // - Para programação, valores típicos são 10-100t (10000-100000kg)
  // - Então se está entre 100-1000, provavelmente são kg
  if (value > 100) {
    return kgToToneladas(value);
  }
  
  // Se valor <= 100, provavelmente já está em toneladas
  return value;
};

/**
 * Formata massa para exibição em toneladas
 */
export const formatMassaDisplay = (toneladas: number, decimals: number = 1): string => {
  // Limitar o número a um máximo razoável de casas decimais para evitar formatação científica
  const roundedValue = Number(toneladas.toFixed(decimals));
  return `${roundedValue}t`;
};

/**
 * Converte valor do banco para exibição na interface
 * ATENÇÃO: 
 * - bd_ruas_requisicao.volume está em KG
 * - bd_registro_cargas.tonelada_real está em KG  
 * - bd_registro_aplicacao_detalhes.tonelada_aplicada está em toneladas
 */
export const formatMassaFromDatabase = (valueFromDb: number, sourceTable?: string, fieldName?: string): number => {
  // Para volumes de ruas, converter de kg para toneladas
  if (sourceTable === 'bd_ruas_requisicao') {
    return Number(kgToToneladas(valueFromDb).toFixed(1));
  }
  
  // Para campo tonelada_real da tabela bd_registro_cargas, converter de kg para toneladas
  if (sourceTable === 'bd_registro_cargas' && fieldName === 'tonelada_real') {
    return Number(kgToToneladas(valueFromDb).toFixed(1));
  }
  
  // Para outras tabelas, assumir que já está em toneladas
  return Number(valueFromDb.toFixed(1));
};

/**
 * Prepara valor para salvar no banco (sempre em toneladas)
 */
export const prepareMassaForDatabase = (inputValue: number): number => {
  const toneladas = normalizeToToneladas(inputValue);
  // Limitar a 3 casas decimais para evitar números excessivamente longos
  return Number(toneladas.toFixed(3));
};

/**
 * Valida se o valor é uma massa válida
 */
export const validateMassaValue = (value: number): { valid: boolean; message?: string } => {
  if (value <= 0) {
    return { valid: false, message: "Massa deve ser maior que zero" };
  }
  
  if (value > 1000000) { // 1000 toneladas em kg
    return { valid: false, message: "Valor muito alto. Use kg ou toneladas" };
  }
  
  return { valid: true };
};

/**
 * Soma valores de massa considerando diferentes unidades
 */
export const sumMassaValues = (values: number[]): number => {
  return values.reduce((sum, value) => {
    const normalized = normalizeToToneladas(value);
    return sum + normalized;
  }, 0);
};

/**
 * Formata peso em kg para exibição em toneladas
 * Converte valores do banco (em kg) para exibição correta
 */
export const formatPesoParaToneladas = (pesoKg: number | null | undefined): string => {
  if (!pesoKg || pesoKg <= 0) return '-';
  
  // Se valor >= 1000kg, exibir em toneladas
  if (pesoKg >= 1000) {
    return `${(pesoKg / 1000).toFixed(1)}t`;
  }
  
  // Se valor < 1000kg, exibir em kg
  return `${pesoKg}kg`;
};

/**
 * Calcula percentual aplicado de massa
 */
export const calculateMassaPercentual = (aplicada: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min((aplicada / total) * 100, 100);
};