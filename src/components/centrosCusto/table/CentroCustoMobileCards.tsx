
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash } from "lucide-react";
import { CentroCusto } from "@/types/centroCusto";

interface CentroCustoMobileCardsProps {
  centrosCusto: CentroCusto[];
  onEdit: (centroCusto: CentroCusto) => void;
  onView: (centroCusto: CentroCusto) => void;
  onDelete: (centroCusto: CentroCusto) => void;
}

const CentroCustoMobileCards: React.FC<CentroCustoMobileCardsProps> = ({
  centrosCusto,
  onEdit,
  onView,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {centrosCusto.map((centroCusto) => (
        <Card key={centroCusto.id} className="p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant={centroCusto.situacao === "Ativo" ? "default" : "secondary"}
                className={centroCusto.situacao === "Ativo" ? "bg-green-500 hover:bg-green-500/90" : "bg-gray-500 hover:bg-gray-500/90"}
              >
                {centroCusto.situacao}
              </Badge>
              <span className="font-medium text-sm">{centroCusto.codigo_centro_custo}</span>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(centroCusto)}
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(centroCusto)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(centroCusto)}
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h3 
            className="font-medium text-lg mb-2 cursor-pointer hover:text-primary truncate"
            onClick={() => onView(centroCusto)}
          >
            {centroCusto.nome_centro_custo}
          </h3>
          
          <div className="space-y-1 text-sm">
            {centroCusto.cnpj_vinculado && (
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">CNPJ:</span>
                <span className="font-mono">{centroCusto.cnpj_vinculado}</span>
              </div>
            )}
            
            {centroCusto.telefone && (
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Telefone:</span>
                <span>{centroCusto.telefone}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CentroCustoMobileCards;
