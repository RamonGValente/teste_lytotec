
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Veiculo } from "@/types/veiculo";

interface VeiculoActionsProps {
  veiculo: Veiculo;
  onView: (veiculo: Veiculo) => void;
  onEdit: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

const VeiculoActions: React.FC<VeiculoActionsProps> = ({ 
  veiculo, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onView(veiculo)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEdit(veiculo)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onDelete(veiculo)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VeiculoActions;
