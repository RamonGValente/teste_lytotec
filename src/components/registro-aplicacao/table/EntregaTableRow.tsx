
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import EntregaStatusBadge from "./EntregaStatusBadge";
import EntregaActionButtons from "./EntregaActionButtons";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";
import { formatMassaDisplay } from "@/utils/massaConversionUtils";

interface EntregaTableRowProps {
  entrega: ListaProgramacaoEntrega;
  onEntregaClick: (entrega: ListaProgramacaoEntrega) => void;
}

const EntregaTableRow: React.FC<EntregaTableRowProps> = ({ entrega, onEntregaClick }) => {
  const isClickable = entrega.status === "Enviada";
  
  // Get centro de custo name - priority order: centro_custo_nome, centro_custo relation, requisicao relation
  const centroCustoNome = 
    entrega.centro_custo_nome ||
    entrega.centro_custo?.nome_centro_custo ||
    entrega.requisicao?.centro_custo?.nome_centro_custo ||
    "N/A";
  
  // Format caminhão display with fallbacks
  const formatCaminhaoDisplay = (caminhao: any): string => {
    console.log("Formatting caminhao display for:", caminhao);
    
    if (!caminhao) {
      console.log("No caminhao data available");
      return "N/A";
    }
    
    // Primary format: placa - modelo
    if (caminhao.placa && caminhao.modelo) {
      return `${caminhao.placa} - ${caminhao.modelo}`;
    }
    
    // Fallback 1: frota + numero_frota
    if (caminhao.frota && caminhao.numero_frota) {
      return `${caminhao.frota}${caminhao.numero_frota}${caminhao.modelo ? ` - ${caminhao.modelo}` : ''}`;
    }
    
    // Fallback 2: just placa
    if (caminhao.placa) {
      return caminhao.placa;
    }
    
    // Fallback 3: just modelo
    if (caminhao.modelo) {
      return caminhao.modelo;
    }
    
    // Fallback 4: frota only
    if (caminhao.frota) {
      return caminhao.frota;
    }
    
    console.log("No usable caminhao data found");
    return "N/A";
  };
  
  const caminhaoDisplay = formatCaminhaoDisplay(entrega.caminhao);
  
  return (
    <TableRow 
      className={isClickable ? "hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer" : ""}
      onClick={() => isClickable ? onEntregaClick(entrega) : null}
    >
      <TableCell>{formatBrazilianDateForDisplay(entrega.data_entrega)}</TableCell>
      <TableCell className="max-w-[200px] truncate" title={centroCustoNome}>
        {centroCustoNome}
      </TableCell>
      <TableCell>
        {caminhaoDisplay}
      </TableCell>
      <TableCell>{entrega.equipe?.nome_equipe || "N/A"}</TableCell>
      <TableCell>{formatMassaDisplay(entrega.quantidade_massa)}</TableCell>
      <TableCell>{entrega.tipo_lancamento}</TableCell>
      <TableCell>
        <EntregaStatusBadge status={entrega.status} />
      </TableCell>
      <TableCell className="text-right">
        <EntregaActionButtons 
          entrega={entrega} 
          onEntregaClick={onEntregaClick} 
        />
      </TableCell>
    </TableRow>
  );
};

export default EntregaTableRow;
