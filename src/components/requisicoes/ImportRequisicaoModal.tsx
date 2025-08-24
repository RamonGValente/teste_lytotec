
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRequisicaoImport } from "@/hooks/useRequisicaoImport";
import { Download, FileUp, CheckCircle2, AlertCircle } from "lucide-react";

interface ImportRequisicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportRequisicaoModal: React.FC<ImportRequisicaoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    file,
    isImporting,
    importResults,
    handleFileChange,
    startImport,
    resetImport
  } = useRequisicaoImport(onSuccess);

  const handleClose = () => {
    resetImport();
    onClose();
  };

  const downloadTemplate = () => {
    // Sample data for template
    const data = [
      ["numero", "centro_custo_id", "diretoria", "gerencia", "engenheiro_id", "data_requisicao", "logradouro", "bairro", "largura", "comprimento", "pintura_ligacao", "traco", "espessura"],
      ["", "(ID obrigatório)", "(opcional)", "(opcional)", "(ID obrigatório)", "(formato YYYY-MM-DD)", "(obrigatório)", "(opcional)", "(obrigatório)", "(obrigatório)", "(IMPRIMA/RR)", "(Binder/5A/4C)", "(obrigatório)"],
    ];
    
    // Create CSV content
    const csvContent = data.map(row => row.join(",")).join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_requisicoes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Requisições</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Selecione um arquivo CSV ou Excel contendo os dados das requisições.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: CSV, XLS, XLSX (máx. 10MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </label>
          </div>
          
          {file && (
            <Alert>
              <FileUp className="h-4 w-4" />
              <AlertTitle>Arquivo selecionado</AlertTitle>
              <AlertDescription className="truncate max-w-[380px]">
                {file.name}
              </AlertDescription>
            </Alert>
          )}
          
          {importResults && (
            <Alert variant={importResults.errors.length > 0 ? "destructive" : "default"}>
              {importResults.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>
                {importResults.errors.length > 0
                  ? "Importação concluída com avisos"
                  : "Importação concluída com sucesso"}
              </AlertTitle>
              <AlertDescription>
                <p>
                  {importResults.success} requisições importadas com sucesso.
                  {importResults.errors.length > 0 && 
                    ` ${importResults.errors.length} registros com erro.`}
                </p>
                {importResults.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      Ver detalhes dos erros
                    </summary>
                    <ul className="mt-2 text-xs list-disc pl-5 space-y-1">
                      {importResults.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={startImport}
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Importando...
              </>
            ) : (
              "Importar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRequisicaoModal;
