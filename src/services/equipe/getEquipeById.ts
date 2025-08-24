
import { supabase } from "@/integrations/supabase/client";
import { Equipe } from "@/types/equipe";

// Function to get equipe by ID with optimized member fetching
export const getEquipeById = async (id: string): Promise<Equipe> => {
  try {
    console.log(`Buscando equipe com ID: ${id}`);
    
    // Get the base equipe data with encarregado and apontador info
    const { data: equipeData, error: equipeError } = await supabase
      .from("bd_equipes")
      .select(`
        *,
        encarregado:encarregado_id(id, nome_completo),
        apontador:apontador_id(id, nome_completo)
      `)
      .eq("id", id)
      .single();

    if (equipeError) {
      console.error(`Erro ao buscar equipe com id ${id}:`, equipeError);
      throw new Error(`Erro ao buscar equipe: ${equipeError.message}`);
    }
    
    if (!equipeData) {
      console.error(`Equipe com id ${id} não encontrada`);
      throw new Error(`Equipe não encontrada`);
    }
    
    // Create the equipe object
    const equipe = equipeData as unknown as Equipe;
    
    // Fetch all funcionarios who are members of this team using the equipe array
    if (equipe.equipe && equipe.equipe.length > 0) {
      console.log(`Buscando ${equipe.equipe.length} membros da equipe ${id}`);
      
      const { data: membrosData, error: membrosError } = await supabase
        .from("bd_funcionarios")
        .select("id, nome_completo")
        .in("id", equipe.equipe);
        
      if (membrosError) {
        console.error(`Erro ao buscar membros da equipe ${id}:`, membrosError);
        // Don't throw error here, just log it and continue with empty members
        console.warn("Continuando com lista vazia de membros");
        equipe.membros = [];
      } else {
        // Add membros to the equipe object, maintaining the order from the equipe array
        const membrosMap = new Map(membrosData?.map(m => [m.id, m]) || []);
        equipe.membros = equipe.equipe
          .map(id => membrosMap.get(id))
          .filter(Boolean) as { id: string; nome_completo: string }[];
        
        console.log(`Encontrados ${equipe.membros.length} membros para a equipe ${id}`);
      }
    } else {
      console.log(`Equipe ${id} não possui membros definidos`);
      equipe.membros = [];
    }
    
    return equipe;
  } catch (error: any) {
    console.error(`Erro ao buscar equipe com id ${id}:`, error);
    throw new Error(`Não foi possível carregar os dados da equipe: ${error.message || 'Erro desconhecido'}`);
  }
};
