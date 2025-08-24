
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ImportFuncionariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  isImporting: boolean;
}

const ImportFuncionariosModal: React.FC<ImportFuncionariosModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setIsParsingFile(true);
    
    try {
      const data = await readExcelFile(file);
      setParsedData(data);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error("Falha na leitura do arquivo"));
            return;
          }

          // For binary files (xlsx)
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: true });
          
          // Log for debugging
          console.log("Dados do Excel:", jsonData);
          if (jsonData.length > 0) {
            console.log("Primeira linha:", jsonData[0]);
          }
          
          resolve(jsonData);
        } catch (error) {
          console.error("Erro ao processar Excel:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Erro na leitura do arquivo:", error);
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: "Nenhum dado para importar",
        description: "O arquivo não contém dados válidos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await onImport(parsedData);
    } catch (error) {
      console.error("Erro durante importação:", error);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        reset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Funcionários</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={isParsingFile || isImporting}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm font-medium">
                {file ? file.name : "Clique para selecionar um arquivo"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Formatos suportados: .xlsx, .xls, .csv
              </span>
            </label>
          </div>
          
          {parsedData.length > 0 && (
            <div className="text-sm text-gray-500">
              <p>
                {parsedData.length} registro(s) encontrado(s) no arquivo.
              </p>
            </div>
          )}

          {isParsingFile && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Processando arquivo...</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isParsingFile || isImporting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={parsedData.length === 0 || isParsingFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                "Importar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFuncionariosModal;
