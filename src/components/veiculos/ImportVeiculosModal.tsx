
import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VeiculoFormData } from "@/types/veiculo";
import { FileUploader } from "@/components/ui/file-uploader";
import { AlertCircle, CheckCircle2, Info, FileSpreadsheet, Download } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ImportVeiculosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (veiculos: VeiculoFormData[] | File) => Promise<{ success: any[]; errors: any[] }>;
  onSuccess: () => void;
}

const ImportVeiculosModal: React.FC<ImportVeiculosModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [parseResults, setParseResults] = useState<any[]>([]);
  const [step, setStep] = useState<"upload" | "confirm" | "result">("upload");
  const [importResult, setImportResult] = useState<{
    success: any[];
    errors: any[];
  }>({ success: [], errors: [] });

  const resetModal = useCallback(() => {
    setFile(null);
    setImportErrors([]);
    setParseResults([]);
    setStep("upload");
    setImportResult({ success: [], errors: [] });
  }, []);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      if (files[0].name.toLowerCase().endsWith(".csv")) {
        parseCSV(files[0]);
      } else if (files[0].name.toLowerCase().endsWith(".xlsx") || 
                files[0].name.toLowerCase().endsWith(".xls")) {
        // For Excel files we'll just use direct file import
        setImportErrors([]);
        setStep("confirm");
      } else {
        setImportErrors(["Formato de arquivo não suportado. Use CSV, XLS ou XLSX."]);
      }
    }
  };

  const parseCSV = (file: File) => {
    const errors: string[] = [];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          errors.push(
            ...results.errors.map(
              (err) => `Linha ${err.row}: ${err.message}`
            )
          );
        }

        if (results.data.length === 0) {
          errors.push("O arquivo não contém dados válidos.");
        }

        setImportErrors(errors);
        setParseResults(results.data);
        
        if (errors.length === 0 && results.data.length > 0) {
          setStep("confirm");
        }
      },
      error: (error) => {
        errors.push(`Erro ao processar o arquivo: ${error.message}`);
        setImportErrors(errors);
      },
    });
  };

  const downloadTemplate = () => {
    const headers = [
      "Placa", "Tipo de Veículo", "Frota", "Número Frota", 
      "Marca", "Modelo", "Cor", "Departamento", 
      "Motor", "Ano de Fabricação", "Tipo de Combustível", 
      "Status IPVA", "Situação", "Capacidade", 
      "Aluguel", "Observações", "Empresa"
    ];
    
    const exampleRow = [
      "ABC1234", "Caminhão", "F1", "12345", 
      "Volvo", "FH 540", "Branco", "Operações", 
      "12345678", "2022", "Diesel", 
      "Pago", "Operando", "30 ton", 
      "Não", "Observação de exemplo", "Empresa XYZ"
    ];
    
    // Create CSV content
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo_importacao_veiculos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      let result;
      
      if (file?.name.toLowerCase().endsWith(".xlsx") || 
          file?.name.toLowerCase().endsWith(".xls")) {
        // Directly import Excel file
        console.log("Importing Excel file:", file.name);
        result = await onImport(file);
      } else {
        // For CSV, use the parsed data
        const formattedData = parseResults.map((item) => ({
          frota: item.frota || item.Frota || null,
          numero_frota: item.numero_frota || item["Número Frota"] || item["Numero Frota"] || null,
          departamento_id: item.departamento_id || null,
          placa: item.placa || item.Placa || null,
          tipo_veiculo: item.tipo_veiculo || item["Tipo de Veículo"] || item["Tipo de Veiculo"] || null,
          marca: item.marca || item.Marca || null,
          modelo: item.modelo || item.Modelo || null,
          cor: item.cor || item.Cor || null,
          motor: item.motor || item.Motor || null,
          ano_fabricacao: item.ano_fabricacao || item["Ano de Fabricação"] || item["Ano de Fabricacao"] || null,
          tipo_combustivel: item.tipo_combustivel || item["Tipo de Combustível"] || item["Tipo de Combustivel"] || null,
          status_ipva: item.status_ipva || item["Status IPVA"] || null,
          situacao: item.situacao || item.Situação || item.Situacao || null,
          capacidade: item.capacidade || item.Capacidade || null,
          aluguel: item.aluguel || item.Aluguel || null,
          observacoes: item.observacoes || item.Observações || item.Observacoes || null,
          empresa_id: item.empresa_id || null,
          imagem_url: null,
        }));

        console.log("Importing CSV data with entries:", formattedData.length);
        result = await onImport(formattedData);
      }
      
      console.log("Import result:", result);
      setImportResult(result);
      setStep("result");

      if (result.success.length > 0 && result.errors.length === 0) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao importar veículos:", error);
      setImportErrors([
        "Ocorreu um erro durante a importação. Por favor, tente novamente.",
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Veículos/Equipamentos</DialogTitle>
          <DialogDescription>
            Importe veículos e equipamentos a partir de um arquivo Excel ou CSV.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Arquivo Excel ou CSV com os dados dos veículos
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Modelo
              </Button>
            </div>

            <FileUploader
              accept=".csv,.xlsx,.xls"
              onFilesSelected={handleFileChange}
              label="Arraste e solte seu arquivo Excel/CSV aqui ou clique para selecionar"
              maxFiles={1}
            />

            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>Formato esperado</AlertTitle>
              <AlertDescription className="text-xs">
                <p>O arquivo Excel deve conter as seguintes colunas:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>Placa</li>
                  <li>Tipo de Veículo</li>
                  <li>Frota</li>
                  <li>Número Frota</li>
                  <li>Marca</li>
                  <li>Modelo</li>
                  <li>Cor</li>
                  <li>Departamento</li>
                  <li>Motor</li>
                  <li>Ano de Fabricação</li>
                  <li>Tipo de Combustível</li>
                  <li>Status IPVA</li>
                  <li>Situação</li>
                  <li>Capacidade</li>
                  <li>Aluguel</li>
                  <li>Observações</li>
                  <li>Empresa</li>
                </ul>
              </AlertDescription>
            </Alert>

            {importErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {importErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Confirmação</AlertTitle>
              <AlertDescription>
                Arquivo "{file?.name}" selecionado. 
                Confirme para continuar com a importação.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={resetModal}
                disabled={isImporting}
              >
                Voltar
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? "Importando..." : "Confirmar Importação"}
              </Button>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-4">
            {importResult.success.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Sucesso</AlertTitle>
                <AlertDescription className="text-green-700">
                  {importResult.success.length} veículos/equipamentos foram
                  importados com sucesso.
                </AlertDescription>
              </Alert>
            )}

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index}>{error.message}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancelar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportVeiculosModal;
