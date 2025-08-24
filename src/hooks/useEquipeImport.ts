
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { processImportData } from "@/services/equipe";
import { useToast } from "./use-toast";

export function useEquipeImport(onImportSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleImport = useCallback(async (data: any[]) => {
    try {
      const result = await processImportData(data);
      
      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['equipes'] });
        queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
        toast({
          title: "Importação concluída",
          description: `${result.success} equipes importadas com sucesso.`
        });
      }
      
      if (result.errors && result.errors.length > 0) {
        console.error("Erros na importação:", result.errors);
        toast({
          title: "Alguns itens não foram importados",
          description: `${result.errors.length} erros encontrados durante a importação.`,
          variant: "destructive"
        });
      }
      
      if (result.success > 0 && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os dados.",
        variant: "destructive"
      });
    }
  }, [queryClient, toast, onImportSuccess]);

  return { handleImport };
}
