
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";

interface ProgramacaoEntregaHeaderActionsProps {
  onNewClick: () => void;
  onExport: () => void;
}

const ProgramacaoEntregaHeaderActions: React.FC<ProgramacaoEntregaHeaderActionsProps> = ({
  onNewClick,
  onExport
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onNewClick} className="whitespace-nowrap">
        <Plus className="mr-2 h-4 w-4" />
        Nova Programação
      </Button>
      <Button 
        variant="outline" 
        onClick={onExport} 
        className="whitespace-nowrap"
      >
        <FileDown className="mr-2 h-4 w-4" />
        Exportar
      </Button>
    </div>
  );
};

export default ProgramacaoEntregaHeaderActions;
