
import { supabase } from "@/integrations/supabase/client";
import { Equipe, EquipeFormData } from "@/types/equipe";

// Function to create a new equipe
export const createEquipe = async (data: EquipeFormData): Promise<Equipe> => {
  try {
    console.log("Creating new equipe with data:", data);
    
    // Create the new equipe
    const { data: newEquipe, error } = await supabase
      .from("bd_equipes")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating equipe:", error);
      throw new Error(error.message);
    }

    console.log("New equipe created:", newEquipe);

    // Atualizar os funcionários com o novo equipe_id
    if (data.equipe && data.equipe.length > 0) {
      for (const funcionarioId of data.equipe) {
        const { error: updateError } = await supabase
          .from("bd_funcionarios")
          .update({ equipe_id: newEquipe.id })
          .eq("id", funcionarioId);
          
        if (updateError) {
          console.error(`Error updating funcionario ${funcionarioId} with new team:`, updateError);
          // Continue with other team members despite errors
        }
      }
      
      console.log(`Updated ${data.equipe.length} funcionarios with new team ID`);
    }

    return newEquipe as unknown as Equipe;
  } catch (error) {
    console.error("Error creating equipe:", error);
    throw error;
  }
};
