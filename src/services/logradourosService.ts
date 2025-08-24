
import { supabase } from "@/integrations/supabase/client";

interface LogradouroOption {
  id: string;
  logradouro: string;
  requisicao_id: string;
}

/**
 * Fetch logradouros by requisition ID
 * @param requisicaoId - The requisition ID to search for
 * @returns Array of logradouro options
 */
export const fetchLogradourosByRequisicao = async (requisicaoId: string): Promise<LogradouroOption[]> => {
  try {
    console.log("Fetching logradouros for requisicao:", requisicaoId);
    
    // Use DISTINCT ON para eliminar duplicatas baseadas no nome do logradouro
    const { data: ruasData, error: ruasError } = await supabase
      .from('bd_ruas_requisicao')
      .select('id, logradouro, requisicao_id')
      .eq('requisicao_id', requisicaoId)
      .order('logradouro')
      .order('id'); // Ordenação secundária para DISTINCT ON funcionar
    
    if (ruasError) throw ruasError;
    
    // Filtrar duplicatas no lado do cliente como fallback
    const uniqueLogradouros = new Map();
    ruasData?.forEach(rua => {
      if (!uniqueLogradouros.has(rua.logradouro)) {
        uniqueLogradouros.set(rua.logradouro, {
          id: rua.id,
          logradouro: rua.logradouro,
          requisicao_id: rua.requisicao_id
        });
      }
    });
    
    const formattedLogradouros = Array.from(uniqueLogradouros.values());
    
    console.log("Logradouros found (unique):", formattedLogradouros.length);
    console.log("Logradouros list:", formattedLogradouros.map(l => l.logradouro));
    return formattedLogradouros;
  } catch (error) {
    console.error("Error fetching logradouros:", error);
    throw error;
  }
};
