
import { supabase } from "@/integrations/supabase/client";
import { Equipe, EquipeFormData } from "@/types/equipe";

// Function to update an existing equipe
export const updateEquipe = async (id: string, data: EquipeFormData): Promise<Equipe> => {
  try {
    console.log("Updating equipe with ID:", id, "with data:", data);
    
    // Update the equipe record
    const { data: updatedEquipe, error } = await supabase
      .from("bd_equipes")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating equipe:", error);
      throw new Error(error.message);
    }
    
    // Primeiro, obter todos os funcionários que atualmente pertencem a esta equipe
    const { data: currentMembers, error: currentMembersError } = await supabase
      .from("bd_funcionarios")
      .select("id")
      .eq("equipe_id", id);
      
    if (currentMembersError) {
      console.error("Error fetching current team members:", currentMembersError);
      throw new Error(currentMembersError.message);
    }
    
    const currentMemberIds = currentMembers?.map(m => m.id) || [];
    
    // Remover funcionários que não estão mais na equipe
    const membersToRemove = currentMemberIds.filter(memberId => !data.equipe.includes(memberId));
    
    if (membersToRemove.length > 0) {
      const { error: clearError } = await supabase
        .from("bd_funcionarios")
        .update({ equipe_id: null })
        .in("id", membersToRemove);
        
      if (clearError) {
        console.error("Error removing team members:", clearError);
        throw new Error(clearError.message);
      }
      
      console.log(`Removed ${membersToRemove.length} members from team`);
    }
    
    // Adicionar novos funcionários à equipe
    const membersToAdd = data.equipe.filter(memberId => !currentMemberIds.includes(memberId));
    
    if (membersToAdd.length > 0) {
      for (const funcionarioId of membersToAdd) {
        const { error: updateError } = await supabase
          .from("bd_funcionarios")
          .update({ equipe_id: id })
          .eq("id", funcionarioId);
          
        if (updateError) {
          console.error(`Error adding funcionario ${funcionarioId}:`, updateError);
          // Continue trying to update other team members despite errors
        }
      }
      
      console.log(`Added ${membersToAdd.length} new members to team`);
    }
    
    // Atualizar funcionários que permaneceram na equipe (garantir que equipe_id está correto)
    const remainingMembers = data.equipe.filter(memberId => currentMemberIds.includes(memberId));
    
    if (remainingMembers.length > 0) {
      for (const funcionarioId of remainingMembers) {
        const { error: updateError } = await supabase
          .from("bd_funcionarios")
          .update({ equipe_id: id })
          .eq("id", funcionarioId);
          
        if (updateError) {
          console.error(`Error updating funcionario ${funcionarioId}:`, updateError);
        }
      }
    }
    
    console.log("Equipe updated successfully:", updatedEquipe);
    console.log("Team composition changes:", {
      removed: membersToRemove.length,
      added: membersToAdd.length,
      total: data.equipe.length
    });
    
    return updatedEquipe as unknown as Equipe;
  } catch (error) {
    console.error("Error updating equipe:", error);
    throw error;
  }
};
