
import { supabase } from "@/integrations/supabase/client";
import { RegistroAplicacao } from "@/types/registroAplicacao";
import { registroAplicacaoSelectQuery } from "./baseService";

/**
 * Fetch registro aplicação by ID
 */
export const fetchRegistroAplicacaoById = async (id: string): Promise<RegistroAplicacao | null> => {
  try {
    console.log("Fetching registro aplicação by ID:", id);
    
    const { data, error } = await supabase
      .from("bd_registro_apontamento_aplicacao")
      .select(registroAplicacaoSelectQuery)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching registro aplicação:", error);
      throw error;
    }
    
    console.log("Fetched registro aplicação:", data);
    return data as any;
  } catch (error) {
    console.error("Unexpected error fetching registro aplicação:", error);
    throw error;
  }
};

/**
 * Fetch registro aplicação by lista_entrega_id
 */
export const fetchRegistroAplicacaoByListaEntregaId = async (listaEntregaId: string): Promise<RegistroAplicacao | null> => {
  try {
    console.log("Fetching registro aplicação by lista_entrega_id:", listaEntregaId);
    
    const { data, error } = await supabase
      .from("bd_registro_apontamento_aplicacao")
      .select(registroAplicacaoSelectQuery)
      .eq("lista_entrega_id", listaEntregaId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching registro aplicação by lista_entrega_id:", error);
      throw error;
    }
    
    console.log("Fetched registro aplicação by lista_entrega_id:", data);
    return data as any;
  } catch (error) {
    console.error("Unexpected error fetching registro aplicação by lista_entrega_id:", error);
    throw error;
  }
};
