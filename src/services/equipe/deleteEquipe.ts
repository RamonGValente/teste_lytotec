
import { supabase } from "@/integrations/supabase/client";

// Function to delete an equipe
export const deleteEquipe = async (id: string): Promise<void> => {
  try {
    console.log("Deleting equipe with ID:", id);
    
    // First, clear all team member associations by removing the equipe_id
    const { error: clearError } = await supabase
      .from("bd_funcionarios")
      .update({ equipe_id: null })
      .eq("equipe_id", id);
      
    if (clearError) {
      console.error("Error clearing team members:", clearError);
      throw new Error(clearError.message);
    }
    
    // Then delete the equipe
    const { error } = await supabase
      .from("bd_equipes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting equipe:", error);
      throw new Error(error.message);
    }
    
    console.log("Equipe deleted successfully");
  } catch (error) {
    console.error("Error deleting equipe:", error);
    throw error;
  }
};
