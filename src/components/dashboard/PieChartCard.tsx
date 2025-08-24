
import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartCardProps {
  title: string;
  icon: LucideIcon;
  data: PieChartData[];
  colors: Record<string, string>;
  isLoading?: boolean;
  onClick?: () => void;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Só mostrar o label para fatias que ocupam pelo menos 5% do gráfico
  return percent >= 0.05 ? (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs md:text-sm font-medium"
      stroke="#00000033"
      strokeWidth={0.5}
      style={{ 
        filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))' 
      }}
    >
      {`${value}`}
    </text>
  ) : null;
};

const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  icon: Icon,
  data,
  colors,
  isLoading = false,
  onClick
}) => {
  // Calculate the total from all data items
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
          {data.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              (Total: {total})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="text-xl text-muted-foreground">Carregando...</div>
        ) : data.length > 0 ? (
          <div className="w-full h-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={240}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={85}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={1}
                >
                  {data.map((entry, index) => {
                    const colorKey = entry.name;
                    const colorValue = colors[colorKey] || 
                                      Object.values(colors)[index % Object.values(colors).length];
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colorValue} 
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} unidades`, name]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    fontWeight: 500
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value, entry, index) => (
                    <span className="text-xs md:text-sm font-medium">{value}</span>
                  )}
                  iconSize={12}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '15px',
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;
