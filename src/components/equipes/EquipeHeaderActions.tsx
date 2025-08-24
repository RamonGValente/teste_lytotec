
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";

interface EquipeHeaderActionsProps {
  onNewEquipe: () => void;
  onExport: () => void;
  onImport: () => void;
}

const EquipeHeaderActions: React.FC<EquipeHeaderActionsProps> = ({
  onNewEquipe,
  onExport,
  onImport
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={onNewEquipe} className="whitespace-nowrap">
        <Plus className="h-4 w-4 mr-2" />
        Nova Equipe
      </Button>
      
      <Button variant="outline" onClick={onExport} className="whitespace-nowrap">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      
      <Button variant="outline" onClick={onImport} className="whitespace-nowrap">
        <Upload className="h-4 w-4 mr-2" />
        Importar
      </Button>
    </div>
  );
};

export default EquipeHeaderActions;
