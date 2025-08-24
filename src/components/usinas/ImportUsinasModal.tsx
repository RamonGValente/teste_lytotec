
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileType, AlertCircle } from "lucide-react";
import { Usina } from "@/types/usina";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportUsinasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onImport: (usinas: Partial<Usina>[]) => void;
}

const ImportUsinasModal: React.FC<ImportUsinasModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setFile(null);
    setError(null);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'csv' && fileExt !== 'xlsx' && fileExt !== 'xls') {
      setError("Formato de arquivo não suportado. Use CSV ou Excel (XLSX/XLS).");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const processCSV = (file: File): Promise<Partial<Usina>[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            // Map CSV data to Usina objects
            const usinas = results.data.map((row: any) => {
              return {
                nome_usina: row['Nome da Usina'] || row['nome_usina'],
                endereco: row['Endereço'] || row['endereco'],
                producao_total: row['Produção Total'] || row['producao_total'],
                telefone: row['Telefone'] || row['telefone']
              };
            }).filter((usina: Partial<Usina>) => usina.nome_usina);

            resolve(usinas);
          } catch (error) {
            reject("Erro ao processar arquivo CSV. Verifique o formato.");
          }
        },
        error: (error) => {
          reject("Erro ao ler arquivo CSV: " + error.message);
        }
      });
    });
  };

  const processExcel = (file: File): Promise<Partial<Usina>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          // Map Excel data to Usina objects
          const usinas = json.map((row: any) => {
            return {
              nome_usina: row['Nome da Usina'] || row['nome_usina'],
              endereco: row['Endereço'] || row['endereco'],
              producao_total: row['Produção Total'] || row['producao_total'],
              telefone: row['Telefone'] || row['telefone']
            };
          }).filter((usina: Partial<Usina>) => usina.nome_usina);

          resolve(usinas);
        } catch (error) {
          reject("Erro ao processar arquivo Excel. Verifique o formato.");
        }
      };
      reader.onerror = () => {
        reject("Erro ao ler arquivo Excel.");
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError("Selecione um arquivo para importar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      let usinas: Partial<Usina>[] = [];

      if (fileExt === 'csv') {
        usinas = await processCSV(file);
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        usinas = await processExcel(file);
      }

      if (usinas.length === 0) {
        throw new Error("Nenhum dado válido encontrado no arquivo.");
      }

      onImport(usinas);
      onSuccess();
    } catch (error) {
      setError(typeof error === 'string' ? error : "Erro ao processar o arquivo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Usinas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Selecione um arquivo CSV ou Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter as colunas: Nome da Usina (obrigatório), Endereço, Produção Total, Telefone
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {file && (
            <div className="flex items-center gap-2 p-2 border rounded">
              <FileType className="h-5 w-5 text-primary" />
              <p className="text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportUsinasModal;
