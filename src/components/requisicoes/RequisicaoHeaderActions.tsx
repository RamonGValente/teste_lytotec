
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";

interface RequisicaoHeaderActionsProps {
  onNewRequisicao: () => void;
  onExport: () => void;
  onImport: () => void;
}

const RequisicaoHeaderActions: React.FC<RequisicaoHeaderActionsProps> = ({
  onNewRequisicao,
  onExport,
  onImport
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={onNewRequisicao}
        className="flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span>Nova Requisição</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onExport}
        className="flex items-center"
      >
        <Download className="mr-2 h-4 w-4" />
        <span>Exportar</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onImport}
        className="flex items-center"
      >
        <Upload className="mr-2 h-4 w-4" />
        <span>Importar</span>
      </Button>
    </div>
  );
};

export default RequisicaoHeaderActions;
