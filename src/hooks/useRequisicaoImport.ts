
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { utils, read } from "xlsx";
import { importRequisicoes } from "@/services/requisicaoService";
import { Requisicao, RuaRequisicao } from "@/types/requisicao";

export const useRequisicaoImport = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setImportResults(null);
    }
  };

  const startImport = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      // Read the file
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<any>(worksheet);

      if (jsonData.length === 0) {
        throw new Error("O arquivo está vazio ou não contém dados válidos.");
      }

      // Group rows by requisition number
      const requisicoesByNumero: Record<string, any[]> = {};
      jsonData.forEach(row => {
        const numeroReq = row.numero || 'temp';
        if (!requisicoesByNumero[numeroReq]) {
          requisicoesByNumero[numeroReq] = [];
        }
        requisicoesByNumero[numeroReq].push(row);
      });

      // Process each requisition group
      const importData = Object.values(requisicoesByNumero).map(rows => {
        const firstRow = rows[0];
        
        // Extract requisition data from the first row
        const requisicao: Omit<Requisicao, 'id' | 'numero' | 'created_at' | 'updated_at'> = {
          centro_custo_id: firstRow.centro_custo_id || '',
          diretoria: firstRow.diretoria || undefined,
          gerencia: firstRow.gerencia || undefined,
          engenheiro_id: firstRow.engenheiro_id || '',
          data_requisicao: firstRow.data_requisicao || new Date().toISOString().split('T')[0],
        };

        // Extract street data from each row
        const ruas: Omit<RuaRequisicao, 'id' | 'requisicao_id' | 'area' | 'volume' | 'created_at' | 'updated_at'>[] = rows.map(row => ({
          logradouro: row.logradouro || '',
          bairro: row.bairro || undefined,
          largura: Number(row.largura) || 0,
          comprimento: Number(row.comprimento) || 0,
          pintura_ligacao: row.pintura_ligacao || '',
          traco: row.traco || '',
          espessura: Number(row.espessura) || 0,
        }));

        return { requisicao, ruas };
      });

      // Perform the import
      const results = await importRequisicoes(importData);
      
      setImportResults({
        success: results.success.length,
        errors: results.errors
      });

      if (results.success.length > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success.length} requisições importadas com sucesso.`,
        });
        
        if (results.success.length === importData.length) {
          // Only trigger success callback if all imports were successful
          onSuccess();
        }
      }

      if (results.errors.length > 0) {
        toast({
          title: "Importação parcial",
          description: `${results.errors.length} requisições não puderam ser importadas.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing requisitions:", error);
      toast({
        title: "Erro na importação",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setImportResults(null);
  };

  return {
    file,
    isImporting,
    importResults,
    handleFileChange,
    startImport,
    resetImport
  };
};
