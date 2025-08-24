
import React from "react";
import { Button } from "@/components/ui/button";
import { FileEdit, CheckCircle, Clipboard } from "lucide-react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";

interface EntregaActionButtonsProps {
  entrega: ListaProgramacaoEntrega;
  onEntregaClick: (entrega: ListaProgramacaoEntrega) => void;
}

const EntregaActionButtons: React.FC<EntregaActionButtonsProps> = ({ 
  entrega, 
  onEntregaClick 
}) => {
  if (entrega.status === "Enviada") {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEntregaClick(entrega);
        }}
        aria-label="Registrar aplicação"
      >
        <FileEdit className="h-4 w-4" />
      </Button>
    );
  } 
  
  if (entrega.status === "Entregue") {
    return (
      <div className="flex justify-end gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" aria-label="Entrega concluída" />
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEntregaClick(entrega);
          }}
          aria-label="Ver detalhes"
        >
          <FileEdit className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex justify-end">
      <Clipboard className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default EntregaActionButtons;
