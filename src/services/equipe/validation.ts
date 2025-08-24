
import { supabase } from "@/integrations/supabase/client";

// Function to check if a name already exists
export const checkEquipeNameExists = async (nome: string, id?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from("bd_equipes")
      .select("id")
      .ilike("nome_equipe", nome);
      
    if (id) {
      query = query.neq("id", id);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    
    return data.length > 0;
  } catch (error) {
    console.error("Error checking if equipe name exists:", error);
    throw error;
  }
};
