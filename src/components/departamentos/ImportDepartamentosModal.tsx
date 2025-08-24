
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { importDepartamentos, validateImportData } from "@/services/departamentoService";
import Papa from "papaparse";
import { DepartamentoFormData } from "@/types/departamento";

interface ImportDepartamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportDepartamentosModal: React.FC<ImportDepartamentosModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Array<{ row: number; errors: string[] }>>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
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
    
    setIsSubmitting(true);
    
    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const data = results.data as Array<{
            nome_departamento: string;
            empresa_id: string;
          }>;
          
          // Validate data
          const validationErrors = validateImportData(data);
          if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
          }
          
          try {
            // Import data
            await importDepartamentos(data as DepartamentoFormData[]);
            
            toast({
              title: "Importação concluída",
              description: `Foram importados ${data.length} departamentos com sucesso.`
            });
            
            onSuccess();
            onClose();
          } catch (error) {
            console.error("Erro ao importar departamentos:", error);
            toast({
              title: "Erro na importação",
              description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os dados.",
              variant: "destructive"
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        error: (error) => {
          console.error("Erro ao processar arquivo:", error);
          toast({
            title: "Erro ao processar arquivo",
            description: "Verifique se o arquivo está no formato correto.",
            variant: "destructive"
          });
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao importar os dados.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Departamentos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Selecione um arquivo CSV ou Excel
            </label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              O arquivo deve conter as colunas: nome_departamento, empresa_id
            </p>
          </div>
          
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p>Foram encontrados erros no arquivo:</p>
                <ul className="list-disc pl-5 mt-2">
                  {errors.map((error, index) => (
                    <li key={index}>
                      Linha {error.row}: {error.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-muted p-3 rounded-md">
            <h3 className="font-medium mb-2">Como funciona a importação?</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Selecione um arquivo CSV ou Excel</li>
              <li>Clique em "Importar"</li>
              <li>O sistema validará os dados antes de importar</li>
              <li>Se não houver erros, os departamentos serão importados</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDepartamentosModal;
