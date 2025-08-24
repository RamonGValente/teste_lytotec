
import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Cell,
  TooltipProps 
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface BarChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Define proper types for the Recharts tooltip content
type ValueType = number | string | Array<number | string>;
type NameType = string;

interface BarChartCardProps {
  title: string;
  icon: LucideIcon;
  data: BarChartData[];
  colors: Record<string, string>;
  isLoading?: boolean;
  onClick?: () => void;
  onBarClick?: (barName: string) => void;
  // Correct the tooltip content type to match what Recharts expects
  tooltipContent?: React.FC<TooltipProps<ValueType, NameType>>;
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  icon: Icon,
  data,
  colors,
  isLoading = false,
  onClick,
  onBarClick,
  tooltipContent
}) => {
  const handleBarClick = (data: any) => {
    if (onBarClick && data?.activePayload?.[0]?.payload?.name) {
      onBarClick(data.activePayload[0].payload.name);
    }
  };
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-xl text-muted-foreground">Carregando...</div>
        ) : data.length > 0 ? (
          <ChartContainer config={{}} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={onBarClick ? handleBarClick : undefined}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={tooltipContent} />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[entry.name] || "#8884d8"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
