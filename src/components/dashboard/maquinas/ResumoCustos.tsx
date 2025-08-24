
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Minus, TrendingUp, Wrench, Truck, Calendar, MapPin, Building } from "lucide-react";
import { CustoLocacao, CaminhoesPorCentroCusto } from "@/types/maquinas";

interface ResumoCustosProps {
  custoData: CustoLocacao;
  caminhoesProgramados: CaminhoesPorCentroCusto[];
  isLoading: boolean;
}

export default function ResumoCustos({ 
  custoData, 
  caminhoesProgramados, 
  isLoading 
}: ResumoCustosProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Ativa':
        return "success";
      case 'Enviada':
        return "info";
      case 'Entregue':
        return "secondary";
      default:
        return "outline";
    }
  };

  const custoItems = [
    {
      title: "Valor Total de Locação",
      value: formatCurrency(custoData?.valorTotal || 0),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total de Descontos",
      value: formatCurrency(custoData?.totalDescontos || 0),
      icon: Minus,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Valor Líquido",
      value: formatCurrency(custoData?.valorLiquido || 0),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Dias em Manutenção",
      value: `${custoData?.diasManutencao || 0} dias`,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const totalCaminhoesProgramados = caminhoesProgramados?.reduce((total, grupo) => total + grupo.totalCaminhoes, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resumo de Custos de Locação</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {custoItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {item.title}
                  </p>
                  <p className="text-lg font-bold">
                    {item.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Caminhões Programados por Centro de Custo */}
      <Card className="p-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            Caminhões Programados por Centro de Custo
            <Badge variant="outline" className="ml-2">
              {totalCaminhoesProgramados} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caminhoesProgramados && caminhoesProgramados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caminhoesProgramados.map((grupo) => (
                <Card key={grupo.codigoCentroCusto} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded">
                          <Building className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{grupo.codigoCentroCusto}</h4>
                          {grupo.nomeCentroCusto && (
                            <p className="text-xs text-muted-foreground truncate">
                              {grupo.nomeCentroCusto}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {grupo.totalCaminhoes}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {grupo.caminhoes.slice(0, 6).map((caminhao) => (
                          <div
                            key={caminhao.id}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs border"
                          >
                            <span className="font-medium">
                              {caminhao.frota} {caminhao.numero_frota}
                            </span>
                            <Badge 
                              variant={getStatusBadgeVariant(caminhao.status)}
                              className="text-[10px] h-4 px-1"
                            >
                              {caminhao.status}
                            </Badge>
                          </div>
                        ))}
                        {grupo.caminhoes.length > 6 && (
                          <div className="px-2 py-1 bg-blue-50 rounded text-xs text-blue-600 border border-blue-200">
                            +{grupo.caminhoes.length - 6} mais
                          </div>
                        )}
                      </div>
                      
                      {grupo.caminhoes.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
                          <Calendar className="h-3 w-3" />
                          <span>Entregas: {formatDate(grupo.caminhoes[0].data_entrega)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Building className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>Nenhum caminhão programado para o período selecionado</p>
              <p className="text-xs mt-1">Tente ajustar os filtros de data do planejamento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
