
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Upload } from "lucide-react";

interface FuncionarioHeaderActionsProps {
  onNew: () => void;
  onExport: () => void;
  onImport: () => void;
}

const FuncionarioHeaderActions: React.FC<FuncionarioHeaderActionsProps> = ({
  onNew,
  onExport,
  onImport,
}) => {
  return (
    <div className="flex space-x-2">
      <Button onClick={onNew} size="sm" className="h-9 gap-1">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Novo Funcionário</span>
        <span className="inline sm:hidden">Novo</span>
      </Button>
      <Button onClick={onExport} variant="outline" size="sm" className="h-9 gap-1">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>
      <Button onClick={onImport} variant="outline" size="sm" className="h-9 gap-1">
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Importar</span>
      </Button>
    </div>
  );
};

export default FuncionarioHeaderActions;
