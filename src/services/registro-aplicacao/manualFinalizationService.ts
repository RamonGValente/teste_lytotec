
import { supabase } from "@/integrations/supabase/client";
import { calcularMassaRemanescente } from "./statusIntegrityService";

interface FinalizationResult {
  success: boolean;
  carga_id: string;
  total_aplicado: number;
  massa_total: number;
  espessura_media: number;
  num_aplicacoes: number;
}

export const finalizarCargaManual = async (cargaId: string): Promise<FinalizationResult> => {
  try {
    console.log('🔧 [MANUAL] Finalizando carga manualmente:', cargaId);
    
    const { data, error } = await supabase.rpc('finalizar_carga_manual', {
      carga_id: cargaId
    });
    
    if (error) {
      console.error('❌ [MANUAL] Erro ao finalizar carga:', error);
      throw error;
    }
    
    console.log('✅ [MANUAL] Carga finalizada com sucesso:', data);
    return data as unknown as FinalizationResult;
    
  } catch (error) {
    console.error('❌ [MANUAL] Erro crítico na finalização:', error);
    throw error;
  }
};

