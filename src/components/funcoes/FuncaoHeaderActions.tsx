
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";

interface FuncaoHeaderActionsProps {
  onNewFuncao: () => void;
  onExport: () => void;
  onImport: () => void;
}

const FuncaoHeaderActions: React.FC<FuncaoHeaderActionsProps> = ({
  onNewFuncao,
  onExport,
  onImport
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={onNewFuncao} 
        className="flex gap-1 items-center"
      >
        <Plus className="h-4 w-4" />
        <span>Nova Função</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onExport}
        className="flex gap-1 items-center"
      >
        <Download className="h-4 w-4" />
        <span>Exportar</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onImport}
        className="flex gap-1 items-center"
      >
        <Upload className="h-4 w-4" />
        <span>Importar</span>
      </Button>
    </div>
  );
};

export default FuncaoHeaderActions;
