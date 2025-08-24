
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Truck, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { EquipamentosPorCentroCusto } from "@/types/maquinas";

interface EquipamentosPorCentroCustoProps {
  equipamentosData: EquipamentosPorCentroCusto[];
  isLoading: boolean;
}

export default function EquipamentosPorCentroCustoComponent({ 
  equipamentosData, 
  isLoading 
}: EquipamentosPorCentroCustoProps) {
  const [expandedCentros, setExpandedCentros] = useState<Set<string>>(new Set());

  const toggleExpanded = (centroCusto: string) => {
    setExpandedCentros(prev => {
      const newSet = new Set(prev);
      if (newSet.has(centroCusto)) {
        newSet.delete(centroCusto);
      } else {
        newSet.add(centroCusto);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-48">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-3 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!equipamentosData || equipamentosData.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Equipamentos por Centro de Custo (Hoje)
        </h2>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Nenhum apontamento encontrado para hoje
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        Equipamentos por Centro de Custo (Hoje)
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {equipamentosData.map((centro) => (
          <Card key={centro.centroCusto} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {centro.centroCusto}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Truck className="h-3 w-3 mr-1" />
                    {centro.totalCaminhoes}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    {centro.totalEquipamentos}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="caminhoes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="caminhoes">
                    Caminhões ({centro.totalCaminhoes})
                  </TabsTrigger>
                  <TabsTrigger value="equipamentos">
                    Equipamentos ({centro.totalEquipamentos})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="caminhoes" className="mt-4">
                  {centro.caminhoes.length > 0 ? (
                    <div className="space-y-2">
                      {centro.caminhoes.slice(0, 3).map((caminhao) => (
                        <div 
                          key={caminhao.id} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">
                              {caminhao.frota} {caminhao.numero_frota}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {caminhao.operador}
                            </div>
                            <Badge 
                              variant={caminhao.situacao === 'Operando' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {caminhao.situacao}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {centro.caminhoes.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleExpanded(centro.centroCusto)}
                        >
                          {expandedCentros.has(centro.centroCusto) ? (
                            <>Mostrar menos <ChevronUp className="h-4 w-4 ml-1" /></>
                          ) : (
                            <>Ver todos ({centro.caminhoes.length - 3} mais) <ChevronDown className="h-4 w-4 ml-1" /></>
                          )}
                        </Button>
                      )}
                      {expandedCentros.has(centro.centroCusto) && centro.caminhoes.slice(3).map((caminhao) => (
                        <div 
                          key={caminhao.id} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">
                              {caminhao.frota} {caminhao.numero_frota}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {caminhao.operador}
                            </div>
                            <Badge 
                              variant={caminhao.situacao === 'Operando' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {caminhao.situacao}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Nenhum caminhão apontado hoje
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="equipamentos" className="mt-4">
                  {centro.equipamentos.length > 0 ? (
                    <div className="space-y-2">
                      {centro.equipamentos.slice(0, 3).map((equipamento) => (
                        <div 
                          key={equipamento.id} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-green-600" />
                            <span className="font-medium">
                              {equipamento.frota} {equipamento.numero_frota}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {equipamento.operador}
                            </div>
                            <Badge 
                              variant={equipamento.situacao === 'Operando' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {equipamento.situacao}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {centro.equipamentos.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleExpanded(`${centro.centroCusto}-eq`)}
                        >
                          {expandedCentros.has(`${centro.centroCusto}-eq`) ? (
                            <>Mostrar menos <ChevronUp className="h-4 w-4 ml-1" /></>
                          ) : (
                            <>Ver todos ({centro.equipamentos.length - 3} mais) <ChevronDown className="h-4 w-4 ml-1" /></>
                          )}
                        </Button>
                      )}
                      {expandedCentros.has(`${centro.centroCusto}-eq`) && centro.equipamentos.slice(3).map((equipamento) => (
                        <div 
                          key={equipamento.id} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-green-600" />
                            <span className="font-medium">
                              {equipamento.frota} {equipamento.numero_frota}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {equipamento.operador}
                            </div>
                            <Badge 
                              variant={equipamento.situacao === 'Operando' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {equipamento.situacao}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Nenhum equipamento apontado hoje
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
