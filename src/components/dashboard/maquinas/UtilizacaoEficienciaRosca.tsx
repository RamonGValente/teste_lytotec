
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CentroCustoUtilizacao } from "@/types/maquinas";

interface UtilizacaoEficienciaRoscaProps {
  centroCustoData: CentroCustoUtilizacao[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

// Componente de legenda customizada
const CustomLegend = ({ data, title }: { data: any[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full">
      <h4 className="font-medium text-sm text-gray-700 mb-3 border-b pb-2">
        {title}
      </h4>
      <div className="flex-1 overflow-y-auto space-y-2">
        {data.map((item, index) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const color = COLORS[index % COLORS.length];
          
          return (
            <div 
              key={item.name}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs text-gray-900 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-600">
                  {item.label} ({percent}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
        Total: {data.length} centro{data.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default function UtilizacaoEficienciaRosca({ 
  centroCustoData, 
  isLoading 
}: UtilizacaoEficienciaRoscaProps) {
  // Função para extrair código do centro de custo
  const extractCode = (centroCusto: string) => {
    const parts = centroCusto.split(' - ');
    return parts.length > 1 ? parts[0] : centroCusto;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="h-96">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Preparar dados para horas trabalhadas
  const dadosHoras = centroCustoData
    .filter(item => item.totalHoras > 0)
    .map(item => ({
      name: extractCode(item.centroCusto),
      fullName: item.centroCusto,
      value: item.totalHoras,
      label: `${item.totalHoras.toFixed(1)}h`
    }));

  // Preparar dados para consumo de combustível
  const dadosCombustivel = centroCustoData
    .filter(item => item.totalCombustivel > 0)
    .map(item => ({
      name: extractCode(item.centroCusto),
      fullName: item.centroCusto,
      value: item.totalCombustivel,
      label: `${item.totalCombustivel.toFixed(1)}L`
    }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Só mostrar o label para fatias maiores que 8%
    const total = dadosHoras.reduce((sum, item) => sum + item.value, 0);
    const percent = (value / total) * 100;
    
    return percent >= 8 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
        stroke="#00000033"
        strokeWidth={0.5}
        style={{ 
          filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))' 
        }}
      >
        {name}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Utilização e Eficiência</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Horas Trabalhadas por Centro de Custo */}
        <Card className="h-96">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Horas Trabalhadas por Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {dadosHoras.length > 0 ? (
              <div className="flex h-full gap-4">
                {/* Área do Gráfico */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosHoras}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {dadosHoras.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          `${Number(value).toFixed(1)} horas`, 
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          fontWeight: 500
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legenda à Direita */}
                <div className="w-44 flex-shrink-0 border-l pl-4">
                  <CustomLegend 
                    data={dadosHoras} 
                    title="Centros de Custo"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">📊</div>
                  <p>Nenhum dado de horas disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consumo de Combustível por Centro */}
        <Card className="h-96">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Consumo de Combustível por Centro</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {dadosCombustivel.length > 0 ? (
              <div className="flex h-full gap-4">
                {/* Área do Gráfico */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosCombustivel}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          const total = dadosCombustivel.reduce((sum, item) => sum + item.value, 0);
                          const percent = (value / total) * 100;
                          
                          return percent >= 8 ? (
                            <text 
                              x={x} 
                              y={y} 
                              fill="white" 
                              textAnchor={x > cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              className="text-xs font-medium"
                              stroke="#00000033"
                              strokeWidth={0.5}
                              style={{ 
                                filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))' 
                              }}
                            >
                              {name}
                            </text>
                          ) : null;
                        }}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {dadosCombustivel.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          `${Number(value).toFixed(1)} litros`, 
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          fontWeight: 500
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legenda à Direita */}
                <div className="w-44 flex-shrink-0 border-l pl-4">
                  <CustomLegend 
                    data={dadosCombustivel} 
                    title="Centros de Custo"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">⛽</div>
                  <p>Nenhum dado de combustível disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
