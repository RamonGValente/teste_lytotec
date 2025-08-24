
import { supabase } from "@/integrations/supabase/client";
import { Equipe, EquipeFilter } from "@/types/equipe";

// Function to fetch equipes with filters
export const fetchEquipes = async (filters: EquipeFilter = {}): Promise<Equipe[]> => {
  try {
    let query = supabase
      .from("bd_equipes")
      .select(`
        *,
        encarregado:encarregado_id (
          id, nome_completo
        ),
        apontador:apontador_id (
          id, nome_completo
        )
      `);

    // Apply filters
    if (filters.nome_equipe) {
      query = query.ilike("nome_equipe", `%${filters.nome_equipe}%`);
    }
    
    if (filters.encarregado_id) {
      query = query.eq("encarregado_id", filters.encarregado_id);
    }
    
    if (filters.apontador_id) {
      query = query.eq("apontador_id", filters.apontador_id);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    
    return data as unknown as Equipe[];
  } catch (error) {
    console.error("Error fetching equipes:", error);
    throw error;
  }
};
