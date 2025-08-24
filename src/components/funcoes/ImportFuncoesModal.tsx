
import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processImportData } from "@/services/funcaoService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Check, X, FileText, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { parseFuncoesExcel, generateFuncoesTemplate } from "@/lib/excel";

interface ImportFuncoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportFuncoesModal: React.FC<ImportFuncoesModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    errors: string[];
  } | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Parse Excel file with our specialized function
      const data = await parseFuncoesExcel(file);
      
      if (data.length === 0) {
        toast({
          title: "Arquivo vazio",
          description: "O arquivo não contém dados para importação.",
          variant: "destructive"
        });
        return;
      }
      
      // Process data
      const results = await processImportData(data);
      setResults(results);
      
      // Show toast with results summary
      if (results.success.length > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success.length} funções importadas com sucesso.${
            results.errors.length > 0 ? ` ${results.errors.length} erros encontrados.` : ""
          }`
        });
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["funcoes"] });
        onSuccess();
      } else {
        toast({
          title: "Importação falhou",
          description: `Nenhuma função foi importada. ${results.errors.length} erros encontrados.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao importar dados.";
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadTemplate = () => {
    generateFuncoesTemplate();
  };
  
  const handleCloseModal = () => {
    setFile(null);
    setResults(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Importar Funções</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Selecione um arquivo Excel para importar</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={downloadTemplate}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                Modelo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter uma coluna com o nome "Função" ou apenas valores das funções.
            </p>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          )}
          
          {results && (
            <div className="space-y-3 max-h-48 overflow-auto border rounded-md p-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Importados ({results.success.length})
                </h4>
                {results.success.length > 0 ? (
                  <ul className="text-sm space-y-1 ml-6 list-disc">
                    {results.success.map((item, index) => (
                      <li key={`success-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground ml-6">Nenhum item importado.</p>
                )}
              </div>
              
              {results.errors.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold flex items-center">
                    <X className="h-4 w-4 mr-1 text-destructive" />
                    Erros ({results.errors.length})
                  </h4>
                  <ul className="text-sm space-y-1 ml-6 list-disc">
                    {results.errors.map((error, index) => (
                      <li key={`error-${index}`} className="text-destructive">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            disabled={isLoading}
          >
            {results ? "Fechar" : "Cancelar"}
          </Button>
          
          {!results && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Iniciar Importação
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFuncoesModal;
