
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";

interface UsinaHeaderActionsProps {
  onNewUsina: () => void;
  onExport: () => void;
  onImport: () => void;
}

const UsinaHeaderActions: React.FC<UsinaHeaderActionsProps> = ({
  onNewUsina,
  onExport,
  onImport,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onNewUsina} className="gap-2">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline-block">Nova Usina</span>
      </Button>
      <Button variant="outline" onClick={onExport} className="gap-2">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline-block">Exportar</span>
      </Button>
      <Button variant="outline" onClick={onImport} className="gap-2">
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline-block">Importar</span>
      </Button>
    </div>
  );
};

export default UsinaHeaderActions;
