
import { supabase } from "@/integrations/supabase/client";

export const fetchEquipeMembers = async (equipeId: string) => {
  console.log("🔍 Fetching team members for equipe:", equipeId);
  
  try {
    // First get the team to access the equipe array
    const { data: equipe, error: equipeError } = await supabase
      .from("bd_equipes")
      .select("equipe")
      .eq("id", equipeId)
      .single();

    if (equipeError) {
      console.error("❌ Error fetching team:", equipeError);
      throw new Error(`Erro ao buscar equipe: ${equipeError.message}`);
    }

    if (!equipe?.equipe || equipe.equipe.length === 0) {
      console.log("ℹ️ No members found for team");
      return [];
    }

    // Now fetch all members by their IDs
    const { data: members, error: membersError } = await supabase
      .from("bd_funcionarios")
      .select("id, nome_completo")
      .in("id", equipe.equipe);

    if (membersError) {
      console.error("❌ Error fetching members:", membersError);
      throw new Error(`Erro ao buscar membros: ${membersError.message}`);
    }

    console.log("✅ Team members fetched:", members);
    return members || [];
    
  } catch (error) {
    console.error("❌ Error in fetchEquipeMembers:", error);
    throw error;
  }
};
