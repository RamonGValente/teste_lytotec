
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Plus } from "lucide-react";

interface VeiculoHeaderActionsProps {
  onNewClick: () => void;
  onExport: () => void;
  onImport: () => void;
}

const VeiculoHeaderActions: React.FC<VeiculoHeaderActionsProps> = ({
  onNewClick,
  onExport,
  onImport
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onNewClick} className="whitespace-nowrap">
        <Plus className="mr-2 h-4 w-4" />
        Novo C/E
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

export default VeiculoHeaderActions;
