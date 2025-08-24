
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the team ID for a user (either as apontador or encarregado)
 * @param userId - The user ID to search for
 * @returns The team ID if found, null otherwise
 */
export const getUserTeamId = async (userId: string): Promise<string | null> => {
  try {
    console.log("Fetching team for user:", userId);
    
    const { data, error } = await supabase
      .from("bd_equipes")
      .select("id, nome_equipe")
      .or(`apontador_id.eq.${userId},encarregado_id.eq.${userId}`)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user team:", error);
      return null;
    }
    
    if (data) {
      console.log("User team found:", data);
      return data.id;
    }
    
    console.log("No team found for user");
    return null;
  } catch (error) {
    console.error("Unexpected error fetching user team:", error);
    return null;
  }
};

/**
 * Get team information for a user
 * @param userId - The user ID to search for
 * @returns The team information if found, null otherwise
 */
export const getUserTeamInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("bd_equipes")
      .select("id, nome_equipe, apontador_id, encarregado_id")
      .or(`apontador_id.eq.${userId},encarregado_id.eq.${userId}`)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user team info:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error fetching user team info:", error);
    return null;
  }
};
