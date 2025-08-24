
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, MapPin, CheckCircle, Eye } from "lucide-react";
import { RegistroAplicacaoDetalhes } from "@/types/registroAplicacaoDetalhes";
import { useEspessuraMedia } from "@/hooks/registro-aplicacao/useEspessuraMedia";
import EspessuraMediaCard from "./EspessuraMediaCard";

interface AplicacoesRegistradasListProps {
  aplicacoes: RegistroAplicacaoDetalhes[];
  onEdit: (aplicacao: RegistroAplicacaoDetalhes) => void;
  onDelete: (aplicacaoId: string) => void;
  massaTotalCarga: number;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

const AplicacoesRegistradasList: React.FC<AplicacoesRegistradasListProps> = memo(({
  aplicacoes,
  onEdit,
  onDelete,
  massaTotalCarga,
  isLoading = false,
  isReadOnly = false
}) => {
  const totalAplicado = aplicacoes.reduce((sum, app) => sum + app.tonelada_aplicada, 0);
  const areaTotal = aplicacoes.reduce((sum, app) => sum + app.area_aplicada, 0);
  const percentualAplicado = massaTotalCarga > 0 ? (totalAplicado / massaTotalCarga) * 100 : 0;
  
  // Hook para calcular espessura média
  const espessuraInfo = useEspessuraMedia(aplicacoes);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isReadOnly && <Eye className="h-5 w-5" />}
              <MapPin className="h-5 w-5" />
              {isReadOnly ? 'Aplicações Registradas (Visualização)' : 'Lista de Aplicações Registradas'}
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {aplicacoes.length} aplicação{aplicacoes.length !== 1 ? 'ões' : ''} registrada{aplicacoes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Status e progresso */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso da carga:</span>
              <span className="font-medium">{percentualAplicado.toFixed(1)}% concluído</span>
            </div>
            <Progress value={percentualAplicado} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600">Total Aplicado</div>
                <div className="font-semibold text-blue-800">{totalAplicado.toFixed(2)}t</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600">Área Total</div>
                <div className="font-semibold text-green-800">{areaTotal.toFixed(2)}m²</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600">Massa Total</div>
                <div className="font-semibold text-purple-800">{massaTotalCarga.toFixed(2)}t</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {aplicacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma aplicação registrada</p>
              <p className="text-sm">
                {isReadOnly 
                  ? 'Esta entrega não possui aplicações registradas' 
                  : 'Adicione a primeira aplicação de rua abaixo'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">Logradouro</TableHead>
                    <TableHead className="font-semibold">Estacas</TableHead>
                    <TableHead className="font-semibold">Dimensões</TableHead>
                    <TableHead className="font-semibold">Temp.</TableHead>
                    <TableHead className="font-semibold">Área (m²)</TableHead>
                    <TableHead className="font-semibold">Tonelada (t)</TableHead>
                    <TableHead className="font-semibold">Espessura (cm)</TableHead>
                    <TableHead className="font-semibold">
                      {isReadOnly ? 'Status' : 'Ações'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aplicacoes.map((aplicacao, index) => (
                    <TableRow key={aplicacao.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{aplicacao.logradouro_nome}</div>
                          {aplicacao.bordo && (
                            <div className="text-xs text-gray-500">
                              Bordo: {aplicacao.bordo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {aplicacao.estaca_inicial && aplicacao.estaca_final ? (
                          <span className="text-sm">
                            {aplicacao.estaca_inicial} - {aplicacao.estaca_final}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {aplicacao.comprimento && aplicacao.largura_media ? (
                          <span className="text-sm">
                            {aplicacao.comprimento}m × {aplicacao.largura_media}m
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {aplicacao.temperatura_aplicacao ? (
                          <span className="text-sm">{aplicacao.temperatura_aplicacao}°C</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{aplicacao.area_aplicada.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{aplicacao.tonelada_aplicada.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {aplicacao.espessura_aplicada ? (
                          <span className="font-medium">{aplicacao.espessura_aplicada.toFixed(1)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isReadOnly ? (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Finalizado
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Salvo
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(aplicacao)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(aplicacao.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Espessura Média - só mostra se há aplicações */}
      {aplicacoes.length > 0 && (
        <EspessuraMediaCard 
          espessuraInfo={espessuraInfo}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
});

AplicacoesRegistradasList.displayName = 'AplicacoesRegistradasList';

export default AplicacoesRegistradasList;
