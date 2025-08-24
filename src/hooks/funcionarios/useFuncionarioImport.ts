
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { processImportData } from "@/services/funcionarioService";
import { useToast } from "../use-toast";

export function useFuncionarioImport(onImportSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  
  const handleImport = useCallback(async (data: any[]) => {
    setIsImporting(true);
    try {
      // Exibe toast de início da importação
      toast({
        title: "Iniciando importação",
        description: `Processando ${data.length} registros...`
      });
      
      console.log("Dados para importação:", data);
      const result = await processImportData(data);
      
      if (result.success > 0) {
        // Invalidate the cache to reflect new data
        await queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
        
        toast({
          title: "Importação concluída",
          description: `${result.success} funcionários importados com sucesso.`
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
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  }, [queryClient, toast, onImportSuccess]);

  return { handleImport, isImporting };
}
