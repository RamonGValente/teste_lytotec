import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Truck, MapPin, Clock, Package, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ResumoOperacional {
  obra: string;
  centro_custo: string;
  data: string;
  turno: string;
  total_massa_diaria: number;
  volume_total_diario: number;
  area_total_diaria: number;
  espessura_media_diaria: number;
  total_caminhoes_diarios: number;
}

interface RelatorioAplicacaoResumoProps {
  dados: {
    resumo: ResumoOperacional;
  };
  filtros: {
    centro_custo_id: string;
    data_aplicacao: string;
    turno: string;
  };
}

const RelatorioAplicacaoResumo: React.FC<RelatorioAplicacaoResumoProps> = ({ dados, filtros }) => {
  const { resumo } = dados;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const statsCards = [
    {
      title: "Total de Massa Diária Aplicada",
      value: `${resumo.total_massa_diaria.toFixed(2)} t`,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Volume Total Diário Aplicado",
      value: `${resumo.volume_total_diario.toFixed(2)} m³`,
      icon: Layers,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Área Total Diária Pavimentada",
      value: `${resumo.area_total_diaria.toFixed(2)} m²`,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Espessura Média Diária",
      value: `${resumo.espessura_media_diaria.toFixed(3)} m`,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Total de Caminhões Utilizados",
      value: resumo.total_caminhoes_diarios.toString(),
      icon: Truck,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Resumo Operacional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Obra</div>
            <div className="text-lg font-semibold text-foreground">{resumo.obra}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Centro de Custo</div>
            <div className="text-lg font-semibold text-foreground">{resumo.centro_custo}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Data</div>
            <div className="text-lg font-semibold text-foreground">{formatDate(resumo.data)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Turno</div>
            <div className="text-lg font-semibold text-foreground">{resumo.turno}</div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground line-clamp-2">
                        {stat.title}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioAplicacaoResumo;