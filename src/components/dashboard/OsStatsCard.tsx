
import React from "react";
import { Wrench, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import CustomSituacaoTooltip from "./CustomSituacaoTooltip";

interface OsStatus {
  aberta: number;
  andamento: number;
  concluida: number;
  cancelada: number;
}

interface OsStatusData {
  name: string;
  value: number;
}

interface OsStatsCardProps {
  total: number;
  status: OsStatus;
  statusBarData: OsStatusData[];
  colors: Record<string, string>;
  isLoading?: boolean;
  onClick?: () => void;
}

const OsStatsCard: React.FC<OsStatsCardProps> = ({
  total,
  status,
  statusBarData,
  colors,
  isLoading = false,
  onClick
}) => {
  // Verifica se todos os valores são zero
  const allZeros = statusBarData.every(item => item.value === 0);
  
  return (
    <Card
      className="col-span-1 md:col-span-2 lg:col-span-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Ordens de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-xl text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="text-3xl font-bold mr-4">
                {total || 0}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
                <span className="text-blue-500">{status.aberta} abertas</span>
                <span className="text-yellow-500">{status.andamento} em andamento</span>
                <span className="text-green-500">{status.concluida} concluídas</span>
                <span className="text-red-500">{status.cancelada} canceladas</span>
              </div>
            </div>
            
            <div className="h-[180px] w-full">
              {allZeros ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mb-2 opacity-30" />
                  <p>Sem registros de OS no período selecionado</p>
                </div>
              ) : (
                <ChartContainer config={{}} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="horizontal" 
                      data={statusBarData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      barSize={20}
                    >
                      <XAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={true}
                        tickLine={true}
                        tick={{ fontSize: 12 }}
                        tickMargin={5}
                      />
                      <YAxis 
                        type="number" 
                        domain={[0, 'dataMax + 1']} 
                        allowDecimals={false} 
                        minTickGap={5}
                        tick={{ fontSize: 12 }}
                        width={30}
                      />
                      <Tooltip 
                        content={<CustomSituacaoTooltip />} 
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        minPointSize={15}
                      >
                        {statusBarData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={colors[entry.name] || Object.values(colors)[index % Object.values(colors).length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OsStatsCard;
