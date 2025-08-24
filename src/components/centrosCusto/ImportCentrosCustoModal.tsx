
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, AlertCircle, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { importCentrosCusto } from "@/services/centroCustoService";
import { parseCentroCustoExcel, generateCentroCustoTemplate } from "@/lib/excel";
import { CentroCustoFormData } from "@/types/centroCusto";

interface ImportCentrosCustoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportCentrosCustoModal: React.FC<ImportCentrosCustoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{ 
    inserted: number; 
    errors: string[] 
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Verificar se é um arquivo Excel
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError("Apenas arquivos Excel são permitidos (.xlsx, .xls)");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Selecione um arquivo para importar.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Parse Excel file with our specialized function
      const data = await parseCentroCustoExcel(file);
      
      if (data.length === 0) {
        throw new Error("Nenhum dado válido encontrado no arquivo. Verifique se o formato está correto.");
      }
      
      // Import data to the database
      const results = await importCentrosCusto(data as CentroCustoFormData[]);
      
      setImportResults(results);
      
      // Show toast
      if (results.inserted > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.inserted} centros de custo importados com sucesso.`,
        });
        
        if (results.errors.length === 0) {
          // If no errors, close the modal and refresh the data
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      } else {
        toast({
          title: "Importação falhou",
          description: "Nenhum centro de custo foi importado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao processar o arquivo.");
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os dados.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    generateCentroCustoTemplate();
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setImportResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Centros de Custo</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel para importar múltiplos centros de custo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              O arquivo deve seguir o formato específico para centros de custo.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Modelo
            </Button>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  {file ? file.name : 'Clique para fazer upload ou arraste e solte'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">XLSX ou XLS (Máx. 5MB)</p>
              </div>
              <Input
                id="dropzone-file"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {file && !error && !importResults && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>Arquivo selecionado: {file.name}</span>
            </div>
          )}
          
          {importResults && (
            <Alert variant={importResults.errors.length > 0 ? "destructive" : "default"}>
              {importResults.errors.length === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {importResults.errors.length === 0 
                  ? "Importação bem-sucedida" 
                  : "Importação com avisos"}
              </AlertTitle>
              <AlertDescription>
                <p>{importResults.inserted} centros de custo importados com sucesso.</p>
                
                {importResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Erros encontrados:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm max-h-40 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {importResults ? "Fechar" : "Cancelar"}
          </Button>
          
          {!importResults && (
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading || !!error}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Importando...
                </>
              ) : (
                "Importar"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCentrosCustoModal;
