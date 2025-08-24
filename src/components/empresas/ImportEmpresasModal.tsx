
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { importEmpresas } from "@/services/empresaService";
import { EmpresaFormData } from "@/types/empresa";
import { Upload, Check, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportEmpresasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    totalRows: number;
    successfulImports: number;
    errorRows: Array<{ row: number; error: string }>;
  };
}

const ImportEmpresasModal: React.FC<ImportEmpresasModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const validateRow = (row: any, index: number): { valid: boolean; data?: EmpresaFormData; error?: string } => {
    // Verificar campos obrigatórios
    if (!row.nome_empresa) {
      return { valid: false, error: `Linha ${index + 1}: Nome da empresa é obrigatório` };
    }
    
    if (!row.cnpj) {
      return { valid: false, error: `Linha ${index + 1}: CNPJ é obrigatório` };
    }
    
    // Verificar situação válida
    const situacao = row.situacao?.trim();
    if (situacao && situacao !== 'Ativa' && situacao !== 'Inativa') {
      return { valid: false, error: `Linha ${index + 1}: Situação deve ser 'Ativa' ou 'Inativa'` };
    }
    
    // Criar objeto de empresa validado
    const empresaData: EmpresaFormData = {
      nome_empresa: row.nome_empresa.trim(),
      cnpj: row.cnpj.trim(),
      telefone: row.telefone ? row.telefone.trim() : null,
      situacao: (situacao as 'Ativa' | 'Inativa') || 'Ativa'
    };
    
    return { valid: true, data: empresaData };
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo CSV ou Excel para importar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const validRows: EmpresaFormData[] = [];
          const errorRows: Array<{ row: number; error: string }> = [];
          
          results.data.forEach((row: any, index: number) => {
            const validation = validateRow(row, index);
            if (validation.valid && validation.data) {
              validRows.push(validation.data);
            } else if (validation.error) {
              errorRows.push({ row: index + 1, error: validation.error });
            }
          });
          
          if (validRows.length === 0) {
            setImportResult({
              success: false,
              message: "Nenhum registro válido encontrado no arquivo.",
              data: {
                totalRows: results.data.length,
                successfulImports: 0,
                errorRows
              }
            });
            return;
          }
          
          // Importar as linhas válidas
          const importedData = await importEmpresas(validRows);
          
          setImportResult({
            success: true,
            message: `Importação concluída com sucesso. ${importedData.length} empresas importadas.`,
            data: {
              totalRows: results.data.length,
              successfulImports: importedData.length,
              errorRows
            }
          });
          
          if (importedData.length > 0) {
            onSuccess();
          }
        } catch (error: any) {
          console.error("Erro na importação:", error);
          setImportResult({
            success: false,
            message: `Erro ao importar dados: ${error.message || "Erro desconhecido"}`
          });
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        console.error("Erro ao processar arquivo:", error);
        setImportResult({
          success: false,
          message: `Erro ao processar o arquivo: ${error.message || "Formato inválido"}`
        });
        setIsUploading(false);
      }
    });
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Lista de Empresas</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="mb-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Selecione um arquivo CSV ou Excel contendo os dados das empresas para importação.
            </p>
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter as colunas: nome_empresa, cnpj, telefone (opcional) e situacao (opcional).
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>
          
          {importResult && (
            <Alert variant={importResult.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{importResult.success ? "Sucesso" : "Erro"}</AlertTitle>
              </div>
              <AlertDescription>{importResult.message}</AlertDescription>
              
              {importResult.data && (
                <div className="mt-2 text-sm">
                  <p>Total de registros: {importResult.data.totalRows}</p>
                  <p>Registros importados: {importResult.data.successfulImports}</p>
                  
                  {importResult.data.errorRows.length > 0 && (
                    <div className="mt-2">
                      <p>Erros encontrados:</p>
                      <ul className="list-disc list-inside mt-1">
                        {importResult.data.errorRows.slice(0, 5).map((row, index) => (
                          <li key={index}>{row.error}</li>
                        ))}
                        {importResult.data.errorRows.length > 5 && (
                          <li>+ {importResult.data.errorRows.length - 5} outros erros</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
          >
            {isUploading ? "Importando..." : "Importar"}
            {!isUploading && <Upload className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportEmpresasModal;
