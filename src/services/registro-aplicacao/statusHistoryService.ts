import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing status history and automatic status changes
 */

export interface StatusHistoryEntry {
  id: string;
  registro_carga_id: string;
  lista_entrega_id: string;
  status_anterior: string | null;
  status_novo: string;
  percentual_aplicado: number;
  massa_remanescente: number;
  data_alteracao: string;
  alterado_por: string | null;
  observacoes: string | null;
  created_at: string;
}

/**
 * Get status history for a specific delivery
 */
export const getStatusHistory = async (listaEntregaId: string): Promise<StatusHistoryEntry[]> => {
  try {
    console.log(`📊 [HISTORY] Buscando histórico de status para entrega: ${listaEntregaId}`);
    
    const { data, error } = await supabase
      .from("bd_carga_status_historico")
      .select(`
        id,
        registro_carga_id,
        lista_entrega_id,
        status_anterior,
        status_novo,
        percentual_aplicado,
        massa_remanescente,
        data_alteracao,
        alterado_por,
        observacoes,
        created_at
      `)
      .eq("lista_entrega_id", listaEntregaId)
      .order("data_alteracao", { ascending: false });
    
    if (error) {
      console.error('❌ [HISTORY] Erro ao buscar histórico:', error);
      throw error;
    }
    
    console.log(`✅ [HISTORY] Encontradas ${data?.length || 0} entradas no histórico`);
    return data || [];
    
  } catch (error) {
    console.error('❌ [HISTORY] Erro crítico na busca:', error);
    throw error;
  }
};

/**
 * Get status history for a specific carga (registro_cargas)
 */
export const getStatusHistoryByCarga = async (registroCargaId: string): Promise<StatusHistoryEntry[]> => {
  try {
    console.log(`📊 [HISTORY] Buscando histórico de status para carga: ${registroCargaId}`);
    
    const { data, error } = await supabase
      .from("bd_carga_status_historico")
      .select(`
        id,
        registro_carga_id,
        lista_entrega_id,
        status_anterior,
        status_novo,
        percentual_aplicado,
        massa_remanescente,
        data_alteracao,
        alterado_por,
        observacoes,
        created_at
      `)
      .eq("registro_carga_id", registroCargaId)
      .order("data_alteracao", { ascending: false });
    
    if (error) {
      console.error('❌ [HISTORY] Erro ao buscar histórico da carga:', error);
      throw error;
    }
    
    console.log(`✅ [HISTORY] Encontradas ${data?.length || 0} entradas no histórico da carga`);
    return data || [];
    
  } catch (error) {
    console.error('❌ [HISTORY] Erro crítico na busca:', error);
    throw error;
  }
};

/**
 * Get comprehensive status history with related data
 */
export const getComprehensiveStatusHistory = async (listaEntregaId: string) => {
  try {
    console.log(`📊 [HISTORY] Buscando histórico completo para entrega: ${listaEntregaId}`);
    
    const { data, error } = await supabase
      .from("bd_carga_status_historico")
      .select(`
        id,
        registro_carga_id,
        lista_entrega_id,
        status_anterior,
        status_novo,
        percentual_aplicado,
        massa_remanescente,
        data_alteracao,
        alterado_por,
        observacoes,
        created_at,
        bd_registro_cargas!inner (
          id,
          data_saida,
          hora_saida,
          tonelada_saida,
          tonelada_real
        ),
        bd_lista_programacao_entrega!inner (
          id,
          logradouro,
          quantidade_massa,
          data_entrega
        ),
        profiles (
          nome_completo
        )
      `)
      .eq("lista_entrega_id", listaEntregaId)
      .order("data_alteracao", { ascending: false });
    
    if (error) {
      console.error('❌ [HISTORY] Erro ao buscar histórico completo:', error);
      throw error;
    }
    
    console.log(`✅ [HISTORY] Histórico completo carregado com ${data?.length || 0} entradas`);
    return data || [];
    
  } catch (error) {
    console.error('❌ [HISTORY] Erro crítico na busca completa:', error);
    throw error;
  }
};

/**
 * Get status statistics for a delivery
 */
export const getStatusStatistics = async (listaEntregaId: string) => {
  try {
    const history = await getStatusHistory(listaEntregaId);
    
    const statistics = {
      totalChanges: history.length,
      currentStatus: history[0]?.status_novo || 'Desconhecido',
      percentualAplicado: history[0]?.percentual_aplicado || 0,
      massaRemanescente: history[0]?.massa_remanescente || 0,
      lastUpdate: history[0]?.data_alteracao || null,
      statusFlow: history.map(h => ({
        from: h.status_anterior,
        to: h.status_novo,
        timestamp: h.data_alteracao
      })).reverse()
    };
    
    console.log(`📊 [STATS] Estatísticas calculadas:`, statistics);
    return statistics;
    
  } catch (error) {
    console.error('❌ [STATS] Erro ao calcular estatísticas:', error);
    throw error;
  }
};

/**
 * Add manual status history entry (for debugging/admin purposes)
 */
export const addManualStatusEntry = async (
  listaEntregaId: string,
  registroCargaId: string,
  statusAnterior: string | null,
  statusNovo: string,
  observacoes: string,
  percentualAplicado: number = 0,
  massaRemanescente: number = 0
): Promise<boolean> => {
  try {
    console.log(`📝 [MANUAL] Adicionando entrada manual no histórico`);
    
    const { error } = await supabase
      .from("bd_carga_status_historico")
      .insert({
        lista_entrega_id: listaEntregaId,
        registro_carga_id: registroCargaId,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        percentual_aplicado: percentualAplicado,
        massa_remanescente: massaRemanescente,
        observacoes: observacoes
      });
    
    if (error) {
      console.error('❌ [MANUAL] Erro ao inserir entrada manual:', error);
      return false;
    }
    
    console.log(`✅ [MANUAL] Entrada manual adicionada com sucesso`);
    return true;
    
  } catch (error) {
    console.error('❌ [MANUAL] Erro crítico na inserção:', error);
    return false;
  }
};