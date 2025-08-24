import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, Users, Factory, Calendar, Weight, BarChart3 } from "lucide-react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroCarga } from "@/types/registroCargas";
import { CargaComAplicacoes } from "@/hooks/registro-aplicacao/useMultipleApplications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPesoParaToneladas, formatMassaFromDatabase } from "@/utils/massaConversionUtils";
interface EntregaHeaderProps {
  entrega: ListaProgramacaoEntrega;
  registroCarga: RegistroCarga | null;
  cargaInfo?: CargaComAplicacoes | null;
}
const EntregaHeader: React.FC<EntregaHeaderProps> = ({
  entrega,
  registroCarga,
  cargaInfo
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizada':
        return 'bg-green-100 text-green-800';
      case 'Em Andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Iniciada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const percentualAplicado = cargaInfo?.percentualAplicado || 0;
  const statusAplicacao = cargaInfo?.statusAplicacao || 'Iniciada';
  // CORREÇÃO: Converter tonelada_real de kg para toneladas
  const massaTotalRaw = registroCarga?.tonelada_real 
    ? formatMassaFromDatabase(registroCarga.tonelada_real, 'bd_registro_cargas', 'tonelada_real')
    : 0;
  const massaRemanescente = cargaInfo?.massaRemanescente || massaTotalRaw;
  const massaTotal = cargaInfo?.massaTotal || massaTotalRaw;
  const totalAplicado = cargaInfo?.totalAplicado || 0;
  return <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header com título e status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {entrega.logradouro}
              </h3>
              <p className="text-sm text-gray-500">
                Entrega programada para {format(new Date(entrega.data_entrega), "dd/MM/yyyy", {
                locale: ptBR
              })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(statusAplicacao)}>
                {statusAplicacao}
              </Badge>
              <Badge variant="outline">
                {entrega.tipo_lancamento}
              </Badge>
            </div>
          </div>

          {/* Progresso da aplicação */}
          {cargaInfo && <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Progresso da Aplicação
                </span>
                <span className="font-medium">
                  {percentualAplicado.toFixed(1)}% concluído
                </span>
              </div>
              <Progress value={percentualAplicado} className="h-2" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Aplicado: {totalAplicado.toFixed(2)}t</span>
                <span>Remanescente: {massaRemanescente.toFixed(2)}t</span>
              </div>
            </div>}

          {/* Informações em grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-gray-600">Caminhão:</span>
                <div className="font-medium">{entrega.caminhao?.placa}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <span className="text-gray-600">Equipe:</span>
                <div className="font-medium">{entrega.equipe?.nome_equipe}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Factory className="h-4 w-4 text-purple-600" />
              <div>
                <span className="text-gray-600">Usina:</span>
                <div className="font-medium">{entrega.usina?.nome_usina}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Weight className="h-4 w-4 text-orange-600" />
              <div>
                <span className="text-gray-600">Massa Total:</span>
                <div className="font-medium">
                  {massaTotal.toFixed(1)}t
                </div>
              </div>
            </div>
          </div>

          {/* Informações da carga quando disponível */}
          {registroCarga && <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Detalhes da Carga:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Saída:</span>
                  <span className="ml-1 font-medium">
                    {format(new Date(registroCarga.data_saida), "dd/MM/yyyy")} às {registroCarga.hora_saida}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Ton. Saída:</span>
                  <span className="ml-1 font-medium">{formatPesoParaToneladas(registroCarga.tonelada_saida)}</span>
                </div>
                {registroCarga.tonelada_retorno && <div>
                    <span className="text-gray-600">Ton. Retorno:</span>
                    <span className="ml-1 font-medium">{formatPesoParaToneladas(registroCarga.tonelada_retorno)}</span>
                  </div>}
              </div>
            </div>}

          {/* Resumo das aplicações quando houver */}
          {cargaInfo && cargaInfo.aplicacoes.length > 0}
        </div>
      </CardContent>
    </Card>;
};
export default EntregaHeader;