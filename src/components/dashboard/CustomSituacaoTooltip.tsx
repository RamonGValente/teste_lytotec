
import React from "react";
import { TooltipProps } from "recharts";

interface FrotaInfo {
  nome_frota: string;
  numero_frota: string;
}

interface SituacaoData {
  name: string;
  value: number;
  frotas?: FrotaInfo[];
}

// Specific typings for recharts Tooltip
type ValueType = number | string | Array<number | string>;
type NameType = string;

const CustomSituacaoTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ 
  active, 
  payload
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SituacaoData;
    return (
      <div className="bg-background border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p>Quantidade: {data.value}</p>
        {data.frotas && data.frotas.length > 0 ? (
          <div className="mt-2">
            <p className="font-medium text-sm">Frotas:</p>
            <div className="max-h-[150px] overflow-y-auto mt-1">
              {data.frotas.map((frota: FrotaInfo, idx: number) => (
                <div key={idx} className="text-xs py-1 border-b border-border/30 last:border-0">
                  <span className="font-medium">{frota.nome_frota}</span>
                  {frota.numero_frota !== 'N/A' && (
                    <span className="text-muted-foreground ml-1">
                      ({frota.numero_frota})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
  return null;
};

export default CustomSituacaoTooltip;
