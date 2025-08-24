
import { useMemo } from "react";
import { RegistroCarga } from "@/types/registroCargas";
import { EspessuraStatus } from "@/utils/aplicacaoCalculations";
import { calculateMassaPercentual } from "@/utils/massaConversionUtils";
import { 
  calculateToneladaAplicada as calculateToneladaAplicadaUtil,
  calculateEspessuraFromTonelada,
  getEspessuraStatus,
  calculateMassaRemanescenteAfterApplication
} from "@/utils/massaAplicacaoUtils";

/**
 * Hook customizado para lidar com cálculos no formulário de registro de aplicação
 */
export const useCalculations = (
  comprimento: number | null | undefined,
  largura: number | null | undefined,
  registroCarga: RegistroCarga | null,
  entregaMassaRemanescente?: number,
  usarMassaTotal?: boolean,
  massaRemanescenteCarga?: number // Nova propriedade para massa remanescente específica da carga
) => {
  // Calcular área
  const calculatedArea = useMemo(() => {
    if (!comprimento || !largura) return null;
    return comprimento * largura;
  }, [comprimento, largura]);

  // Calcular tonelada aplicada baseada na área calculada e massa disponível
  const calculatedToneladaAplicada = useMemo(() => {
    if (!calculatedArea || !registroCarga?.tonelada_real) return null;
    
    // Priorizar massa remanescente da carga se disponível
    const massaDisponivel = massaRemanescenteCarga ?? entregaMassaRemanescente ?? registroCarga.tonelada_real;
    
    // Usar a função centralizada que segue a especificação exata
    return calculateToneladaAplicadaUtil(calculatedArea, massaDisponivel, usarMassaTotal || false);
  }, [calculatedArea, registroCarga?.tonelada_real, entregaMassaRemanescente, massaRemanescenteCarga, usarMassaTotal]);

  // Calcular espessura com lógica centralizada - FÓRMULA CORRIGIDA
  const calculatedEspessura = useMemo(() => {
    if (!calculatedArea || !calculatedToneladaAplicada) return null;
    
    // Usar a função centralizada que agora segue a fórmula correta
    const espessura = calculateEspessuraFromTonelada(calculatedToneladaAplicada, calculatedArea);
    return espessura; // Já retorna formatado pela função
  }, [calculatedArea, calculatedToneladaAplicada]);

  // Calcular massa remanescente após esta aplicação - FUNÇÃO CENTRALIZADA
  const massaRemanescente = useMemo(() => {
    if (!registroCarga?.tonelada_real || !calculatedToneladaAplicada) {
      return massaRemanescenteCarga ?? entregaMassaRemanescente ?? registroCarga?.tonelada_real ?? 0;
    }
    
    // Usar massa remanescente da carga se disponível, caso contrário usar massa total
    const massaAtual = massaRemanescenteCarga ?? entregaMassaRemanescente ?? registroCarga.tonelada_real;
    // Usar função centralizada
    return calculateMassaRemanescenteAfterApplication(massaAtual, calculatedToneladaAplicada);
  }, [registroCarga?.tonelada_real, calculatedToneladaAplicada, entregaMassaRemanescente, massaRemanescenteCarga]);

  // Verificar se a massa aplicada excede a massa disponível
  const exceededAvailableMass = useMemo(() => {
    if (!calculatedToneladaAplicada || !registroCarga?.tonelada_real) return false;
    
    const massaDisponivel = massaRemanescenteCarga ?? entregaMassaRemanescente ?? registroCarga.tonelada_real;
    return calculatedToneladaAplicada > massaDisponivel;
  }, [calculatedToneladaAplicada, registroCarga?.tonelada_real, entregaMassaRemanescente, massaRemanescenteCarga]);

  // Status para espessura - lógica centralizada e unificada
  const espessuraStatus: EspessuraStatus = useMemo(() => {
    if (!calculatedEspessura) return null;
    
    // Usar função centralizada que segue a especificação exata
    const status = getEspessuraStatus(calculatedEspessura, usarMassaTotal || false);
    
    // Converter para o tipo EspessuraStatus esperado (compatibilidade)
    if (status === 'warning') return 'error'; // Manter compatibilidade com o tipo existente
    return status as EspessuraStatus;
  }, [calculatedEspessura, usarMassaTotal]);

  return {
    calculatedArea,
    calculatedToneladaAplicada,
    calculatedEspessura,
    massaRemanescente,
    espessuraStatus,
    exceededAvailableMass
  };
};
