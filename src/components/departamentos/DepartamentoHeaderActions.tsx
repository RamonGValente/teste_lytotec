
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Plus } from "lucide-react";

interface DepartamentoHeaderActionsProps {
  onNewDepartamento: () => void;
  onExport: () => void;
  onImport: () => void;
}

const DepartamentoHeaderActions: React.FC<DepartamentoHeaderActionsProps> = ({
  onNewDepartamento,
  onExport,
  onImport
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onNewDepartamento} className="whitespace-nowrap">
        <Plus className="mr-2 h-4 w-4" />
        Novo Departamento
      </Button>
      <Button 
        variant="outline" 
        onClick={onExport} 
        className="whitespace-nowrap"
      >
        <FileDown className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      <Button 
        variant="outline" 
        onClick={onImport}
        className="whitespace-nowrap"
      >
        <FileUp className="mr-2 h-4 w-4" />
        Importar
      </Button>
    </div>
  );
};

export default DepartamentoHeaderActions;
