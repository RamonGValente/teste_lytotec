
import { useState } from "react";
import { Funcionario } from "@/types/funcionario";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useFuncionarioImageUpload() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const openImageModal = (funcionario: Funcionario) => {
    console.log("Opening image modal for funcionario:", funcionario);
    setSelectedFuncionario(funcionario);
    setIsImageModalOpen(true);
  };
  
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedFuncionario(null);
  };
  
  const updateFuncionarioImage = async (imageUrl: string): Promise<void> => {
    if (!selectedFuncionario) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('bd_funcionarios')
        .update({ imagem: imageUrl })
        .eq('id', selectedFuncionario.id);
        
      if (error) throw error;
      
      // Show success toast
      toast({
        title: "Imagem atualizada",
        description: "A imagem do funcionário foi atualizada com sucesso."
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      
      // If we have a specific funcionario query, invalidate that too
      queryClient.invalidateQueries({ 
        queryKey: ["funcionario", selectedFuncionario.id] 
      });
    } catch (error) {
      console.error("Error updating funcionario image:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a imagem do funcionário.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return {
    isImageModalOpen,
    selectedFuncionario,
    openImageModal,
    closeImageModal,
    updateFuncionarioImage
  };
}
