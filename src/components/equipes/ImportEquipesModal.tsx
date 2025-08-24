
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet } from "lucide-react";
import * as Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { useEquipeImport } from "@/hooks/useEquipeImport";

interface ImportEquipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportEquipesModal: React.FC<ImportEquipesModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { handleImport } = useEquipeImport(() => {
    onSuccess();
    resetState();
  });
  
  const resetState = () => {
    setFile(null);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check if it's a CSV or Excel file
    const fileType = selectedFile.type;
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(fileType) && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Formato de arquivo inválido",
        description: "Por favor, selecione um arquivo CSV ou Excel.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleImportClick = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    // Process CSV file
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      try {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            const data = results.data as any[];
            await handleImport(data);
          },
          error: (error) => {
            toast({
              title: "Erro ao processar arquivo",
              description: error.message,
              variant: "destructive"
            });
            setIsImporting(false);
          }
        });
      } catch (error) {
        toast({
          title: "Erro ao processar arquivo",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo.",
          variant: "destructive"
        });
        setIsImporting(false);
      }
    } 
    // Process Excel file - this would require additional Excel parsing
    else {
      toast({
        title: "Formato não suportado",
        description: "Por favor, use um arquivo CSV para importação.",
        variant: "destructive"
      });
      setIsImporting(false);
    }
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Equipes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="import-file">Selecione um arquivo CSV</Label>
            <Input 
              id="import-file" 
              type="file" 
              accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter as colunas: nome_equipe, encarregado_id, apontador_id, equipe
            </p>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}
          
          <div className="rounded-md border p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-2">Modelo de Dados Esperado:</h4>
            <p className="text-xs">
              - <strong>nome_equipe:</strong> Nome da equipe<br />
              - <strong>encarregado_id:</strong> ID do encarregado<br />
              - <strong>apontador_id:</strong> ID do apontador<br />
              - <strong>equipe:</strong> Lista de IDs dos funcionários (opcional)
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImportClick}
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <>
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportEquipesModal;
