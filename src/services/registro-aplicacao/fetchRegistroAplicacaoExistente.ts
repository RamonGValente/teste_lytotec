
import { supabase } from "@/integrations/supabase/client";
import { RegistroAplicacao } from "@/types/registroAplicacao";

/**
 * Buscar registro de aplicação existente por lista_entrega_id
 * Prioriza registros que já possuem detalhes de aplicação
 */
export const fetchRegistroAplicacaoExistente = async (listaEntregaId: string): Promise<RegistroAplicacao | null> => {
  try {
    console.log("Buscando registro aplicação existente para lista_entrega_id:", listaEntregaId);
    
    // Buscar todos os registros para esta entrega
    const { data: registros, error } = await supabase
      .from("bd_registro_apontamento_aplicacao")
      .select(`
        *,
        lista_entrega:bd_lista_programacao_entrega!lista_entrega_id(*),
        registro_carga:bd_registro_cargas!registro_carga_id(*)
      `)
      .eq("lista_entrega_id", listaEntregaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar registros existentes:", error);
      throw error;
    }

    if (!registros || registros.length === 0) {
      console.log("Nenhum registro encontrado para lista_entrega_id:", listaEntregaId);
      return null;
    }

    // Para cada registro, verificar quantos detalhes de aplicação possui
    const registrosComDetalhes = await Promise.all(
      registros.map(async (registro) => {
        const { count } = await supabase
          .from("bd_registro_aplicacao_detalhes")
          .select("*", { count: "exact", head: true })
          .eq("registro_aplicacao_id", registro.id);

        return {
          ...registro,
          num_detalhes: count || 0
        };
      })
    );

    // Priorizar registro com mais detalhes de aplicação
    const registroComMaisDetalhes = registrosComDetalhes
      .sort((a, b) => b.num_detalhes - a.num_detalhes)[0];

    console.log("Registro encontrado:", {
      id: registroComMaisDetalhes.id,
      num_detalhes: registroComMaisDetalhes.num_detalhes
    });

    return registroComMaisDetalhes as RegistroAplicacao;
  } catch (error) {
    console.error("Erro ao buscar registro existente:", error);
    throw error;
  }
};
