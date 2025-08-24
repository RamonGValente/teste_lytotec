
import React from "react";
import { Badge } from "@/components/ui/badge";

interface VeiculoStatusBadgeProps {
  situacao: string | null;
}

const VeiculoStatusBadge: React.FC<VeiculoStatusBadgeProps> = ({ situacao }) => {
  const getSituacaoBadgeVariant = (situacao: string | null) => {
    switch (situacao?.toLowerCase()) {
      case 'operando':
        return "success";
      case 'em manutenção':
      case 'em manutencao':
        return "warning";
      case 'disponível':
      case 'disponivel':
        return "info";
      case 'inativo':
        return "destructive";
      default:
        return "outline";
    }
  };

  return situacao ? (
    <Badge variant={getSituacaoBadgeVariant(situacao)}>
      {situacao}
    </Badge>
  ) : (
    "N/A"
  );
};

export default VeiculoStatusBadge;
