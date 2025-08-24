
/**
 * Funções utilitárias para cálculos de registro de aplicação
 */

/**
 * Calcula área baseada no comprimento e largura
 */
export const calculateArea = (
  comprimento: number | null, 
  largura: number | null
): number | null => {
  if (comprimento && largura) {
    return comprimento * largura;
  }
  return null;
};

/**
 * Calcula massa aplicada baseada na área e espessura
 * Fórmula correta: Volume (m³) × Densidade (kg/m³) ÷ 1000 = Massa (t)
 * Volume = area (m²) × espessura (m)
 * Densidade CBUQ = 2400 kg/m³
 * 
 * @param area - Área em m²
 * @param espessura - Espessura em cm (será convertida para metros)
 */
export const calculateToneladaAplicada = (
  area: number | null,
  espessura: number = 5 // padrão 5cm se não informado
): number | null => {
  if (!area) {
    return null;
  }
  
  // Converter espessura de cm para metros
  const espessuraMetros = espessura / 100;
  
  // Volume = área × espessura (em metros)
  const volumeM3 = area * espessuraMetros;
  
  // Massa = Volume × Densidade ÷ 1000 (para converter kg para toneladas)
  // Densidade CBUQ = 2400 kg/m³
  return (volumeM3 * 2400) / 1000;
};

/**
 * Ajusta tonelada aplicada baseada na massa disponível
 * Se tonelada_aplicada calculada > qtd_massa, usa qtd_massa
 */
export const adjustToneladaAplicada = (
  calculatedToneladaAplicada: number | null,
  qtdMassa: number | string | null | undefined
): number | null => {
  if (calculatedToneladaAplicada === null || !qtdMassa) {
    return calculatedToneladaAplicada;
  }
  
  const qtdMassaNum = typeof qtdMassa === 'string' 
    ? parseFloat(qtdMassa) 
    : qtdMassa;
    
  if (isNaN(qtdMassaNum)) {
    return calculatedToneladaAplicada;
  }
  
  // Se o valor calculado excede a massa disponível, usa a massa disponível
  return calculatedToneladaAplicada > qtdMassaNum ? qtdMassaNum : calculatedToneladaAplicada;
};

/**
 * Calcula espessura baseada na tonelada_aplicada e área
 * Fórmula correta: ((toneladas × 1000) ÷ densidade ÷ área) × 100 = espessura em cm
 * Densidade CBUQ = 2400 kg/m³
 */
export const calculateEspessura = (
  tonelada_aplicada: number | string | null | undefined, 
  area: number | null
): number | null => {
  if (!tonelada_aplicada || !area) {
    return null;
  }
  
  const tonelada = typeof tonelada_aplicada === 'string' 
    ? parseFloat(tonelada_aplicada) 
    : tonelada_aplicada;
    
  if (isNaN(tonelada)) {
    return null;
  }
  
  // Fórmula correta: ((toneladas × 1000) ÷ 2400 kg/m³ ÷ área) × 100 = cm
  return ((tonelada * 1000) / 2400 / area) * 100;
};

/**
 * Calcula espessura calculada baseada na tonelada_aplicada e área
 * Fórmula correta: ((toneladas × 1000) ÷ densidade ÷ área) × 100 = espessura em cm
 * Densidade CBUQ = 2400 kg/m³
 */
export const calculateEspessuraCalculada = (
  tonelada_aplicada: number | null,
  area: number | null
): number | null => {
  if (!tonelada_aplicada || !area) {
    return null;
  }
  
  // Fórmula correta: ((toneladas × 1000) ÷ 2400 kg/m³ ÷ área) × 100 = cm
  return ((tonelada_aplicada * 1000) / 2400 / area) * 100;
};

/**
 * Calcula massa remanescente baseada na tonelada_real e tonelada_aplicada
 * Se tonelada_aplicada > tonelada_real, retorna 0
 * Caso contrário, retorna tonelada_real - tonelada_aplicada
 */
export const calculateMassaRemanescente = (
  tonelada_real: number | string | null | undefined,
  tonelada_aplicada: number | null
): number | null => {
  if (!tonelada_real || tonelada_aplicada === null) {
    return null;
  }
  
  const tonelada = typeof tonelada_real === 'string' 
    ? parseFloat(tonelada_real) 
    : tonelada_real;
    
  if (isNaN(tonelada)) {
    return null;
  }
  
  // Se tonelada_aplicada excede tonelada_real, massa remanescente é 0
  return tonelada_aplicada > tonelada ? 0 : tonelada - tonelada_aplicada;
};

/**
 * Determina status baseado no valor da espessura
 */
export type EspessuraStatus = "success" | "warning" | "error" | null;

/**
 * Lógica atualizada de status da espessura com novos requisitos
 * < 3.5 cm ou > 5 cm → "Crítica" (error)
 * Entre 3.5 e 5 cm, inclusive → "Boa" (success)
 */
export const getEspessuraStatus = (espessura: number | null): EspessuraStatus => {
  if (!espessura) return null;
  
  if (espessura < 3.5 || espessura > 5) {
    return "error";
  } else {
    return "success";
  }
};

/**
 * Nova lógica de status da espessura
 * < 3.5 cm ou > 5 cm → "Fora do Padrão" (error)
 * Entre 3.5 e 5 cm, inclusive → "Dentro do Padrão" (success)
 */
export const getEspessuraCalculadaStatus = (espessura: number | null): EspessuraStatus => {
  if (!espessura) return null;
  
  if (espessura < 3.5 || espessura > 5) {
    return "error";
  } else {
    return "success";
  }
};

/**
 * Obtém descrição textual para o status da espessura
 */
export const getEspessuraCalculadaStatusText = (status: EspessuraStatus): string => {
  switch (status) {
    case "success":
      return "Dentro do Padrão";
    case "error":
      return "Fora do Padrão";
    default:
      return "Não calculado";
  }
};
